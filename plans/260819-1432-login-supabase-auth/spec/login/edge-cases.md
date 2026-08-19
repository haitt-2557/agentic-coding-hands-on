---
status: draft
authored_by: takumi
created: 2026-08-19
lang: vi
---

# Edge Cases — Login qua Google OAuth (Supabase)

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Khách hủy ở màn đồng ý của Google | Google đưa trình duyệt trở lại `/auth/callback` kèm cờ lỗi; app redirect về `/login` với cờ hiển thị lỗi | "Đăng nhập không thành công. Vui lòng thử lại." |
| Trao đổi mã xác thực (`exchangeCodeForSession`) thất bại (mã hết hạn/không hợp lệ) | App redirect về `/login` với cùng cờ lỗi như trên, không hiện trang lỗi chung của Next.js | "Đăng nhập không thành công. Vui lòng thử lại." |
| Người đã đăng nhập tự gõ hoặc quay lại `/login` | Redirect ngay tới trang chính, form Login không render dù chỉ trong khoảnh khắc | "None — không có thông báo, chuyển trang tức thời." |
| Khách bấm nút Login nhiều lần liên tiếp thật nhanh | Sau lần bấm đầu, nút đã ở trạng thái disabled nên các lần bấm sau không có tác dụng, không gửi thêm yêu cầu xác thực nào | "None — nút không phản hồi thêm cho tới khi rời trang hoặc lỗi xuất hiện." |
| Khách mở `/login` trong lúc cổng đếm-ngược-trước-khi-mở-site còn khóa | Khác với mọi route khác của app (bị đưa về `/prelaunch`), `/login` vẫn tải bình thường nhờ nằm trong danh sách miễn trừ | "None — trang tải bình thường như khi cổng đã mở." |
