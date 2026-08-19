---
status: draft
authored_by: takumi
created: 2026-08-19
---

# SCR-login — Screen Spec

**Screen**: SCR-login (mã SCR### thật cấp lúc promote): Login
**Feature**: Login qua Google OAuth (Supabase) [F### cấp lúc promote]
**Type**: atomic
**Route**: `/login`
**Generated**: 2026-08-19

## Purpose

Cho khách truy cập đăng nhập vào SAA 2025 bằng tài khoản Google của họ, qua một Supabase local
project thật đứng phía sau.

## Screen Layout

Frame 1440×1024 (MoMorph node `662:14387`). Header cố định trên cùng chứa logo (trái) và
language selector (phải). Khối chính nằm giữa, absolute 1440×845, padding 96px/144px, xếp cột,
gap 120px: hero key visual (nền wave + logo ROOT FURTHER chồng lên) rồi tới khối
title/subtitle/tagline/nút Login. Footer căn giữa nằm cuối trang, không cuộn (trang không có nội
dung dài hơn viewport ở kích thước thiết kế).

### Layout Sketch

```
┌───────────────────────────────────────────────────┐
│  R1: Header (fixed-top) — Logo | Language selector │
├─────────────────────────────────────────────────────┤
│  R2: Main (wave key visual nền, static, column)     │
│    ┌───────────────────────────────────────────┐   │
│    │  R2a: Hero key visual (logo ROOT FURTHER)  │   │
│    ├───────────────────────────────────────────┤   │
│    │  R2b: Intro block                          │   │
│    │    title / subtitle / tagline               │   │
│    │    [ LOGIN With Google ]                    │   │
│    │    - - - vùng lỗi (role=alert, khi có) - -  │   │
│    └───────────────────────────────────────────┘   │
├───────────────────────────────────────────────────┤
│  R3: Footer (bản quyền, căn giữa)                   │
└───────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Header | fixed-top | no | Logo (tĩnh, không tương tác), `LanguageSwitcher` (tái dùng) | fluid, thu hẹp padding dưới floor 375px (suy diễn) |
| R2 | Main | static | no | Hero key visual (ảnh nền + logo ROOT FURTHER), title/subtitle/tagline, nút Login, vùng lỗi | title/subtitle xếp chồng trên nút khi hẹp (suy diễn, chưa có frame khác) |
| R3 | Footer | static (dưới cùng của trang full-height, không viewport-fixed thật — xem khiếm khuyết thiết kế #4) | no | Dòng bản quyền căn giữa | fluid |

## User Flow

> **Scope:** chỉ tương tác trong phạm vi màn Login. Điều hướng sang Google/Supabase và quay lại
> `/` thuộc phạm vi flow toàn app.

### Happy Path

1. Khách mở `/login` — nếu chưa có phiên Supabase, R2 hiện đầy đủ intro + nút Login.
2. Khách click nút Login trong R2 — nút chuyển disabled + hiện loader.
3. Trình duyệt điều hướng đi (cùng tab) sang Supabase rồi Google — màn Login rời khỏi trạng thái
   hiển thị (unmount).

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 1 (mount) | Đã có phiên Supabase hợp lệ | Redirect ngay tới `/`, R2 không render | TBD (draft) — chưa viết code |
| Sau khi rời màn (bước 3) | Google/Supabase trả lỗi hoặc bị hủy | Quay lại `/login`, R2 hiện lại kèm vùng lỗi `role="alert"` dưới nút | TBD (draft) — chưa viết code |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| idle | mount, chưa click, chưa có lỗi | Nút Login ở trạng thái mặc định, không có vùng lỗi | click nút, đổi ngôn ngữ | TBD (draft) |
| loading | vừa click nút | Nút disabled + loader hiện trên nút | không (chờ điều hướng) | TBD (draft) |
| error | quay lại từ `/auth/callback` với cờ lỗi | Vùng `role="alert"` hiện dưới nút với thông báo lỗi cố định, nút về lại nhấn-được | click nút để thử lại | TBD (draft) |
| redirecting-away | đã có phiên Supabase lúc mount | Không có gì render — chuyển trang trước khi vẽ R2 (tránh nhấp nháy) | không | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

`N/A — no client-side form validation detected.` Màn hình không có input nào để nhập — chỉ có
một nút hành động.

### B) Server-side

#### Đăng nhập bằng Google
- **Hành động kích hoạt:** click nút "LOGIN With Google"
- **Dữ liệu gửi đi:** `provider: 'google'`, `redirectTo` trỏ về `/auth/callback` của app
- **Thành công:** trình duyệt được điều hướng khỏi `/login`; kết quả thật (thành công/thất bại)
  được quyết định ở `/auth/callback`, không phải ở màn Login này
- **Lỗi:** nếu `signInWithOAuth` thất bại NGAY tại `/login` (trước khi kịp điều hướng — ví dụ
  mất mạng), hiện luôn vùng lỗi tại chỗ với cùng thông báo cố định
- **Nguồn:** TBD (draft) — chưa viết code

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | partial (kế hoạch) | Vùng lỗi dự kiến `role="alert"` để được công bố ngay; logo header dự kiến không có role tương tác (khớp test case: không click/hover) |
| Keyboard navigation | unknown | Chưa viết code — nút Login và language selector cần tab tới được bằng bàn phím, kế thừa hành vi `LanguageSwitcher`/`DropdownMenu` đã có |
| Focus management | unknown | Chưa xác định focus có tự chuyển vào vùng lỗi khi nó xuất hiện hay không |
| Screen reader compatibility | unknown | Chưa viết code |

## Unresolved Questions

1. Vị trí chính xác và style của vùng lỗi (khiếm khuyết thiết kế #2) chưa được design owner xác
   nhận — hiện đặt ngay dưới nút Login theo quyết định triển khai.
2. Footer "fixed" theo mô tả test case nhưng frame chỉ có một viewport không cuộn (khiếm khuyết
   thiết kế #4) — triển khai dự kiến static-bottom-of-page, không phải viewport-fixed thật.
3. Responsive dưới 1440px hoàn toàn suy diễn (khiếm khuyết thiết kế #6) — chưa có frame khác để
   đối chiếu.
