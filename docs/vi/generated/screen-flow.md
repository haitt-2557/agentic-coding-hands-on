# Screen Flow

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Analysis Scope**: 5 screens (SCR001–SCR005) từ `screen-list.md`, route-view (web), Next.js App Router static.

**Code Format**: `SCR###_NameSlug`.

## Navigation Map

```mermaid
graph TD
    Start["Direct URL / external link"] -->|Initial load| SCR001["SCR001_Home ( / )"]
    SCR001 -->|"nav Awards / hero CTA / AwardCard / widget"| SCR002["SCR002_Awards ( /awards )"]
    SCR001 -->|"nav Kudos / footer / hero CTA / KudosSection / widget"| SCR003["SCR003_Kudos ( /kudos )"]
    SCR001 -->|"AccountMenu Profile (role != guest)"| SCR004["SCR004_Profile ( /profile )"]
    SCR001 -->|"AccountMenu Admin Dashboard (role == admin)"| SCR005["SCR005_AdminDashboard ( /admin )"]
    SCR002 -.->|"browser Back only — no in-app link"| SCR001
    SCR003 -.->|"browser Back only — no in-app link"| SCR001
    SCR004 -.->|"browser Back only — no in-app link"| SCR001
    SCR005 -.->|"browser Back only — no in-app link"| SCR001
```

**Đọc sơ đồ:** Mọi cạnh đi ra từ SCR001 là link thật (`next/link` `href`). 4 cạnh nét đứt quay về SCR001 là **giả định browser Back**, không phải link trong app — SCR002–SCR005 tự render `<main>` trần (không có `SiteHeader`/`SiteFooter`, vì layout gốc `app/layout.tsx` chỉ bọc `SessionProvider`/`LocaleProvider`, không có chrome dùng chung). Xem chi tiết ở § Screen Transitions.

## Feature Entry Points

<!-- Feature Entry Points: run /tkm:rebuild-spec --feature-specs to populate -->

## Screen Access Paths

| From Screen | To Screen | Action/Trigger | Conditions | Region |
|-------------|-----------|----------------|------------|--------|
| START | SCR001_Home | Initial load / direct URL `/` | None | |
| SCR001_Home | SCR002_Awards | Click nav "Awards", hero CTA, bất kỳ AwardCard "Chi tiết" link, hoặc QuickActionWidget "Về SAA" | None | |
| SCR001_Home | SCR003_Kudos | Click nav "Kudos", footer "Kudos" link, hero CTA, KudosSection "Chi tiết" link, hoặc QuickActionWidget "Viết Kudos" | None | |
| SCR001_Home | SCR004_Profile | Click AccountMenu "Profile" | `role !== 'guest'` (AccountMenu ẩn hoàn toàn khi `role === 'guest'`) | |
| SCR001_Home | SCR005_AdminDashboard | Click AccountMenu "Admin Dashboard" | `role === 'admin'` (mục menu chỉ hiện khi role này; **route `/admin` vẫn truy cập trực tiếp được với mọi role** — xem § Guard Logic) | |
| SCR002_Awards | SCR001_Home | Browser Back | Không có link trong-app — `app/awards/page.tsx` không render header/footer | |
| SCR003_Kudos | SCR001_Home | Browser Back | Không có link trong-app | |
| SCR004_Profile | SCR001_Home | Browser Back | Không có link trong-app | |
| SCR005_AdminDashboard | SCR001_Home | Browser Back | Không có link trong-app | |

> Region column: bỏ trống ở mọi dòng — không có REG### nào (0 composite screen, xem `screen-list.md`).

## Screen Transitions

### SCR001_Home (Home)

**Entry Points**:
- Direct URL access `/`
- External link (bookmark, search engine, chia sẻ)

**Exit Points**:
- To SCR002_Awards: nav link / hero CTA / AwardCard "Chi tiết" / widget "Về SAA"
- To SCR003_Kudos: nav link / footer link / hero CTA / KudosSection "Chi tiết" / widget "Viết Kudos"
- To SCR004_Profile: AccountMenu "Profile" (chỉ hiện khi `role !== 'guest'`)
- To SCR005_AdminDashboard: AccountMenu "Admin Dashboard" (chỉ hiện khi `role === 'admin'`)

**Decision Points**:
- Hiển thị AccountMenu/NotificationBell: nếu `role === 'guest'` → cả hai ẩn hoàn toàn, không render gì; ngược lại → hiện
- Mục "Admin Dashboard" trong AccountMenu: nếu `role === 'admin'` → hiện; ngược lại → ẩn
- Badge NotificationBell: nếu `unreadCount > 0` → hiện số; ngược lại → ẩn badge (panel dropdown luôn hiện empty-state cố định bất kể badge)

---

### SCR002_Awards (Awards)

**Entry Points**:
- From SCR001_Home: nav "Awards" / hero CTA / AwardCard "Chi tiết" (mang theo hash `#<slug>` — trình duyệt tự cuộn tới `<section id={slug}>`) / widget "Về SAA"
- Direct URL access `/awards` hoặc `/awards#<slug>`

**Exit Points**:
- To SCR001_Home: **chỉ qua browser Back** — trang không có `SiteHeader`/`SiteFooter`/link nào quay lại trong-app

**Decision Points**:
- None (route tĩnh, không rẽ nhánh)

---

### SCR003_Kudos (Kudos)

**Entry Points**:
- From SCR001_Home: nav "Kudos" / footer link / hero CTA / KudosSection "Chi tiết" / widget "Viết Kudos"
- Direct URL access `/kudos`

**Exit Points**:
- To SCR001_Home: **chỉ qua browser Back** — không có link trong-app

**Decision Points**:
- None

---

### SCR004_Profile (Profile)

**Entry Points**:
- From SCR001_Home: AccountMenu "Profile" (khi `role !== 'guest'`)
- Direct URL access `/profile` (không bị chặn bởi bất kỳ role nào)

**Exit Points**:
- To SCR001_Home: **chỉ qua browser Back**

**Decision Points**:
- None

---

### SCR005_AdminDashboard (AdminDashboard)

**Entry Points**:
- From SCR001_Home: AccountMenu "Admin Dashboard" (mục menu chỉ hiện khi `role === 'admin'`)
- Direct URL access `/admin` — **truy cập được với MỌI role, kể cả `guest`** (không có route guard thật, xem § Guard Logic)

**Exit Points**:
- To SCR001_Home: **chỉ qua browser Back**

**Decision Points**:
- None

---

## Region Transitions

`N/A — không có REG### nào trong screen-list.md (0 composite screen).`

---

## Authentication Flow

```mermaid
graph LR
    A["Public — không có đăng nhập"] --> B["SCR001_Home"]
    A --> C["SCR002_Awards"]
    A --> D["SCR003_Kudos"]
    A --> E["SCR004_Profile"]
    A --> F["SCR005_AdminDashboard"]
```

**Không có hệ thống authentication nào trong codebase** (khớp `system-overview.md` § Security Overview: "Không có — không tồn tại luồng đăng nhập/đăng xuất nào"). `role` (`guest|user|admin`) là **mock phía client** đọc từ `localStorage`/`NEXT_PUBLIC_*` (`lib/session/session-provider.tsx`), có cảnh báo tường minh ngay trong source rằng giá trị này sửa được từ DevTools và không có kiểm tra server nào tồn tại. Nó chỉ điều khiển **hiển thị UI** (ẩn/hiện AccountMenu, NotificationBell, mục "Admin Dashboard"), không phải một ranh giới bảo mật.

| Screen | Authentication Required | Authorization Level |
|--------|-------------------------|----------------------|
| SCR001_Home | No | Public |
| SCR002_Awards | No | Public |
| SCR003_Kudos | No | Public |
| SCR004_Profile | No | Public (route không kiểm tra role; chỉ mục menu dẫn tới bị ẩn theo mock role) |
| SCR005_AdminDashboard | No | Public (route KHÔNG được bảo vệ — comment nguồn `app/admin/page.tsx` cảnh báo tường minh; chỉ mục menu bị ẩn theo mock role, ai gõ thẳng URL vẫn xem được) |

---

## Error Handling Flows

| Screen | Error | Handling | Scope |
|--------|-------|----------|-------|
| SCR001_Home | `NEXT_PUBLIC_EVENT_START_AT` thiếu hoặc không parse được (ISO date không hợp lệ) | `computeCountdown()` (`lib/countdown.ts`) trả `isInvalid: true`, CountdownTimer giữ nguyên zero-state ("00/00/00" + text "Coming soon") — không throw, không crash | screen |

> Không có network/API error nào khác để document — hệ thống không gọi API nào (0 backend route, xác nhận `route-list.md` + `scout-report.md`). 4 screen còn lại (SCR002–SCR005) là nội dung tĩnh thuần, không có logic nào có thể lỗi.

---

## Circular Dependencies Check

- [x] No circular dependencies detected (mọi cạnh đi ra từ SCR001; cạnh quay về là browser Back, không phải app-level navigation)
- [x] All screens have valid entry/exit points
- [x] All navigation paths terminate

---

## Guard Logic

`N/A — no route guards detected.`

Codebase không có `middleware.ts`, không `beforeRouteEnter`/`canActivate`/`loader`, không kiểm tra nào trước khi vào route. Mục "Admin Dashboard" trong AccountMenu chỉ là **hiển thị/ẩn UI** theo mock role (`lib/session/session-provider.tsx`) — nó không chặn navigation. Điều hướng thẳng URL `/admin` (gõ tay, bookmark, chia sẻ link) render trang bình thường bất kể `role`, kể cả `guest`. Comment nguồn trong `app/admin/page.tsx` xác nhận tường minh: "this page is NOT access-controlled and must not be treated as protected". Đây là gap bảo mật đã biết và được document có chủ đích (ADR-001, theo comment), không phải bug bỏ sót.

---

## Deep-Link State Restoration

`N/A — no URL-driven state restoration detected.`

SCR002_Awards dùng hash anchor (`/awards#<slug>`) để trình duyệt tự cuộn tới `<section id={slug}>` — đây là hành vi cuộn gốc của trình duyệt (CSS `scroll-mt-24`), KHÔNG phải app đọc `useSearchParams`/`router.query` để dựng lại state. Không có state nào được "restore" — trang render y hệt nhau dù có hash hay không, chỉ khác vị trí cuộn ban đầu.

---

## Unsaved-Changes Protection

`N/A — no unsaved-changes guards detected.`

Không có form nhập liệu nào trong 5 screen — không có gì để mất khi rời trang.

---

## Extraction Signatures

### Guard Logic
Không tìm thấy `beforeEnter|canActivate|middleware|loader|before_action` nào gắn với route config — xác nhận qua `scout-report.md` (không có `middleware.ts`) và đọc trực tiếp `app/**/page.tsx` (không có export `generateMetadata`/guard nào chặn render).

### Deep-Link State Restoration
Grep `useSearchParams|useQuery|router\.query|URLSearchParams|params\[` trên `app/**/page.tsx` và các component import trực tiếp — không có kết quả khớp.

### Unsaved-Changes Protection
Grep `beforeunload|onbeforeunload|usePrompt|useBeforeUnload|leaveGuard|isDirty|formState\.isDirty` — không có kết quả khớp (không có form nào trong repo).
