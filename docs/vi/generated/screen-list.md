# Screen List

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Analysis Scope**: 5 route files dưới `app/**/page.tsx` (route-view, web) — đối chiếu với `route-list.md` (ROUTE001–ROUTE005). `ROUTE006` (`/_not-found`) bị loại khỏi phạm vi vì không có file `page.tsx`/`not-found.tsx` nguồn — đây là route mặc định do Next.js tự sinh, không có source file để phân loại H1–H6.

**Code Format**: `SCR###_NameSlug` (e.g. SCR001_Home).

> **Composite-detection method note**: H1–H6 (composite-screen-detection.md, thứ tự chạy H6→H4→H5→H2→H3→H1→2-of-3 gate) đã áp dụng không điều kiện cho cả 5 screen file. Kết quả: **cả 5 đều atomic** — không có REG### nào được phát sinh. Lý do: H6 (router outlet) không khớp — không route nào có `<Outlet>`/child route; H4 (tab) và H5 (wizard) không khớp — không có UI tab/step nào; H2 (domain-module import gate) fail trên mọi screen — import của các file `page.tsx` chỉ trỏ vào `components/*`, `lib/*` (không có thư mục `features/*`/`modules/*`/`domains/*` trong repo, và `components/*` nằm trong danh sách loại trừ JS/TS của H2); H3 (semantic region wrapper) chỉ pass cho SCR001 (4 khối `<section>`: Hero, RootFurther, Awards, Kudos) nhưng 2-of-3 gate cần thêm H1 hoặc H2 cùng pass — không có, nên SCR001 vẫn atomic theo gate, dù có 4 khối `<section>` trực quan. Quan trọng hơn, Trap 1 (composite-screen-detection.md/verification-checklist) yêu cầu mỗi REG có ≥1 independence signal (API riêng, loading state riêng, scroll container riêng, auth/permission gate riêng, mutation surface riêng, validation path riêng) — hệ thống này không có backend (xác nhận bởi `system-overview.md` Decision 1), nên không khối nào trên SCR001 có tín hiệu độc lập thật sự; tách visual thôi là không đủ (Trap 1). Việc này cũng phù hợp với `[H3_RAW_DIV]`-adjacent tình huống nhưng ở đây H3 pass nhờ `<section>` tag thật (không phải raw div), chỉ là 2-of-3 gate không đạt.

**Note**: Feature mapping (F###) chưa gán — `feature-list.md` là Wave 5 (`_session-context.md` § Counts: `feature_count: <pending-W5>`). Mọi ô Owner F### trong RouteList hiện là `—`; ScreenList tự nó không mang F###/US### (theo đúng contract của template — FeatureList/UserStories sở hữu các mapping đó).

**Service-coverage note**: Rule kiểm tra "service/API hook không có ROUTE### hoặc BL### tương ứng → critical" là vô hiệu (vacuously satisfied) ở đây — không màn hình nào gọi bất kỳ service/API/hook mạng nào. Toàn bộ dữ liệu hiển thị đến từ hằng số nội bộ (`lib/awards.ts`), hàm thuần (`lib/countdown.ts`), hoặc mock client-side (`lib/session/session-provider.tsx`, `lib/i18n/locale-provider.tsx`) — không có network call nào trong toàn bộ `app/`, `components/`, `lib/` (khớp `scout-report.md` § Background Logic Source Inventory — zero hit mọi category).

## Screen Index

| Code | Name | Type | Components | Data Displayed |
|------|------|------|------------|----------------|
| SCR001_Home | Home | atomic | 15 | 4 |
| SCR002_Awards | Awards | atomic | 1 | 1 |
| SCR003_Kudos | Kudos | atomic | 1 | 0 |
| SCR004_Profile | Profile | atomic | 2 | 0 |
| SCR005_AdminDashboard | AdminDashboard | atomic | 2 | 0 |
| SCR006_Prelaunch | Prelaunch | atomic | 4 | 1 |

---

## SCR001_Home: Home

**Type**: atomic
**Route**: ROUTE001 (`/`)

### Description

Trang chủ marketing/sự kiện SAA 2025 — `app/page.tsx`. Compose trực tiếp 7 component top-level theo thứ tự render: `SiteHeader` → `HeroKeyvisual` → `RootFurtherContent` → `AwardsSection` → `KudosSection` → `QuickActionWidget` (fixed, ngoài luồng `<main>`) → `SiteFooter`. Đây là màn hình duy nhất trong 5 route mang header/footer/nav thật — `app/layout.tsx` chỉ bọc `SessionProvider`/`LocaleProvider`, không có chrome dùng chung; 4 route còn lại tự render `<main>` trần, không có `SiteHeader`/`SiteFooter` (xem ghi chú "no chrome" ở các SCR placeholder bên dưới và ScreenFlow § Screen Transitions).

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| SiteHeader | layout | Sticky top nav — logo click-to-scroll-top (`/`), in-page nav links "About/Awards/Kudos" (`href="/"`/`/awards`/`/kudos`), chứa LanguageSwitcher + NotificationBell + AccountMenu. `components/layout/site-header.tsx` |
| HeroKeyvisual | section | Full-bleed hero `<section>` — keyvisual background image, "ROOT FURTHER" title image, chứa CountdownTimer + EventInfo + HeroCta. `components/home/hero-keyvisual.tsx` |
| CountdownTimer | widget | Đếm ngược days/hours/minutes tới `NEXT_PUBLIC_EVENT_START_AT`; SSR-default zero-state ("Coming soon"), giá trị thật chỉ tính sau mount (tránh hydration mismatch); tick lại mỗi 60s qua `setInterval` (client-UI refresh, không phải BL). `components/home/countdown-timer.tsx` |
| EventInfo | text | Dòng thông tin sự kiện tĩnh, lấy từ dictionary i18n. `components/home/event-info.tsx` |
| HeroCta | nav | Hai nút CTA — "Xem giải thưởng" → `/awards`, "Sun* Kudos" → `/kudos`. `components/home/hero-cta.tsx` |
| RootFurtherContent | section | Khối copy dài "Root Further" tĩnh (2 đoạn văn tiếng Việt + trích dẫn), không có state/logic. `components/home/root-further-content.tsx` |
| AwardsSection | section | `<section>` heading + `<ul>` render 6 `AwardCard` từ `AWARDS` (`lib/awards.ts`). `components/home/awards-section.tsx` |
| AwardCard | card | Một hạng mục giải thưởng — badge ảnh dùng chung + wordmark riêng, title/description tĩnh, link "Chi tiết" tới `awardHref(slug)` = `/awards#<slug>`. `components/home/award-card.tsx` |
| KudosSection | section | Khối promo Sun* Kudos — copy tĩnh + link "Chi tiết" → `/kudos`. `components/home/kudos-section.tsx` |
| QuickActionWidget | widget | Nút nổi cố định (fixed, ngoài `<main>`) mở dropdown 2 mục: "Viết Kudos" → `/kudos`, "Về SAA" → `/awards`. `components/layout/quick-action-widget.tsx` |
| SiteFooter | layout | Logo + nav links (About/Awards/Kudos) + "Tiêu chuẩn chung" (text tĩnh, KHÔNG phải link — không có đích đến) + copyright. `components/layout/site-footer.tsx` |
| AccountMenu | dropdown | Ẩn hoàn toàn khi `role === 'guest'`; menu gồm "Profile" (→ `/profile`), "Sign out" (nút UI, không có logic đăng xuất thật), "Admin Dashboard" (→ `/admin`, chỉ hiện khi `role === 'admin'`). `components/ui/account-menu.tsx` |
| NotificationBell | dropdown | Ẩn hoàn toàn khi `role === 'guest'`; badge số chỉ hiện khi `unreadCount > 0`; panel luôn hiện empty-state cố định (chưa có dữ liệu thông báo thật). `components/ui/notification-bell.tsx` |
| LanguageSwitcher | dropdown | Toggle VI/EN, ghi lựa chọn vào `localStorage` key `saa.locale`. `components/ui/language-switcher.tsx` |
| DropdownMenu | primitive | Primitive dropdown dùng chung (toggle, click-outside đóng, Esc đóng + trả focus, Enter/Space mở) — được 4 component trên (AccountMenu, NotificationBell, LanguageSwitcher, QuickActionWidget) tái sử dụng. `components/ui/dropdown-menu.tsx` |

### Data Displayed

- Data Entity 1: 6 hạng mục giải thưởng (title/description/image) — hằng số `AWARDS` trong `lib/awards.ts` (hard-code, không fetch)
- Data Entity 2: Thời điểm đếm ngược mục tiêu — `NEXT_PUBLIC_EVENT_START_AT` (env, client-side, tính bởi hàm thuần `computeCountdown` trong `lib/countdown.ts`)
- Data Entity 3: Chuỗi dịch i18n (vi/en) — `lib/i18n/dictionaries/{vi,en}.ts`
- Data Entity 4: Mock session state (`role`, `unreadCount`) — đọc từ `localStorage` (`saa.mock-role`/`saa.mock-unread`), fallback `NEXT_PUBLIC_MOCK_ROLE`/`NEXT_PUBLIC_MOCK_UNREAD_COUNT`; chỉ dùng để ẩn/hiện UI (AccountMenu, NotificationBell, mục "Admin Dashboard"), **không phải một entity nghiệp vụ thật** — xem `system-overview.md` Decision 2

### Routes/URLs

- `/`

### Related Screens

- SCR002_Awards: Awards (nav link, hero CTA, mọi AwardCard "Chi tiết" link, QuickActionWidget "Về SAA")
- SCR003_Kudos: Kudos (nav link, footer link, hero CTA, KudosSection "Chi tiết" link, QuickActionWidget "Viết Kudos")
- SCR004_Profile: Profile (AccountMenu "Profile" — hiện khi `role !== 'guest'`)
- SCR005_AdminDashboard: AdminDashboard (AccountMenu "Admin Dashboard" — hiện khi `role === 'admin'`; **không có route guard thật**, xem ScreenFlow § Guard Logic)

### Regions

_(none — atomic; xem giải thích 2-of-3 gate + Trap 1 ở ghi chú đầu tài liệu)_

---

## SCR002_Awards: Awards

**Type**: atomic
**Route**: ROUTE002 (`/awards`)

### Description

Route placeholder có chủ đích (comment nguồn: "content out of scope this run") — tồn tại để CTA/award-card từ Home resolve thay vì 404. Mang tiêu đề tĩnh "Award Information" + lặp `AWARDS.map` thành 6 khối `<section id={award.slug}>` (title + description), phục vụ neo hash `#<slug>` mà Home trỏ tới. Đây là loop lặp lại cùng một loại nội dung (không phải các vùng ngữ nghĩa khác nhau) — không tách REG; đối chiếu H3 (composite-screen-detection.md): các `<section>` này là instance lặp của MỘT loại khối, không phải ≥3 vùng khác nhau về mặt nghiệp vụ, nên không đạt "distinct" theo tinh thần H3/Trap 1 dù đếm thô ra 6 wrapper.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| Award anchor section (×6, `AWARDS.map`) | section | Một khối `<section id={award.slug}>` mỗi hạng mục — heading + description tĩnh; `id` là đích cho hash-anchor scroll từ Home. `app/awards/page.tsx` |

### Data Displayed

- Data Entity 1: Award title/description ×6 — **cùng nguồn** `AWARDS` (`lib/awards.ts`) với SCR001 (không nhân bản dữ liệu)

### Routes/URLs

- `/awards`
- `/awards#top-talent`, `/awards#top-project`, `/awards#top-project-leader`, `/awards#best-manager`, `/awards#signature-2025-creator`, `/awards#mvp` (6 anchor, nguồn `lib/awards.ts` `EXPECTED_AWARD_SLUGS`)

### Related Screens

- SCR001_Home: Home (nguồn của mọi liên kết trỏ tới màn này — nav/CTA/card/widget); **không có đường quay lại trong-app** — xem ScreenFlow § Screen Transitions

### Regions

_(none — atomic; xem Description)_

---

## SCR003_Kudos: Kudos

**Type**: atomic
**Route**: ROUTE003 (`/kudos`)

### Description

Route placeholder có chủ đích (comment nguồn: "bare stub") — chỉ để nav/footer/CTA/widget trỏ tới Sun* Kudos resolve thay vì 404. Không có nội dung, không có dữ liệu, không có logic.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| Static heading | text | `<h1>Sun* Kudos</h1>` — toàn bộ nội dung màn hình. `app/kudos/page.tsx` |

### Data Displayed

_(none — bare stub, không có data entity nào)_

### Routes/URLs

- `/kudos`

### Related Screens

- SCR001_Home: Home (nguồn của mọi liên kết trỏ tới màn này); **không có đường quay lại trong-app**

### Regions

_(none — atomic)_

---

## SCR004_Profile: Profile

**Type**: atomic
**Route**: ROUTE004 (`/profile`)

### Description

Route placeholder có chủ đích — comment nguồn: "the account menu links here ... the destination is out of scope this run, but a 404 is not an acceptable stand-in for 'not built yet'". AccountMenu trỏ tới đây cho mọi `role !== 'guest'` (cả `user` và `admin`).

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| Static heading + paragraph | text | `<h1>Profile</h1>` + câu thông báo "chưa được thiết kế". `app/profile/page.tsx` |

### Data Displayed

_(none)_

### Routes/URLs

- `/profile`

### Related Screens

- SCR001_Home: Home (AccountMenu "Profile" link — hiện khi `role !== 'guest'`); **không có đường quay lại trong-app**

### Regions

_(none — atomic)_

---

## SCR005_AdminDashboard: AdminDashboard

**Type**: atomic
**Route**: ROUTE005 (`/admin`)

### Description

Route placeholder có chủ đích — comment nguồn cảnh báo tường minh: hiển thị mục menu này bị điều khiển bởi **mock session phía client**, "this page is NOT access-controlled and must not be treated as protected: real authorization has to be enforced server-side when real auth arrives (see ADR-001)". Nói cách khác: bất kỳ ai gõ thẳng URL `/admin` đều xem được trang này, bất kể `role` — AccountMenu chỉ ẩn/hiện MỤC MENU dẫn tới đây, không chặn truy cập route.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| Static heading + paragraph | text | `<h1>Admin Dashboard</h1>` + câu thông báo "chưa được thiết kế". `app/admin/page.tsx` |

### Data Displayed

_(none)_

### Routes/URLs

- `/admin`

### Related Screens

- SCR001_Home: Home (AccountMenu "Admin Dashboard" link — hiện khi `role === 'admin'`, KHÔNG phải một ranh giới bảo mật thật); **không có đường quay lại trong-app**

### Regions

_(none — atomic)_

---

## SCR006_Prelaunch: Prelaunch

**Type**: atomic
**Route**: ROUTE007 (`/prelaunch`)

### Description

Route mới (2026-08-19) — `app/prelaunch/page.tsx`. Full-viewport, không cuộn: nền ảnh sự
kiện + gradient overlay + tiêu đề + 3 ô đếm ngược DAYS/HOURS/MINUTES tick 1 giây. Không có
header/footer/nav — đây là toàn bộ nội dung màn hình. Khác với 4 placeholder SCR002–SCR005
(chỉ tồn tại để không 404), màn này mang logic thật: một request-interception layer mới
(`proxy.ts`) chặn 5 route còn lại và đưa về đây cho tới khi `NEXT_PUBLIC_EVENT_START_AT`
tới/qua hạn — xem `docs/vi/system/architecture.md` § Request-Interception Layer,
`docs/vi/features/countdown-prelaunch/technical-spec.md`.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| PrelaunchCountdown | widget | Tiêu đề + hàng 3 `CountdownUnit`; tick 1s qua `usePrelaunchCountdown()`. `components/prelaunch/prelaunch-countdown.tsx` |
| CountdownUnit | widget | Một cặp digit-box + label, `aria-label` đọc trọn giá trị. `components/prelaunch/countdown-unit.tsx` |
| DigitBox | widget | Một ô số LED (gradient/blur nền + glyph). `components/prelaunch/digit-box.tsx` |
| Background image + overlay | section | Nền ảnh sự kiện (`public/saa/Prelaunch_BG.png`) + gradient overlay tĩnh. `app/prelaunch/page.tsx` |

### Data Displayed

- Data Entity 1: Thời điểm đếm ngược mục tiêu — cùng `NEXT_PUBLIC_EVENT_START_AT` với
  SCR001 (không nhân bản dữ liệu; đọc lại qua `lib/countdown.ts`, tick 1s thay vì 60s)

### Routes/URLs

- `/prelaunch`

### Related Screens

- SCR001_Home: Home (đích redirect khi gate mở, `router.replace('/')` phía client hoặc
  redirect phía server — không phải link `next/link` như các SCR khác)

### Regions

_(none — atomic, cùng lý do các SCR khác: không có tín hiệu độc lập thật)_

---

## Summary

- **Total Screens**: 6 (ROUTE006 `/_not-found` loại khỏi phạm vi — auto-generated, không có source file)
- **Composite Screens**: 0 (2-of-3 gate không đạt ở mọi screen — xem ghi chú phương pháp ở đầu tài liệu)
- **Total Regions**: 0

---

## Cross-Reference Validation

- [x] All SCR### codes are unique
- [x] All SCR### codes are referenced in ScreenFlow.md (xem `screen-flow.md`)
- [x] All related screen references are valid
- [x] All route URLs are properly formatted (đối chiếu `route-list.md` ROUTE001–ROUTE005, ROUTE007)
- [x] All SCR### codes are referenced in FeatureList.md — 19/19 US và 6/6 SCR đều được ít nhất một F### tham chiếu (SCR006 → F010, thêm 2026-08-19).
- [x] No orphaned screen references
