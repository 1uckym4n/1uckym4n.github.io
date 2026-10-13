---
title: "Writeup mẫu: crackme đơn giản"
date: 2026-10-13T12:00:00+07:00
draft: false
description: "Bài mẫu cho section CTF — quy trình giải một bài reverse cơ bản."
tags: ["reverse", "ctf"]
categories: ["Writeup"]
---

Đây là bài mẫu cho section **CTF** — thay bằng writeup thật của bạn.

## Đề bài

File `crackme.exe` nhận vào một chuỗi, in ra "Correct!" nếu đúng.

## Phân tích

Load vào IDA/Ghidra, hàm `main` gọi `check_flag`:

```c
int check_flag(const char *input) {
    return strcmp(input, "s3cr3t_fl4g") == 0;
}
```

## Kết luận

Flag: `s3cr3t_fl4g`

Vài gợi ý trình bày writeup:

1. Nêu rõ hướng tiếp cận ban đầu và vì sao
2. Đoạn disassemble/decompile quan trọng + giải thích
3. Flag cuối + bài học rút ra
