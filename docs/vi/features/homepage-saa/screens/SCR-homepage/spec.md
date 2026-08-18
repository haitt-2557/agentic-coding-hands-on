---
status: promoted
authored_by: doc-writer
created: 2026-08-18
promoted_from: plans/260818-0936-homepage-saa/spec/homepage-saa/screens/SCR-homepage/spec.md
---

# SCR-homepage — Screen Spec

**Screen**: SCR-homepage (mã thật: `SCR001_Home`, xem `docs/vi/generated/screen-list.md`): Trang chủ SAA 2025
**Feature**: F001_EventOverview, F002_EventCountdown, F003_AwardDiscovery, F004_KudosPromotion, F005_LanguageSwitching, F006_QuickActionWidget, F007_AccountMenuAccess, F008_NotificationPanelAccess, F009_ReturnToHomeTop (9 feature thật, cùng một màn hình — xem `../../technical-spec.md` § Overview)
**Type**: composite (theo ý định thiết kế) / **atomic** theo kết quả gate thật (`screen-list.md` § composite-detection: 2-of-3 gate không đạt, không có REG### nào phát sinh)
**Route**: `/` (`app/page.tsx`)
**Generated**: 2026-08-18

## Purpose

Khách truy cập hoặc nhân viên Sun* xem chủ đề, đếm ngược và thông tin cốt lõi của SAA 2025, rồi chọn tìm hiểu sâu hơn về hệ thống giải thưởng hoặc Sun* Kudos.

## Screen Layout

Một trang cuộn dọc dài, gồm 7 vùng chính xếp theo chiều dọc: header sticky ở trên cùng, hero/keyvisual full-bleed, nội dung Root Further, lưới giải thưởng, khối quảng bá Kudos, và footer ở cuối; một nút widget nổi giữ vị trí cố định (fixed) ở cạnh phải trong suốt quá trình cuộn. Breakpoint chính ảnh hưởng bố cục là lưới giải thưởng (desktop 3 cột, tablet/mobile 2 cột — xem `## User Flow` > Branches). Thứ tự render thật khớp 1:1 với sketch dưới đây — xác nhận tại `app/page.tsx:11-22`.

### Layout Sketch

```
┌───────────────────────────────────────────────┐
│  R1: Header (sticky-top)                       │
├───────────────────────────────────────────────┤
│  R2: Hero / Keyvisual (static, full-bleed)     │
│      - ROOT FURTHER + Coming soon + Countdown  │
│      - Event info + 2 CTA                      │
├───────────────────────────────────────────────┤
│  R3: Root Further content (static, scrollable) │
├───────────────────────────────────────────────┤
│  R4: Awards grid (static)             ┌ - - -┐ │
│                                        │  R6  │ │
├───────────────────────────────────────┤widget│ │
│  R5: Sun* Kudos promo (static)         │fixed │ │
│                                        └ - - -┘ │
├───────────────────────────────────────────────┤
│  R7: Footer (static)                           │
└───────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Header | sticky-top | no | Logo, NavLinks, LanguageDropdown, NotificationBell, AccountMenu | always visible — `components/layout/site-header.tsx:23` (`sticky top-0`) |
| R2 | Hero / Keyvisual | static | yes (part of page scroll) | HeroTitle, ComingSoonLabel, CountdownTimer, EventInfo, HeroCTAs | fluid, text wraps at narrow widths — `components/home/hero-keyvisual.tsx:17` |
| R3 | Root Further content | static | yes | RootFurtherHeading, BodyCopy, ProverbQuote | fluid, max-width nội dung trên desktop rộng — `components/home/root-further-content.tsx:18` (`max-w-[1152px]`) |
| R4 | Awards grid | static | yes | AwardsCaption, AwardsHeading, AwardCard × 6 | 3 cột desktop / 2 cột tablet+mobile — `components/home/awards-section.tsx:21` |
| R5 | Sun* Kudos promo | static | yes | KudosLabel, KudosTitle, KudosBody, KudosCTA, KudosArtwork | fluid — `components/home/kudos-section.tsx:19` |
| R6 | Quick-action widget | fixed (right edge) | no (nổi trên nội dung) | QuickActionWidgetButton, QuickActionMenu | luôn hiển thị, không đổi vị trí khi cuộn — `components/layout/quick-action-widget.tsx:17` (`fixed right-4 top-1/2`) |
| R7 | Footer | static | yes | FooterLogo, FooterNavLinks, Copyright | nav links xếp lại theo cột trên mobile hẹp — `components/layout/site-footer.tsx:19` |

**Ghi chú promote (R6 vị trí):** clarifications.md ghi nhận widget dùng `top-1/2` (giữa mép phải dọc), khác câu chữ "cố định ở mép phải bên dưới màn hình" của spec item gốc — quyết định giữ nguyên `top-1/2` theo frame (frame thắng layout, xem Post-forge decisions trong clarifications.md).

## User Flow

> **Scope:** chỉ tương tác trong phạm vi màn hình này. Điều hướng sang `/awards`, `/kudos` là điểm kết thúc luồng (cross-screen, ngoài phạm vi).

### Happy Path

1. Người dùng mở `/`, thấy R1 Header và R2 Hero với "ROOT FURTHER", "Coming soon", đếm ngược, thông tin sự kiện, 2 CTA.
2. Người dùng cuộn xuống R3, đọc nội dung Root Further và trích dẫn tục ngữ.
3. Người dùng cuộn tiếp tới R4, đọc caption + heading + lướt 6 thẻ giải thưởng.
4. Người dùng click ảnh, tiêu đề, hoặc "Chi tiết" trên một thẻ ở R4 — rời màn hình này, sang `/awards#<slug>`.
5. (Nhánh khác) Người dùng cuộn tới R5, đọc nội dung Kudos, click "Chi tiết" — rời màn hình này, sang `/kudos`.
6. Người dùng cuộn tới R7 Footer, click một link nav — rời màn hình này, sang `/awards` hoặc `/kudos` tương ứng (hoặc quay `/` nếu click logo).

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 1 (viewport) | Desktop | R4 hiển thị lưới 3 cột | `components/home/awards-section.tsx:21` (`lg:grid-cols-3`) |
| Bước 1 (viewport) | Tablet hoặc mobile | R4 hiển thị lưới 2 cột | `components/home/awards-section.tsx:21` (`grid-cols-2` mặc định) |
| Bước 1 (session) | `role: guest` | R1 không hiện NotificationBell, không hiện AccountMenu | `components/ui/notification-bell.tsx:16`, `components/ui/account-menu.tsx:16` |
| Bước 1 (session) | `role: user` hoặc `admin` | R1 hiện NotificationBell (có badge nếu unread > 0) + AccountMenu | `components/ui/notification-bell.tsx:13-49`, `components/ui/account-menu.tsx:13-65` |
| Bước 1 (session) | `role: admin` | AccountMenu có thêm mục "Admin Dashboard" | `components/ui/account-menu.tsx:51-59` |
| Bất kỳ lúc nào | Click nút ngôn ngữ ở R1 | Menu VN/EN mở tại chỗ, chọn xong toàn bộ copy màn hình đổi ngôn ngữ, không rời màn hình | `components/ui/language-switcher.tsx:20-72`, `lib/i18n/locale-provider.tsx:63-66` |
| Bất kỳ lúc nào | Click nút widget ở R6 | Menu 2 mục ("Viết Kudos", "Về SAA 2025") mở tại chỗ, không rời màn hình cho tới khi chọn | `components/layout/quick-action-widget.tsx:14-64` |
| Bước 4 | Thẻ giải thưởng thiếu slug hợp lệ | Điều hướng `/awards` không kèm hash, không auto-scroll | `lib/awards.ts:69-74` — nhánh không khả đạt từ UI thật (6/6 award đều có slug), coverage ở `lib/awards.test.ts:51-52` |
| Countdown (nền) | Thời điểm hiện tại đã qua sự kiện, hoặc env không hợp lệ | R2 hiện `00/00/00`, ẩn "Coming soon", không rời màn hình | `lib/countdown.ts:35-61`, `components/home/countdown-timer.tsx:39` |

## UI States

> Trang không gọi API/mutation nào (nội dung tĩnh + client-side mock state) — không có state loading/saving/success kiểu request-response truyền thống. Các state dưới đây là state hiển thị thực tế của màn hình.

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| counting (countdown) | `NEXT_PUBLIC_EVENT_START_AT` hợp lệ và còn hạn | 3 ô DAYS/HOURS/MINUTES hiện số 2 chữ số, "Coming soon" hiện | none (tự động, tick mỗi phút) | `components/home/countdown-timer.tsx:20-53`, `lib/countdown.ts:50-59` |
| zero-state (countdown) | tới/qua thời điểm sự kiện, hoặc env không hợp lệ/không parse được | 3 ô hiện `00`, "Coming soon" ẩn | none | `lib/countdown.ts:24-26,36-48` |
| empty (notification panel) | click chuông khi chưa có dữ liệu thông báo thật | panel hiện header + "Không có thông báo mới" | đóng panel (click ngoài/Esc/click lại) | `components/ui/notification-bell.tsx:41-46` |
| dropdown-open (ngôn ngữ / tài khoản / widget) | click nút trigger, hoặc Enter/Space khi focus | menu tương ứng render bên dưới/nổi trên nút trigger | chọn mục, click ngoài, Esc để đóng | `components/ui/dropdown-menu.tsx:88-114` |
| dropdown-closed | mặc định, hoặc sau khi đóng | không có menu nào hiển thị | click/Enter/Space để mở | `components/ui/dropdown-menu.tsx:48` (`useState(false)`) |

`N/A — no loading/saving/success async states (no API calls on this screen).`

## Validation & Error Feedback

### A) Client-side

`N/A — no client-side form validation detected.` (Trang chủ không có form nhập liệu; menu ngôn ngữ và menu tài khoản là lựa chọn, không phải input cần validate.)

### B) Server-side

`N/A — no submit-style action handlers detected.` (Mọi hành động trên màn hình này là điều hướng (`Link`) hoặc toggle UI cục bộ, không có action gửi dữ liệu lên server.)

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | partial | 3 warning ghi nhận sau review, chưa sửa (chờ quyết định design owner — `plans/260818-0936-homepage-saa/reports/design-defects-260818-homepage-saa.md` mục D): (1) `role="button"` trên 2 CTA hero (`components/home/hero-cta.tsx:19,27`) tuy chúng là link điều hướng — Space không kích hoạt được như hứa hẹn của `role="button"`; (2) `role="menu"`/`"menuitem"` trên 4 dropdown (`components/ui/dropdown-menu.tsx:103`, `components/ui/account-menu.tsx:37,45,54`) hứa điều hướng phím mũi tên theo APG nhưng chưa có; (3) mỗi award card có 3 link cùng đích, 2 link trùng accessible name (`components/home/award-card.tsx:44-46,69`) |
| Keyboard navigation | supported | Tab tới nút dropdown, Enter hoặc Space mở menu (`components/ui/dropdown-menu.tsx:81-86`), Esc đóng menu + trả focus (`components/ui/dropdown-menu.tsx:64-71`) — áp dụng cho mọi dropdown trên màn hình |
| Focus management | partial | Click ra ngoài đóng menu (`components/ui/dropdown-menu.tsx:58-62`); Esc trả focus về trigger qua `data-dropdown-trigger` (dòng 67-69); focus trap bên trong menu khi mở CHƯA được hiện thực — giữ mức "partial" |
| Screen reader compatibility | unknown | Không có test case nào xác nhận hành vi screen reader trong 62 TC gốc; cần audit riêng trước khi phát hành chính thức |
