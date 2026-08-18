---
status: draft
authored_by: takumi
created: 2026-08-18
---

# SCR-homepage — Screen Spec

**Screen**: SCR-homepage (draft — SCR### cấp phát khi promote): Trang chủ SAA 2025
**Feature**: F000_HomepageSaa (F001 provisional — xem `technical-spec.md` § Artifact References)
**Type**: composite
**Route**: `/`
**Generated**: 2026-08-18

## Purpose

Khách truy cập hoặc nhân viên Sun* xem chủ đề, đếm ngược và thông tin cốt lõi của SAA 2025, rồi chọn tìm hiểu sâu hơn về hệ thống giải thưởng hoặc Sun* Kudos.

## Screen Layout

Một trang cuộn dọc dài (1512×4480 theo frame), gồm 7 vùng chính xếp theo chiều dọc: header sticky ở trên cùng, hero/keyvisual full-bleed, nội dung Root Further, lưới giải thưởng, khối quảng bá Kudos, và footer ở cuối; một nút widget nổi giữ vị trí cố định (fixed) ở cạnh phải trong suốt quá trình cuộn. Breakpoint chính ảnh hưởng bố cục là lưới giải thưởng (desktop 3 cột, tablet/mobile 2 cột — xem `## User Flow` > Branches).

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
| R1 | Header | sticky-top | no | Logo, NavLinks, LanguageDropdown, NotificationBell, AccountMenu | always visible |
| R2 | Hero / Keyvisual | static | yes (part of page scroll) | HeroTitle, ComingSoonLabel, CountdownTimer, EventInfo, HeroCTAs | fluid, text wraps at narrow widths |
| R3 | Root Further content | static | yes | RootFurtherHeading, BodyCopy, ProverbQuote | fluid, max-width nội dung trên desktop rộng |
| R4 | Awards grid | static | yes | AwardsCaption, AwardsHeading, AwardCard × 6 | 3 cột desktop / 2 cột tablet+mobile |
| R5 | Sun* Kudos promo | static | yes | KudosLabel, KudosTitle, KudosBody, KudosCTA, KudosArtwork | fluid, artwork ẩn/thu nhỏ trên mobile hẹp |
| R6 | Quick-action widget | fixed (right edge) | no (nổi trên nội dung) | QuickActionWidgetButton, QuickActionMenu | luôn hiển thị, không đổi vị trí khi cuộn |
| R7 | Footer | static | yes | FooterLogo, FooterNavLinks, Copyright | nav links xếp lại theo cột trên mobile hẹp |

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
| Bước 1 (viewport) | Desktop | R4 hiển thị lưới 3 cột | TBD (draft) |
| Bước 1 (viewport) | Tablet hoặc mobile | R4 hiển thị lưới 2 cột | TBD (draft) |
| Bước 1 (session) | `role: guest` | R1 không hiện NotificationBell, không hiện AccountMenu | TBD (draft) |
| Bước 1 (session) | `role: user` hoặc `admin` | R1 hiện NotificationBell (có badge nếu unread > 0) + AccountMenu | TBD (draft) |
| Bước 1 (session) | `role: admin` | AccountMenu có thêm mục "Admin Dashboard" | TBD (draft) |
| Bất kỳ lúc nào | Click nút ngôn ngữ ở R1 | Menu VN/EN mở tại chỗ, chọn xong toàn bộ copy màn hình đổi ngôn ngữ, không rời màn hình | TBD (draft) |
| Bất kỳ lúc nào | Click nút widget ở R6 | Menu 2 mục ("Viết Kudos", "Về SAA 2025") mở tại chỗ, không rời màn hình cho tới khi chọn | TBD (draft) |
| Bước 4 | Thẻ giải thưởng thiếu slug hợp lệ | Điều hướng `/awards` không kèm hash, không auto-scroll | TBD (draft) |
| Countdown (nền) | Thời điểm hiện tại đã qua sự kiện, hoặc env không hợp lệ | R2 hiện `00/00/00`, ẩn "Coming soon", không rời màn hình | TBD (draft) |

## UI States

> Trang không gọi API/mutation nào (nội dung tĩnh + client-side mock state) — không có state loading/saving/success kiểu request-response truyền thống. Các state dưới đây là state hiển thị thực tế của màn hình.

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| counting (countdown) | `NEXT_PUBLIC_EVENT_START_AT` hợp lệ và còn hạn | 3 ô DAYS/HOURS/MINUTES hiện số 2 chữ số, "Coming soon" hiện | none (tự động, tick mỗi phút) | TBD (draft) |
| zero-state (countdown) | tới/qua thời điểm sự kiện, hoặc env không hợp lệ/không parse được | 3 ô hiện `00`, "Coming soon" ẩn | none | TBD (draft) |
| empty (notification panel) | click chuông khi chưa có dữ liệu thông báo thật | panel hiện header + "Không có thông báo mới" | đóng panel (click ngoài/Esc/click lại) | TBD (draft) |
| dropdown-open (ngôn ngữ / tài khoản / widget) | click nút trigger, hoặc Enter/Space khi focus | menu tương ứng render bên dưới/nổi trên nút trigger | chọn mục, click ngoài, Esc để đóng | TBD (draft) |
| dropdown-closed | mặc định, hoặc sau khi đóng | không có menu nào hiển thị | click/Enter/Space để mở | TBD (draft) |

`N/A — no loading/saving/success async states (no API calls on this screen).`

## Validation & Error Feedback

### A) Client-side

`N/A — no client-side form validation detected.` (Trang chủ không có form nhập liệu; menu ngôn ngữ và menu tài khoản là lựa chọn, không phải input cần validate.)

### B) Server-side

`N/A — no submit-style action handlers detected.` (Mọi hành động trên màn hình này là điều hướng (`Link`) hoặc toggle UI cục bộ, không có action gửi dữ liệu lên server.)

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | partial | Logo cần `alt` text mô tả (TC ID-8); dropdown trigger cần `aria-expanded`/`aria-haspopup` cho menu ngôn ngữ, tài khoản, widget, panel thông báo (kế thừa từ SM-001 dùng chung) |
| Keyboard navigation | supported | Tab tới nút dropdown, Enter hoặc Space mở menu, Esc đóng menu (TC ID-33, 34, 35) — áp dụng cho mọi dropdown trên màn hình |
| Focus management | partial | Click ra ngoài đóng menu (TC ID-32); focus trap bên trong menu khi mở chưa được đặc tả rõ trong test case — để ở mức "partial" cho tới khi có xác nhận thêm |
| Screen reader compatibility | unknown | Không có test case nào xác nhận hành vi screen reader; cần audit riêng trước khi phát hành chính thức |
