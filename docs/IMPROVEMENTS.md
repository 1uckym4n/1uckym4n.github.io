# Các điểm nên cải thiện

Cập nhật 05/11/2026: đã xử lý cấu hình syntax (1), grid responsive (6),
pagination (8), pin Hugo (9) và tên manifest trong mục (10).
Chuẩn đang áp dụng, các giới hạn và lệnh kiểm tra nằm trong [BLOG-QUALITY.md](BLOG-QUALITY.md).

Rà soát ngày 15/10/2026 dựa trên source, `hugo config`, asset và docs Blowfish.
Đây là đề xuất; đợt dọn này không tự thay đổi ngôn ngữ, giao diện hoặc dịch vụ ngoài.

## Nên làm trước

1. **Chuẩn hóa cấu hình syntax khi cần.** `enableCodeCopy=true`,
   effective `markup.highlight.noClasses=true`. Docs khuyên `noClasses=false`,
   nhưng v3.9.0 có đường copy code thường không phụ thuộc class syntax; không
   kết luận nút copy hỏng từ cấu hình này. Kiểm tra cả code có số dòng trước khi đổi.
   [Tài liệu Configuration](https://blowfish.page/docs/configuration/).
2. **Thay bài mẫu bằng bài viết thật, bổ sung About me.** Home mô tả CTF, malware
   analysis, reverse engineering; ngoài bài mẫu Hugo hiện có thêm 3 bài dummy để
   xem bố cục. About chỉ có lời chào và GitHub. Nên thêm lĩnh vực quan tâm, vài
   dự án/lab và một cách liên hệ khi hoàn thiện nội dung thật.
3. **Để sau theo yêu cầu: ảnh nguồn nét hơn cho hero.** Thumbnail hiện 547×365, phù hợp card nhỏ nhưng
   bị phóng lên toàn màn hình. Khi có nguồn tốt hơn, dùng ảnh rộng khoảng 1600 px
   hoặc một bản vector phù hợp; không upscale ảnh nhỏ để giả tăng chất lượng.
4. **Đã tối ưu tải/phát video.** Runtime chuyển từ 1080p/30fps sang 720p/24fps;
   dùng poster khi tiết kiệm dữ liệu/giảm chuyển động, pause tab ẩn, không tải MP4
   ở trang có hero, chờ trang tải xong rồi mới bắt đầu video. Blur toàn trang vẫn
   giữ như cũ. Chưa đo Lighthouse nên không quy đổi thành điểm hiệu năng.

## Khi bắt đầu có nhiều bài

5. **Card có summary một câu, thời gian đọc.** Hiện cả hai đang tắt; bật khi bài đủ dài
   để người đọc chọn nội dung thuận tiện. Chuẩn hóa tags/categories; sửa đoạn bài mẫu
   ghi “Kỹ thuật” trong khi category thực tế là `Example`.
6. **Grid 1/2/3 cột theo màn hình.** CSS hiện ép 3 cột ở mọi chiều rộng trên 640 px,
   nên tablet/card hẹp. Có thể dùng 1 cột mobile, 2 tablet, 3 desktop.
7. **Thống nhất ngôn ngữ và metadata.** Site khai báo `en`/`en-US`, menu và About
   tiếng Anh nhưng bài mẫu tiếng Việt. Chọn ngôn ngữ chính hoặc cấu hình đa ngôn ngữ
   có chủ đích; giữ title, description, alt ảnh và ảnh chia sẻ phù hợp từng bài.
8. **Sửa phân trang trước khi có nhiều bài.** `paginate=20` không còn có tác dụng;
   `hugo config` hiện cho `pagination.pagerSize=10`. Chuyển sang `[pagination]`
   và đặt `pagerSize` theo số bài muốn hiện, rồi kiểm tra URL trang 2.

## Bảo trì và nhận diện

9. **Chốt phiên bản Hugo trong CI.** Workflow dùng `latest`, local đang kiểm tra
   0.167.0 Extended. Pin bản đã thử để build/deploy không thay đổi ngoài dự kiến;
   nâng có chủ đích cùng theme submodule.
10. **Cá nhân hóa favicon/manifest đầy đủ.** Giữ các kích thước icon hiện có.
    Manifest đang lấy từ theme với `name`/`short_name` rỗng; `favicon.ico` cũng còn
    bản theme. Tạo bộ nhận diện thống nhất và đặt tên app `dn4m` khi muốn hoàn thiện.
11. **Duy trì tài liệu và dọn theo build sạch.** README và hướng dẫn đã được bổ sung
    trong đợt này. Dùng lệnh dọn ở `docs/CLEANUP.md`, tránh xóa tài nguyên dependency.

Tài liệu cách áp dụng các tính năng: [BLOWFISH.md](BLOWFISH.md).
