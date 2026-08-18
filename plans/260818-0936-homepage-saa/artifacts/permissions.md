# Permissions

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Analysis Scope**: Toàn bộ repo — xem chi tiết kỹ thuật ở [permissions-matrix.md](./permissions-matrix.md)

> **Curated, plain-language view.** Tài liệu này dành cho PM/BA/khách hàng cần hiểu ai
> làm được gì mà không cần đọc mã PERM###. Bảng chi tiết kỹ thuật (mã PERM###, dòng code,
> file nguồn) nằm ở [permissions-matrix.md](./permissions-matrix.md). Nội dung dưới đây
> được suy ra TỪ bảng đó.

## Cảnh báo quan trọng nhất: hệ thống này chưa có phân quyền thật

Trước khi đọc phần "ai làm được gì" bên dưới, cần hiểu rõ: **mọi điều mô tả trong tài
liệu này chỉ là việc ẩn/hiện giao diện, không phải một hàng rào bảo mật**. "Vai trò"
(role) người dùng đang chọn được lưu ngay trên trình duyệt của chính họ (giống như một
tùy chọn hiển thị, không khác gì bật/tắt dark mode) — không có máy chủ nào xác thực hay
kiểm tra lại giá trị này. Bất kỳ ai cũng có thể tự đổi vai trò của mình từ công cụ dev
của trình duyệt mà không cần đăng nhập gì cả.

Hệ quả trực tiếp: **trang Admin Dashboard (`/admin`) có thể truy cập được bởi bất kỳ ai
gõ đúng địa chỉ, dù họ có được thấy đường dẫn tới đó trong menu hay không.** Việc ẩn mục
menu chỉ là "khuất mắt", không phải "khóa cửa". Khi hệ thống có xác thực thật (đăng nhập
server), toàn bộ quy tắc dưới đây phải được dựng lại và kiểm tra ở phía máy chủ — không
được xem những gì mô tả ở đây là đã đủ an toàn.

## Authorization System Type

**System Type**: `other` — Không có hệ thống authorization thật nào tồn tại. Có một khái
niệm "vai trò" ba giá trị (guest/user/admin) trông giống RBAC, nhưng nó chỉ điều khiển
giao diện phía trình duyệt, không có bất kỳ kiểm tra nào ở phía máy chủ đứng sau — nên
không đủ điều kiện xếp vào `rbac` (hay bất kỳ loại nào trong bảng chuẩn: `abac`, `acl`,
`ownership`, `hybrid`).

**Identified Roles** (chỉ dùng để chọn giao diện hiển thị, không phải quyền hạn thật):
- `guest` — người dùng mặc định, chưa "đăng nhập" (mock)
- `user` — vai trò trung gian
- `admin` — vai trò cao nhất trong 3 vai trò mock

## Curated View

- **`guest`** thấy đầy đủ nội dung trang chủ (hero, đếm ngược, giải thưởng, Kudos) nhưng
  **không thấy** biểu tượng tài khoản và biểu tượng thông báo trên thanh điều hướng — hai
  biểu tượng này biến mất hoàn toàn, không hiện dưới dạng mờ hay khóa.
- **`user`** thấy thêm biểu tượng tài khoản (mở ra menu "Profile" + "Sign out") và biểu
  tượng thông báo (mở ra một bảng thông báo hiện "chưa có thông báo nào" — nội dung này
  cố định, chưa có dữ liệu thông báo thật cho bất kỳ ai), nhưng **không thấy** mục "Admin
  Dashboard" trong menu tài khoản.
- **`admin`** thấy mọi thứ `user` thấy, cộng thêm một mục "Admin Dashboard" trong menu
  tài khoản dẫn tới trang `/admin`.
- **Bất kỳ ai** — kể cả `guest` chưa từng thấy mục menu đó — vẫn **truy cập được** trang
  `/admin` nếu họ tự gõ địa chỉ này vào trình duyệt. Việc ẩn mục menu không ngăn được ai.
- Nút "Sign out" chỉ là một nút bấm trên giao diện — bấm vào không có tác dụng đăng xuất
  thật, vì không có phiên đăng nhập nào đang tồn tại để đăng xuất khỏi.

## Access Boundaries

Không có ranh giới truy cập thật nào giữa `guest`, `user`, và `admin` — cả ba đều xem
được cùng một nội dung nếu gõ đúng địa chỉ, kể cả trang được gắn nhãn "Admin Dashboard".
Điểm khác biệt duy nhất là những gì mỗi vai trò *nhìn thấy trên thanh điều hướng* để dẫn
họ tới các trang đó — không phải những gì họ *được phép làm*. Không có khái niệm "chủ sở
hữu tài nguyên" (ownership) trong hệ thống — không có tài nguyên nào (bài viết, đơn hàng,
hồ sơ dữ liệu…) để phân biệt ai là chủ. Trang Profile và Admin Dashboard hiện đều là
trang giữ chỗ tĩnh, chưa có nội dung hay dữ liệu cá nhân nào để bảo vệ.

## Special Conditions

Không có điều kiện đặc biệt nào theo thời gian, IP, hay môi trường triển khai. Chuyển đổi
ngôn ngữ (Việt/Anh) trên thanh điều hướng chỉ đổi văn bản hiển thị, không mở khóa hay
khóa bất kỳ tính năng nào theo ngôn ngữ — không phải một điều kiện phân quyền. Chi tiết
kỹ thuật của từng điểm ẩn/hiện nằm ở [permissions-matrix.md](./permissions-matrix.md).
