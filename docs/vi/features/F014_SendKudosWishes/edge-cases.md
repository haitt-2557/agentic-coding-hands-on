---
status: implemented
authored_by: takumi
created: 2026-08-24
lang: vi
---

| Scenario | Input | Expected | Severity |
|----------|-------|----------|----------|
| Mở `/kudos/send` khi chưa đăng nhập | Truy cập trực tiếp URL, không có phiên Supabase | Chuyển hướng `/login` trước khi render bất kỳ phần nào của form | high |
| Bấm Gửi khi cả 4 trường bắt buộc còn trống | Không nhập gì, bấm Gửi | Nút Gửi đang disabled nên không nhận click; nếu vẫn cố submit, mỗi trường thiếu hiện viền đỏ + "Không được để trống" | high |
| Nhập Danh hiệu vượt quá 100 ký tự | Chuỗi 150 ký tự | Chỉ 100 ký tự đầu được giữ lại, không nhận thêm | medium |
| Nhập nội dung lời chúc vượt quá 1.000 ký tự | Chuỗi 1.200 ký tự | Bộ đếm dừng ở `1.000/1.000`, không nhận thêm ký tự | medium |
| Chọn hashtag thứ 6 khi đã chọn đủ 5 | Bấm vào một hàng chưa chọn khi 5 hashtag khác đã chọn | Hàng đó ở trạng thái disabled, không nhận click, không có hashtag thứ 6 nào được thêm | medium |
| Đính kèm tệp `.pdf`, `.mp4` hoặc `.txt` | Chọn một trong ba loại tệp trên | Tệp bị từ chối kèm thông báo lỗi định dạng, không thêm vào danh sách ảnh | medium |
| Thêm ảnh thứ 6 khi đã có đủ 5 ảnh hợp lệ | Chọn thêm một ảnh `.jpg` khi đã có 5 ảnh | Nút thêm ảnh đã ẩn từ khi đủ 5 — không có thao tác nào để thêm ảnh thứ 6 | low |
| Bật "Ẩn danh" rồi bấm Gửi mà chưa nhập Nickname | Bật checkbox, để trống Nickname, bấm Gửi | Trường Nickname hiện viền đỏ + "Không được để trống", không submit | high |
| Tắt "Ẩn danh" sau khi đã nhập Nickname | Nhập Nickname, sau đó tắt checkbox | Trường Nickname biến mất; giá trị đã nhập không còn được gửi kèm dòng `kudos` | low |
| Gõ `@` theo sau một tên trong nội dung | Gõ `@Nguyễn` vào textarea | Không có danh sách gợi ý mention nào bật lên — ký tự được gõ như văn bản thường (tính năng hoãn, không assert được TC ID-12/13/33) | low |
| Chọn chính mình làm Người nhận | Người gửi tìm và chọn đúng tên/tài khoản của họ | Không có ràng buộc nào chặn — lời chúc vẫn gửi được bình thường (hành vi chưa được đặc tả, ghi ở `technical-spec.md` Unresolved #3) | low |
| Bấm "Hủy" giữa chừng khi đã điền một phần form | Điền vài trường, bấm Hủy | Toàn bộ nội dung bị bỏ, không có dòng `kudos` nào được tạo, không có ảnh nào được tải lên Storage, quay lại `/kudos` | high |
| Request ghi trực tiếp gán `sender_id` khác `auth.uid()` của người gọi | Gọi Supabase client với `sender_id` giả mạo | Row Level Security từ chối; không có dòng nào được ghi | high |
| Gửi thành công có ảnh đính kèm | Form hợp lệ kèm 2 ảnh, bấm Gửi | Ảnh được tải lên Supabase Storage trước, đường dẫn lưu kèm dòng `kudos`, sau đó redirect `/kudos` kèm toast thành công | high |
