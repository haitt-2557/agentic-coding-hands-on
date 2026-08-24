---
status: implemented
authored_by: takumi
created: 2026-08-24
lang: vi
---

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
