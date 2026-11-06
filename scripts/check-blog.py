"""Check a fresh Hugo build, optionally exercising it in a local browser."""

import argparse
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import threading
from urllib.parse import unquote, urljoin, urlsplit


VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input",
             "link", "meta", "param", "source", "track", "wbr"}


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.items = []
        self.stack = []
        self.json_blocks = []
        self.json_text = None
        self.nested_figures = 0
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        in_article = any("article-content" in a.get("class", "").split()
                         for _, a in self.stack)
        self.items.append((tag, attrs, in_article))
        if tag == "figure" and in_article and any(t == "p" for t, _ in self.stack):
            self.nested_figures += 1
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.json_text = ""
        if tag not in VOID_TAGS:
            self.stack.append((tag, attrs))

    def handle_endtag(self, tag):
        if tag == "script" and self.json_text is not None:
            self.json_blocks.append(self.json_text)
            self.json_text = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.json_text is not None:
            self.json_text += data


def check_html(root):
    errors = []
    documents = {}
    home = Document((root / "index.html").read_text(encoding="utf-8"))
    canonical = next(a["href"] for t, a, _ in home.items
                     if t == "link" and a.get("rel") == "canonical")
    origin = urlsplit(canonical).netloc
    for path in sorted(root.rglob("*.html")):
        relative = path.relative_to(root).as_posix()
        source = path.read_text(encoding="utf-8")
        doc = Document(source)
        documents[relative] = doc
        redirect = any(t == "meta" and a.get("http-equiv", "").lower() == "refresh"
                       for t, a, _ in doc.items)
        if not redirect and sum(t == "h1" for t, _, _ in doc.items) != 1:
            errors.append(f"{relative}: expected one h1")
        if doc.nested_figures:
            errors.append(f"{relative}: figure nested inside paragraph")
        if re.search(r"!\[\[[^\n]+\]\]", source):
            errors.append(f"{relative}: unrendered Obsidian image syntax")
        for block in doc.json_blocks:
            try:
                json.loads(block)
            except ValueError:
                errors.append(f"{relative}: invalid JSON-LD")
        for tag, attrs, in_article in doc.items:
            if tag == "img" and in_article and attrs.get("role") != "presentation" and not attrs.get("alt", "").strip():
                errors.append(f"{relative}: article image needs alt text")
            if tag == "th" and in_article and attrs.get("scope") != "col":
                errors.append(f"{relative}: table header needs scope=col")
            if "err" in attrs.get("class", "").split() and in_article:
                errors.append(f"{relative}: syntax highlighter error token")
            urls = [attrs[k] for k in ("src", "poster", "data-zoom-src", "href")
                    if attrs.get(k)]
            if attrs.get("data-src"):
                urls.append(attrs["data-src"])
            if attrs.get("srcset"):
                urls.extend(part.strip().split()[0] for part in attrs["srcset"].split(","))
            for url in urls:
                if url.startswith("#"):
                    continue
                parsed = urlsplit(urljoin(canonical + relative, url))
                if parsed.scheme not in ("http", "https") or parsed.netloc != origin:
                    continue
                target = root / unquote(parsed.path).lstrip("/")
                if target.is_dir():
                    target /= "index.html"
                if not target.is_file():
                    errors.append(f"{relative}: missing local resource {parsed.path}")
    return documents, sorted(set(errors))


class QuietHandler(SimpleHTTPRequestHandler):
    def handle(self):
        try:
            super().handle()
        except ConnectionError:
            pass  # The browser may close a page while an asset is still streaming.

    def log_message(self, *args):
        pass


def check_browser(root, documents, executable):
    from playwright.sync_api import sync_playwright

    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(root)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}"
    table_pages = [name for name, doc in documents.items()
                   if any(t == "table" and inside for t, _, inside in doc.items)]
    routes = ["/", "/blogs/", "/about-me/"]
    routes.extend("/" + name.removesuffix("index.html") for name in table_pages)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=executable)
            context = browser.new_context(reduced_motion="reduce", permissions=["clipboard-read", "clipboard-write"])
            context.route("**/*", lambda route: route.continue_()
                          if route.request.url.startswith(base + "/") else route.abort())
            for width in (320, 768, 1360):
                for route in dict.fromkeys(routes):
                    for appearance in ("light", "dark"):
                        page = context.new_page()
                        page.set_viewport_size({"width": width, "height": 900})
                        errors = []
                        page.on("pageerror", lambda error: errors.append(str(error)))
                        page.goto(base + route, wait_until="load")
                        page.evaluate("dark => document.documentElement.classList.toggle('dark', dark)", appearance == "dark")
                        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), (route, width, "page overflow")
                        if route == "/":
                            columns = page.locator("main div.relative.w-screen section.grid").evaluate_all(
                                "grids => grids.map(g => getComputedStyle(g).gridTemplateColumns.split(' ').length)")
                            expected_columns = 1 if width < 640 else 2 if width < 1024 else 3
                            assert all(count == expected_columns for count in columns), (width, columns)
                        broken_words = page.locator(".article-table td").evaluate_all("""cells => cells.filter(c => {
                            if (c.children.length || !/^[A-Za-z]{1,12}$/.test(c.textContent.trim())) return false;
                            const range = document.createRange(); range.selectNodeContents(c);
                            return range.getClientRects().length > 1;
                        }).map(c => c.textContent)""")
                        assert not broken_words, (route, width, broken_words)
                        clipped_toc = page.locator(".toc > details:visible").evaluate_all(
                            "regions => regions.some(r => r.scrollWidth > r.clientWidth + 1)")
                        assert not clipped_toc, (route, width, "table of contents clipped")
                        assert not page.locator('#bg-video source[src]').count(), "reduced motion loaded video"
                        assert not errors, (route, errors)
                        if width >= 1024 and page.locator("#TableOfContents a").count():
                            target = page.locator("#TableOfContents a").evaluate_all("""links => {
                                const anchors = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))));
                                return anchors.find((anchor, i) => anchor && anchors[i + 1]
                                    && anchors[i + 1].getBoundingClientRect().top - anchor.getBoundingClientRect().top > innerHeight)?.id;
                            }""")
                            if target:
                                page.evaluate("id => scrollTo({top:scrollY+document.getElementById(id).getBoundingClientRect().top,behavior:'instant'})", target)
                                page.wait_for_function("id => document.querySelector('#TableOfContents a[aria-current=location]')?.hash === '#' + id", arg=target)
                                assert page.locator("#TableOfContents a.active").count() == 1
                        if route == "/blogs/":
                            tab_rows = page.locator("#blog-tabs button").evaluate_all(
                                "buttons => buttons.map(b => Math.round(b.getBoundingClientRect().top))")
                            assert len(set(tab_rows)) <= 1, (width, "category filters wrapped", tab_rows)
                        page.close()
                print(f"Browser layout checks passed at {width} px", flush=True)
            page = context.new_page()
            page.set_viewport_size({"width": 1360, "height": 900})
            page.goto(base + "/", wait_until="load")
            page.locator("#search-button").click()
            entries = json.loads((root / "index.json").read_text(encoding="utf-8"))
            article = next((item for item in entries
                            if urlsplit(item.get("permalink", "")).path.startswith("/blogs/")
                            and urlsplit(item.get("permalink", "")).path != "/blogs/"), entries[0])
            search_term = next((word for word in re.findall(r"\w+", article["title"])
                                if len(word) >= 3), article["title"])
            page.locator("#search-query").fill(search_term)
            page.wait_for_function("document.querySelectorAll('#search-results a').length > 0")
            page.keyboard.press("Escape")
            assert not page.locator("#search-wrapper").is_visible(), "search did not close"
            page.goto(base + "/blogs/", wait_until="load")
            filters = page.locator("#blog-tabs button")
            if filters.count() > 1:
                filters.nth(1).click()
                assert filters.nth(1).get_attribute("aria-pressed") == "true"
                assert page.locator('#blog-tabs button[aria-pressed="true"]').count() == 1
            for name in table_pages:
                page.goto(base + "/" + name.removesuffix("index.html"), wait_until="load")
                button = page.locator(".copy-button").first
                if button.count():
                    expected = page.locator(".highlight-wrapper").first.locator("pre code").last.inner_text().strip()
                    button.focus()
                    assert button.evaluate("el => Number(getComputedStyle(el).opacity) > 0"), "copy button hidden on keyboard focus"
                    button.click()
                    page.wait_for_function("expected => navigator.clipboard.readText().then(text => text === expected)", arg=expected)
                    break
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path, help="fresh Hugo output directory")
    parser.add_argument("--browser", help="Chrome/Chromium executable; requires Python playwright")
    args = parser.parse_args()
    root = args.destination.resolve()
    documents, errors = check_html(root)
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"HTML checks passed for {len(documents)} pages", flush=True)
    if args.browser:
        check_browser(root, documents, args.browser)
        print("Browser checks passed at 320/768/1360 px in light/dark mode")


if __name__ == "__main__":
    main()
