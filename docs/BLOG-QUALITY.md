# Chất lượng blog dn4m

Đối chiếu tài liệu gốc và kiểm tra bản demo ngày 05/11/2026.
Đây là các yêu cầu kỹ thuật và kiểm tra thực tế, không phải chứng nhận WCAG
hay kết quả Core Web Vitals ngoài thực địa.

## Chuẩn tham chiếu

| Mảng | Yêu cầu áp dụng | Nguồn |
| --- | --- | --- |
| Đọc trên mobile và khi zoom | Nội dung thường reflow ở 320 CSS px. Bảng dữ liệu được cuộn riêng, giữ nguyên từ và cấu trúc cột. | [WCAG 2.2, Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) |
| Bàn phím và nút bấm | Focus nhìn thấy được, vùng cuộn dùng được bằng bàn phím, bộ lọc báo trạng thái. Mục tiêu chạm tối thiểu 24×24 CSS px, có các ngoại lệ về khoảng cách và liên kết trong dòng. | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| Hiệu năng | Mục tiêu LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1. Cần số đo người dùng thật để kết luận site đạt Core Web Vitals. | [Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals) |
| Tìm kiếm và chia sẻ | Title, description, canonical, sitemap, Open Graph và dữ liệu Article có tác giả, ngày, ảnh phù hợp. | [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) |
| Render nội dung | Dùng hook bảng có ngữ nghĩa HTML, ảnh đứng riêng ngoài paragraph, lexer phù hợp với nội dung. | [Hugo table hooks](https://gohugo.io/render-hooks/tables/), [Markup configuration](https://gohugo.io/configuration/markup/) |

## Cấu hình và chức năng hiện có

- Search hỗ trợ gõ và dán, Ctrl/Cmd+K, Escape và quản lý focus của theme.
  Project override thêm sự kiện `input`, truy vấn sau khi tải chỉ mục xong và tránh request lặp.
- RSS có liên kết ở footer và dùng ảnh khai báo qua `featureimage`.
  Article JSON-LD dùng cùng bộ giải quyết URL ảnh.
- Bảng có header `scope="col"`, vùng cuộn được gắn nhãn và nhận focus.
  Bảng ba/bốn cột có chiều rộng tối thiểu, giữ nội dung dễ đọc trên điện thoại.
- Syntax dùng class Chroma và palette sáng/tối sẵn trong theme. Disassembly có
  địa chỉ IDA hoặc hex dump dùng `text` khi lexer ASM nhận diện sai.
- Card trang chủ có 1/2/3 cột theo mobile/tablet/desktop.
- TOC dùng bộ theo dõi cuộn của theme, tô sáng mục đang đọc bằng CSS.
  `toc-highlight.js` đồng bộ `aria-current`/TOC mobile và giữ mục hiện tại trong
  vùng cuộn sidebar. Glow không có animation lặp; reduced motion tắt transition.
- Video giữ source trong `data-src`, `preload="none"`, poster khi reduced motion/Save-Data,
  không tải trên bài có hero và pause khi tab ẩn.
- Bản nháp dùng server loopback, render trong RAM và tắt Firebase ở môi trường development.
- Hugo được pin ở 0.167.0 Extended. CI kiểm tra HTML/tài nguyên trước bước deploy.

Reading time, ngày cập nhật, series, related posts, breadcrumb, comments và newsletter
là các lựa chọn theo nhu cầu biên tập. Chúng không thay thế việc kiểm tra bố cục và nội dung.
Repo đã có search, RSS, TOC, taxonomy, related posts và nút copy code.

## Viết bài

- Giữ `draft: true` khi xem demo. Kiểm tra bản nháp riêng trước khi quyết định đăng.
- Dùng Markdown chuẩn cho ảnh, mô tả đúng nội dung trong alt và đặt dòng trống trước/sau ảnh.
- Khai báo cả `featureimage` và `images` cho ảnh card/hero và ảnh chia sẻ của bài.
- Gắn đúng ngôn ngữ code. Output terminal, pseudocode và dump dữ liệu có thể dùng `text`.
- Dùng heading có thứ tự, header bảng ngắn và rõ nghĩa. Dữ liệu kỹ thuật dài có thể cuộn ngang trong vùng bảng.

## Kiểm tra trước khi đăng

Build sạch vào `public/` như README cho phép, rồi chạy kiểm tra tĩnh bằng Python 3:

```powershell
hugo --minify --cleanDestinationDir
python scripts/check-blog.py public
git diff --check
```

Script kiểm tra một H1/trang, HTML ảnh/figure, alt ảnh trong bài, scope của header bảng,
JSON-LD hợp lệ, cú pháp Obsidian còn sót, token lỗi của highlighter và URL tài nguyên cục bộ.
Script bỏ qua kiểm tra một H1 đối với trang alias redirect.

Để kiểm tra bản nháp và các thao tác trong trình duyệt:

```powershell
$qaOutput = Join-Path $env:TEMP 'dn4m-preview-qa'
hugo --minify --environment development -D --destination $qaOutput
python -m pip install playwright
python scripts/check-blog.py $qaOutput --browser 'C:\Program Files\Google\Chrome\Application\chrome.exe'
```

Browser test mở build trên HTTP server loopback tạm, chặn request ra ngoài, kiểm tra
320/768/1360 px ở cả sáng/tối, page overflow, từ ngắn trong bảng, reduced motion,
JavaScript error, search bằng thao tác dán và nội dung được copy vào clipboard.
Đường dẫn Chrome có thể thay bằng Chromium tương thích đã cài.

Khi thay JavaScript, chạy thêm:

```powershell
node --check assets/js/blog-transition.js
node --check assets/js/background-video.js
node --check assets/js/search.js
node --check assets/js/toc-highlight.js
```

## Giới hạn của lần rà soát

Các kiểm tra tự động này không thay thế đọc bài trên màn hình thật, kiểm tra screen reader,
đối chiếu độ tương phản của mọi trạng thái, hoặc đo hiệu năng với người dùng thật.
Chưa có kết quả Lighthouse/CrUX để kết luận site đạt các ngưỡng Core Web Vitals.
Các override `search.js`, `schema.html`, `toc.html` và `rss.xml` dựa trên Blowfish v3.9.0,
cần so sánh lại khi nâng theme.
Override TOC sửa việc chọn nhầm heading trước đó khi bấm anchor gần nhau.
