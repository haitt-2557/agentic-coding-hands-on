---
status: draft
authored_by: takumi
created: 2026-08-19
---

# SCR-Prelaunch — Screen Spec

**Screen**: SCR-Prelaunch (draft): Prelaunch
**Feature**: F010_PrelaunchCountdownGate (provisional)
**Type**: atomic
**Route**: `/prelaunch`
**Generated**: 2026-08-19

## Purpose

Bất kỳ actor nào ghé site trước giờ sự kiện SAA 2025 đều thấy màn này thay cho route họ định vào,
và chỉ chờ đếm ngược tự chạy tới lúc sự kiện bắt đầu.

## Screen Layout

Một màn full-viewport duy nhất, không cuộn: lớp nền là ảnh sự kiện phủ kín (node MoMorph
`2268:35129`) cộng gradient overlay tối dần từ góc trên-trái xuống trong suốt (node `2268:35130`);
đè lên trên là một khối canh giữa cả dọc lẫn ngang gồm tiêu đề + hàng 3 ô đếm ngược. Không có
header/footer/nav nào khác — đây là toàn bộ nội dung màn hình. Frame gốc (`2268:35127`,
1512×1077) chỉ có một breakpoint desktop; hành vi dưới 1512px là suy diễn, xem
`## Unresolved Questions` bên dưới `technical-spec.md`.

### Layout Sketch

```
┌──────────────────────────────────────────────────┐
│ R1: Nền ảnh sự kiện + gradient overlay (full-bleed│
│     static, phủ toàn viewport)                    │
│                                                    │
│          ┌──────────────────────────────┐         │
│          │ R2: Khối đếm ngược (căn giữa)│         │
│          │  "Sự kiện sẽ bắt đầu sau"    │         │
│          │  [D][D]   [H][H]   [M][M]    │         │
│          │  DAYS     HOURS     MINUTES  │         │
│          └──────────────────────────────┘         │
└──────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|-----------------|----------------------|
| R1 | Nền + overlay | static, full-bleed | no | ảnh nền (node `2268:35129`) + gradient overlay (node `2268:35130`) | không có breakpoint riêng trong frame gốc — chỉ desktop 1512px được đặc tả |
| R2 | Khối đếm ngược | static, canh giữa dọc + ngang | no | Title + 3 CountdownUnit (mỗi unit: cặp digit-box + label, xem `clarifications.md` § Extracted design values) | scale tỉ lệ xuống floor 375px (suy diễn, chưa được đặc tả — xem Unresolved Questions của `technical-spec.md`) |

## User Flow

> **Scope:** chỉ tương tác trong màn này. Điều hướng liên-màn (redirect vào/ra khỏi Prelaunch)
> thuộc về gate toàn ứng dụng — xem BR-004/BR-005/DEC-001 tại `../../technical-spec.md`.

### Happy Path

1. Actor được đưa tới R2 ngay khi trang tải xong, thấy tiêu đề và 3 ô đếm ngược đã điền giá trị
   hiện tại (không có trạng thái loading trung gian).
2. Mỗi giây, giá trị 3 ô tự cập nhật tại chỗ (R2) — không có hiệu ứng chuyển động nào được đặc tả.
3. Khi đếm ngược chạm 0, actor rời khỏi màn này (điều hướng sang `/`) mà không cần thao tác gì
   trên R1/R2.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|-----------------|-----------|--------------------------|--------|
| Bước 1 | `NEXT_PUBLIC_EVENT_START_AT` thiếu/không hợp lệ | Actor không hề thấy màn này — mọi route vào thẳng bình thường (gate coi như đã mở) | TBD (draft) |
| Bước 3 | Actor rời tab/đóng trình duyệt trước mốc 0 | Không có điều hướng nào xảy ra trên màn đã đóng; lần mở lại sau mốc 0 vào thẳng route mong muốn | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|-------------------|--------------------------|--------|
| ticking (custom) | mount, lặp lại mỗi 1 giây | 3 ô số tự cập nhật tại chỗ, không hiệu ứng chuyển động đặc tả | không có, chỉ xem | TBD (draft) |
| unlocking (custom) | đếm ngược chạm 0 trong lúc actor đang xem | điều hướng ngay sang `/` trong cùng tick đó, không có màn trung gian | không có | TBD (draft) |
| loading | N/A — không gọi API nào phía client trên màn này | — | — | N/A |
| error | N/A — không có gọi API nào có thể lỗi | — | — | N/A |
| empty | N/A — luôn có nội dung hiển thị, kể cả `00 00 00` | — | — | N/A |
| saving / success | N/A — không có hành động submit nào trên màn này | — | — | N/A |

## Validation & Error Feedback

### A) Client-side

N/A — no client-side form validation detected. Màn không có input nào.

### B) Server-side

N/A — no submit-style action handlers detected.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | intended, chưa triển khai | Mỗi ô số nên có `aria-label` đọc trọn giá trị + đơn vị (vd "05 ngày") thay vì đọc từng chữ số rời rạc |
| Keyboard navigation | not implemented | Màn không có phần tử tương tác nào — không có tab stop nào cần thiết |
| Focus management | not implemented | Không áp dụng — không có modal/form trên màn này |
| Screen reader compatibility | unknown, chưa triển khai | Cần một vùng `aria-live="polite"` bao khối đếm ngược để tránh đọc lại toàn bộ mỗi giây; ý định ghi nhận ở đây, chưa có quyết định cuối cùng |

