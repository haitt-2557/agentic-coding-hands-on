# Behavior Logic

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Analysis Scope**: Toàn bộ repo (`app/`, `components/`, `lib/`, root config) — đối chiếu 1-1 với `scout-report.md` § Background Logic Source Inventory.

**Code Format**: `BL###_NameSlug`.

**Behavior Logic Types** (canonical 10 — language-neutral):
`scheduled-job`, `queue-worker`, `event-listener`, `observer`, `mail`, `notification`, `middleware`, `custom-command`, `integration`, `webhook`.

**Note**: Auth/permission middleware không thuộc tài liệu này — xem `permissions.md` (khi được sinh). Feature/UserStory mapping thuộc `feature-list.md`/`user-stories.md` (chưa tồn tại, Wave 5+).

---

## Cardinality Contract

Rule C1/C2/C3 áp dụng như bình thường. Inventory nguồn gốc (`scout-report.md` § Background
Logic Source Inventory, 2026-08-18) trả về **zero hit ở cả 10/10 category** cho stack lúc
đó (`### Next.js (App Router, no backend)`). **Cập nhật 2026-08-19**: một item mới xuất
hiện ở category `middleware` — `proxy.ts` (request-interception layer cho gate
đếm-ngược-trước-khi-mở-site, xem `docs/vi/system/architecture.md` § Request-Interception
Layer). Theo Rule C1 ("1 BL per inventory entry"), 1 entry mới → 1 BL item.

**Cập nhật (lượt Login, 2026-08-19)**: một item mới xuất hiện ở category `integration` —
`app/auth/callback/route.ts` (đổi `code` OAuth lấy session qua Supabase Auth/Google, xem
BL002 bên dưới). `proxy.ts` (BL001) cũng đổi hành vi trong lượt này — nay refresh session
cookie Supabase trên MỌI request TRƯỚC KHI chạy `resolveGateRedirect()` — nhưng vẫn là 1
entry duy nhất (cùng file, cùng trigger "mọi request"), không tách BL riêng cho việc refresh
cookie theo Rule C1.

---

## Behavior Logic Index

| Code | Name | Type | Trigger |
|------|------|------|---------|
| BL001_PrelaunchLaunchGate | Prelaunch Launch-Timing Gate | middleware | Mọi incoming request tới bất kỳ route nào (trừ static asset đã loại trừ bởi matcher) |
| BL002_OAuthCallbackExchange | OAuth Callback Session Exchange | integration | Redirect từ Google (qua Supabase Auth) tới `/auth/callback` sau khi actor đồng ý/huỷ consent |

---

## Behavior Logic Details

### BL001_PrelaunchLaunchGate: Prelaunch Launch-Timing Gate

**Type**: middleware
**Trigger**: Mọi request tới bất kỳ route nào của ứng dụng — chạy trước khi route đích
render.
**Source File**: `proxy.ts` (adapter), `lib/prelaunch/gate.ts` (logic thuần
`resolveGateRedirect`)
**Source Symbol**: `proxy()`, `resolveGateRedirect()`

**Description**: Đọc `NEXT_PUBLIC_EVENT_START_AT` + đồng hồ server, tính lại qua
`computeCountdown()` (`lib/countdown.ts`, tái dùng với đếm ngược trang chủ). Khi đếm ngược
còn > 0 ("khóa"), chặn mọi request tới route khác `/prelaunch` và redirect về
`/prelaunch`. Khi đếm ngược tới/qua hạn ("mở"), chặn request tới `/prelaunch` và redirect
về `/`. `targetIso` thiếu/không parse được → fail-open, không khóa gì (BR-003 tương tự đếm
ngược hiển thị). **Đây là gate theo THỜI GIAN, không phải middleware phân quyền** — không
đọc `role`/session/cookie nào; xem `docs/vi/generated/permissions-matrix.md` (không có
`PERM###` nào được cấp cho item này) và
`docs/vi/features/countdown-prelaunch/technical-spec.md` (BR-004, BR-005, DEC-001) để biết
chi tiết đầy đủ. Rationale kiến trúc: [ADR-002](../../decisions/ADR-002-prelaunch-launch-timing-gate.md).

**Related Feature**: F010_PrelaunchCountdownGate
**Related Route**: ROUTE007 (`/prelaunch`) — cũng ảnh hưởng ROUTE001–ROUTE005 (điều kiện
truy cập, không đổi file)

**Cập nhật (lượt Login, 2026-08-19)**: `proxy()` trong `proxy.ts` nay gọi
`updateSupabaseSession(request)` (`lib/supabase/proxy-session.ts`) TRƯỚC khi gọi
`resolveGateRedirect()`, để gate luôn đọc cookie session mới nhất. Rủi ro cao nhất của thay
đổi này: `@supabase/ssr` ghi cookie refresh lên response nó được giao; nếu `proxy.ts` sau đó
trả về MỘT response khác (redirect của gate), cookie đó bị rơi mất — actor bị đăng xuất âm
thầm. Xử lý: `updateSupabaseSession()` trả về cả `response` lẫn `supabaseCookies`; `proxy.ts`
copy thủ công từng cookie đó lên bất kỳ response cuối cùng nào thực sự được gửi (dòng 38-41
của `proxy.ts`). Chi tiết đầy đủ: `docs/vi/system/architecture.md` § Authentication Layer.

---

### BL002_OAuthCallbackExchange: OAuth Callback Session Exchange

**Type**: integration
**Trigger**: Redirect từ Google OAuth consent (qua Supabase Auth/GoTrue) quay lại
`/auth/callback` — sau khi actor đồng ý HOẶC huỷ.
**Source File**: `app/auth/callback/route.ts`
**Source Symbol**: `GET()`

**Description**: Đọc query param theo đúng THỨ TỰ: kiểm tra `error_description` TRƯỚC khi
giả định `code` tồn tại — một consent bị huỷ redirect về với
`?error=access_denied&error_description=...` (query param, không phải exception); đọc
`code` trước sẽ rơi vào nhánh `missing_code` sai thay vì hiển thị lý do thật. Nếu có `code`,
gọi `exchangeCodeForSession(code)` (`lib/supabase/server.ts`) bọc trong try/catch — một số
phiên bản `@supabase/auth-js` throw thay vì trả `{ error }` (auth-js#782), nên bọc bất kể
type signature hứa gì. Mọi redirect (thành công lẫn thất bại) đều dựng từ `getSiteUrl()`
(`lib/supabase/env.ts`), KHÔNG BAO GIỜ từ `request.nextUrl.origin` — phát hiện security
review (mức High): route này không xác thực và internet-reachable, `nextUrl.origin` suy ra
từ header `Host`/`X-Forwarded-Host` do client gửi nên có thể bị giả mạo thành open-redirect
nếu hạ tầng phía trước không pin `Host`. Route không bao giờ render trang lỗi — lỗi luôn
được chuyển thành `?error=` trên `/login`, nơi `LoginClient` hiển thị một câu cố định (không
lộ message gốc).

**Related Feature**: F011_GoogleOAuthLogin
**Related Route**: ROUTE008 (`/auth/callback`) — kết quả điều hướng actor tới ROUTE001 (`/`)
hoặc ROUTE009 (`/login`)

---

Ngoài BL001 và BL002, không có mục nào khác để liệt kê. Lý do, theo từng category còn lại
(đối chiếu `scout-report.md` dòng 77–88, vẫn đúng ở 2026-08-19):

| Category | Kết quả scout | Vì sao không có |
|----------|---------------|------------------|
| `custom-command` | _(none found)_ | Không có script CLI custom nào trong `package.json`/`bin/`; chỉ có `next dev/build/start`, `eslint`, `playwright test` — đều là CLI của framework/tool, không phải command nghiệp vụ tự viết |
| `event-listener` | _(none found)_ | Không có event bus/pub-sub server-side nào; DOM event handler (`onClick`, `onPointerDown` trong `DropdownMenu`) là client-UI interaction, không phải BL |
| `integration` | 1 hit (2026-08-19) | `app/auth/callback/route.ts` — xem BL002_OAuthCallbackExchange ở trên. Trước 2026-08-19 không có external API client nào (0 network call trong `app/`, `components/`, `lib/`); đây là category duy nhất khác `middleware` còn hit sau khi thêm login. |
| `mail` | _(none found)_ | Không có mail-sending logic nào |
| `middleware` | 1 hit (2026-08-19) | `proxy.ts` — xem BL001_PrelaunchLaunchGate ở trên. Trước 2026-08-19 không có `middleware.ts`/`proxy.ts` nào trong repo; đây là category duy nhất còn hit sau khi thêm gate. |
| `notification` | _(none found)_ | `NotificationBell` (`components/ui/notification-bell.tsx`) là UI hiển thị badge/panel tĩnh, không có nguồn phát notification thật (panel luôn render empty-state cố định, không đọc dữ liệu nào) |
| `observer` | _(none found)_ | Không có model/ORM nào trong repo — không có lifecycle hook (`created`/`updated`/`deleted`) để observe |
| `queue-worker` | _(none found)_ | Không có queue/worker nào |
| `scheduled-job` | _(none found)_ | Không có cron/scheduled task nào phía server |
| `webhook` | _(none found)_ | Không có webhook handler (incoming hay outgoing) nào |

**Near-miss đã xét và loại (audit trail, không tính là BL):**
`components/home/countdown-timer.tsx:35` gọi `setInterval(tick, 60_000)` để refresh UI đếm ngược mỗi phút. Đây là tick UI phía client (biến mất khi đóng tab, không có server process, không phải job định kỳ thật) — không khớp intent `scheduled-job` ("cron-like scheduled tasks"). Đã document ở `system-overview.md` § Scalability và `scout-report.md` § Notes; không lặp lại thành BL ở đây.

**Không có genuine background logic nào khác bị bỏ sót** — ngoài `proxy.ts` (BL001, thêm
2026-08-19) và `app/auth/callback/route.ts` (BL002, thêm 2026-08-19), không database/ORM
client tự viết (Supabase quản lý schema riêng của nó), không mailer/notification SDK, không
cron lib, không webhook receiver ở bất kỳ đâu.

---

## Summary

- **Total Behavior Logic Items**: 2
- **By Type**: custom-command: 0, event-listener: 0, integration: 1, mail: 0, middleware: 1, notification: 0, observer: 0, queue-worker: 0, scheduled-job: 0, webhook: 0

---

## Cross-Reference Validation

- [x] All BL### codes are unique
- [x] All BL### codes are referenced in UserStories.md (type=system) — N/A, BL001 tương ứng với US018/US019 và BL002 tương ứng với US020/US021/US022 (tất cả type `ui`, không phải `system`) vì hành vi được mô tả trọn vẹn từ góc nhìn actor, xem `user-stories.md`
- [x] All BL### codes are referenced in FeatureList.md — BL001 → F010_PrelaunchCountdownGate; BL002 → F011_GoogleOAuthLogin
- [x] All related route references are valid — BL001 → ROUTE007 (`/prelaunch`), cũng ảnh hưởng ROUTE001–ROUTE005; BL002 → ROUTE008 (`/auth/callback`)
- [x] All related data model references are valid — N/A (BL001 không đọc/ghi model nào, chỉ đọc env + đồng hồ; BL002 tạo session Supabase — không phải MODEL### của app, xem `entities.md`)
- [x] No orphaned behavior logic references
- [x] All BL items have Source File + Source Symbol fields — BL001: `proxy.ts`/`lib/prelaunch/gate.ts`, `proxy()`/`resolveGateRedirect()`; BL002: `app/auth/callback/route.ts`, `GET()`
- [x] All Source File paths match scout Background Logic Source Inventory entries — `proxy.ts` và `app/auth/callback/route.ts` xác nhận tồn tại thật (đọc trực tiếp), không suy đoán

**Cardinality Cross-Check** (đối chiếu `verification-checklist-core-artifacts.md` § BehaviorLogic):
- Inventory total: 2 (`middleware` + `integration` category, thêm 2026-08-19)
- Artifact BL count: 2 (BL001_PrelaunchLaunchGate, BL002_OAuthCallbackExchange)
- Gap: 0% (PASS — `abs(2-2)/max(2,2) = 0%`)
- Missing categories: none
- Orphan files: none

---

## Client-Side Logic

### Debounce / Throttle

`N/A — no debounce or throttle patterns detected.`

Đã grep `setTimeout|clearTimeout|debounce|throttle|useDebounce` trên `components/**`, `lib/**` — không có kết quả khớp pattern debounce/throttle (chỉ có `setInterval` trong CountdownTimer, đã xét riêng dưới đây).

### Optimistic UI

`N/A — no optimistic UI patterns detected.`

Không có mutation nào trong app (0 backend) nên không có optimistic-update/rollback nào để có.

### Polling

`N/A — no polling patterns detected.`

`components/home/countdown-timer.tsx:35` có `setInterval(tick, 60_000)`, nhưng `tick()` chỉ gọi hàm thuần `computeCountdown()` cục bộ (không có `fetch`/API call nào bên trong) — không khớp định nghĩa "polling" (recurring API call). Đây là UI refresh tick thuần, cùng lý do đã loại khỏi BehaviorLogic ở trên.

### Upload Progress

`N/A — no upload progress patterns detected.`

Không có form upload file nào trong repo.

### Realtime (WebSocket / SSE / EventSource)

`N/A — no realtime patterns detected.`

Không có `WebSocket`/`EventSource`/subscribe channel nào trong repo.
