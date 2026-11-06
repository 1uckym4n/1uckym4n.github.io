# Cách dùng Blowfish trong blog dn4m

Đối chiếu ngày **15/10/2026**: đã đọc đủ **15 bài** trong
[docs chính thức](https://blowfish.page/docs/) và đối chiếu mã/docs của submodule
đang cài: **v3.9.0**, commit `ebe683e9c2668972b71bc011e61e0004ff8e7689`.
Hugo local: **0.167.0 Extended**. Đây là ghi chú áp dụng cho repo, không phải bản
sao toàn bộ tài liệu. Docs đi kèm đúng phiên bản nằm tại
`themes/blowfish/exampleSite/content/docs/<slug>/index.md`.

## Bản đồ project

| Việc cần làm | Nơi chỉnh |
| --- | --- |
| Tên site, base URL, taxonomy, output, related | `config/_default/config.toml` |
| Giao diện, home, card, bài viết, search | `config/_default/params.toml` |
| Author, avatar, logo, ngôn ngữ, định dạng ngày | `config/_default/languages.toml` |
| Menu | `config/_default/menus.en.toml` |
| Trang chủ / Blogs / About | `content/_index.md`, `content/blogs/_index.md`, `content/about-me.md` |
| Bài và ảnh riêng | `content/blogs/<slug>/index.md` và ảnh trong cùng thư mục |
| Ảnh dùng chung có thể qua Hugo processing | `assets/img/` |
| Video, favicon được phục vụ nguyên dạng | `static/` |
| CSS / chuyển cảnh / video nền | `assets/css/custom.css`, `assets/js/blog-transition.js`, `assets/js/background-video.js` |
| Hook theme / tab chủ đề tự viết | `layouts/partials/`, `layouts/shortcodes/blogtabs.html` |
| CI xuất bản | `.github/workflows/hugo.yml` |

## Cài đặt và chạy

Blowfish v3 yêu cầu Hugo từ **0.162.0**. Repo này đã dùng Git submodule;
giữ cách cài hiện tại. Sau khi clone, chạy:

```powershell
git submodule update --init --recursive
hugo server --disableFastRender -D
```

`hugo --minify` build production; không cần chạy npm chỉ để viết bài.
Khi nâng theme, chọn phiên bản có chủ đích, kiểm tra diff submodule và chạy lại
các trang home, Blogs, About, bài, taxonomy cùng chuyển cảnh.
Nguồn: [Installation](https://blowfish.page/docs/installation/),
[Getting Started](https://blowfish.page/docs/getting-started/).

## Viết bài và front matter

```powershell
hugo new content blogs/ten-bai/index.md
```

```yaml
---
title: "Tên bài viết"
date: 2026-10-15T10:00:00+07:00
draft: true
description: "Mô tả cho tìm kiếm và chia sẻ."
summary: "Một câu giúp người đọc chọn bài."
featureimage: "thumbnail.png"
tags: ["ctf", "reverse-engineering"]
categories: ["Writeups"]
---
```

Đặt ảnh cạnh `index.md`. Preview nháp bằng `-D`, đổi `draft: false` khi đăng;
ngày tương lai vẫn bị bỏ khỏi build mặc định. Chỉ ghi các tùy chọn khác mặc định
trong front matter. `lastmod` có thể đi cùng `showDateUpdated`.
`showHero: false` tắt hero cho một trang; About đang dùng thiết lập này.
`excludeFromSearch: true` còn loại trang khỏi sitemap theo theme hiện tại.
Nguồn: [Front Matter](https://blowfish.page/docs/front-matter/).

## Ảnh, thumbnail và nền

Chỉ rõ `featureimage` để tránh chọn nhầm khi một bundle có nhiều ảnh.
Theme còn tự tìm tên kiểu `feature*`, `cover*`, `thumbnail*`; hero cũng xét
`background*`. Metadata và một số kiểu danh sách có cơ chế tìm ảnh riêng,
nên đổi ảnh phải kiểm tra cả RSS, Open Graph và taxonomy.

- Bài hiện tại dùng `thumbnail.png` cho card/hero. File này chỉ 547×365;
  nếu muốn nét khi phóng lớn, cần nguồn ảnh lớn hơn.
- `imagePosition` chỉnh vị trí crop hero; `imagePositionFeature` chỉnh crop trên card.
- `assets/img/background.jpg` vẫn dùng làm poster video và ảnh dự phòng.
- `static/video/background.mp4` là video nền đang dùng; không phải file thừa.
- About tắt hero, còn nền video và lớp gradient/blur có chủ đích.

Chỉ dẫn cũ trong docs Thumbnails nhắc `layouts/partials/hero.html`; code v3.9.0
thực tế gọi `hero/<heroStyle>.html`. Site hiện dùng `hero/background.html`.
Nguồn: [Thumbnails](https://blowfish.page/docs/thumbnails/), đối chiếu
`themes/blowfish/layouts/_default/single.html` và các partial hero/article-link.

## Cấu hình home, list và bài

Home đang dùng `profile`: avatar/author từ cấu hình ngôn ngữ, phần giới thiệu từ
`content/_index.md`. Số bài gần đây do `homepage.showRecentItems = 9` điều khiển.
Nút xem thêm trỏ `/blogs/`; `mainSections = ["blogs"]` giữ About ngoài danh sách.
Không cần đổi layout để thêm vài đoạn giới thiệu.
Nguồn: [Homepage Layout](https://blowfish.page/docs/homepage-layout/).

Search cần output home `HTML`, `RSS`, `JSON`; repo đã có. `showTaxonomies`
điều khiển việc hiện tag/category. Related cần chỉ mục `[related]`; repo đã khai báo.
Phân biệt card layout với `list.showCards`, vốn thay hình thức bề mặt của từng mục.
Không bật thêm `backgroundCanvas` khi chưa kiểm tra video nền tùy chỉnh.
Nguồn: [Configuration](https://blowfish.page/docs/configuration/).

Các điểm đã kiểm tra bằng `hugo config` và code theme, hiện ghi thành đề xuất:

1. `paginate = 20` đang bị bỏ qua; thực tế `pagination.pagerSize = 10`.
   Cấu hình mới cần dùng `[pagination]` và `pagerSize`.
2. `enableCodeCopy = true`, `markup.highlight.noClasses = true`.
   Docs khuyên `noClasses = false`, nhưng code v3.9.0 tạo nút theo
   `.highlight-wrapper` và có fallback đọc `code.textContent`, nên code block
   thường vẫn có cơ chế copy. Đây không phải bằng chứng nút copy đang hỏng.
   Khi chuẩn hóa syntax cần kiểm tra cả code thường lẫn code có số dòng.
3. Ngôn ngữ cấu hình `en` trong khi bài mẫu là tiếng Việt: cần quyết định ngôn ngữ
   chính rồi đồng bộ menu, metadata và nội dung.

## Markdown, trang, taxonomy

`_index.md` mô tả home/section/taxonomy; `index.md` trong bundle chứa bài.
Có thể dùng `cascade` ở section để đặt mặc định cho các bài con. Tiêu đề/mô tả
một tag có thể đặt trong `content/tags/<term>/_index.md`.
Repo đã khai báo `tag`, `category`, `author`, `series` ở config chính.
Trang ít tính năng có thể chọn `layout: simple`; bài dẫn ra site khác dùng
`externalUrl`. Giữ Markdown chuẩn cho heading, bảng, code fence và blockquote.
Nguồn: [Content Examples](https://blowfish.page/docs/content-examples/).

## Shortcode

Ưu tiên chức năng có sẵn trước khi viết template mới. Những nhóm đã đọc gồm:

| Nhu cầu | Shortcode/nhóm cần tra |
| --- | --- |
| Ghi chú và nhấn mạnh | alert, badge, lead, keyword, accordion |
| Ảnh và media | figure, gallery, carousel, video, youtubeLite |
| Sơ đồ, công thức, biểu đồ | mermaid, katex, chart |
| Bài/danh sách/CTA | article, list, button, cta, feature, stats |
| Trình bày nhiều phần | tabs/tab, timeline, steps, typeit, swatches |
| Code và nguồn bên ngoài | codeimporter, mdimporter, github, gitlab, gist, gitea, forgejo |
| Tiện ích | icon, email, ltr, rtl và các integration còn lại |

Ví dụ tự soạn:

```markdown
{{< alert icon="circle-info" >}}
Các bước này được thực hiện trong môi trường lab.
{{< /alert >}}

{{< figure src="diagram.png" alt="Luồng phân tích" caption="Sơ đồ tổng quan" >}}

{{< mermaid >}}
flowchart LR
  Sample --> Static --> Dynamic
{{< /mermaid >}}

{{< github repo="1uckym4n/1uckym4n.github.io" >}}
```

Importer remote khiến build phụ thuộc nguồn bên ngoài. SVG tùy chỉnh đặt ở
`assets/icons/`; `katex` chỉ cần gọi một lần trong trang. Tra tham số chi tiết và
ví dụ từng shortcode tại [Shortcodes](https://blowfish.page/docs/shortcodes/).
Tab lọc Blogs của repo là shortcode riêng `blogtabs`, không phải `tabs` của theme.

## Bài dummy và video nền

Ba bundle `dummy-ctf-notes`, `dummy-malware-lab`, `dummy-reversing-notes` đã được
xóa ngày 05/11/2026 sau khi kiểm tra bố cục. Các bundle này chỉ chứa Markdown,
dùng ảnh chung `assets/img/background.jpg`; không có ảnh riêng cần dọn thêm.

Video runtime đã tối ưu thành H.264 720p/24 fps, không audio, faststart;
bản gốc 4K vẫn ở `video-src/`. Source MP4 ban đầu chỉ nằm trong `data-src`:
`background-video.js` mới gắn khi trang cần video, không ở chế độ giảm chuyển
động/tiết kiệm dữ liệu và tab đang hiện. Tab ẩn thì pause; quay lại tiếp tục phát.
Trang có hero chỉ dùng hero, không tải thêm video. Khi JavaScript không chạy,
poster vẫn hiển thị. Nguyên tắc này cũng áp dụng cho hero dùng ảnh dự phòng.

## Series và tác giả

Repo đã có taxonomy series. Để gom loạt bài:

```yaml
series: ["Reverse engineering cơ bản"]
series_order: 1
seriesOpened: true
```

`series_order` quyết định thứ tự; nên dùng một series chính cho mỗi bài.
Nguồn: [Series](https://blowfish.page/docs/series/).

Site một người chưa cần nhiều tác giả. Khi mở rộng, tạo
`data/authors/<key>.json` với hồ sơ/social và tham chiếu bằng `authors: ["<key>"]`.
Hồ sơ taxonomy có thể mở rộng tại `content/authors/<key>/_index.md`.
Phân biệt author mặc định của site với danh sách authors của bài để tránh hiện lặp.
Nguồn: [Multiple Authors](https://blowfish.page/docs/multi-author/).

## Tùy chỉnh và nâng theme

Blowfish có sẵn search, TOC, taxonomy, layout và shortcode; nên tận dụng trước
khi tạo override. [Welcome](https://blowfish.page/docs/welcome/) là mục giới thiệu.

Hugo ưu tiên file project hơn file cùng đường dẫn của theme. `assets/css/custom.css`
được nạp sau CSS theme. Bộ màu riêng ở `assets/css/schemes/`, font ở `static/fonts/`.
Nếu thêm class Tailwind chưa có trong CSS được biên dịch sẵn, cần build CSS riêng;
viết CSS thuần không đòi npm build. Nguồn:
[Advanced Customisation](https://blowfish.page/docs/advanced-customisation/).

Hai hook `extend-head.html`, `extend-footer.html` được gọi bằng `partialCached`.
Không dùng dữ liệu page riêng trong đó. Có hook `extend-head-uncached.html` khi cần.
Icons trong `assets/icons/`; favicon trong `static/` theo tên quy ước. Comments cần
partial comments và `showComments`; analytics là một tùy chọn riêng.
Nguồn: [Partials](https://blowfish.page/docs/partials/).

Các selector của chuyển cảnh như `#hero-background`, `.article-link--card`, header
phụ thuộc markup theme. Mỗi lần nâng submodule phải kiểm tra chúng, cùng reduced
motion, Back, click tag, Ctrl-click, chế độ sáng/tối và màn hình nhỏ.

## Hosting và tính năng có dịch vụ ngoài

Repo dùng `main → GitHub Actions → gh-pages → GitHub Pages`. CI phải checkout
submodule. `baseURL` hiện là `https://1uckym4n.github.io/`; output là `public/`.
Mẫu workflow trong docs còn dùng phiên bản cũ, không chép đè workflow đang chạy.
Netlify/Render có lệnh build riêng; Cloudflare Rocket Loader có thể ảnh hưởng
appearance switcher. Nguồn:
[Hosting & Deployment](https://blowfish.page/docs/hosting-deployment/).

Bộ đếm view trên bài/card dùng Firebase project `blog-views-counter-6666`,
đã khai báo trong `params.toml` với `article.showViews = true`; likes đang tắt.
Theme tự nạp SDK, không cần chép đoạn `initializeApp` hay `getAnalytics` vào hook.
Cấu hình `measurementId` không tự bật Google Analytics trong bộ đếm của theme.
Override `assets/js/firebase.js` giữ code Blowfish v3.9.0 và chuẩn hóa cả dấu `\`
lẫn `/` trong ID, để preview Windows và bản deploy Linux dùng chung bộ đếm.

Trong Firebase Console cần bật **Authentication → Sign-in method → Anonymous**
và tạo **Cloud Firestore Standard**, database ID **`(default)`**, Production mode.
Ở tab **Rules**, dán nội dung [firestore.rules](firestore.rules) rồi **Publish**.
File này chỉ cấp quyền đọc bộ đếm khi đã xác thực, tạo view ban đầu bằng 1 và
cập nhật tăng đúng 1; các collection khác bị chặn. Giữ gói Spark nếu chỉ dùng
hạn mức miễn phí. Không cần bật Hosting hay Storage để đếm view.

Theme ghi dấu lượt xem trong `localStorage`, không có thời hạn: F5/quay lại cùng
trình duyệt không tăng, xóa storage/đổi thiết bị có thể được tính lại. Đây không
phải số người đọc duy nhất. Rules giới hạn thay đổi bộ đếm, không ngăn được mọi
cách tăng view giả. Sau deploy, mở một bài và kiểm tra số view hiện trên bài/card;
Firestore sẽ tự tạo document trong collection `views` khi lượt ghi đầu thành công.
Nguồn:
[Firebase: Views & Likes](https://blowfish.page/docs/firebase-views/).

## Mục lục toàn bộ docs đã đọc

Danh sách đối chiếu với trang index và sitemap tiếng Anh ngày 15/10/2026.

| # | Trang chính thức | Ghi chú trong tài liệu này |
| --- | --- | --- |
| 1 | [Welcome](https://blowfish.page/docs/welcome/) | Tính năng có sẵn |
| 2 | [Installation](https://blowfish.page/docs/installation/) | Phiên bản và submodule |
| 3 | [Getting Started](https://blowfish.page/docs/getting-started/) | Cấu trúc project, menu, author |
| 4 | [Configuration](https://blowfish.page/docs/configuration/) | Config và các điểm đang lệch |
| 5 | [Homepage Layout](https://blowfish.page/docs/homepage-layout/) | Profile, recent articles |
| 6 | [Shortcodes](https://blowfish.page/docs/shortcodes/) | Đủ nhóm chức năng, ví dụ dùng |
| 7 | [Front Matter](https://blowfish.page/docs/front-matter/) | Mẫu bài và override |
| 8 | [Multiple Authors](https://blowfish.page/docs/multi-author/) | Hồ sơ tác giả |
| 9 | [Partials](https://blowfish.page/docs/partials/) | Hooks, favicon, comments |
| 10 | [Thumbnails](https://blowfish.page/docs/thumbnails/) | Ảnh và quy tắc tìm ảnh |
| 11 | [Content Examples](https://blowfish.page/docs/content-examples/) | Markdown, section, taxonomy |
| 12 | [Series](https://blowfish.page/docs/series/) | Thứ tự loạt bài |
| 13 | [Advanced Customisation](https://blowfish.page/docs/advanced-customisation/) | CSS, Tailwind, override |
| 14 | [Hosting & Deployment](https://blowfish.page/docs/hosting-deployment/) | Quy trình deploy hiện tại |
| 15 | [Firebase](https://blowfish.page/docs/firebase-views/) | Views/likes tùy chọn |
