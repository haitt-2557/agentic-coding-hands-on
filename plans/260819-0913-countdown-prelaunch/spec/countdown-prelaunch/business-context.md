---
status: draft
authored_by: takumi
created: 2026-08-19
lang: vi
---

# Business Context — F010_PrelaunchCountdownGate (provisional)

## Why It Matters

Giữ nội dung SAA 2025 kín tiếng cho tới đúng giờ công bố — khách ghé site sớm chỉ thấy một trang
đếm ngược, không thấy trước được nội dung sự kiện, và được tự động đưa vào trang chủ đúng lúc sự
kiện mở màn mà không cần tự làm gì.

## Who Uses It

- **Mọi khách truy cập site** (chưa đăng nhập, thành viên, hay quản trị viên — không phân biệt) —
  ai ghé site trong khoảng thời gian trước giờ G đều gặp cùng một trang chờ, vì đây là khóa theo
  thời gian, không phải khóa theo vai trò.

## What They Do

1. Khách bấm vào một liên kết bất kỳ của site trước giờ sự kiện — được đưa thẳng tới trang đếm
   ngược, không thấy được nội dung khác của site.
2. Khách theo dõi đếm ngược ngày/giờ/phút tự chạy mỗi giây, không cần làm gì thêm để trang cập
   nhật.
3. Đúng thời điểm sự kiện bắt đầu, khách đang xem trang đếm ngược được tự động đưa sang trang chủ;
   khách bấm liên kết sau mốc đó được vào thẳng trang mong muốn như bình thường, không còn bị chặn.
4. Nếu đội vận hành lỡ đặt sai hoặc quên đặt thời điểm sự kiện, site chọn mở cửa thay vì khóa cứng
   mãi mãi — tránh việc một lỗi cấu hình nhỏ làm sập toàn bộ site.

## Unresolved Questions

- **Xem trước cho đội vận hành**: có cần một cách riêng để đội vận hành xem nội dung thật trong
  lúc gate còn khóa hay không (ví dụ một liên kết xem trước riêng)? Chưa được ai yêu cầu trong bản
  gốc — ghi nhận là câu hỏi mở cho design owner.
- **Quản lý thời điểm sự kiện qua giao diện**: hiện vẫn phải sửa biến môi trường và redeploy để đổi
  giờ sự kiện. Việc thiết kế một cách đổi giờ không cần redeploy vẫn là TODO còn treo từ trước
  (xem `clarifications.md` mục "Design defects" #2) — chưa ai yêu cầu ưu tiên xây ngay trong lần
  này.
