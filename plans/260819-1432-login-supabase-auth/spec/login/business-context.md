---
status: draft
authored_by: takumi
created: 2026-08-19
lang: vi
---

# Business Context — Login qua Google OAuth (Supabase)

## Why It Matters

Trước lượt này, ứng dụng sự kiện SAA 2025 không có cách nào để một người thật chứng minh danh
tính của mình — mọi "vai trò" chỉ là một lựa chọn hiển thị tự đặt trên trình duyệt của chính họ.
Màn hình Login là bước đầu tiên đưa vào một cách đăng nhập thật, dùng ngay tài khoản Google sẵn
có của người dùng, không cần tạo mật khẩu riêng cho sự kiện.

## Who Uses It

- **Khách chưa đăng nhập** — mở `/login`, bấm nút, xác thực bằng tài khoản Google của mình, rồi
  vào trang chính của sự kiện.
- **Người đã đăng nhập** — nếu lỡ quay lại `/login`, được đưa thẳng vào trang chính, không phải
  đăng nhập lại lần nữa.

## What They Do

1. Khách mở đường dẫn `/login` — thấy tiêu đề sự kiện, một đoạn giới thiệu ngắn, và duy nhất một
   nút "LOGIN With Google".
2. Khách bấm nút — được chuyển sang màn xác nhận của Google (cùng một tab, không mở cửa sổ mới).
3. Khách đồng ý bằng tài khoản Google của mình — được đưa thẳng về trang chính của sự kiện,
   không cần thao tác gì thêm.
4. Nếu khách đổi ý và hủy giữa chừng, hoặc có trục trặc trong lúc xác thực, khách được đưa trở
   lại màn Login kèm một dòng thông báo ngắn để biết cần thử lại.
5. Lần sau quay lại trang, khách không cần đăng nhập lại — hệ thống vẫn nhớ đã đăng nhập.

## Unresolved Questions

- **Trang đích sau khi đăng nhập thành công có đúng là trang chủ không?** Bản thiết kế gốc ghi
  một trang khác không tồn tại trong ứng dụng này; đã tạm chọn trang chủ vì khớp với mô tả trong
  các test case, nhưng cần chủ sở hữu thiết kế xác nhận lại.
- **Việc bảo vệ các trang khác (trang giải thưởng, hồ sơ cá nhân, trang quản trị…) bằng phiên
  đăng nhập này có nằm trong phạm vi lượt sau không, hay cần làm ngay?** Lượt này chỉ dừng ở màn
  Login và việc ghi nhớ đã đăng nhập — chưa khóa bất kỳ trang nào khác.
