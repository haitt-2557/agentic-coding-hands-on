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


---

<!-- Forward-drafted at F014_SendKudosWishes implement-start (2026-08-24).
     MERGED as a delta section, NOT copied over this file: the draft is explicitly a
     delta and a literal copy would have destroyed the preceding sections.
     Reconciled to as-built by the next Core rebuild-spec pass. -->

# Permissions — Delta: Gửi lời chúc Kudos (`/kudos/send`)

> **Bản nháp forward-author (Stage 1.5, takumi).** Đây là DELTA nối vào
> `docs/vi/system/permissions.md` hiện có — không phải bản viết lại toàn bộ tài liệu đó.
> Được promote khi implement bắt đầu, rồi RECONCILE về as-built bởi pha Core hậu-forge.
> Trigger: tính năng này thêm route-guard + RLS mới — theo Trigger Mapping của
> `subagent-patterns.md` § Documentation (Auth/RBAC/policy/guard → `permissions.md`).

**Nguồn**: `plans/260824-0912-send-kudos-wishes/clarifications.md` (quyết định 3, Session
2026-08-24) + test case ID-0 / ID-1 (`ihQ26W78P2`, dẫn qua `evidence/study-context.json`).

## 1. Route guard mới trên `/kudos/send` — REAL guard thứ hai của app

Toàn hệ thống tới nay có đúng MỘT route-guard thật ở phía server:
`PERM004_LoginRouteAuthGate` trên `/login` (`docs/vi/generated/permissions-matrix.md`) —
gọi `getUser()` để redirect NGƯỢC LẠI (đã đăng nhập → đá về `/`). `/kudos/send` là route-guard
thật THỨ HAI, và là route ĐẦU TIÊN gate theo chiều ngược: chưa đăng nhập → đá đi, không phải
đã đăng nhập → đá đi.

| Trạng thái phiên Supabase | Hành vi tại `/kudos/send` | Test case |
|---|---|---|
| Không có / hết hạn | Redirect `/login` — không render form | ID-1 |
| Có, hợp lệ (`getUser()` trả về user) | Render form đầy đủ | ID-0 |

Cùng kỷ luật đã dùng cho `PERM004`: dùng `getUser()` (round-trip xác minh thật với Supabase
Auth qua `lib/supabase/server.ts`), KHÔNG dùng `getSession()` (chỉ đọc cookie tại chỗ, không
xác minh lại — cookie là input không đáng tin trên server).

Mã `PERM###` thật cho gate này: **TBD (draft)** — chưa được cấp, cấp ở bước reconcile. Loại
dự kiến: `route-guard` (giống `PERM004`, khác 3 mã `screen-permission` PERM001–003).

**Route protection cho các route còn lại KHÔNG đổi bởi tính năng này.** `/`, `/awards`,
`/kudos`, `/profile`, `/admin` vẫn y nguyên tình trạng đã ghi từ lượt login (F011): không có
guard nào, ai gõ đúng URL cũng vào được. Việc thêm guard cho `/kudos/send` không phải bước
đầu của một kế hoạch bảo vệ toàn site — nó là guard cục bộ cho đúng một route, giống cách
`PERM004` chỉ chi phối `/login`.

## 2. RLS — sender suy từ `auth.uid()`, không nhận từ input client

Ba bảng mới (`profiles`, `hashtags`, `kudos`) đều cần RLS vì Supabase expose chúng qua API
data trực tiếp tới client (`schemas = ["public", "graphql_public"]` trong
`supabase/config.toml`). Nguyên tắc cốt lõi, lấy từ clarifications.md quyết định 3:

- **Cột `sender` của bảng `kudos` PHẢI được set từ `auth.uid()` phía server/DB, không bao
  giờ nhận trực tiếp từ payload client.** Một client gửi request `INSERT` mang `sender` là
  ID của người khác phải bị RLS chặn — đây là điều kiện "RLS prevents a client from writing
  a kudos row attributed to another user" trong acceptance criteria của tính năng
  (`evidence/study-context.json`).
- Read policy cho `kudos`: TBD (draft) — chưa quyết định public-read hay chỉ-owner-read,
  vì `/kudos/send` chỉ cần đọc lại CHÍNH bản ghi vừa tạo (§ Architecture delta, mục 2), chưa
  có yêu cầu đọc bảng này từ nơi khác ở lượt này.
- Read policy cho `profiles`/`hashtags`: cả hai cần đọc công khai (hoặc ít nhất cho mọi
  `authenticated` user) để dropdown người nhận/hashtag hoạt động — chi tiết chính sách cụ
  thể (row-level hay bảng-level) là TBD (draft), quyết định ở bước implement.
- **Storage bucket cho ảnh kudos cũng cần policy riêng**, không chỉ RLS trên bảng: ai được
  `INSERT` (upload) — dự kiến giới hạn `authenticated` — và ai được `SELECT` (xem lại ảnh đã
  upload). Tên bucket và policy cụ thể: TBD (draft).

Không có mã `PERM###` nào được bịa cho các policy trên; toàn bộ giữ `TBD (draft)` cho tới khi
migration thật tồn tại và reconcile cấp mã.

## 3. Cảnh báo đứng vững — vẫn không unify hai hệ thống danh tính

`lib/session/session-provider.tsx` (`role`, `userId`, `displayName`) VẪN là mock phía client
— đọc/ghi qua `localStorage` → `NEXT_PUBLIC_*` → default cứng, sửa được từ DevTools mà không
cần đăng nhập gì. Comment bảo mật ngay đầu file (dòng 3-14) nói rõ: không phải authorization
boundary. **Tính năng này không đọc `session-provider` để xác định người gửi kudos** — sender
của một hàng `kudos` LUÔN đến từ `auth.uid()` của phiên Supabase thật, không bao giờ từ mock
session.

Hệ quả: sau tính năng này, app có **hai hệ thống danh tính chạy song song, không hợp nhất**:

| | Mock session (`session-provider.tsx`) | Phiên Supabase thật |
|---|---|---|
| Nguồn | `localStorage`/env, ai cũng sửa được | Cookie do `@supabase/ssr` quản lý, xác minh qua Google |
| Chi phối gì | `role` cho UI (account menu, notification bell, mục Admin Dashboard), `userId`/`displayName` cho affordance "kudos của chính mình" trên `/kudos` board | `/login` (PERM004) redirect nếu đã đăng nhập; `/kudos/send` (§ 1 ở trên) redirect nếu CHƯA đăng nhập; sender của mọi hàng `kudos` mới |
| Có phải access control? | Không, chưa từng | Có — nhưng phạm vi hẹp, chỉ 2 route |

Việc hợp nhất hai hệ thống này (vd dùng `auth.uid()` để suy ra `role` thật, bảo vệ các route
còn lại) nằm ngoài phạm vi tính năng này — vẫn đúng nguyên văn kết luận đã ghi từ lượt login
(F011) và lượt Kudos board (F013): "Hai identity systems now coexist; neither is being
unified this run."

## 4. Unresolved — ghi lại trung thực, không tự ý gate

**Không có spec nào (ở bất kỳ frame MoMorph nào đã đọc, kể cả `ihQ26W78P2`) định nghĩa hành
vi khi người nhận trùng với người gửi (self-kudos).** Không có test case nào assert việc này
bị cấm hay được phép. Tính năng này KHÔNG thêm gate cho trường hợp đó — recipient dropdown
lọc trên toàn bộ `profiles` đã seed, kể cả chính Sunner đang đăng nhập, trừ khi một quyết
định implement sau này thu hẹp nó lại. Đây là mục giữ nguyên trạng thái "chưa quyết", không
phải một quyết định ẩn.

## Cross-reference với `docs/vi/generated/permissions-matrix.md`

Delta này, khi reconcile, dự kiến thêm đúng 1 mục mới vào bảng "Permissions Index" hiện có
(4 mục PERM001–004) — route-guard trên `/kudos/send`, cùng loại `route-guard` với PERM004
nhưng gate theo chiều ngược. Không có mục PERM### thứ hai phát sinh: các quy tắc validate
trường bắt buộc (Người nhận/Danh hiệu/message/hashtag) là business-rule/form-validation, không
phải authorization, nên không thuộc phạm vi `permissions.md`/`permissions-matrix.md` — chúng
thuộc `technical-spec.md` của feature (`## Cross-Cutting Logic` / FR).

# Permissions — Delta: Thả tim Kudos (like) trên Live board

> **status: implemented** — forward-draft viết ở giai đoạn spec, promote tại implement-start (F015). Promote vào
> `docs/vi/system/permissions.md` theo kiểu append-delta ở implement-start.
> Không tự đặt mã `PERM###` mới — bảng kỹ thuật `permissions-matrix.md` do pipeline sinh,
> không viết tay ở đây.

## 1. Lần đầu một quy tắc nghiệp vụ được enforce ở tầng database

Cho tới nay, mọi quy tắc "ai được làm gì" trên live board đều nằm ở client và chỉ có tác dụng
trang trí. Nút tim bị vô hiệu hoá dựa trên mock session trong `localStorage` — ai mở DevTools cũng
đổi được, và file `lib/session/session-provider.tsx` đã tự cảnh báo đúng điều đó.

Delta này chuyển **BR-002 (người gửi không được tự thả tim cho kudos của mình)** từ một quy ước
UI thành một ràng buộc thật, được giữ ở cả hai tầng:

| Tầng | Cách chặn | Chống được gì |
|------|-----------|---------------|
| UI | nút render `disabled` | người dùng bình thường bấm nhầm |
| Database | policy RLS + ràng buộc | người gọi thẳng server action, bỏ qua UI |

Tầng UI là tiện lợi. Tầng database là ranh giới thật. Không được coi tầng UI là đủ.

## 2. `user_id` bị ép từ `auth.uid()`, không nhận từ client

Giống hệt cách `kudos.sender_id` được xử lý ở F014: mệnh đề `with check` của policy insert ép
`user_id = auth.uid()`. Payload từ client không bao giờ được tin.

Hệ quả: một client cố ghi lượt thả tim mang danh người khác thì bị từ chối ở database, không cần
tầng ứng dụng kiểm tra thêm. Đây là kiểm soát chính của BR-006.

## 3. "Một người một lượt tim" là ràng buộc, không phải kiểm tra

Quy tắc "mỗi người chỉ thả một tim cho một kudos" (BR-001) được giữ bằng `unique (kudos_id,
user_id)` chứ không bằng một lệnh kiểm tra "đã tồn tại chưa" ở tầng ứng dụng.

Lý do là race condition: hai request đến cùng lúc thì cả hai đều thấy "chưa tồn tại" và cùng ghi.
Chỉ ràng buộc ở database mới thực sự chặn được double-click. Tầng ứng dụng bắt lỗi vi phạm ràng
buộc và xử lý êm, chứ không cố phòng ngừa trước.

## 4. Bảng vẫn công khai — có chủ ý

`/kudos` **không** được thêm route guard. Khách chưa đăng nhập vẫn đọc được bảng và thấy số tim
thật; chỉ hành động thả tim là bị chặn.

Đây là khác biệt có chủ ý so với `/kudos/send` — trang đó đẩy khách chưa đăng nhập sang `/login`.
Live board là mặt tiền công khai của sự kiện; gate nó lại là một sự thụt lùi về sản phẩm mà không
ai yêu cầu (clarifications quyết định 5).

## 5. Cảnh báo cũ vẫn đứng vững

Delta này **không** hợp nhất hai hệ thống danh tính. `role` trong mock session vẫn là mock, vẫn
không phải ranh giới phân quyền, và vẫn không có gì phía sau nó.

Cột `profiles.auth_user_id` chỉ trả lời đúng một câu hỏi — "người đang đăng nhập có phải người gửi
kudos này không?" — và không được dùng cho bất kỳ quyết định phân quyền nào khác. Cụ thể: nó không
cấp quyền admin, không gate route, không mở dữ liệu của người khác.

**Cơ chế đọc thật (rework sau rà soát bảo mật)**: người dùng `authenticated` KHÔNG đọc được cột
này bằng một câu lệnh select thông thường — quyền đọc bảng `profiles` bị thu hẹp lại chỉ còn 3 cột
công khai (`id`, `display_name`, `department`), cố tình bỏ `auth_user_id` ra ngoài. Việc tra cứu
cầu nối này chỉ đi qua đúng một cửa: một hàm phía database chạy dưới quyền hệ thống (không phải
quyền của người đang đăng nhập), tên `resolve_viewer_slug`. Đây là cách duy nhất để giữ cột này
"kín" với client mà vẫn dùng được nó cho BR-002.

## 6. GRANT là bắt buộc, không phải tuỳ chọn

`config.toml` không bật `auto_expose_new_tables`, nên bảng mới **không** tự động tiếp cận được qua
Data API. Thiếu `grant` thì mọi thao tác fail với "permission denied for table kudos_likes" —
trông y hệt như RLS đang chặn đúng.

Đây là bẫy chẩn đoán đã được ghi nhận từ F014. Kiểm thử phải phân biệt được hai ca: "RLS chặn đúng
người sai" và "thiếu grant nên chặn tất cả".

## 7. Unresolved — ghi trung thực, không tự ý gate

- Chưa có màn admin cho `special_days`; ai chèn được dòng vào bảng đó thì nhân đôi được tim. Hiện
  chỉ truy cập DB trực tiếp mới làm được, nhưng khi có màn admin thì nó **phải** được gate thật.
- Người dùng đăng nhập mà chưa gắn `auth_user_id` với slug nào thì không trùng người gửi nào, nên
  thả tim được cho mọi thẻ. Đúng theo thiết kế ở quy mô hiện tại, cần xem lại khi seam đóng.
