# User Stories

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Analysis Scope**: 7 màn hình trong `screen-list.md` (SCR001–SCR007; SCR006 thêm 2026-08-19, SCR007 thêm 2026-08-19 lượt Login) + `permissions-matrix.md` (PERM001–PERM004) — enumeration chạy theo `references/user-stories-ipe-protocol.md`, `screen_source: route-view` (web). Nguồn được scan trực tiếp: `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`, `components/layout/quick-action-widget.tsx`, `components/home/hero-cta.tsx`, `components/home/award-card.tsx`, `components/home/kudos-section.tsx`, `components/home/countdown-timer.tsx`, `components/ui/account-menu.tsx`, `components/ui/notification-bell.tsx`, `components/ui/language-switcher.tsx`, `components/ui/dropdown-menu.tsx`, `lib/awards.ts`, và (thêm 2026-08-19) `proxy.ts`, `lib/prelaunch/gate.ts`, `lib/prelaunch/use-prelaunch-countdown.ts`, `components/prelaunch/*`, và (thêm 2026-08-19, lượt Login) `app/login/page.tsx`, `app/login/login-client.tsx`, `app/auth/callback/route.ts`, `components/login/*`.

**Code Format**: All US codes MUST follow `US###_NameSlug` format (e.g., US001_Login, US002_ViewDashboard)

**US Types**:
- `ui` - User-facing stories (require Screen mapping)
- `system` - System stories: hook, event, observer, bg-job, trigger, etc. (no Screen mapping needed)

**Note**: Feature mapping thuộc `feature-list.md`. Cả 19 US dưới đây đều type `ui` — hệ
thống có đúng 1 background-logic item thật (BL001_PrelaunchLaunchGate, thêm 2026-08-19,
xem `behavior-logic.md`), nhưng nó không phát sinh US type `system` riêng vì hành vi của
nó (chặn điều hướng, tự mở khóa) đã được US018/US019 mô tả trọn vẹn từ góc nhìn actor —
không cần một US "hệ thống" song song.

**Judgment call (đọc trước khi review)**: Bảng vocabulary chuẩn của IPE Step 1 (CTA/modal/row-action/bulk/destructive/form/filter/nav) được xây cho app có backend; site này gần như thuần nội dung tĩnh. Để không bỏ sót năng lực thật của trang (đọc hero, xem countdown, đọc Root Further, đọc promo Kudos — đều được liệt kê tường minh trong brief là năng lực thật), 5 US **view-content** (US001, US002, US003, US004, US005) được thêm vào ngoài các category interaction chuẩn, gắn `Interaction: secondary-action` và có dòng riêng trong Interaction Inventory. Đây là một mở rộng có chủ đích, không phải điền khống — mỗi US vẫn trace về đúng component/dữ liệu nguồn đã đọc ở trên. Do đó tổng US (16 ở lần sinh gốc, nay 19 sau khi thêm US017–US019 cho `F010_PrelaunchCountdownGate` 2026-08-19) vượt ước tính pre-gen (~8); phần lớn chênh lệch đến từ việc tách riêng theo actor (guest/user/admin) cho account-menu/notification-bell/admin-link và từ 5 US view-content này.

## Interaction Inventory

> Complete this table BEFORE writing any US. One row per interactive element (hoặc, với các mục view-content đã ghi chú ở trên, một khối nội dung tĩnh) per screen.
> Source of truth for US count — every row maps to ≥1 US below (unless merge exception applies).
> See: references/user-stories-ipe-protocol.md for enumeration rules and merge exception.

| Screen | Element | Type | Action | Endpoint |
|--------|---------|------|--------|---------|
| SCR001_Home | HeroKeyvisual + EventInfo (`hero-keyvisual.tsx`, `event-info.tsx`) | secondary-action | Hiển thị keyvisual + thông tin sự kiện tĩnh | N/A — nội dung tĩnh |
| SCR001_Home | CountdownTimer (`countdown-timer.tsx`) | secondary-action | Đếm ngược tới `NEXT_PUBLIC_EVENT_START_AT`, tick mỗi 60s; 3 trạng thái: coming-soon/normal, expired, invalid-config | N/A — hàm thuần `computeCountdown` (`lib/countdown.ts`), không network |
| SCR001_Home | RootFurtherContent (`root-further-content.tsx`) | secondary-action | Hiển thị copy "Root Further" tĩnh | N/A — nội dung tĩnh |
| SCR001_Home | AwardsSection heading + `<ul>` (`awards-section.tsx`) | secondary-action | Hiển thị danh sách 6 hạng mục giải thưởng | N/A — hằng số `AWARDS` (`lib/awards.ts`) |
| SCR001_Home | AwardCard image/title/"Chi tiết" link ×6 card (`award-card.tsx`) | navigation | Điều hướng tới `/awards#<slug>` theo hạng mục | N/A — client-side Next.js Link, không network |
| SCR001_Home | KudosSection promo copy (`kudos-section.tsx`) | secondary-action | Hiển thị nội dung giới thiệu Sun* Kudos | N/A — nội dung tĩnh |
| SCR001_Home | Header nav "Awards" + Footer nav "Awards" + Hero CTA "Xem giải thưởng" + QuickActionWidget "Về SAA" | navigation | Điều hướng tới `/awards` (không hash) | N/A — client-side Next.js Link |
| SCR001_Home | Header nav "Kudos" + Footer nav "Kudos" + Hero CTA "Sun* Kudos" + KudosSection "Chi tiết" + QuickActionWidget "Viết Kudos" | navigation | Điều hướng tới `/kudos` | N/A — client-side Next.js Link |
| SCR001_Home | Header logo + Header nav "About" + Footer logo + Footer nav "About" | navigation | Cuộn lên đầu trang + link `/` (đang đứng tại `/`) | N/A — `window.scrollTo` + client-side Link |
| SCR001_Home | LanguageSwitcher trigger (`language-switcher.tsx`) | secondary-action | Mở dropdown chọn ngôn ngữ | N/A |
| SCR001_Home | LanguageSwitcher option "Tiếng Việt"/"English" | system-action | Đổi locale hiển thị + ghi `localStorage.saa.locale` | N/A — không network |
| SCR001_Home | QuickActionWidget trigger (`quick-action-widget.tsx`) | secondary-action | Mở dropdown 2 mục ("Viết Kudos", "Về SAA") | N/A |
| SCR001_Home | NotificationBell trigger (`notification-bell.tsx`) — ẩn khi `role==='guest'` | secondary-action | Mở panel thông báo (luôn empty-state cố định) | N/A |
| SCR001_Home | AccountMenu trigger (`account-menu.tsx`) — ẩn khi `role==='guest'` | secondary-action | Mở account menu | N/A |
| SCR001_Home | AccountMenu "Profile" link | navigation | Điều hướng tới `/profile` | N/A — client-side Next.js Link |
| SCR001_Home | AccountMenu "Sign out" button | secondary-action | Đóng menu — **không có logic đăng xuất thật**, không session để xóa | N/A |
| SCR001_Home | AccountMenu "Admin Dashboard" link — chỉ hiện khi `role==='admin'` | navigation | Điều hướng tới `/admin` | N/A — client-side Next.js Link; route không có guard thật (xem PERM002) |
| SCR006_Prelaunch | PrelaunchCountdown (`components/prelaunch/prelaunch-countdown.tsx`) — thêm 2026-08-19 | secondary-action | Hiển thị đếm ngược DAYS/HOURS/MINUTES, tick 1s (không phải 60s như SCR001) | N/A — hàm thuần `computeCountdown` (`lib/countdown.ts`), không network |
| SCR006_Prelaunch | Toàn ứng dụng — `proxy.ts` (request-interception layer, thêm 2026-08-19) | system-action | Chặn mọi route khác `/prelaunch` khi gate khóa, đưa `/prelaunch` về `/` khi gate mở | N/A — `lib/prelaunch/gate.ts`, không network |
| SCR006_Prelaunch | `usePrelaunchCountdown` client-side unlock (`lib/prelaunch/use-prelaunch-countdown.ts`) — thêm 2026-08-19 | system-action | `router.replace('/')` ngay khi client thấy gate đã mở, để actor đang xem không kẹt tới khi tải lại | N/A — không network, ghi `sessionStorage` để throttle |
| SCR007_Login | `getUser()` guard (`app/login/page.tsx`) — thêm 2026-08-19, lượt Login | system-action | `redirect('/')` trước khi render nếu actor đã có phiên Supabase hợp lệ | `supabase.auth.getUser()` qua `lib/supabase/server.ts` — network call thật tới Supabase Auth |
| SCR007_Login | LoginButton (`components/login/login-button.tsx`) — thêm 2026-08-19 | primary-action | Click → loading → `signInWithOAuth({provider:'google'})`, redirect cùng-tab tới Google | `supabase.auth.signInWithOAuth()` (`lib/supabase/client.ts`) — network call thật |
| SCR007_Login | LoginErrorAlert (`components/login/login-error-alert.tsx`) — thêm 2026-08-19 | secondary-action | Hiện thông báo lỗi cố định khi `?error` có trên URL hoặc click thất bại cục bộ | N/A — đọc prop `errored`/`failedLocally`, không network |
| SCR007_Login | OAuth callback exchange (`app/auth/callback/route.ts`) — thêm 2026-08-19 | system-action | Đổi `code` OAuth lấy session; redirect `/` (thành công) hoặc `/login?error=...` (thất bại/huỷ) | `supabase.auth.exchangeCodeForSession()` qua `lib/supabase/server.ts` — network call thật |

## User Story Index

| Code | Title | Type | Priority | Screens |
|------|-------|------|----------|---------|
| US001_ViewHeroSection | View Hero Section | ui | High | SCR001 |
| US002_ViewEventCountdown | View Event Countdown | ui | High | SCR001 |
| US003_ReadRootFurtherContent | Read Root Further Content | ui | Medium | SCR001 |
| US004_BrowseAwardCategories | Browse Award Categories | ui | High | SCR001 |
| US006_ViewAwardCategoryDetail | View Award Category Detail | ui | High | SCR001, SCR002 |
| US005_ReadKudosPromotion | Read Kudos Promotion | ui | Medium | SCR001 |
| US007_NavigateToAwardsPage | Navigate To Awards Page | ui | High | SCR001, SCR002 |
| US008_NavigateToKudosPage | Navigate To Kudos Page | ui | High | SCR001, SCR003 |
| US009_ReturnToHomeTop | Return To Home Top | ui | Low | SCR001 |
| US010_SwitchInterfaceLanguage | Switch Interface Language | ui | Medium | SCR001 |
| US011_OpenQuickActionWidget | Open Quick Action Widget | ui | Medium | SCR001 |
| US012_OpenNotificationPanel | Open Notification Panel | ui | Low | SCR001 |
| US013_OpenAccountMenu | Open Account Menu | ui | Medium | SCR001 |
| US014_NavigateToProfilePage | Navigate To Profile Page | ui | Medium | SCR001, SCR004 |
| US015_ClickSignOutButton | Click Sign Out Button | ui | Low | SCR001 |
| US016_NavigateToAdminDashboard | Navigate To Admin Dashboard | ui | Low | SCR001, SCR005 |
| US017_ViewPrelaunchCountdown | View Prelaunch Countdown | ui | High | SCR006 |
| US018_BlockedByLaunchGate | Blocked By Launch Gate While Counting Down | ui | High | SCR001, SCR002, SCR003, SCR004, SCR005, SCR006 |
| US019_AutoUnlockAtZero | Auto-Unlock And Redirect At Zero | ui | High | SCR006, SCR001 |
| US020_ViewLoginScreen | View Login Screen | ui | High | SCR007 |
| US021_SignInWithGoogle | Sign In With Google | ui | High | SCR007 |
| US022_SeeLoginErrorMessage | See Login Error Message | ui | Medium | SCR007 |
| US023_RedirectedAwayWhenAlreadyAuthenticated | Redirected Away When Already Authenticated | ui | High | SCR007, SCR001 |

**Ghi chú thêm 2026-08-19**: US017–US019 map 1-1 với US017–US019 trong
`docs/vi/features/countdown-prelaunch/technical-spec.md` (đặt tên khác chút theo convention
`NameSlug` tiếng Anh ngắn gọn của tài liệu này, cùng nội dung/mã Priority/Screens).

**Ghi chú thêm 2026-08-19 (lượt Login)**: US020–US023 mô tả `F011_GoogleOAuthLogin` — được
đối chiếu ngược trực tiếp từ source đã shipped (không có feature-spec đầy đủ đứng trước, xem
advisory ở `feature-list.md`). Cả 4 đều `type: ui`, không có US nào `type: system` vì mọi
hành vi (kể cả BL002_OAuthCallbackExchange) đều mô tả trọn vẹn được từ góc nhìn actor.

**Cảnh báo gap thêm 2026-08-20 (F012_AwardSystemPage)** — KHÔNG đối chiếu ngược vào file này ở
lượt này (quyết định có chủ đích, không phải bỏ sót). `docs/vi/features/award-system-page/technical-spec.md`
tự đánh mã `US001_XemNoiDungTrangGiaiThuong`, `US002_DieuHuongQuaMucNavDanhMuc`,
`US003_KhamPhaSunKudosTuTrangGiaiThuong` — các mã này CỤC BỘ trong feature-spec đó và **trùng
số** (không trùng nội dung) với `US001_ViewHeroSection`/`US002_ViewEventCountdown`/`US003_ReadRootFurtherContent`
global ở ngay trên. Không renumber một trong hai phía ở lượt này để tránh phá vỡ tham chiếu
chưa xác nhận hết ở nơi khác; khuyến nghị `/tkm:rebuild-spec --features F012` cấp mã global
mới (kế tiếp sau US023) và cập nhật `Screen → US Map` + `SCR002_Awards` bên dưới khi chạy.



---

## US001_ViewHeroSection: View Hero Section

**Type**: ui
**Interaction**: secondary-action
**Priority**: High
**Estimate**: S

### User Story

As a guest, I want to view the hero section so that I know what the event is and where to go next.

### Acceptance Criteria

- [ ] Criterion 1: Hero hiển thị keyvisual full-bleed, tiêu đề "ROOT FURTHER", và `EventInfo` tĩnh khi vào `/`.
- [ ] Criterion 2: Hero hiển thị cho mọi actor (guest/user/admin) — không có điều kiện role nào chi phối khối này.
- [ ] Criterion 3: Nội dung `EventInfo` đúng theo locale hiện tại (vi/en) — xem US010.

### Technical Notes

- **Endpoint**: N/A — nội dung tĩnh, không network call.
- **Data Required**: Chuỗi dịch i18n (`lib/i18n/dictionaries/{vi,en}.ts`); asset keyvisual tĩnh.
- **Dependencies**: `components/home/hero-keyvisual.tsx`, `components/home/event-info.tsx`.

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest mở `/` | Trang render xong | Hero keyvisual + EventInfo hiển thị đầy đủ, đúng locale hiện tại |
| Edge Case | Locale đổi từ vi sang en (US010) | Hero re-render | Nội dung EventInfo cập nhật sang tiếng Anh, layout không đổi |

---

## US002_ViewEventCountdown: View Event Countdown

**Type**: ui
**Interaction**: secondary-action
**Priority**: High
**Estimate**: M

### User Story

As a guest, I want to view the countdown to the event so that I know how much time remains.

### Acceptance Criteria

- [ ] Criterion 1: Trước khi mount (SSR) và ngay sau mount, countdown hiển thị trạng thái "Coming soon" với số 00/00/00 (tránh hydration mismatch).
- [ ] Criterion 2: Sau mount, `computeCountdown(NEXT_PUBLIC_EVENT_START_AT, now)` chạy và cập nhật days/hours/minutes mỗi 60 giây qua `setInterval`.
- [ ] Criterion 3: Khi thời điểm hiện tại đã qua `NEXT_PUBLIC_EVENT_START_AT` → `isExpired = true`, UI chuyển sang trạng thái expired (không còn "Coming soon").
- [ ] Criterion 4: Khi `NEXT_PUBLIC_EVENT_START_AT` không hợp lệ/thiếu → `isInvalid = true`, UI vào trạng thái invalid-config (không crash).

### Technical Notes

- **Endpoint**: N/A — hàm thuần `computeCountdown` (`lib/countdown.ts`), không network.
- **Data Required**: Biến env `NEXT_PUBLIC_EVENT_START_AT` (client-side).
- **Dependencies**: `components/home/countdown-timer.tsx`, ALG-001 (feature-spec sẽ trích dẫn), BR-001/BR-002/BR-003.

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | `NEXT_PUBLIC_EVENT_START_AT` hợp lệ, còn trong tương lai | Trang mount xong, `tick()` chạy | Days/hours/minutes hiển thị đúng, cập nhật mỗi 60s |
| Edge Case | `NEXT_PUBLIC_EVENT_START_AT` đã ở quá khứ | `tick()` chạy | `isExpired=true`, UI chuyển trạng thái expired, không hiện "Coming soon" |
| Edge Case 2 | `NEXT_PUBLIC_EVENT_START_AT` rỗng/không parse được | `tick()` chạy | `isInvalid=true`, UI vào trạng thái invalid-config, không throw |

---

## US003_ReadRootFurtherContent: Read Root Further Content

**Type**: ui
**Interaction**: secondary-action
**Priority**: Medium
**Estimate**: S

### User Story

As a guest, I want to read the Root Further content so that I understand the event's message.

### Acceptance Criteria

- [ ] Criterion 1: Khối `RootFurtherContent` hiển thị 2 đoạn văn tiếng Việt + trích dẫn, không có state/logic tương tác.
- [ ] Criterion 2: Nội dung hiển thị cho mọi actor, không phụ thuộc role.

### Technical Notes

- **Endpoint**: N/A — nội dung tĩnh.
- **Data Required**: Copy tĩnh trong `components/home/root-further-content.tsx` (không qua dictionary i18n theo scope note trong `award-card.tsx`/`kudos-section.tsx`).
- **Dependencies**: `components/home/root-further-content.tsx`.

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest cuộn tới khối Root Further trên `/` | Khối render | Cả 2 đoạn văn + trích dẫn hiển thị đầy đủ, không lỗi |

---

## US004_BrowseAwardCategories: Browse Award Categories

**Type**: ui
**Interaction**: secondary-action
**Priority**: High
**Estimate**: S

### User Story

As a guest, I want to browse the list of award categories so that I know what awards exist.

### Acceptance Criteria

- [ ] Criterion 1: `AwardsSection` render đúng 6 `AwardCard` từ hằng số `AWARDS` (`lib/awards.ts`), thứ tự giữ nguyên mảng nguồn.
- [ ] Criterion 2: Mỗi card hiển thị badge dùng chung + wordmark riêng + title/description tĩnh của đúng hạng mục.
- [ ] Criterion 3: Grid responsive 3 cột (≥lg) / 2 cột (<lg) theo BR-004.

### Technical Notes

- **Endpoint**: N/A — dữ liệu hard-code, không fetch.
- **Data Required**: `AWARDS: Award[]` (`lib/awards.ts`).
- **Dependencies**: `components/home/awards-section.tsx`, `components/home/award-card.tsx`.

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest cuộn tới AwardsSection trên `/` | Khối render | Đúng 6 card hiển thị, đúng badge/wordmark/title/description theo `AWARDS` |
| Edge Case | Viewport < lg breakpoint | Khối render | Grid chuyển sang 2 cột thay vì 3 |

---

## US006_ViewAwardCategoryDetail: View Award Category Detail

**Type**: ui
**Interaction**: navigation
**Priority**: High
**Estimate**: S

### User Story

As a guest, I want to view an award category's detail so that I can learn more about that specific award.

### Acceptance Criteria

- [ ] Criterion 1: Click vào ảnh badge, title, hoặc link "Chi tiết" của một `AwardCard` bất kỳ (áp dụng đều cho cả 6 hạng mục — `awardHref(slug)` per BR-005) điều hướng tới `/awards#<slug>` đúng của hạng mục đó.
- [ ] Criterion 2: Trang `/awards` load, cuộn tới đúng `<section id={slug}>` tương ứng.
- [ ] Criterion 3: Card không có slug hợp lệ (fallback) điều hướng về `/awards` trần, không hash, không auto-scroll (BR-005, ID-62).

### Technical Notes

- **Endpoint**: N/A — client-side Next.js Link, không network. Đích: `/awards#<slug>`.
- **Data Required**: `EXPECTED_AWARD_SLUGS`, `awardHref()` (`lib/awards.ts`).
- **Dependencies**: `components/home/award-card.tsx`, `app/awards/page.tsx`.

### Screens

- SCR001_Home: Home (nguồn — 3 link/card × 6 card)
- SCR002_Awards: Awards (đích — 6 khối `<section id={slug}>`)

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest click "Chi tiết" của card "Top Talent" | Điều hướng | URL = `/awards#top-talent`, trang Awards load và cuộn tới section đó |
| Edge Case | Card không có slug hợp lệ | Click | Điều hướng về `/awards` (không hash, không auto-scroll) |

---

## US005_ReadKudosPromotion: Read Kudos Promotion

**Type**: ui
**Interaction**: secondary-action
**Priority**: Medium
**Estimate**: S

### User Story

As a guest, I want to read the Sun* Kudos promotion so that I understand what this new activity is.

### Acceptance Criteria

- [ ] Criterion 1: `KudosSection` hiển thị label, title, đoạn giới thiệu dài (tiếng Việt, không qua dictionary) và wordmark "Sun* Kudos".
- [ ] Criterion 2: Nội dung hiển thị cho mọi actor.

### Technical Notes

- **Endpoint**: N/A — nội dung tĩnh.
- **Data Required**: Copy tĩnh trong `components/home/kudos-section.tsx`.
- **Dependencies**: `components/home/kudos-section.tsx`.

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest cuộn tới KudosSection trên `/` | Khối render | Label/title/copy/wordmark hiển thị đầy đủ |

---

## US007_NavigateToAwardsPage: Navigate To Awards Page

**Type**: ui
**Interaction**: navigation
**Priority**: High
**Estimate**: S

### User Story

As a guest, I want to navigate to the Awards page so that I can see the award information overview.

### Acceptance Criteria

- [ ] Criterion 1: Click header nav "Awards", footer nav "Awards", hero CTA "Xem giải thưởng", hoặc QuickActionWidget mục "Về SAA" — cả 4 điểm vào đều điều hướng tới `/awards` (không hash) — merge vì cùng actor (mọi role), cùng đích, không rẽ nhánh dữ liệu.
- [ ] Criterion 2: Trang `/awards` load, hiển thị tiêu đề "Award Information" + 6 khối anchor section.

### Technical Notes

- **Endpoint**: N/A — client-side Next.js Link tới `/awards`.
- **Data Required**: Không.
- **Dependencies**: `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`, `components/home/hero-cta.tsx`, `components/layout/quick-action-widget.tsx`, `app/awards/page.tsx`.

### Screens

- SCR001_Home: Home (4 entry point)
- SCR002_Awards: Awards (đích)

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest click header nav "Awards" | Điều hướng | URL = `/awards`, trang load không hash |
| Edge Case | Guest click QuickActionWidget "Về SAA" thay vì header nav | Điều hướng | Kết quả giống hệt — cùng đích `/awards` |

---

## US008_NavigateToKudosPage: Navigate To Kudos Page

**Type**: ui
**Interaction**: navigation
**Priority**: High
**Estimate**: S

### User Story

As a guest, I want to navigate to the Kudos page so that I can find out more about Sun* Kudos.

### Acceptance Criteria

- [ ] Criterion 1: Click header nav "Kudos", footer nav "Kudos", hero CTA "Sun* Kudos", KudosSection "Chi tiết", hoặc QuickActionWidget mục "Viết Kudos" — cả 5 điểm vào đều điều hướng tới `/kudos` — merge vì cùng actor, cùng đích, không rẽ nhánh.
- [ ] Criterion 2: Trang `/kudos` load, hiển thị `<h1>Sun* Kudos</h1>` (bare stub, không có nội dung khác).

### Technical Notes

- **Endpoint**: N/A — client-side Next.js Link tới `/kudos`.
- **Data Required**: Không.
- **Dependencies**: `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`, `components/home/hero-cta.tsx`, `components/home/kudos-section.tsx`, `components/layout/quick-action-widget.tsx`, `app/kudos/page.tsx`.

### Screens

- SCR001_Home: Home (5 entry point)
- SCR003_Kudos: Kudos (đích)

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest click KudosSection "Chi tiết" | Điều hướng | URL = `/kudos`, trang load hiển thị heading "Sun* Kudos" |

---

## US009_ReturnToHomeTop: Return To Home Top

**Type**: ui
**Interaction**: navigation
**Priority**: Low
**Estimate**: S

### User Story

As a guest, I want to return to the top of the Home page so that I can quickly get back to the hero section.

### Acceptance Criteria

- [ ] Criterion 1: Click logo (header hoặc footer) hoặc nav "About"/"About SAA 2025" (header hoặc footer) gọi `window.scrollTo({top:0, behavior:'auto'})` và link `href="/"` — merge 4 điểm vì cùng actor, cùng hành vi, cùng đích.
- [ ] Criterion 2: Header nav "About" mang `aria-current="page"` (chỉ báo trang hiện tại, không phải link chéo trang thật).

### Technical Notes

- **Endpoint**: N/A — `window.scrollTo` + client-side Link tới `/` (đang đứng tại `/`).
- **Data Required**: Không.
- **Dependencies**: `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`.

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest đã cuộn xuống AwardsSection, click logo header | Click | Trang cuộn về đầu (top=0) |

---

## US010_SwitchInterfaceLanguage: Switch Interface Language

**Type**: ui
**Interaction**: system-action
**Priority**: Medium
**Estimate**: S

### User Story

As a guest, I want to switch the interface language so that I can read the site in vi or en.

### Acceptance Criteria

- [ ] Criterion 1: Mở dropdown `LanguageSwitcher`, chọn "Tiếng Việt" hoặc "English" — merge 2 option vì cùng actor, cùng cơ chế `setLocale`, chỉ khác tham số.
- [ ] Criterion 2: Chọn xong, toàn bộ chuỗi dịch trên trang đổi theo locale mới, dropdown đóng lại.
- [ ] Criterion 3: Lựa chọn được ghi vào `localStorage` (`saa.locale`), tồn tại qua lần tải trang sau.
- [ ] Criterion 4: Mục đang chọn có `aria-current="true"`.

### Technical Notes

- **Endpoint**: N/A — không network, ghi `localStorage`.
- **Data Required**: `lib/i18n/dictionaries/{vi,en}.ts`.
- **Dependencies**: `components/ui/language-switcher.tsx`, `lib/i18n/locale-provider.tsx`, `components/ui/dropdown-menu.tsx` (SM-001).

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Locale hiện tại = vi | Chọn "English" | Toàn trang đổi sang tiếng Anh, `localStorage.saa.locale = 'en'` |
| Edge Case | Reload trang sau khi đã chọn en | Trang load lại | Locale vẫn là en (đọc từ `localStorage`) |

---

## US011_OpenQuickActionWidget: Open Quick Action Widget

**Type**: ui
**Interaction**: secondary-action
**Priority**: Medium
**Estimate**: S

### User Story

As a guest, I want to open the quick action widget so that I can jump to Kudos or Awards from anywhere on the page.

### Acceptance Criteria

- [ ] Criterion 1: Click nút widget nổi (fixed, luôn hiển thị khi cuộn) mở dropdown 2 mục: "Viết Kudos", "Về SAA".
- [ ] Criterion 2: Chọn một mục điều hướng tới đích tương ứng (xem US007/US008) và đóng dropdown.
- [ ] Criterion 3: Widget hiển thị cho mọi actor, không phụ thuộc role.

### Technical Notes

- **Endpoint**: N/A.
- **Data Required**: Không.
- **Dependencies**: `components/layout/quick-action-widget.tsx`, `components/ui/dropdown-menu.tsx` (SM-001).

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest click nút widget | Click | Dropdown mở, hiện 2 mục "Viết Kudos"/"Về SAA" |
| Edge Case | Dropdown đang mở, click ra ngoài | Click outside | Dropdown đóng (hành vi chung của SM-001) |

---

## US012_OpenNotificationPanel: Open Notification Panel

**Type**: ui
**Interaction**: secondary-action
**Priority**: Low
**Estimate**: S

### User Story

As a user, I want to open the notification panel so that I can check for notifications.

### Acceptance Criteria

- [ ] Criterion 1: Chuông thông báo chỉ hiển thị khi `role !== 'guest'` (PERM003) — guest không thấy, không có cách nào mở panel.
- [ ] Criterion 2: Click chuông mở panel, panel luôn hiển thị cùng một empty-state cố định (chưa có nguồn dữ liệu thông báo thật — không phải lỗi).
- [ ] Criterion 3: Badge số chỉ hiện khi `unreadCount > 0`; badge không phải một permission riêng theo role, chỉ là điều kiện hiển thị dữ liệu.

### Technical Notes

- **Endpoint**: N/A.
- **Data Required**: `unreadCount` từ `lib/session/session-provider.tsx` (mock, `localStorage.saa.mock-unread` hoặc fallback env).
- **Dependencies**: `components/ui/notification-bell.tsx`, `components/ui/dropdown-menu.tsx` (SM-001).

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | `role='user'`, `unreadCount=3` | Click chuông | Badge hiện "3"; panel mở, hiện empty-state cố định |
| Edge Case | `role='guest'` | Xem SiteHeader | Chuông không render, không có cách nào mở panel |

---

## US013_OpenAccountMenu: Open Account Menu

**Type**: ui
**Interaction**: secondary-action
**Priority**: Medium
**Estimate**: S

### User Story

As a user, I want to open the account menu so that I can access account-related actions.

### Acceptance Criteria

- [ ] Criterion 1: Account menu chỉ hiển thị khi `role !== 'guest'` (PERM001) — guest không thấy nút trigger, không cách nào mở menu.
- [ ] Criterion 2: Click nút account mở menu, hiển thị "Profile" + "Sign out" cho `user`; thêm "Admin Dashboard" cho `admin` (PERM002, xem US016).

### Technical Notes

- **Endpoint**: N/A.
- **Data Required**: `role` từ `lib/session/session-provider.tsx`.
- **Dependencies**: `components/ui/account-menu.tsx`, `components/ui/dropdown-menu.tsx` (SM-001).

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | `role='user'` | Click nút account | Menu mở, hiện đúng "Profile" + "Sign out", không có "Admin Dashboard" |
| Edge Case | `role='guest'` | Xem SiteHeader | Nút account không render |

---

## US014_NavigateToProfilePage: Navigate To Profile Page

**Type**: ui
**Interaction**: navigation
**Priority**: Medium
**Estimate**: S

### User Story

As a user, I want to navigate to the Profile page so that I can see my profile.

### Acceptance Criteria

- [ ] Criterion 1: Trong account menu đã mở, click "Profile" điều hướng tới `/profile` và đóng menu.
- [ ] Criterion 2: Trang `/profile` load, hiển thị `<h1>Profile</h1>` + thông báo "chưa được thiết kế" (placeholder có chủ đích, không phải 404).
- [ ] Criterion 3: Khả dụng như nhau cho `user` và `admin` (cả hai đều thấy mục "Profile").

### Technical Notes

- **Endpoint**: N/A — client-side Next.js Link tới `/profile`.
- **Data Required**: Không.
- **Dependencies**: `components/ui/account-menu.tsx`, `app/profile/page.tsx`.

### Screens

- SCR001_Home: Home (nguồn — account menu)
- SCR004_Profile: Profile (đích)

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | `role='user'`, account menu đang mở | Click "Profile" | URL = `/profile`, trang load hiển thị placeholder, menu đóng |

---

## US015_ClickSignOutButton: Click Sign Out Button

**Type**: ui
**Interaction**: secondary-action
**Priority**: Low
**Estimate**: S

### User Story

As a user, I want to click the sign-out button so that the account menu closes (no real session exists to end).

### Acceptance Criteria

- [ ] Criterion 1: Trong account menu đã mở, click "Sign out" chỉ đóng menu — **không xóa session/token/cookie nào vì không có session thật để xóa** (không có luồng đăng nhập trong repo, `system-overview.md` § Security Overview).
- [ ] Criterion 2: Không có điều hướng nào xảy ra sau khi click — người dùng vẫn ở `/`.
- [ ] Criterion 3: Hành vi giống nhau cho `user` và `admin`.

### Technical Notes

- **Endpoint**: N/A — `onClick={close}` thuần, không gọi API/xóa state nào khác.
- **Data Required**: Không.
- **Dependencies**: `components/ui/account-menu.tsx`.

### Screens

- SCR001_Home: Home

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Account menu đang mở | Click "Sign out" | Menu đóng, URL không đổi, `role` trong `localStorage` không bị xóa/thay đổi |

---

## US016_NavigateToAdminDashboard: Navigate To Admin Dashboard

**Type**: ui
**Interaction**: navigation
**Priority**: Low
**Estimate**: S

### User Story

As an admin, I want to navigate to the Admin Dashboard so that I can access the admin area from the account menu.

### Acceptance Criteria

- [ ] Criterion 1: Mục menu "Admin Dashboard" chỉ hiển thị trong account menu khi `role === 'admin'` (PERM002).
- [ ] Criterion 2: Click mục này điều hướng tới `/admin`, trang load hiển thị `<h1>Admin Dashboard</h1>` + thông báo "chưa được thiết kế".
- [ ] Criterion 3: **Cảnh báo bắt buộc ghi nhận**: `/admin` KHÔNG có route guard thật — bất kỳ ai gõ thẳng URL đều xem được trang, kể cả `guest`/`user` chưa từng thấy mục menu này (comment nguồn `app/admin/page.tsx:1-4`, PERM002). Đây là ẩn MỤC MENU, không phải chặn truy cập.

### Technical Notes

- **Endpoint**: N/A — client-side Next.js Link tới `/admin`; route không có server-side enforcement.
- **Data Required**: `role` từ `lib/session/session-provider.tsx` (chỉ để ẩn/hiện mục menu).
- **Dependencies**: `components/ui/account-menu.tsx`, `app/admin/page.tsx`.

### Screens

- SCR001_Home: Home (nguồn — account menu, chỉ admin thấy mục)
- SCR005_AdminDashboard: AdminDashboard (đích — reachable bởi MỌI role qua URL trực tiếp)

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | `role='admin'`, account menu đang mở | Click "Admin Dashboard" | URL = `/admin`, trang load hiển thị placeholder |
| Edge Case | `role='guest'`, gõ thẳng URL `/admin` | Truy cập trực tiếp | Trang vẫn load bình thường — không có guard nào chặn (xác nhận hành vi KHÔNG an toàn theo thiết kế hiện tại) |

---

## US017_ViewPrelaunchCountdown: View Prelaunch Countdown

**Type**: ui
**Interaction**: secondary-action
**Priority**: High
**Estimate**: M
**Thêm**: 2026-08-19

### User Story

As a guest, I want to view the prelaunch countdown so that I know when the event unlocks the rest of the site.

### Acceptance Criteria

- [ ] Criterion 1: `/prelaunch` render full-viewport nền ảnh sự kiện + gradient overlay + tiêu đề "Sự kiện sẽ bắt đầu sau" + 3 ô DAYS/HOURS/MINUTES.
- [ ] Criterion 2: Giá trị tick lại mỗi 1 giây (không phải 60 giây như SCR001), zero-padded 2 chữ số.
- [ ] Criterion 3: Số ngày còn lại vượt quá 99 hiển thị cố định `99` (không hiển thị sai như `12` của một số 3 chữ số).
- [ ] Criterion 4: Hiển thị như nhau cho mọi actor (guest/user/admin) — không có điều kiện role nào chi phối khối này.

### Technical Notes

- **Endpoint**: N/A — hàm thuần `computeCountdown` (`lib/countdown.ts`) + `capDisplayDays` (`lib/prelaunch/display.ts`), không network.
- **Data Required**: `NEXT_PUBLIC_EVENT_START_AT` (cùng biến với SCR001).
- **Dependencies**: `components/prelaunch/prelaunch-countdown.tsx`, `components/prelaunch/countdown-unit.tsx`, `components/prelaunch/digit-box.tsx`, `lib/prelaunch/use-prelaunch-countdown.ts`.

### Screens

- SCR006_Prelaunch: Prelaunch

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | `NEXT_PUBLIC_EVENT_START_AT` hợp lệ, còn 5 ngày 3 giờ 9 phút | Actor mở `/prelaunch` | 3 ô hiện `05`, `03`, `09`, tick lại mỗi giây |
| Edge Case | Còn hơn 99 ngày | Actor mở `/prelaunch` | Ô DAYS hiện `99`, không hiện số sai |

---

## US018_BlockedByLaunchGate: Blocked By Launch Gate While Counting Down

**Type**: ui
**Interaction**: navigation
**Priority**: High
**Estimate**: M
**Thêm**: 2026-08-19

### User Story

As a guest, I want to be redirected to the prelaunch countdown when I try any other page before launch so that I cannot see content that isn't public yet.

### Acceptance Criteria

- [ ] Criterion 1: Trong lúc gate khóa (`!isExpired && !isInvalid`), request tới `/`, `/awards`, `/kudos`, `/profile`, hoặc `/admin` đều bị `proxy.ts` chặn và đưa về `/prelaunch` trước khi trang đích render.
- [ ] Criterion 2: Request tới `/prelaunch` trong lúc gate khóa không bị redirect vòng lặp — render bình thường.
- [ ] Criterion 3: Áp dụng như nhau cho mọi role — gate không đọc `role`/session.

### Technical Notes

- **Endpoint**: N/A — `proxy.ts` (request-interception layer), gọi `lib/prelaunch/gate.ts` (`resolveGateRedirect`).
- **Data Required**: `NEXT_PUBLIC_EVENT_START_AT`, `pathname` hiện tại.
- **Dependencies**: `proxy.ts`, `lib/prelaunch/gate.ts`.

### Screens

- SCR001_Home, SCR002_Awards, SCR003_Kudos, SCR004_Profile, SCR005_AdminDashboard (nguồn — bị chặn)
- SCR006_Prelaunch (đích)

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Gate khóa | Actor mở `/awards` | Actor thấy `/prelaunch`, không thấy nội dung `/awards` |
| Edge Case | Gate khóa | Actor mở `/prelaunch` trực tiếp | Render bình thường, không redirect vòng lặp |

---

## US019_AutoUnlockAtZero: Auto-Unlock And Redirect At Zero

**Type**: ui
**Interaction**: system-action
**Priority**: High
**Estimate**: M
**Thêm**: 2026-08-19

### User Story

As a guest already viewing the prelaunch countdown, I want to be redirected to the homepage the moment the event starts so that I don't have to reload manually.

### Acceptance Criteria

- [ ] Criterion 1: Khi đếm ngược chạm 0 (hoặc `NEXT_PUBLIC_EVENT_START_AT` không hợp lệ), request mới tới bất kỳ route nào đi thẳng tới đích; `/prelaunch` tự redirect về `/`.
- [ ] Criterion 2: Actor đang mở sẵn `/prelaunch` được `router.replace('/')` ngay trong tick 1 giây đó mà không cần tải lại.
- [ ] Criterion 3: Việc thử redirect phía client được throttle tối đa 1 lần/30 giây qua `sessionStorage`, để tránh vòng lặp nhấp nháy khi đồng hồ máy actor lệch server.

### Technical Notes

- **Endpoint**: N/A — `lib/prelaunch/use-prelaunch-countdown.ts` (client), `lib/prelaunch/gate.ts` (server).
- **Data Required**: `NEXT_PUBLIC_EVENT_START_AT`, đồng hồ client/server.
- **Dependencies**: `lib/prelaunch/use-prelaunch-countdown.ts`, `proxy.ts`.

### Screens

- SCR006_Prelaunch (nguồn)
- SCR001_Home (đích)

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Actor đang mở `/prelaunch` | Đồng hồ server chạm mốc sự kiện | Actor được đưa về `/` trong vòng 1 giây, không cần thao tác |
| Edge Case | Đồng hồ client lệch nhanh hơn server | Client tự redirect `/`, server bounce về `/prelaunch` | Nhấp nháy tối đa 1 lần/30 giây (không phải mỗi giây) cho tới khi server cũng đồng ý — xem ADR-002 |

---

## US020_ViewLoginScreen: View Login Screen

**Type**: ui | **Interaction**: secondary-action | **Priority**: High | **Estimate**: S | **Thêm**: 2026-08-19 (lượt Login)

**Story**: As a guest chưa đăng nhập, I want to view the login screen so that I can start signing in with my Google account.

**Acceptance**: (1) `/login` render header/intro/nút đăng nhập/footer riêng, không tái dùng chrome của SCR001. (2) Đã có phiên hợp lệ → `redirect('/')` trước khi render (US023). (3) `?error=...` trên URL → thông báo lỗi cố định hiện ngay khi tải xong.

**Technical**: `getUser()` (`lib/supabase/server.ts`) chạy trước render. Không có data entity nghiệp vụ. Deps: `app/login/page.tsx`, `components/login/{login-header,login-main,login-intro,login-footer}.tsx`.

**Screens**: SCR007_Login

**Test**: Happy — chưa có phiên, mở `/login` → thấy nút, không lỗi. Edge — quay lại từ `?error=...` → thông báo hiện ngay.

---

## US021_SignInWithGoogle: Sign In With Google

**Type**: ui | **Interaction**: primary-action | **Priority**: High | **Estimate**: M | **Thêm**: 2026-08-19 (lượt Login)

**Story**: As a guest trên màn đăng nhập, I want to click a button to sign in with Google so that I get a real authenticated session without typing a password.

**Acceptance**: (1) Click → nút loading (disabled + loader) ngay. (2) `signInWithOAuth({provider:'google'})` điều hướng CÙNG-TAB (không popup). (3) Lỗi/throw trước khi kịp điều hướng → nút hết loading + thông báo lỗi cố định. (4) Google đồng ý → qua `/auth/callback` → về `/` không cần thao tác thêm.

**Technical**: `supabase.auth.signInWithOAuth()` (`lib/supabase/client.ts`) → `app/auth/callback/route.ts` (BL002). Deps: `app/login/login-client.tsx`, `components/login/login-button.tsx`.

**Screens**: SCR007_Login (nguồn), SCR001_Home (đích thành công)

**Test**: Happy — click, đồng ý ở Google → về `/`, có phiên hợp lệ. Edge — lỗi mạng cục bộ trước redirect → nút hết loading, `LoginErrorAlert` hiện, vẫn ở `/login`.

---

## US022_SeeLoginErrorMessage: See Login Error Message

**Type**: ui | **Interaction**: secondary-action | **Priority**: Medium | **Estimate**: S | **Thêm**: 2026-08-19 (lượt Login)

**Story**: As a guest vừa huỷ hoặc gặp lỗi khi đăng nhập Google, I want to see a clear error message so that I know the attempt didn't succeed.

**Acceptance**: (1) Huỷ consent (`error=access_denied`) → `/login?error=...`, `LoginErrorAlert` (`role="alert"`) hiện câu CỐ ĐỊNH, không lộ message gốc. (2) `exchangeCodeForSession` lỗi/throw → cùng hành vi. (3) Nút vẫn bấm lại được ngay, không "khoá".

**Technical**: Nguồn lỗi từ `app/auth/callback/route.ts` (BL002) qua `?error`. Data: boolean `errored` (prop `searchParams.error`, không phải message thật — xem `business-rules.md`). Deps: `app/login/page.tsx`, `components/login/login-error-alert.tsx`.

**Screens**: SCR007_Login

**Test**: Happy — huỷ ở Google → `LoginErrorAlert` hiện, không lộ chi tiết kỹ thuật. Edge — `exchangeCodeForSession` throw (auth-js#782) → vẫn redirect `?error=...`, không crash, không trang lỗi riêng.

---

## US023_RedirectedAwayWhenAlreadyAuthenticated: Redirected Away When Already Authenticated

**Type**: ui | **Interaction**: system-action | **Priority**: High | **Estimate**: S | **Thêm**: 2026-08-19 (lượt Login)

**Story**: As a user đã đăng nhập Google, I want to be redirected away from the login screen so that I don't see a sign-in prompt I no longer need.

**Acceptance**: (1) Phiên hợp lệ, gõ thẳng `/login` → `redirect('/')` ở Server Component TRƯỚC KHI render bất kỳ gì. (2) Kiểm tra dùng `getUser()` (round-trip thật), KHÔNG chỉ đọc cookie (`getSession()`). (3) Độc lập với `role` mock — PERM004 không đọc `SessionState.role`.

**Technical**: `supabase.auth.getUser()` qua `lib/supabase/server.ts`. Cookie phiên refresh bởi `proxy.ts`/BL001. Deps: `app/login/page.tsx`.

**Screens**: SCR007_Login (nguồn), SCR001_Home (đích)

**Test**: Happy — phiên hợp lệ, gõ `/login` → redirect ngay về `/`. Edge — cookie hết hạn/thu hồi, gõ `/login` → `getUser()` trả `null` → render bình thường, KHÔNG redirect.

---

## Screen → US Map

| Screen | US Codes |
|--------|---------|
| SCR001_Home | US001, US002, US003, US004, US006, US005, US007, US008, US009, US010, US011, US012, US013, US014, US015, US016, US018, US019 |
| SCR002_Awards | US006, US007, US018 |
| SCR003_Kudos | US008, US018 |
| SCR004_Profile | US014, US018 |
| SCR005_AdminDashboard | US016, US018 |
| SCR006_Prelaunch | US017, US018, US019 |
| SCR007_Login | US020, US021, US022, US023 |

> `[IPE_ZERO]` — SCR002_Awards, SCR003_Kudos, SCR004_Profile, SCR005_AdminDashboard không phát sinh interaction NÀO có nguồn gốc từ chính màn hình đó (cả 4 là placeholder/bare-stub, không có button/link tương tác nào trong source — xem `screen-list.md`). Cả 4 vẫn có US mapping ở trên vì chúng là **đích đến** (destination) của các US điều hướng nguồn từ SCR001_Home, không phải vì tự thân chúng có interaction. **Thêm 2026-08-19**: US018 (gate) cũng map vào cả 4 vì cùng lý do đối xứng — chúng là điểm mà request bị `proxy.ts` chặn, dù bản thân màn hình không phát sinh interaction đó.

## Cross-Reference Validation

- [x] All US### codes are unique
- [x] All acceptance criteria are testable
- [x] All technical notes are complete
- [x] All US### codes are referenced in FeatureList.md — 23/23 US và 7/7 SCR đều được ít nhất một F### tham chiếu (US017–US019 → F010, US020–US023 → F011, thêm 2026-08-19).
- [x] All `ui` US### mapped to SCR### or SCR###/REG### (parent SCR must exist in ScreenList; system US excluded) — không có REG### nào (toàn bộ SCR đều atomic theo `screen-list.md`)
- [x] All system US### have at least one BL### mapped (UI US excluded) — N/A, không có US type `system` nào trong tài liệu này
