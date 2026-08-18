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

Rule C1/C2/C3 áp dụng như bình thường — nhưng inventory nguồn (`scout-report.md` § Background Logic Source Inventory) trả về **zero hit ở cả 10/10 category** cho stack duy nhất trong repo (`### Next.js (App Router, no backend)`). Theo Rule C1 ("1 BL per inventory entry"), một inventory trống nghĩa là **0 BL item** — không có gì để aggregate hay split.

---

## Behavior Logic Index

_(trống — không có Background Logic item nào trong codebase này)_

| Code | Name | Type | Trigger |
|------|------|------|---------|
| _(none)_ | | | |

---

## Behavior Logic Details

Không có mục nào để liệt kê. Lý do, theo từng category (đối chiếu `scout-report.md` dòng 77–88):

| Category | Kết quả scout | Vì sao không có |
|----------|---------------|------------------|
| `custom-command` | _(none found)_ | Không có script CLI custom nào trong `package.json`/`bin/`; chỉ có `next dev/build/start`, `eslint`, `playwright test` — đều là CLI của framework/tool, không phải command nghiệp vụ tự viết |
| `event-listener` | _(none found)_ | Không có event bus/pub-sub server-side nào; DOM event handler (`onClick`, `onPointerDown` trong `DropdownMenu`) là client-UI interaction, không phải BL |
| `integration` | _(none found)_ | Không có external API client nào — 0 network call trong toàn bộ `app/`, `components/`, `lib/` |
| `mail` | _(none found)_ | Không có mail-sending logic nào |
| `middleware` | _(none found)_ | Không có `middleware.ts` (chỉ artifact build dưới `.next/`, đã loại khỏi scope) |
| `notification` | _(none found)_ | `NotificationBell` (`components/ui/notification-bell.tsx`) là UI hiển thị badge/panel tĩnh, không có nguồn phát notification thật (panel luôn render empty-state cố định, không đọc dữ liệu nào) |
| `observer` | _(none found)_ | Không có model/ORM nào trong repo — không có lifecycle hook (`created`/`updated`/`deleted`) để observe |
| `queue-worker` | _(none found)_ | Không có queue/worker nào |
| `scheduled-job` | _(none found)_ | Không có cron/scheduled task nào phía server |
| `webhook` | _(none found)_ | Không có webhook handler (incoming hay outgoing) nào |

**Near-miss đã xét và loại (audit trail, không tính là BL):**
`components/home/countdown-timer.tsx:35` gọi `setInterval(tick, 60_000)` để refresh UI đếm ngược mỗi phút. Đây là tick UI phía client (biến mất khi đóng tab, không có server process, không phải job định kỳ thật) — không khớp intent `scheduled-job` ("cron-like scheduled tasks"). Đã document ở `system-overview.md` § Scalability và `scout-report.md` § Notes; không lặp lại thành BL ở đây.

**Không có genuine background logic nào bị scout bỏ sót** — đối chiếu độc lập bằng cách đọc trực tiếp mọi file trong `scout-report.md` § File Inventory (30 file nguồn, không tính config/test) trong lượt sinh artifact này xác nhận cùng kết luận: không có `app/api/**/route.ts`, không `middleware.ts`, không database/ORM client, không mailer/notification SDK, không cron lib, không webhook receiver ở bất kỳ đâu.

---

## Summary

- **Total Behavior Logic Items**: 0
- **By Type**: custom-command: 0, event-listener: 0, integration: 0, mail: 0, middleware: 0, notification: 0, observer: 0, queue-worker: 0, scheduled-job: 0, webhook: 0

---

## Cross-Reference Validation

- [x] All BL### codes are unique — vacuously true (0 items)
- [ ] All BL### codes are referenced in UserStories.md (type=system) — N/A, không có BL### nào để reference; sẽ không có `system`-type US nào cần map trong `user-stories.md`
- [ ] All BL### codes are referenced in FeatureList.md — N/A, cùng lý do; không feature nào thuộc type `background`/`mixed` cần BL###
- [x] All related route references are valid — N/A (không có route reference nào được emit)
- [x] All related data model references are valid — N/A (không có model reference nào được emit)
- [x] No orphaned behavior logic references
- [x] All BL items have Source File + Source Symbol fields — vacuously true (0 items)
- [x] All Source File paths match scout Background Logic Source Inventory entries — vacuously true (0 items, 0 inventory entries)

**Cardinality Cross-Check** (đối chiếu `verification-checklist-core-artifacts.md` § BehaviorLogic):
- Inventory total: 0
- Artifact BL count: 0
- Gap: 0% (PASS — cả hai phía đều 0, `abs(0-0)/max(0,1) = 0%`)
- Missing categories: none (không category nào có ≥1 entry trong inventory để đòi hỏi BL tương ứng — Rule "Category drop" chỉ fire khi inventory có ≥1 entry ở category đó)
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
