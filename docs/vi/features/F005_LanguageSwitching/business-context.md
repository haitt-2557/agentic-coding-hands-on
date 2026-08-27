---
status: implemented
authored_by: takumi
created: 2026-08-26
lang: vi
fcode: F005
---

## Why It Matters

Sự kiện SAA 2025 có cả nhân viên Việt Nam lẫn khách/đối tác nước ngoài ghé trang. Nút đổi ngôn ngữ để mỗi người đọc được nội dung bằng ngôn ngữ họ quen, không phải đổi trình duyệt hay đoán nghĩa tiếng Việt/Anh. Bản revision này không đổi cơ chế đổi ngôn ngữ (đã chạy tốt) — chỉ chỉnh lại giao diện của nút và menu cho khớp với bản thiết kế mới nhất, để trang không bị "lệch" so với các phần khác đã theo đúng design.

## Who Uses It

- Khách chưa đăng nhập, nhân viên đã đăng nhập, admin — ai cũng thấy và dùng được nút này, không phân biệt quyền.
- Xuất hiện ở 2 chỗ: header trang chủ (mọi màn hình công khai) và header trang đăng nhập.

## What They Do

Người dùng bấm vào nút cờ + mã ngôn ngữ (VN/EN) trên góc header, một menu nhỏ xổ xuống cho 2 lựa chọn. Bấm chọn dòng còn lại thì toàn bộ chữ trên trang đổi ngôn ngữ ngay, menu tự đóng, và lựa chọn được nhớ cho lần ghé sau (không phải chọn lại mỗi lần vào trang). Với bản revision này, người dùng còn thấy rõ hơn: mỗi dòng trong menu có cờ nhỏ bên cạnh chữ, dòng đang chọn có nền sáng nhẹ để phân biệt, và nút trên header cũng đổi hình cờ theo đúng ngôn ngữ đang hiển thị.
