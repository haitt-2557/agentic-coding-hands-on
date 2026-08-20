---
status: promoted
authored_by: takumi
fcode: F012_AwardSystemPage
created: 2026-08-20
promoted_from: plans/260820-1020-award-system-page/spec/award-system-page/screens/SCR-AwardSystem/spec.md
---

# SCR002_Awards — Screen Spec

**Screen**: SCR002_Awards: Hệ thống giải thưởng SAA 2025
**Feature**: F012_AwardSystemPage — Hệ thống giải thưởng SAA 2025 (Award System Page)
**Type**: atomic
**Route**: `/awards`
**Generated**: 2026-08-20

## Purpose

Cho bất kỳ ai truy cập trang chủ hay header đọc đầy đủ thông tin cả 6 hạng mục giải thưởng SAA
2025 và nhảy nhanh tới đúng hạng mục quan tâm bằng một nav danh mục dính bên trái.

## Screen Layout

Frame 1440×6410 (MoMorph node `313:8436`) — một trang cuộn dọc rất dài. Header dùng chung dính
trên cùng. Bên dưới là hero thu nhỏ (không đếm ngược/CTA như trang chủ), rồi khối tiêu đề 2 dòng.
Từ đó trở xuống, layout chia 2 cột: nav danh mục dính bên trái (6 mục, theo dõi cuộn — `position:
sticky`) và cột nội dung bên phải chứa 6 khối chi tiết giải thưởng xếp dọc, mỗi khối là ảnh
336×336 + nội dung, xen kẽ trái/phải theo BR-005. Cuối trang là khối quảng bá Sun* Kudos (dùng lại
nguyên trạng `KudosSection`) rồi tới footer dùng chung.

### Layout Sketch

```
┌───────────────────────────────────────────────────┐
│  R1: Header (sticky-top, dùng chung)               │
├───────────────────────────────────────────────────┤
│  R2: Hero thu nhỏ (static)                         │
├───────────────────────────────────────────────────┤
│  R3: Khối tiêu đề (static) — phụ đề + tiêu đề vàng │
├──────────────┬──────────────────────────────────────┤
│ R4: Nav       │ R5: Danh sách chi tiết giải thưởng   │
│ danh mục      │ (scrollable — 6x khối, ảnh 336x336   │
│ (sticky-left, │ xen kẽ trái/phải theo BR-005)         │
│ 6 mục)        │                                       │
├──────────────┴──────────────────────────────────────┤
│  R6: Khối quảng bá Sun* Kudos (static, dùng chung)  │
├───────────────────────────────────────────────────┤
│  R7: Footer (static, dùng chung)                   │
└───────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Header | sticky-top | no | `SiteHeader` (dùng chung, mục "Award Information" active) | luôn hiển thị, kế thừa hành vi đã có |
| R2 | Hero thu nhỏ | static | yes (thuộc cuộn trang) | logo ROOT FURTHER trên nền wave | fluid, không có đếm ngược/CTA (khác trang chủ) |
| R3 | Khối tiêu đề | static | yes | Phụ đề mờ, tiêu đề vàng | text wrap ở viewport hẹp |
| R4 | Nav danh mục | sticky (theo cột nội dung khi cuộn) | no (tự nó không cuộn riêng) | 6 mục (icon 24×24 + tên), mục active có vàng + gạch chân | thu gọn thành thanh ngang cuộn được dưới 1440px (suy diễn — chưa có frame khác) |
| R5 | Danh sách chi tiết giải thưởng | static | yes (phần chính của cuộn trang) | 6x khối (ảnh 336×336 + tiêu đề + mô tả dài + số lượng + giá trị), xen kẽ trái/phải | 2 cột (ảnh/nội dung) gộp về 1 cột xếp chồng dưới breakpoint tablet (suy diễn) |
| R6 | Khối quảng bá Sun* Kudos | static | yes | `KudosSection` (dùng chung nguyên trạng) | kế thừa hành vi responsive đã có của component này |
| R7 | Footer | static | yes | `SiteFooter` (dùng chung nguyên trạng) | kế thừa hành vi responsive đã có |

## User Flow

> **Scope:** chỉ tương tác trong phạm vi màn hình này. Điều hướng sang `/kudos` là điểm kết thúc
> luồng (cross-screen, ngoài phạm vi).

### Happy Path

1. Người dùng mở `/awards`, thấy R1 Header, R2 Hero, R3 khối tiêu đề, và R4 nav 6 mục.
2. Người dùng click một mục trong R4 — R5 cuộn mượt tới đúng khối chi tiết tương ứng, mục vừa
   click chuyển vàng + gạch chân trong R4, mục active trước đó (nếu có) mất trạng thái.
3. Người dùng đọc nội dung khối đang xem ở R5, rồi tự cuộn tay tiếp — mục active ở R4 tự đổi theo
   khối đang hiển thị chính trong R5, không cần click lại.
4. Người dùng cuộn hết 6 khối ở R5, tới R6 Sun* Kudos, click "Chi tiết" — rời màn hình này, sang
   `/kudos`.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 1 (URL khi mount) | URL mang `#<slug>` hợp lệ trong 6 slug | R5 tự cuộn tới đúng khối khi tải xong, R4 mục tương ứng đã sáng sẵn | TBD (draft) — hành vi auto-scroll-theo-hash gốc của trình duyệt, chưa viết code đồng bộ R4 |
| Bước 1 (URL khi mount) | URL mang hash không khớp slug nào | Trang tải bình thường ở đầu, không mục nào active trong R4, không lỗi | TBD (draft) — chưa viết code |
| Bước 2/3 (viewport) | Viewport hẹp hơn 1440px (suy diễn) | R4 chuyển thành thanh ngang cuộn được thay vì cột sticky-left | TBD (draft) — chưa có frame responsive để đối chiếu |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| nav-none-active | mount, chưa có khối nào cắt ngưỡng viewport chính (hiếm, thường chỉ tức thời) | Không mục nào trong R4 mang style active | cuộn/click để kích hoạt | TBD (draft) |
| nav-active(slug) | khối tương ứng đang là khối chính trong viewport (click, cuộn tay, hoặc deep-link) | Mục tương ứng trong R4 chuyển vàng + gạch chân | click mục khác, tiếp tục cuộn | TBD (draft) |
| nav-hover | rê chuột qua một mục R4 | Mục dưới con trỏ hiện hiệu ứng nổi bật (không cần đang active) | click | TBD (draft) |

`N/A — no loading/saving/success async states (không có API call trên màn hình này).`

## Validation & Error Feedback

### A) Client-side

`N/A — no client-side form validation detected.` Màn hình không có input nào để nhập — chỉ có
click nav và click CTA điều hướng.

### B) Server-side

`N/A — no submit-style action handlers detected.` Mọi hành động trên màn hình này là cuộn trong
trang hoặc điều hướng (`Link` sang `/kudos`), không có action gửi dữ liệu lên server.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | partial (kế hoạch) | Mục nav đang active dự kiến cần `aria-current` tương ứng (giống mẫu đã dùng ở header cho FR-002); chưa viết code |
| Keyboard navigation | unknown | Chưa viết code — mục nav cần tab tới được và kích hoạt bằng Enter/Space, cuộn-tới-section tương ứng |
| Focus management | unknown | Chưa xác định việc cuộn bằng click nav có tự chuyển focus vào section đích hay chỉ cuộn hình ảnh |
| Screen reader compatibility | unknown | Chưa viết code; scrollspy cần đảm bảo không đọc lặp lại trạng thái active liên tục khi cuộn nhanh |
