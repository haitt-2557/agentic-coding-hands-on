---
status: draft
authored_by: takumi
created: 2026-08-21
lang: vi
---

# SCR008_KudosLiveBoard — Screen Spec

**Screen**: SCR008_KudosLiveBoard: Sun* Kudos - Live board
**Feature**: F013_KudosLiveBoard — Kudos Live Board
**Type**: composite
**Route**: `/kudos`
**Generated**: 2026-08-21

## Purpose

Người dùng mở trang để đọc, tìm kiếm và thả tim cho các lời cảm ơn (Kudos) đồng nghiệp đã gửi trong
đợt SAA 2025, và xem vị trí của chính mình trong phong trào qua khu vực thống kê riêng.

## Screen Layout

Header dùng chung ở trên cùng (mục "Sun* Kudos" đang chọn); ngay dưới là banner + ô mời gửi lời cảm
ơn; tiếp theo là ba khối nội dung xếp dọc toàn chiều rộng — HIGHLIGHT KUDOS (carousel + 2 dropdown
lọc), SPOTLIGHT BOARD (bảng tên nổi bật + tìm kiếm), và ALL KUDOS (danh sách đầy đủ, cuộn để hiện
thêm) đặt cạnh một sidebar cố định bên phải (thống kê cá nhân + bảng xếp hạng) trong cùng vùng nội
dung chính; footer dùng chung ở cuối. Không có modal/drawer nào thật sự mở được ở lượt này — bốn
trigger tới đích chưa xây chỉ dừng ở phản hồi hình ảnh (xem `## User Flow` § Branches).

### Layout Sketch

```
┌──────────────────────────────────────────────────────────┐
│  R1: Header (fixed-top, mục "Sun* Kudos" active)         │
├──────────────────────────────────────────────────────────┤
│  R2: Banner + ô mời gửi lời cảm ơn (static)               │
├──────────────────────────────────────────────────────────┤
│  R3: HIGHLIGHT KUDOS — carousel 3/5 thẻ + 2 dropdown lọc  │
├──────────────────────────────────────┬────────────────── ┤
│  R4: SPOTLIGHT BOARD (tìm kiếm +      │  R6: Sidebar       │
│      bảng tên nổi bật)                │      (thống kê +   │
├────────────────────────────────────── │      bảng xếp      │
│  R5: ALL KUDOS (danh sách, cuộn để    │      hạng, sticky)  │
│      hiện thêm — scrollable)          │                    │
├──────────────────────────────────────┴────────────────── ┤
│  R7: Footer (static)                                      │
└──────────────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Header | fixed-top | no | SiteHeader | always |
| R2 | Banner + ô mời gửi lời cảm ơn | static | no | KudosBanner, KudosActionBar (2 `<section>` riêng — không có `KudosSubmitPill` riêng, pill sống trong `KudosActionBar`) | fluid |
| R3 | HIGHLIGHT KUDOS | static | no | HighlightCarousel, KudosFilterBar | 3-up → 1-up dưới 1440px |
| R4 | SPOTLIGHT BOARD | static | no | SpotlightBoard, SpotlightSearch | co theo tỉ lệ container |
| R5 | ALL KUDOS | static (nội dung hiện dần) | yes (nội bộ trang, không phải panel riêng) | AllKudosFeed, KudosCard | 2 cột → 1 cột (cạnh sidebar) dưới breakpoint `lg` (1024px, không phải 1440px như R3) |
| R6 | Sidebar | không sticky (`<aside>` xếp cạnh feed, không có `position: sticky` riêng) | no | KudosSidebar (bọc KudosSidebarStats + KudosLeaderboard) | xuống dưới feed khi 1 cột (cùng breakpoint `lg` với R5) |
| R7 | Footer | static | no | SiteFooter | always |

## User Flow

> **Scope:** chỉ tương tác trong phạm vi màn hình này. Điều hướng sang màn hình khác thuộc
> `screen-flow.md`.

### Happy Path

1. Người dùng mở `/kudos`, thấy R1 Header, R2 Banner, và R3 HIGHLIGHT KUDOS với carousel 3 thẻ.
2. Người dùng chọn một hashtag hoặc phòng ban trong R3 — carousel và danh sách ở R5 lọc lại đồng
   thời, carousel quay về thẻ đầu tiên.
3. Người dùng thả tim cho một thẻ trong R3 hoặc R5 — đếm tim tăng, màu nút đổi.
4. Người dùng cuộn xuống R4, gõ tên vào ô tìm kiếm — tên khớp được tô sáng trong bảng tên nổi bật.
5. Người dùng tiếp tục cuộn xuống R5 — danh sách hiện thêm thẻ dần theo đà cuộn.
6. Người dùng nhìn sang R6 để xem thống kê cá nhân và bảng xếp hạng.
7. Người dùng bấm "Copy Link" trên một thẻ bất kỳ — nhận được thông báo xác nhận đã sao chép.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 3 (thả tim) | Thẻ là do chính mock-user hiện tại gửi | Nút tim ở R3/R5 hiển thị disable, không phản hồi click | `components/kudos/kudos-card-actions.tsx:34,71` |
| Bước 2 (bộ lọc) | Không có thẻ nào khớp bộ lọc đã chọn | R3 và R5 đều hiện trạng thái rỗng "Hiện tại chưa có Kudos nào." | `components/kudos/highlight-carousel.tsx:68-74`, `components/kudos/all-kudos-feed.tsx:90-91` |
| Bất kỳ lúc nào | Người dùng bấm ô mời gửi kudos (R2), "Xem chi tiết" (R3/R5), một avatar/tên (R3/R5/R6), hoặc "Mở Secret Box" (R6) | Control phản hồi hình ảnh nhưng không điều hướng hay mở overlay nào — đích chưa được thiết kế | `components/kudos/kudos-action-bar.tsx:25-30`, `components/kudos/kudos-card-actions.tsx:98-112`, `components/kudos/kudos-card-people.tsx:49-61`, `components/kudos/kudos-sidebar-stats.tsx:53-60` |
| Bước 5 (cuộn) | Đã hiện hết toàn bộ dữ liệu tĩnh | Sentinel cuối R5 không còn tác dụng, không có thêm thẻ nào xuất hiện | `components/kudos/all-kudos-feed.tsx:49,104` (`exhausted`, sentinel chỉ render khi `!exhausted`) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading | N/A — dữ liệu tĩnh, không có API in-flight | không áp dụng | none | N/A |
| empty (R3/R5) | bộ lọc hiện tại không khớp thẻ nào | hiện câu "Hiện tại chưa có Kudos nào." thay cho danh sách | xoá bộ lọc | `components/kudos/highlight-carousel.tsx:68-74`, `components/kudos/all-kudos-feed.tsx:90-91` |
| empty (R6 leaderboard) | danh sách xếp hạng trống | hiện câu "Chưa có dữ liệu" thay cho bảng | none | `lib/kudos/leaderboard.ts:31-33` (`leaderboardOrEmpty`), `components/kudos/kudos-leaderboard.tsx:26-27` |
| revealing (R5) | sentinel cuối feed vào viewport, còn dữ liệu chưa hiện | hiện thêm một lô thẻ kế tiếp (4 thẻ) | tiếp tục cuộn | `components/kudos/all-kudos-feed.tsx:51-70` (`IntersectionObserver`, `REVEAL_BATCH = 4` dòng 21) |
| exhausted (R5) | đã hiện hết dữ liệu đã lọc | sentinel không còn tác dụng | none | `components/kudos/all-kudos-feed.tsx:49` (`exhausted = revealedCount >= filtered.length`) |
| liked / unliked (thẻ) | click nút tim | đổi màu nút giữa `#999999` (chưa thả) và `--badge-danger` `#D4271D` (đã thả) + tăng/giảm đếm | gỡ tim (click lại) | `components/kudos/kudos-card-actions.tsx:32,35,72-73` |
| toast hiện (Copy Link) | sao chép clipboard thành công | hiện toast "Link copied — ready to share!" trong thời gian ngắn rồi tự ẩn | dismiss (tự động, 3s) | `components/kudos/kudos-card-actions.tsx:43-60`, `components/kudos/kudos-toast.tsx:18-41` |

## Validation & Error Feedback

### A) Client-side

| Field | Type | Required | Constraints | Async Check | Error Message |
|-------|------|----------|-------------|-------------|---------------|
| Ô tìm kiếm Sunner (R4) | text | no | tối đa 100 ký tự | none | N/A — chặn nhập ở ký tự thứ 100, không có thông báo lỗi riêng |

### B) Server-side

`N/A — no submit-style action handlers detected.` Toàn bộ tương tác (lọc, thả tim, sao chép link, tìm
kiếm, cuộn hiện thêm) là state client-side trên dữ liệu tĩnh; không có endpoint nào được gọi ở lượt
này.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | partial | `aria-label` động cho nút tim theo trạng thái đã/chưa thả và chủ sở hữu (`components/kudos/kudos-card-actions.tsx:37-41`), `aria-pressed` (dòng 70); `aria-current="page"` cho mục header đang chọn (`components/layout/site-header.tsx:48,55,62`); toast dùng `role="status"` (`kudos-toast.tsx:35`), tooltip dùng `role="tooltip"` (`star-tier-tooltip.tsx:43`, `spotlight-name-cloud.tsx:84`). |
| Keyboard navigation | supported | e2e 18/18 pass xác nhận bốn nhóm trigger đích-hoãn (US009) và toàn bộ nút/dropdown/thẻ nhận focus theo đúng thứ tự DOM và Tab được — điều kiện bắt buộc của `e2e-red-first` đã đạt. |
| Focus management | unmanaged (không có overlay nào thật ở lượt này) | Không có dialog/drawer nào được xây ở lượt này nên không cần focus trap; bốn đích US009 chỉ dừng ở trigger, chưa mở overlay nào. |
| Screen reader compatibility | unknown | Chưa có kiểm thử screen reader chuyên biệt trong lượt này — nằm ngoài phạm vi `e2e-red-first` (Playwright không kiểm tra trải nghiệm SR thật). |
