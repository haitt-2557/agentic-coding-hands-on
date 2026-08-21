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

**Cập nhật (lượt Login, 2026-08-19) — điều trên vẫn đúng cho MỌI route ngoại trừ đúng một
trang.** Hệ thống giờ có một trang đăng nhập (`/login`, Google OAuth qua Supabase) với một
kiểm tra THẬT ở phía server: `getUser()` xác minh lại với Supabase Auth, không đọc
`localStorage`. Nhưng phạm vi của kiểm tra đó chỉ có đúng một tác dụng — quyết định `/login`
có redirect người xem đi hay không. Nó **không** quyết định `role`, **không** bảo vệ
`/admin`/`/profile`/route nào khác, và **không** nối với bảng `guest`/`user`/`admin` bên
dưới. Đọc tiếp phần dưới với giả định "chưa có phân quyền thật" vẫn đúng cho mọi thứ ngoại
trừ ngoại lệ một-trang này — chi tiết ở § Special Conditions cuối tài liệu.

**Cập nhật (lượt Kudos Live board, 2026-08-21) — kết luận trên không đổi.** Lượt này mở rộng
mock session thêm một danh tính người xem (mã định danh + tên hiển thị), nhưng phần mở rộng đó
**làm rõ thêm cùng một sự thật** chứ không thêm gì được xác thực phía máy chủ: nó vẫn đọc/ghi
qua đúng cơ chế `localStorage` → `NEXT_PUBLIC_*` → mặc định cứng đã có, nên bất kỳ ai cũng tự
đổi được danh tính này từ DevTools của chính họ, không có bước xác thực nào đứng giữa.

## Authorization System Type

**System Type**: `other` — Không có hệ thống authorization thật nào tồn tại. Có một khái
niệm "vai trò" ba giá trị (guest/user/admin) trông giống RBAC, nhưng nó chỉ điều khiển
giao diện phía trình duyệt, không có bất kỳ kiểm tra nào ở phía máy chủ đứng sau — nên
không đủ điều kiện xếp vào `rbac` (hay bất kỳ loại nào trong bảng chuẩn: `abac`, `acl`,
`ownership`, `hybrid`).

**Identified Roles** (chỉ dùng để chọn giao diện hiển thị, không phải quyền hạn thật):

| Role | Nguồn | Mô tả |
|---|---|---|
| `guest` | Default cứng khi `localStorage`/env chưa seed (`lib/session/session-provider.tsx:24`) | Người dùng mặc định, chưa "đăng nhập" (mock) |
| `user` | `localStorage` key `saa.mock-role` → fallback `NEXT_PUBLIC_MOCK_ROLE` (`resolveSession()`, dòng 44-49) | Vai trò trung gian |
| `admin` | Cùng cơ chế seed như `user` | Vai trò cao nhất trong 3 vai trò mock |

Seed do người dùng cuối tự đặt trên trình duyệt của chính họ (vd
`localStorage.setItem('saa.mock-role', 'admin')` trong DevTools) — không có bước xác thực
nào diễn ra giữa chừng.

**Cập nhật (lượt Kudos Live board, 2026-08-21)**: loại authorization vẫn là `other`, không đổi.
`lib/session/session-provider.tsx` (trước đây chỉ mang `role` và `unreadCount`) được mở rộng
thêm hai field: một mã định danh và một tên hiển thị cho "người xem hiện tại". Đây **không** phải
một hệ thống định danh mới và **không** thêm role thứ tư — nó chỉ thêm dữ liệu vào đúng khái niệm
"vai trò/mock" đã mô tả ở bảng trên, qua đúng cơ chế seed đã có, và mang nguyên SECURITY NOTE ở
đầu file đó. Lý do cần danh tính này nằm ở § Điểm enforce bên dưới.

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

## Điểm enforce (client-only) và mã kỹ thuật

Cả 3 điểm ẩn/hiện đều enforce bằng early-return trong thân component (không phải route
guard, không phải middleware — không liên quan tới gate đếm-ngược ở `proxy.ts`, xem
§ Special Conditions bên dưới):

| Mã `PERM###` | Điểm enforce | Loại |
|---|---|---|
| `PERM001_AccountMenuVisibility` | `components/ui/account-menu.tsx:16` — `if (role === 'guest') return null;` | screen-permission |
| `PERM002_AdminDashboardLinkVisibility` | `components/ui/account-menu.tsx:51` — mục "Admin Dashboard" chỉ render `role === 'admin'` | screen-permission |
| `PERM003_NotificationBellVisibility` | `components/ui/notification-bell.tsx:16` — `if (role === 'guest') return null;` | screen-permission |

Chi tiết đầy đủ từng mã (permission rules, related routes/screens/modules) nằm ở
[permissions-matrix.md](./permissions-matrix.md). Lý do kiến trúc đứng sau việc chọn mock
session thay vì auth thật — và điều kiện để thay nó bằng auth thật — nằm ở
[ADR-001](../../decisions/ADR-001-mock-session-and-hand-rolled-i18n.md).

**Cập nhật (lượt Kudos Live board, 2026-08-21) — một affordance UI, chưa được cấp mã.** Trang
Sun* Kudos - Live board (`/kudos`) cần biết "bạn" là ai để (1) vô hiệu nút tim trên chính lời
cảm ơn bạn đã gửi, và (2) hiển thị đúng số liệu ở khu vực thống kê cá nhân ("Số Kudos bạn nhận
được", "Số Kudos bạn đã gửi", …). Không có danh tính nào để so sánh thì hai chỗ đó không có gì
để "loại trừ chính mình" hay "thuộc về ai" — đó là lý do mock session được mở rộng ở trên.

Đây là **một affordance UI trên dữ liệu tĩnh, không phải một điểm gate mới theo nghĩa PERM###**:
nó không quyết định người dùng có xem được trang hay không (`/kudos` vẫn công khai), không đọc
`role`, và không thêm ranh giới truy cập nào — nó chỉ quyết định MỘT nút cụ thể trên MỖI thẻ có
bấm được hay không, dựa trên so sánh dữ liệu tĩnh (`kudos.senderId === viewer.id`), tương tự cách
3 mã trên chỉ ẩn/hiện icon trên header.

| Mã `PERM###` | Điểm enforce dự kiến | Loại | Ghi chú |
|---|---|---|---|
| TBD (draft) — chưa được cấp | `components/kudos/kudos-card-actions.tsx:34,71` — `isOwnKudos = record.senderId === viewerId`, `disabled={isOwnKudos}` (đã viết, xác nhận trong lượt này) | screen-permission | Vô hiệu nút tim trên chính lời cảm ơn người xem đã gửi; không phải role-based, không đọc `role` |

Không có PERM### thứ hai phát sinh từ feature này — mọi tương tác khác trên trang (lọc, cuộn,
tìm kiếm, sao chép link, bốn trigger đích-hoãn) không phụ thuộc vào danh tính hay vai trò của
người xem. Mã trên chưa được cấp trong
[permissions-matrix.md](./permissions-matrix.md); nó giữ nguyên trạng `TBD (draft)` cho tới khi
một lượt rebuild-spec cấp mã thật — không có mã nào được bịa ra ở đây.

## Access Boundaries

Không có ranh giới truy cập thật nào giữa `guest`, `user`, và `admin` — cả ba đều xem
được cùng một nội dung nếu gõ đúng địa chỉ, kể cả trang được gắn nhãn "Admin Dashboard".
Điểm khác biệt duy nhất là những gì mỗi vai trò *nhìn thấy trên thanh điều hướng* để dẫn
họ tới các trang đó — không phải những gì họ *được phép làm*. Không có khái niệm "chủ sở
hữu tài nguyên" (ownership) trong hệ thống — không có tài nguyên nào (bài viết, đơn hàng,
hồ sơ dữ liệu…) để phân biệt ai là chủ. Trang Profile và Admin Dashboard hiện đều là
trang giữ chỗ tĩnh, chưa có nội dung hay dữ liệu cá nhân nào để bảo vệ.

**Cập nhật (lượt Kudos Live board, 2026-08-21)**: không đổi. Route `/kudos` mở công khai, không
có ranh giới truy cập nào giữa `guest`/`user`/`admin` khi xem trang này. Danh tính mock-user mới
**không** tạo ra khái niệm "chủ sở hữu tài nguyên" (ownership) nào — nó chỉ là một chuỗi so sánh
trên client, do chính người dùng đặt được từ DevTools.

## Special Conditions

**Cập nhật 2026-08-19**: có một điều kiện MỚI theo thời gian — trong lúc đếm ngược tới sự
kiện SAA 2025 còn chạy, mọi route (`/`, `/awards`, `/kudos`, `/profile`, `/admin`) đều bị
chặn và đưa về `/prelaunch` cho tới khi đếm ngược tới/qua hạn. Đây KHÔNG phải một
permission theo vai trò — áp dụng như nhau cho `guest`/`user`/`admin`, không đọc `role`
nào ở trên — nên không có mã `PERM###` nào cho nó và không ảnh hưởng tới bảng
`guest`/`user`/`admin` ở trên (một khi gate mở, mọi phân biệt vai trò cũ vẫn giữ nguyên
như đã mô tả). Chi tiết ở
[docs/vi/features/countdown-prelaunch/technical-spec.md](../features/countdown-prelaunch/technical-spec.md)
và [ADR-002](../../decisions/ADR-002-prelaunch-launch-timing-gate.md).

**Cập nhật (lượt Login, 2026-08-19)**: `/login` và `/auth/callback` được miễn trừ khỏi gate
đếm-ngược ở trên, cùng cách `/prelaunch` đã được miễn trừ — vẫn là gate theo THỜI GIAN,
không đổi bản chất "launch-timing, không phải authorization" của gate đó.

Tách biệt với gate thời gian ở trên: `/login` (`app/login/page.tsx`) giờ có thêm một kiểm
tra THẬT khác — `getUser()` phía server, redirect `/` nếu actor đã có phiên Supabase hợp
lệ. Đây là kiểm tra đầu tiên trong toàn hệ thống KHÔNG dựa trên `localStorage`/mock — được
ghi nhận là `PERM004_LoginRouteAuthGate`, type `route-guard` (loại đầu tiên khác
`screen-permission`) trong
[permissions-matrix.md](./permissions-matrix.md). Nó chỉ chi phối MỘT route (`/login`) và
không đọc/ghi `role` — không mở rộng ra bất kỳ route nào khác, không thay đổi kết luận
"không có phân quyền thật theo vai trò" ở đầu tài liệu này.

**Cập nhật (lượt Kudos Live board, 2026-08-21)**: mock session
(`lib/session/session-provider.tsx`) được mở rộng thêm danh tính người xem (mã định danh + tên
hiển thị) để phục vụ đúng hai chỗ trên trang `/kudos` nêu ở § Điểm enforce. Cơ chế seed
(`localStorage` → `NEXT_PUBLIC_*` → mặc định cứng) và SECURITY NOTE giữ nguyên, không đổi bản
chất — vẫn không có bước xác thực nào, vẫn không phải một access boundary. Route `/kudos` không
được gate mới ở lượt này; gate đếm-ngược trước sự kiện (nếu còn hiệu lực) và mọi special
condition khác ở trên vẫn áp dụng như cũ, không bị thay đổi bởi cập nhật này. Lý do kiến trúc vì
sao chọn mở rộng mock session thay vì gắn với Supabase user thật: đây là một ứng dụng thêm của
cùng quyết định trong [ADR-001](../../decisions/ADR-001-mock-session-and-hand-rolled-i18n.md),
không phải một quyết định kiến trúc mới cần ADR riêng.

Ngoài điều kiện trên, không có điều kiện đặc biệt nào khác theo IP hay môi trường triển
khai. Chuyển đổi ngôn ngữ (Việt/Anh) trên thanh điều hướng chỉ đổi văn bản hiển thị, không
mở khóa hay khóa bất kỳ tính năng nào theo ngôn ngữ — không phải một điều kiện phân
quyền. Chi tiết kỹ thuật của từng điểm ẩn/hiện nằm ở
[permissions-matrix.md](./permissions-matrix.md).
