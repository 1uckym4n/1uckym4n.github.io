# Dọn tài nguyên ngày 15/10/2026

Đã rà ảnh/video của project, cấu hình, template, quy tắc tự tìm ảnh của theme,
HTML/XML sau build và favicon/manifest. Không sửa submodule `themes/blowfish/`.

## Đã dọn

- **05/11/2026:** xóa ba bundle `dummy-ctf-notes`, `dummy-malware-lab`,
  `dummy-reversing-notes` theo yêu cầu. Build sạch để bỏ trang, taxonomy, RSS và
  chỉ mục search cũ. Mỗi bundle chỉ có `index.md`, không có tài nguyên riêng.
- **`content/blogs/bai-dau-tien-hugo-blowfish/featured.jpg`** — ảnh rừng cũ,
  409.942 byte. Bài đã chọn `featureimage: "thumbnail.png"`. Tuy vậy, trước khi
  dọn, Open Graph/RSS và một số trang taxonomy vẫn tự chọn ảnh cũ theo tên.
  Sau khi bỏ ảnh, build đã chuyển cả các vị trí này sang thumbnail mới.
- **Output cũ trong `public/`** — các bản `featured_raw.jpg`, `featured_new.jpg`,
  ảnh resize cũ, nhiều bundle CSS/JS có hash cũ và file thử `_transition-preview`.
  Dọn bằng chính Hugo rồi build lại, không xóa thủ công tài nguyên của theme.
- **Cache không còn dùng trong `resources/`** — Hugo GC dọn 11 file.
- **`homepage.recentLimit`** — bỏ khóa không được theme v3.9.0 đọc.
  Số bài vẫn là `homepage.showRecentItems = 9`, không đổi hành vi hiện tại.
- Cập nhật chú thích lỗi thời trỏ tới code morph cũ trong footer; logic thực tế
  nằm ở `assets/js/blog-transition.js`.

| Phạm vi | Trước | Sau | Số file trước → sau |
| --- | ---: | ---: | ---: |
| `public/` | 16.354.127 byte | 6.822.981 byte | 172 → 51 |
| `resources/` | 1.248.493 byte | 196.789 byte | 15 → 4 |
| Ảnh nguồn đã bỏ | 409.942 byte | 0 byte | 1 → 0 |

Tổng dung lượng thu hồi ở working directory khoảng **10,48 MiB**.
Các con số output/cache sẽ thay đổi sau những lần build tiếp theo. Đây không phải
giảm tương ứng kích thước lịch sử Git: ảnh cũ vẫn có thể khôi phục từ commit trước.

## Tài nguyên vẫn cần giữ

| Tài nguyên | Lý do |
| --- | --- |
| `thumbnail.png` cạnh bài | Thumbnail, hero, ảnh chia sẻ và RSS hiện tại |
| `assets/img/avatar.png` | Logo header và author profile |
| `assets/img/background.jpg` | Poster video và ảnh nền dự phòng |
| `static/video/background.mp4` | Video nền runtime; lần dọn đầu 5,24 MiB, sau tối ưu còn 2,47 MiB |
| `static/favicon-16x16.png`, `favicon-32x32.png` | Link favicon do head theme tạo |
| `static/apple-touch-icon.png` | Icon Apple |
| `static/android-chrome-192x192.png`, `android-chrome-512x512.png` | Được `site.webmanifest` của theme tham chiếu |
| `themes/blowfish/` | Dependency; ảnh demo/docs không phải rác của project |
| `video-src/background-4k.mp4` | Bản gốc để biên tập, không phải cache; đã Git-ignore |
| `.zcodeignore` | Cấu hình editor cục bộ có sẵn của người dùng |
| `.hugo_build.lock` | File do Hugo quản lý; không dọn khi server đang chạy |

Không phát hiện cặp ảnh/video trùng byte trong `assets/`, `static/`, `content/`.
Các icon khác kích thước có mục đích riêng, không coi là bản trùng.

## Cách dọn những lần sau

1. Tìm tham chiếu trong source và kiểm tra tên tự nhận `feature*`, `cover*`,
   `thumbnail*`, `background*`; đọc cả manifest, metadata và RSS.
2. Chỉ bỏ ảnh nguồn đã xác nhận lỗi thời. Với ảnh trong bundle, Hugo có thể copy
   nguyên file dù nội dung Markdown không tham chiếu trực tiếp.
3. Chạy tại root project, với output mặc định `public/`:

   ```powershell
   hugo --minify --cleanDestinationDir --gc
   ```

4. Kiểm tra card home, Blogs, taxonomy, hero bài, Open Graph/Twitter và RSS.
   Preview local: `hugo server --disableFastRender`.
5. `git diff --check`; kiểm tra `git status`. Không thêm `public/`, `resources/`
   hoặc video gốc vào commit.

## Kết quả kiểm tra lần này

- Production build thành công: 24 trang, 1 non-page file trong bundle bài.
- Kiểm tra 172 tham chiếu asset trong HTML/CSS/XML và manifest: không có file thiếu.
- Không còn ảnh `featured*` cũ hoặc output `_transition-preview` trong `public/`.
- Open Graph, Twitter và RSS của bài đều chọn `thumbnail.png`.
- `node --check assets/js/blog-transition.js` và `git diff --check` đạt.
