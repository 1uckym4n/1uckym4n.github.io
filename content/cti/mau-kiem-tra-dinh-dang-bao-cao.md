---
title: "Mẫu kiểm tra: định dạng báo cáo CTI"
date: 2026-10-13T11:00:00+07:00
draft: false
description: "Bài mẫu cho section CTI — tóm tắt executer, IOC, attribution."
tags: ["cti", "template"]
categories: ["Báo cáo"]
---

Đây là bài mẫu cho section **CTI** — thay bằng báo cáo thật của bạn.

## Tóm tắt

Mở đầu bằng 3–5 câu tóm tắt: đối tượng là ai, hành vi gì, mức độ ảnh hưởng.

## IOC (Indicator of Compromise)

```text
SHA256   : 4f2a...c9b1
C2       : example-c2[.]com (defanged)
Mutex    : Global\{A1B2C3D4-...}
```

> Nhớ **defang** các IOC khi đăng công khai (`hxxps://`, `example[.]com`).

## Phân tích

- Giai đoạn 1: initial access qua đính kèm email
- Giai đoạn 2: loader ghi vào Run key
- Giai đoạn 3: beacon về C2

## Attribution

Ghi chú về TTPs và liên hệ với các chiến dịch đã biết, kèm tham chiếu MITRE ATT&CK: `T1566.001` (Spearphishing Attachment).
