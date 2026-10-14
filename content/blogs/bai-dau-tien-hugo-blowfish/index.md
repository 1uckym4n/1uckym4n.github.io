---
title: "Blog Hugo + Blowfish"
date: 2026-10-13T10:00:00+07:00
draft: false
description: "Bài mẫu để kiểm tra giao diện: heading, code block, danh sách, bảng và tag."
featureimage: "thumbnail.png"
tags: ["hugo", "web"]
categories: ["Example"]
---

Đây là bài mẫu — bạn chỉ cần sửa file Markdown này hoặc tạo file mới trong `content/blogs/`.

## Viết bài như thế nào

Tạo file `.md` mới trong đúng folder section, front matter tối thiểu như sau:

```yaml
---
title: "Tên bài viết"
date: 2026-10-13T10:00:00+07:00
draft: false
tags: ["ten-tag"]
---
```

Đặt `draft: true` nếu chưa muốn đăng — bài sẽ bị ẩn khi build.

## Markdown render ra sao

Đoạn code có nút copy (bật trong `params.toml`):

```python
def hello(name: str) -> str:
    return f"Xin chào {name}"

print(hello("thế giới"))
```

Danh sách, **bold**, *italic*, `inline code`, [link](https://gohugo.io) đều chuẩn Markdown.

| Cột 1 | Cột 2 |
|-------|-------|
| Hugo  | Generator |
| Blowfish | Theme |

> Blockquote — dùng cho trích dẫn hoặc lưu ý quan trọng.

Bài này nằm trong section **Kỹ thuật** và có tag `hugo`, `web` — bấm vào tag ở cuối bài để xem trang tổng hợp.
