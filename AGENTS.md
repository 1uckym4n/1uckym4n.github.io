# Hướng dẫn làm việc với blog dn4m

- Đọc `README.md` và `docs/BLOWFISH.md` trước khi chỉnh cấu hình/template.
  Các đề xuất đang chờ nằm trong `docs/IMPROVEMENTS.md`.
- Repo dùng Hugo Extended, theme Git submodule Blowfish v3.9.0. Không sửa/xóa
  tài liệu, ảnh demo hoặc template trong `themes/blowfish/` để dọn website.
  Đặt override ở `layouts/`, `assets/`, `config/_default/` của project.
- Bài nằm trong `content/blogs/<slug>/index.md`; ảnh đi cùng bài. Ưu tiên chỉ rõ
  `featureimage` và kiểm tra cả card, hero, taxonomy, RSS, Open Graph khi đổi/xóa ảnh.
- Home/About dùng video nền; About có `showHero: false`. Bài có ảnh riêng dùng
  ảnh hero. Giữ quy tắc này khi sửa nền để tránh hai nền chồng lên nhau.
- `assets/js/background-video.js` chỉ gắn source MP4 sau khi trang đã tải xong;
  giữ `preload="none"` và `data-src` trong footer. Trang có hero không tải video;
  reduced motion/Save-Data dùng poster, tab ẩn phải pause.
- Hiệu ứng card → bài nằm trong `assets/js/blog-transition.js` và `custom.css`,
  thời lượng 700 ms, có native View Transitions, fallback và reduced motion.
- `extend-head.html` và `extend-footer.html` được cache. Dữ liệu riêng từng trang
  phải dùng hook uncached hoặc xử lý bằng DOM; không thêm điều kiện page vào hook cache.
- Không đánh giá ảnh là thừa chỉ bằng tìm chuỗi: Hugo còn tự tìm theo tên,
  metadata/RSS và favicon/manifest có quy ước riêng. Xem `docs/CLEANUP.md`.
- `public/`, `resources/` là output/cache. `video-src/` là bản video gốc để chỉnh sửa,
  không phải cache. Giữ cấu hình editor cục bộ của người dùng.
- Sau thay đổi source/config, chạy `hugo --minify` và `git diff --check`.
  Nếu đổi JavaScript, thêm `node --check assets/js/blog-transition.js` và
  `node --check assets/js/background-video.js`.
  Sau dọn tài nguyên, build sạch và kiểm tra URL ảnh/video trong HTML, XML, manifest.
