---
status: draft
authored_by: takumi
created: 2026-08-18
lang: vi
---

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| `NEXT_PUBLIC_EVENT_START_AT` rỗng hoặc không parse được thành ngày hợp lệ | Countdown chuyển sang zero-state (00/00/00), không throw lỗi, không crash trang (TC ID-60) | "None — không có thông báo lỗi hiển thị, chỉ hiện 00 ở cả 3 ô" |
| Thời điểm hiện tại đã qua `NEXT_PUBLIC_EVENT_START_AT` | Countdown về 00/00/00, nhãn "Coming soon" tự ẩn (TC ID-41, 42) | "None — không có thông báo, chỉ ẩn nhãn Coming soon" |
| Thẻ giải thưởng không có slug hợp lệ | Điều hướng tới `/awards` không kèm hash, không tự cuộn (TC ID-62) | "None — người dùng thấy trang Award Information từ đầu trang" |
| Khách chưa đăng nhập mở trang chủ | Chuông thông báo và menu tài khoản không hiển thị; toàn bộ nội dung công khai vẫn xem được (TC ID-0) | "None — không có thông báo, các phần tử liên quan tài khoản chỉ đơn giản không xuất hiện" |
| Người dùng đã đăng nhập nhưng không có thông báo chưa đọc | Không hiển thị badge đỏ trên chuông (TC ID-29) | "None — chuông thông báo hiển thị bình thường không có huy hiệu" |
| Mở panel thông báo khi chưa có dữ liệu thông báo thật | Panel hiện trạng thái rỗng cố định | "Không có thông báo mới" |
| Click ra ngoài vùng dropdown đang mở (ngôn ngữ/tài khoản/thông báo/widget) | Dropdown tự đóng, không cần click lại nút trigger (TC ID-32) | "None — dropdown đóng lại êm, không có thông báo" |
| Nhấn phím Esc khi một dropdown đang mở | Dropdown đóng ngay lập tức, focus không bị mất khỏi trang (TC ID-35) | "None — không có thông báo, chỉ đóng menu" |
| Xem trang trên viewport tablet hoặc mobile | Lưới giải thưởng chuyển còn 2 cột thay vì 3 (TC ID-16) | "None — bố cục tự điều chỉnh, không có cảnh báo" |
