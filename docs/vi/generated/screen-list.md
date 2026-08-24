# Screen List

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Analysis Scope**: 5 route files dưới `app/**/page.tsx` (route-view, web) — đối chiếu với `route-list.md` (ROUTE001–ROUTE005). `ROUTE006` (`/_not-found`) bị loại khỏi phạm vi vì không có file `page.tsx`/`not-found.tsx` nguồn — đây là route mặc định do Next.js tự sinh, không có source file để phân loại H1–H6.

**Cập nhật phạm vi**: `/prelaunch` (SCR006, thêm 2026-08-19) và `/login` (SCR007, thêm
2026-08-19, lượt Login) mở rộng phạm vi lên 7 screen file — cùng phương pháp H1–H6 áp dụng
cho cả hai, xem chi tiết ở mục riêng của từng SCR bên dưới.

**Cập nhật phạm vi (lượt Kudos Live board, 2026-08-21)**: `/kudos` (SCR008) nâng phạm vi lên 8
screen file. `app/kudos/page.tsx` trước đây là placeholder (đã được đếm trong SCR003_Kudos);
SCR008 là mục cho nội dung thật của route đó — xem § SCR008 bên dưới về quan hệ với SCR003.
**Lưu ý phân loại**: feature-spec
(`docs/vi/features/kudos-live-board/screens/SCR008_KudosLiveBoard/spec.md`) ghi
`Type: composite` theo nghĩa *bố cục* (7 vùng layout R1–R7 với hành vi responsive riêng). Cột
`Type` trong tài liệu này mang nghĩa khác — nó là kết quả gate H1–H6 + Trap 1 (mỗi REG cần ≥1
independence signal thật). Gate đó KHÔNG được chạy lại ở lượt promote này và không có mã `REG###`
nào được cấp, nên SCR008 được ghi `atomic` cho nhất quán với 7 SCR còn lại và với
`Composite Screens: 0` ở § Summary. Hai nhãn nói về hai trục khác nhau, không phải mâu thuẫn dữ
liệu; một lượt `/tkm:rebuild-spec --screen-specs` chạy gate thật mới là nơi kết luận lại cột này.

**Code Format**: `SCR###_NameSlug` (e.g. SCR001_Home).

> **Composite-detection method note**: H1–H6 (composite-screen-detection.md, thứ tự chạy H6→H4→H5→H2→H3→H1→2-of-3 gate) đã áp dụng không điều kiện cho cả 5 screen file. Kết quả: **cả 5 đều atomic** — không có REG### nào được phát sinh. Lý do: H6 (router outlet) không khớp — không route nào có `<Outlet>`/child route; H4 (tab) và H5 (wizard) không khớp — không có UI tab/step nào; H2 (domain-module import gate) fail trên mọi screen — import của các file `page.tsx` chỉ trỏ vào `components/*`, `lib/*` (không có thư mục `features/*`/`modules/*`/`domains/*` trong repo, và `components/*` nằm trong danh sách loại trừ JS/TS của H2); H3 (semantic region wrapper) chỉ pass cho SCR001 (4 khối `<section>`: Hero, RootFurther, Awards, Kudos) nhưng 2-of-3 gate cần thêm H1 hoặc H2 cùng pass — không có, nên SCR001 vẫn atomic theo gate, dù có 4 khối `<section>` trực quan. Quan trọng hơn, Trap 1 (composite-screen-detection.md/verification-checklist) yêu cầu mỗi REG có ≥1 independence signal (API riêng, loading state riêng, scroll container riêng, auth/permission gate riêng, mutation surface riêng, validation path riêng) — hệ thống này không có backend (xác nhận bởi `system-overview.md` Decision 1), nên không khối nào trên SCR001 có tín hiệu độc lập thật sự; tách visual thôi là không đủ (Trap 1). Việc này cũng phù hợp với `[H3_RAW_DIV]`-adjacent tình huống nhưng ở đây H3 pass nhờ `<section>` tag thật (không phải raw div), chỉ là 2-of-3 gate không đạt.

**Note**: Feature mapping (F###) chưa gán — `feature-list.md` là Wave 5 (`_session-context.md` § Counts: `feature_count: <pending-W5>`). Mọi ô Owner F### trong RouteList hiện là `—`; ScreenList tự nó không mang F###/US### (theo đúng contract của template — FeatureList/UserStories sở hữu các mapping đó).

**Service-coverage note (2026-08-18, trước lượt Login)**: Rule kiểm tra "service/API hook không có ROUTE### hoặc BL### tương ứng → critical" là vô hiệu (vacuously satisfied) ở đây — không màn hình nào gọi bất kỳ service/API/hook mạng nào. Toàn bộ dữ liệu hiển thị đến từ hằng số nội bộ (`lib/awards.ts`), hàm thuần (`lib/countdown.ts`), hoặc mock client-side (`lib/session/session-provider.tsx`, `lib/i18n/locale-provider.tsx`) — không có network call nào trong toàn bộ `app/`, `components/`, `lib/` (khớp `scout-report.md` § Background Logic Source Inventory — zero hit mọi category).

**Cập nhật (lượt Login, 2026-08-19)**: dòng trên không còn đúng tuyệt đối. SCR007_Login gọi
`supabase.auth.signInWithOAuth()` (network call thật tới Supabase Auth) — có `ROUTE###`
tương ứng (`ROUTE008` `/auth/callback` xử lý phần quay lại) và `BL###` tương ứng
(`BL002_OAuthCallbackExchange`), nên rule trên vẫn PASS (không phải critical), chỉ không
còn "vacuously satisfied" nữa — đây là service call đầu tiên có mapping thật.

## Screen Index

| Code | Name | Type | Components | Data Displayed |
|------|------|------|------------|----------------|
| SCR001_Home | Home | atomic | 15 | 4 |
| SCR002_Awards | Awards | atomic | 8 | 2 |
| SCR003_Kudos | Kudos | atomic | 1 | 0 |
| SCR004_Profile | Profile | atomic | 2 | 0 |
| SCR005_AdminDashboard | AdminDashboard | atomic | 2 | 0 |
| SCR006_Prelaunch | Prelaunch | atomic | 4 | 1 |
| SCR007_Login | Login | atomic | 7 | 0 |
| SCR008_KudosLiveBoard | KudosLiveBoard | atomic | 12 | 5 |

---

## SCR001_Home: Home

**Type**: atomic
**Route**: ROUTE001 (`/`)

### Description

Trang chủ marketing/sự kiện SAA 2025 — `app/page.tsx`. Compose trực tiếp 7 component top-level theo thứ tự render: `SiteHeader` → `HeroKeyvisual` → `RootFurtherContent` → `AwardsSection` → `KudosSection` → `QuickActionWidget` (fixed, ngoài luồng `<main>`) → `SiteFooter`. `app/layout.tsx` chỉ bọc `SessionProvider`/`LocaleProvider`, không có chrome dùng chung ở tầng layout — mỗi route tự quyết định có compose `SiteHeader`/`SiteFooter` hay không. **Cập nhật 2026-08-20**: SCR001 không còn là màn duy nhất mang chrome thật — SCR002_Awards nay cũng compose `SiteHeader`/`SiteFooter` (xem section riêng bên dưới). 3 route còn lại (SCR003_Kudos, SCR004_Profile, SCR005_AdminDashboard) vẫn tự render `<main>` trần, không có `SiteHeader`/`SiteFooter` (xem ghi chú "no chrome" ở các SCR placeholder bên dưới và ScreenFlow § Screen Transitions).

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

**Cập nhật 2026-08-20 (F012_AwardSystemPage)** — không còn placeholder. `app/awards/page.tsx`
compose `SiteHeader` → `AwardsHero` (hero thu nhỏ, không đếm ngược/CTA) → `AwardSectionTitle`
(phụ đề mờ + tiêu đề vàng) → một hàng `AwardCategoryNav` + `AwardDetailList` (6×
`AwardDetailCard`, xen kẽ ảnh/nội dung, ảnh 336×336) → `KudosSection` (tái dùng nguyên trạng)
→ `SiteFooter`. Đây là màn hình THỨ HAI (sau SCR001) compose `SiteHeader`/`SiteFooter` thật —
trước lượt này route không render chrome nào. Header "Award Information" mang trạng thái
đang-chọn tại đây (`usePathname()`, xem SCR001 Components). 6 `<section id={award.slug}>` giữ
đúng id cũ nên hợp đồng hash-anchor với Home không đổi. Vẫn atomic: `AwardCategoryNav` +
`AwardDetailList` là một cặp đồng bộ hai chiều qua một `IntersectionObserver` chung (không có
API riêng, loading state riêng, hay auth gate riêng cho từng khối) — cùng lý do 2-of-3 gate
không đạt như SCR001 (xem ghi chú Trap 1 ở đầu tài liệu).

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| SiteHeader | layout | Tái dùng nguyên trạng từ SCR001; "Award Information" mang trạng thái đang-chọn khi ở `/awards`. `components/layout/site-header.tsx` |
| AwardsHero | section | Hero thu nhỏ — nền `Keyvisual_BG.png` + logo "ROOT FURTHER"; không đếm ngược/EventInfo/CTA như SCR001. `components/awards/awards-hero.tsx` |
| AwardSectionTitle | text | Phụ đề mờ "Sun* Annual Awards 2025" + tiêu đề vàng "Hệ thống giải thưởng SAA 2025", khóa dictionary `awardsPage.*`. `components/awards/award-section-title.tsx` |
| AwardCategoryNav | nav | Nav danh mục dính bên trái, 6 mục theo thứ tự `AWARDS`; trạng thái active bám theo section đang xem qua `IntersectionObserver` (scrollspy), click cuộn mượt tới section và không ghi lại `location.hash`. `components/awards/award-category-nav.tsx` |
| AwardDetailList | section | Lặp `AWARDS` thành 6 `AwardDetailCard` theo đúng thứ tự mảng nguồn (không có danh sách thứ tự riêng). `components/awards/award-detail-list.tsx` |
| AwardDetailCard (×6, qua `AwardDetailList`) | card | Một khối chi tiết giải thưởng — ảnh 336×336 (badge dùng chung + wordmark riêng) + mô tả dài + số lượng + giá trị giải; xen kẽ ảnh trái/phải theo chỉ số chẵn/lẻ; `<section id={award.slug}>` là đích hash-anchor. `components/awards/award-detail-card.tsx` |
| KudosSection | section | Tái dùng nguyên trạng từ SCR001 — copy quảng bá Sun* Kudos + link "Chi tiết" → `/kudos`. `components/home/kudos-section.tsx` |
| SiteFooter | layout | Tái dùng nguyên trạng từ SCR001. `components/layout/site-footer.tsx` |

### Data Displayed

- Data Entity 1: 6 hạng mục giải thưởng (title/mô tả dài/số lượng/giá trị giải) — **cùng nguồn** `AWARDS` (`lib/awards.ts`, mở rộng thêm field so với SCR001) — không nhân bản dữ liệu, `description` ngắn của SCR001 và `longDescription` của màn này cùng đọc từ một hằng số
- Data Entity 2: Chuỗi dịch i18n cho khối tiêu đề + nhãn số lượng/giá trị giải (`awardsPage.*`, `lib/i18n/dictionaries/{vi,en}.ts`) — cùng cơ chế locale với SCR001

### Routes/URLs

- `/awards`
- `/awards#top-talent`, `/awards#top-project`, `/awards#top-project-leader`, `/awards#best-manager`, `/awards#signature-2025-creator`, `/awards#mvp` (6 anchor, nguồn `lib/awards.ts` `EXPECTED_AWARD_SLUGS`, giữ nguyên từ trước lượt này)

### Related Screens

- SCR001_Home: Home — nguồn của mọi liên kết trỏ TỚI màn này (nav/CTA/card/widget); **cập nhật 2026-08-20**: nay cũng là đích một chiều-QUA-LẠI — `SiteHeader`/`SiteFooter` thật tại đây có link nav "About"/logo về `/` và link "Kudos", nên rời màn này không còn chỉ có browser Back (xem ScreenFlow § Screen Transitions)
- SCR003_Kudos: Kudos — **thêm 2026-08-20**: link nav "Kudos" (header/footer) + CTA "Chi tiết" của khối `KudosSection` đều điều hướng tới `/kudos`

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

## SCR007_Login: Login — thêm 2026-08-19

**Type**: atomic
**Route**: ROUTE009 (`/login`)

### Description

Màn đăng nhập Google OAuth qua Supabase — `app/login/page.tsx` (Server Component). Khác
với 5 placeholder SCR002–SCR005: đây là màn hình có logic thật, và khác cả SCR006: đây là
màn ĐẦU TIÊN mang một guard phía server thật (`getUser()`, PERM004) thay vì chỉ đọc env
công khai. Không có header/footer/nav dùng chung với SCR001 — tự bọc `LoginHeader`/
`LoginFooter` riêng.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| LoginHeader | layout | Header riêng của màn login (không tái dùng `SiteHeader`). `components/login/login-header.tsx` |
| LoginMain | layout | Khung bố cục chính. `components/login/login-main.tsx` |
| LoginIntro | section | Khối giới thiệu/copy tĩnh bọc quanh `LoginClient`. `components/login/login-intro.tsx` |
| LoginClient | island | Client Component — sở hữu vòng round-trip click → loading → `signInWithOAuth` → điều hướng-hoặc-lỗi. `app/login/login-client.tsx` |
| LoginButton | button | Nút đăng nhập Google — disabled + hiện loader từ lúc click tới khi trình duyệt điều hướng đi hoặc lỗi. `components/login/login-button.tsx` |
| LoginErrorAlert | alert | `role="alert"`, chuỗi lỗi CỐ ĐỊNH (không lộ message gốc từ Supabase/Google) — hiện khi `?error` có trên URL HOẶC lần click này thất bại cục bộ. `components/login/login-error-alert.tsx` |
| LoginFooter | layout | Footer riêng của màn login. `components/login/login-footer.tsx` |

### Data Displayed

_(none — không có data entity nghiệp vụ nào hiển thị; toàn bộ nội dung là copy tĩnh + trạng
thái UI cục bộ (`loading`, `failedLocally`))_

### Routes/URLs

- `/login`
- `/login?error=<msg>` (từ `app/auth/callback/route.ts` khi thất bại/huỷ — giá trị chỉ dùng
  làm boolean gate hiển thị `LoginErrorAlert`, không render vào DOM)

### Related Screens

- SCR001_Home: Home (đích redirect khi `getUser()` thấy phiên hợp lệ, PERM004; cũng là đích
  sau khi `exchangeCodeForSession` thành công qua `/auth/callback`)

### Regions

_(none — atomic, cùng lý do các SCR khác: không có tín hiệu độc lập thật)_

---

## SCR008_KudosLiveBoard: Sun* Kudos - Live board — thêm 2026-08-21

**Type**: atomic (xem § Lưu ý phân loại ở đầu tài liệu — feature-spec ghi `composite` theo nghĩa bố cục)
**Route**: ROUTE003 (`/kudos`)

### Description

Trang nội dung thật của route `/kudos` — `app/kudos/page.tsx`, dựng theo frame MoMorph
`MaZUn5xHXZ`. Thay thế nội dung placeholder mà SCR003_Kudos đã ghi nhận: SCR003 là mục cho
route-view giữ chỗ (1 component, 0 data) từ lượt 2026-08-18, SCR008 là mục cho màn hình đầy đủ
sau lượt này — **cùng một route**, hai trạng thái nội dung khác nhau ở hai thời điểm. Đây là màn
hình dày đặc chuyển-trạng-thái nhất trong 5 lượt gần đây (carousel, 2 dropdown lọc dùng chung 2
khối, thả/gỡ tim, copy link + toast, tìm kiếm giới hạn 100 ký tự, feed hiện dần theo cuộn) — nên
lượt này dùng `e2e-red-first` thay vì chỉ visual-contract. Toàn bộ dữ liệu là hằng số tĩnh trong
`lib/kudos/`; không có API, không có persistence.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| SiteHeader | layout | Header dùng chung, tái dùng; mục "Sun* Kudos" chuyển sang derive `aria-current` từ `usePathname()`. `components/layout/site-header.tsx` |
| KudosSubmitPill | section | Banner + ô mời gửi lời cảm ơn. Trigger-only (US009) — bấm được nhưng chưa dẫn tới đâu. `components/kudos/kudos-submit-pill.tsx` |
| KudosFilterBar | control | 2 dropdown lọc (hashtag, phòng ban) — dùng chung, lọc đồng thời HIGHLIGHT và ALL KUDOS (DEC-001). `components/kudos/kudos-filter-bar.tsx` |
| HighlightCarousel | section | Khối HIGHLIGHT KUDOS — 5 thẻ nhiều tim nhất, 3 hiển thị cùng lúc, next/prev disable ở hai đầu (SM-001). `components/kudos/highlight-carousel.tsx` |
| KudosCard | card | Thẻ một lời cảm ơn — 2 biến thể (carousel / list), dùng chung cho cả 2 khối. `components/kudos/kudos-card.tsx` |
| KudosCardActions | control | Nút tim (thả/gỡ, tự-loại-trừ kudos của chính người xem), Copy Link + toast, "Xem chi tiết" (trigger-only). `components/kudos/kudos-card-actions.tsx` |
| SpotlightBoard | section | Word cloud ~100 tên Sunner nổi bật, tooltip. `components/kudos/spotlight-board.tsx` |
| SpotlightSearch | control | Ô tìm kiếm tên trong SPOTLIGHT BOARD — tô sáng tên khớp, chặn nhập ở ký tự thứ 100. `components/kudos/spotlight-search.tsx` |
| AllKudosFeed | section | Khối ALL KUDOS — feed thẻ hiện dần theo đà cuộn qua sentinel cuối feed (SM-002). `components/kudos/all-kudos-feed.tsx` |
| KudosSidebarStats | section | Thống kê cá nhân (nhận/gửi/tim/Secret Box) — đọc danh tính từ `useSession()` đã mở rộng. `components/kudos/kudos-sidebar-stats.tsx` |
| KudosLeaderboard | section | Bảng "10 SUNNER NHẬN QUÀ MỚI NHẤT" + nút "Mở Secret Box" (trigger-only). `components/kudos/kudos-leaderboard.tsx` |
| SiteFooter | layout | Footer dùng chung, tái dùng nguyên trạng. `components/layout/site-footer.tsx` |

### Data Displayed

| Data | Source | Notes |
|------|--------|-------|
| KudosRecord | `lib/kudos/kudos-records.ts` (hằng số) | Nguồn duy nhất cho cả HIGHLIGHT (top-5 nhiều tim) và ALL KUDOS feed |
| SpotlightEntry | `lib/kudos/spotlight-names.ts` (hằng số) | ~100 tên + toạ độ node gốc cho word cloud |
| LeaderboardEntry | `lib/kudos/leaderboard.ts` (hằng số) | 5 dòng bảng xếp hạng sidebar |
| FilterVocabulary | `lib/kudos/filters.ts` (hằng số) | Giá trị cho 2 dropdown lọc |
| ViewerStats | `lib/kudos/viewer-stats.ts` (hằng số/derived) | 5 dòng thống kê sidebar, gắn với danh tính mock-user hiện tại |

Không có `MODEL###` nào — đây là hằng số tĩnh trong mã nguồn, không phải entity có persistence
(cùng tình trạng `lib/awards.ts` của MODEL001_Award trước đó, xem `entities.md`).

### Routes/URLs

- `/kudos` (ROUTE003 — đã tồn tại từ lượt homepage dưới dạng placeholder có chủ đích; lượt này
  thay nội dung, không cấp ROUTE### mới)

### Related Screens

- SCR003_Kudos: Kudos — cùng route `/kudos`; mục cho trạng thái placeholder trước lượt này
- SCR001_Home: Home — khối quảng bá Kudos (`components/home/kudos-section.tsx`, F004) dẫn tới đây
- SCR002_Awards: Awards — khối quảng bá Kudos dùng chung cũng dẫn tới đây

Bốn đích điều hướng được frame tham chiếu (dialog gửi kudos, trang chi tiết một kudos, trang hồ sơ
Sunner, dialog Secret Box) **chưa có màn hình nào** — không có SCR### nào được cấp cho chúng ở lượt
này; các trigger tương ứng chỉ render + focusable, không dẫn tới đâu (US009).

### Regions

_(none — không có mã `REG###` nào được cấp; gate H1–H6 + Trap 1 không được chạy lại ở lượt promote
này. 7 vùng bố cục R1–R7 mô tả trong feature-spec là mô tả layout/responsive, không phải REG###.)_

---

## Pending: màn hình mới từ F014_SendKudosWishes (2026-08-24, chưa cấp mã SCR###)

`/kudos/send` (`app/kudos/send/page.tsx`) là màn hình MỚI, dựng theo frame MoMorph
`JsTvi8KVQA` ("Gửi lời chúc Kudos") — hành vi thật lấy từ frame component `ihQ26W78P2` (26
spec item, 57 test case), vì frame đích không mang spec nào (`clarifications.md` § Source
data). Gate H1–H6 KHÔNG được chạy lại ở lượt promote này (cùng tình trạng SCR008) nên mã
`SCR###` giữ `TBD (draft)` — không tự đánh số.

**Route**: TBD (draft) — xem mục Pending tương ứng ở `route-list.md` — `/kudos/send`

### Components (đã build thật)

| Component | Type | Purpose |
|-----------|------|---------|
| KudosSendPageClient | island | Client wrapper — gọi Server Action `submitKudos`; khi thành công ghi cờ vào `sessionStorage` rồi điều hướng `/kudos` (không dùng `redirect()` server-side, để URL sau thành công không mang query param — khớp assertion test). `components/kudos/kudos-send-page-client.tsx` |
| KudosSendForm | form | Toàn bộ form: Người nhận, Danh hiệu, nội dung + toolbar markdown-lite, Hashtag, Image, checkbox ẩn danh + Nickname, footer Hủy/Gửi. `components/kudos/send/kudos-send-form.tsx` |
| RecipientField | control | Autocomplete trên `profiles` đã seed, input trimmed. `components/kudos/send/recipient-field.tsx` |
| TitleField | control | "Danh hiệu" — free text bắt buộc, tối đa 100 ký tự. **Trường này không có spec ở bất kỳ frame nào** (`clarifications.md` defect 1). `components/kudos/send/title-field.tsx` |
| MessageEditor + MessageToolbar | control | Textarea + 6 nút định dạng markdown-lite (bold/italic/strikethrough/numbered/link/quote), đếm cứng 1.000 ký tự. `components/kudos/send/{message-editor,message-toolbar}.tsx` |
| HashtagPicker | control | Dropdown mở bằng nút "+ Hashtag", chọn từ 8 giá trị hạt giống, tối đa 5, hàng chưa chọn disable khi đủ 5. `components/kudos/send/hashtag-picker.tsx` |
| ImageAttachments | control | Tối đa 5 ảnh `.jpg`/`.png`, upload lên bucket Storage `kudos-images` khi Gửi. `components/kudos/send/image-attachments.tsx` |
| AnonymousToggle | control | Checkbox ẩn danh (mặc định tắt), mở trường Nickname bắt buộc khi bật. `components/kudos/send/anonymous-toggle.tsx` |
| FormFooter | control | Hủy (điều hướng `/kudos`, không lưu gì) + Gửi (disabled tới khi đủ trường bắt buộc). `components/kudos/send/form-footer.tsx` |
| FieldErrorText | text | Thông báo lỗi validate-on-blur "Không được để trống". `components/kudos/send/field-error-text.tsx` |
| KudosSentToast | toast | Toast báo thành công trên `/kudos`, đọc cờ `sessionStorage` sau redirect. `components/kudos/kudos-sent-toast.tsx` |

### Data Displayed

| Data | Source | Notes |
|------|--------|-------|
| ProfileOption[] | `lib/kudos/send/queries.ts` `listProfiles()` (đọc bảng `profiles`) | Vocabulary cho autocomplete Người nhận |
| HashtagOption[] | `lib/kudos/send/queries.ts` `listHashtags()` (đọc bảng `hashtags`) | Vocabulary cho dropdown Hashtag |

Cả hai đọc đều bọc `withRetry()` (`lib/kudos/send/retry.ts`, 3 lần thử lại, backoff
100→200→400ms) — xem cảnh báo độ tin cậy bên dưới.

### Routes/URLs

- `/kudos/send`

### Related Screens

- SCR007_Login: Login — đích redirect khi `requireSupabaseUser()` không thấy phiên (TC ID-1)
- SCR003_Kudos / SCR008_KudosLiveBoard: Kudos — đích redirect sau khi Gửi thành công; kudos
  gửi từ đây KHÔNG hiện trên board (quyết định 1, `clarifications.md` của F014)

### Regions

_(none — gate H1–H6 chưa được chạy lại ở lượt promote này)_

### Cảnh báo độ tin cậy đã biết (không phải mô tả sai lệch)

`GET /kudos/send` intermittently trả về **500** — log `Failed to load hashtags: JWT issued at
future` tại `lib/kudos/send/queries.ts:52`, đo được ở tần suất vài phần trăm mỗi lần chạy
(GoTrue đôi khi stamp `iat` sớm hơn đồng hồ thật vài chục ms; PostgREST validate `iat` không
có leeway). `withRetry()` tồn tại nhưng lợi ích của nó KHÔNG được xác nhận bằng số liệu (2/72
thất bại ở cửa sổ retry rộng hơn, so với 1/72 trước đó khi hẹp hơn). Người dùng đã chấp nhận
rủi ro này một cách tường minh — xem `clarifications.md` § "Decision on the residual 500".
Verdict inspection của lượt này là **REWORK**, chưa sealed — đừng đọc đây là "đã verify đầy
đủ".

---

## Summary

- **Total Screens**: 8 (ROUTE006 `/_not-found` loại khỏi phạm vi — auto-generated, không có source file) — **+1 pending** (`/kudos/send`, F014, § Pending ở trên; chưa cấp mã SCR### nên không cộng vào 8)
- **Composite Screens**: 0 (2-of-3 gate không đạt ở mọi screen — xem ghi chú phương pháp ở đầu tài liệu; SCR008 chưa được chạy gate lại ở lượt promote, xem § Lưu ý phân loại)
- **Total Regions**: 0

---

## Cross-Reference Validation

- [x] All SCR### codes are unique
- [x] All SCR### codes are referenced in ScreenFlow.md (xem `screen-flow.md`) — đúng cho SCR001–SCR007; SCR008 là ngoại lệ, xem dòng pending cuối danh sách
- [x] All related screen references are valid
- [x] All route URLs are properly formatted (đối chiếu `route-list.md` ROUTE001–ROUTE005, ROUTE007, ROUTE009)
- [x] All SCR### codes are referenced in FeatureList.md — SCR006 → F010, SCR007 → F011 (thêm 2026-08-19), SCR008 → F013 (thêm 2026-08-21); 8/8 SCR đều có ≥1 F### tham chiếu.
- [ ] SCR008 chưa được tham chiếu trong `screen-flow.md` — pending: lượt promote này không sinh lại flow diagram; `/kudos` đã có mặt trong `screen-flow.md` dưới dạng đích placeholder (SCR003), cần một lượt `/tkm:rebuild-spec` cập nhật flow cho nội dung thật của SCR008
- [x] No orphaned screen references
