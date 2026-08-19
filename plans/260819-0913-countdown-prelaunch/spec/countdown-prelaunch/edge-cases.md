# Edge Cases — F010_PrelaunchCountdownGate (provisional)

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Đếm ngược về đúng 0 trong lúc actor đang đứng ở Prelaunch | Trang tự động chuyển sang Trang chủ trong vòng 1 giây kể từ mốc 0, không cần tải lại | "Không có thông báo — chỉ chuyển trang mượt sang Trang chủ" |
| Actor gõ thẳng URL trang khác (vd Awards) trong lúc còn khóa | Bị điều hướng ngay về Prelaunch trước khi trang kia kịp hiển thị bất kỳ nội dung nào | "Không có thông báo lỗi — chỉ là một lần chuyển hướng" |
| Biến môi trường thời điểm sự kiện bị thiếu hoặc sai định dạng | Toàn site coi như đã mở khóa — không khóa vĩnh viễn vì lỗi cấu hình | "Không có — actor không thấy khác biệt gì, vào thẳng Trang chủ như bình thường" |
| Actor cố vào lại Prelaunch sau khi sự kiện đã bắt đầu | Bị điều hướng ngay về Trang chủ, không hiển thị lại đếm ngược | "Không có — chuyển hướng êm, không thông báo" |
| Giá trị giờ/phút chạm biên (00, 09, 23, 59) | Luôn hiển thị đủ 2 chữ số; giá trị ngoài khoảng (âm, ≥24 giờ, ≥60 phút) không bao giờ xảy ra vì được tính bằng phép chia lấy dư | "Không có — chỉ là cách hiển thị số, không phải lỗi" |
