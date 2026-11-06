# Blog dn4m

Blog cá nhân chạy bằng Hugo Extended và Blowfish, xuất bản tại
[1uckym4n.github.io](https://1uckym4n.github.io/).

## Chạy trên máy

Phiên bản đã kiểm tra ngày 15/10/2026: Hugo **0.167.0 Extended**,
Blowfish **v3.9.0**, submodule `ebe683e9c2668972b71bc011e61e0004ff8e7689`.
Không cần cài npm để viết bài hoặc dùng CSS hiện có.

```powershell
git submodule update --init --recursive
hugo server --bind 127.0.0.1 --disableFastRender --renderToMemory -D
```

Mở `http://localhost:1313/`. `-D` cho xem bài nháp; bản publish bỏ qua bài có
`draft: true` và bài có ngày trong tương lai.
Preview lưu trong RAM và tắt bộ đếm Firebase qua `config/development/params.toml`.

```powershell
# Build giống CI
hugo --minify

# Dọn output cũ và tài nguyên được Hugo sinh nhưng không còn cần
hugo --minify --cleanDestinationDir --gc
```

`public/` và `resources/` là dữ liệu sinh lại được, đã được Git bỏ qua.
Lệnh dọn chỉ dùng với output mặc định `public/`; không trỏ destination vào thư mục nguồn.

## Viết bài mới

```powershell
hugo new content blogs/ten-bai-viet/index.md
```

Đặt ảnh cùng thư mục bài và chọn ảnh bằng `featureimage`. Ví dụ:

```yaml
---
title: "Tên bài viết"
date: 2026-10-15T10:00:00+07:00
draft: true
description: "Mô tả ngắn nội dung bài."
featureimage: "thumbnail.png"
tags: ["ctf"]
categories: ["Writeups"]
---
```

Đổi `draft` thành `false` khi đăng. About me dùng `showHero: false` để chỉ có
video nền, tránh chồng thêm ảnh hero.

## Tra cứu

- [Hướng dẫn Blowfish cho repo này](docs/BLOWFISH.md): cách dùng và mục lục đủ 15 trang docs.
- [Các điểm nên cải thiện](docs/IMPROVEMENTS.md): ưu tiên theo tình trạng thực tế.
- [Bản ghi dọn tài nguyên](docs/CLEANUP.md): ảnh đã bỏ, tài nguyên cần giữ và cách dọn tiếp.
- [Chuẩn chất lượng và kiểm tra trước khi đăng](docs/BLOG-QUALITY.md).

Nội dung ở `content/`; giao diện ở `config/_default/`; CSS ở `assets/css/custom.css`;
chuyển cảnh ở `assets/js/blog-transition.js`. Chỉnh override trong thư mục gốc,
giữ nguyên mã dependency tại `themes/blowfish/`.

Push lên `main` kích hoạt workflow `.github/workflows/hugo.yml`: build và xuất bản
output lên nhánh `gh-pages`. Xem kết quả trong tab Actions trên GitHub.
