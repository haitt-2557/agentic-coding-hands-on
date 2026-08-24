---
status: draft
authored_by: takumi
created: 2026-08-21
lang: vi
---

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Bộ lọc hiện tại (hashtag/phòng ban) không khớp lời cảm ơn nào | Cả khối HIGHLIGHT KUDOS lẫn ALL KUDOS đều hiện trạng thái rỗng thay vì danh sách trống không giải thích | "Hiện tại chưa có Kudos nào." |
| Bảng xếp hạng "10 SUNNER NHẬN QUÀ MỚI NHẤT" chưa có dữ liệu | Bảng hiện đúng câu trạng thái rỗng thay vì bảng trống | "Chưa có dữ liệu" |
| Người dùng thả tim cho chính lời cảm ơn mình đã gửi | Nút tim ở trạng thái vô hiệu, không nhận click, không có thông báo lỗi riêng vì đây là trạng thái hiển nhiên | "None — nút tim hiển thị mờ/không bấm được, không có thông báo bật lên." |
| Người dùng thả tim rồi bấm lại ngay lập tức (double-click nhanh) | Chỉ tính là một lượt thả và một lượt gỡ — đếm không tăng quá một đơn vị mỗi lượt bấm, không có tình trạng đếm nhảy hai lần | "None — đếm tim thay đổi đúng một đơn vị mỗi lần bấm." |
| Trình duyệt từ chối quyền truy cập clipboard khi bấm "Copy Link" | Thao tác sao chép thất bại êm, không có lỗi không được bắt hiện ra console, và không có thông báo thành công giả | "None — không có thông báo lỗi riêng; chỉ đơn giản là không có xác nhận sao chép thành công hiện ra." |
| Người dùng gõ quá 100 ký tự vào ô tìm kiếm bảng tên nổi bật | Ô nhập chặn ở ký tự thứ 100, không nhận thêm ký tự nào, không có thông báo lỗi vì đây là giới hạn nhập liệu thông thường | "None — ô tìm kiếm đơn giản không nhận thêm ký tự." |
| Người dùng bấm ô mời gửi lời cảm ơn, "Xem chi tiết", một avatar/tên, hoặc "Mở Secret Box" | Control phản hồi hình ảnh (trạng thái focus/hover) nhưng không điều hướng hay mở ra bất kỳ màn hình nào, vì các đích đó chưa được thiết kế ở lượt này | "None — không có điều hướng nào xảy ra; đây là hành vi placeholder có chủ đích." |
| Xem trang dưới các ngưỡng responsive khác nhau (không phải một ngưỡng chung 375px) | Khối HIGHLIGHT KUDOS thu về hiển thị một thẻ mỗi lần thay vì ba ở MỌI viewport dưới 1440px (`min-[1440px]:` trên `highlight-carousel.tsx`, không phải dưới 375px); khu vực ALL KUDOS và sidebar xếp chồng một cột dưới breakpoint `lg` (1024px, Tailwind mặc định); bảng tên nổi bật SPOTLIGHT BOARD co liên tục theo container query ở mọi độ rộng, không có breakpoint rời rạc; ảnh đính kèm ALL KUDOS tự xuống dòng (`flex-wrap`) khi không đủ chỗ — không có phần nào tràn ngang trang xuống tới sàn thiết kế 375px | "None — bố cục tự điều chỉnh, không có cảnh báo." |
| Khách chưa đăng nhập mở trang Sun* Kudos - Live board | Trang tải công khai giống hệt người đã đăng nhập — không có yêu cầu đăng nhập nào, vì bảo vệ đường dẫn vẫn chưa được triển khai ở lượt này | "None — trang tải bình thường, không yêu cầu đăng nhập." |
| Một tên trong bảng tên nổi bật (SPOTLIGHT BOARD) có toạ độ gốc từ thiết kế nằm ngoài chiều cao khung (4/106 tên) | Tên đó bị cắt (clip) theo viền bo góc của khung thay vì vẽ tràn xuống nền trang bên dưới khung | "None — tên đó không còn hiển thị; không có thông báo nào." |
