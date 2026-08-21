---
status: draft
authored_by: takumi
created: 2026-08-21
lang: vi
---

# F000_KudosLiveBoard

**Priority**: P1
**Type**: ui
**Generated**: 2026-08-21

## Overview

Route `/kudos` — điền nội dung thật vào placeholder đang tồn tại (`app/kudos/page.tsx`), theo frame
MoMorph `MaZUn5xHXZ`: banner + pill nhập kudos, khối HIGHLIGHT KUDOS (carousel 5 thẻ nhiều tim nhất,
3 hiển thị cùng lúc, 2 dropdown lọc), khối SPOTLIGHT BOARD (word cloud ~100 tên, tìm kiếm, tooltip),
khối ALL KUDOS (feed thẻ với progressive reveal), và sidebar thống kê cá nhân + bảng xếp hạng. Toàn
bộ dữ liệu là một module tĩnh mới `lib/kudos/` (tách nhiều file theo giới hạn 200 dòng, cùng tiền lệ
`lib/awards.ts`) — không có bảng CSDL, không có API route. Bốn đích điều hướng được frame tham chiếu
nhưng không có frame riêng (dialog gửi kudos, trang chi tiết kudos, trang hồ sơ, dialog Secret Box)
đều dừng ở mức trigger render + focusable, không xây đích. Đây là feature dày đặc chuyển trạng thái
nhất trong 5 lượt gần đây nên dùng strict E2E (`e2e-red-first`): carousel next/prev disable ở hai
đầu, dropdown lọc mở/chọn/xoá làm mới đồng thời 2 khối, tim thả/gỡ đổi màu và đếm, Copy Link ghi
clipboard + toast, ô tìm kiếm Sunner giới hạn 100 ký tự. `lib/session/session-provider.tsx` (mock,
không phải auth) được mở rộng thêm danh tính người xem để tim tự-loại-trừ và sidebar có chủ.

## Polymorphic Behavior

N/A — no discriminator fields in Key Entities. Không entity nào ở `## Key Entities` bên dưới có một
field kiểu enum/boolean ≥2 giá trị đặt tên riêng biệt điều khiển nhánh render/validate/persist khác
nhau. Trạng thái trang carousel (1..5) và tiến trình progressive-reveal của All Kudos là UI state
(xem `SM-001`, `SM-002`), không phải discriminator dữ liệu; heart on/off là một boolean hai trạng
thái đơn giản, xử lý bằng Business Rule (`BR-001`, `BR-002`) chứ không đủ ngưỡng để thành DISC hay SM
riêng.

## Cross-Cutting Logic

### Requirements

None. — mọi FR-### đặt dưới `**Requirements fulfilled:**` của đúng một US bên dưới; không FR nào áp
dụng ngang hàng cho ≥2 US (khối lọc dùng chung do US006 sở hữu; US001/US003 chỉ hiển thị kết quả đã
lọc, không có FR riêng cho việc đó).

### Business Rules

#### BR-001_MotTimMotNguoiMotKudos
**Linked FR:** FR-006
**Applies to:** Nút tim trên mọi thẻ kudos (Highlight lẫn All Kudos)
**Rule:** Mỗi người xem chỉ thả được một tim cho một kudos; thả lần hai không tăng thêm đếm, gỡ tim
đưa đếm về đúng trạng thái trước khi thả. Trạng thái "đã thả tim" là state cục bộ theo mock-user
hiện tại, không đồng bộ nhiều tab (giới hạn của dữ liệu tĩnh, ghi ở `## Assumptions`).
**Source:** TBD (draft) — chưa viết code; dự kiến state cục bộ theo `kudosId` trong
`components/kudos/kudos-card.tsx` (mới), đọc danh tính từ `useSession()`.

**Pseudocode:**
```text
if hasLiked(kudosId, viewerId) → clicking heart removes like, heartCount -= 1
else → clicking heart adds like, heartCount += 1
# second click from same viewer never double-counts
```

#### BR-002_KhongTuThaTimChoKudosCuaMinh
**Linked FR:** FR-006
**Applies to:** Nút tim trên thẻ mà `senderId === viewerId`
**Rule:** Người gửi một kudos không thả tim được cho chính kudos đó — nút tim hiển thị ở trạng thái
vô hiệu (disabled), không click được, không có tooltip giải thích riêng vì đây là trạng thái hiển
nhiên từ dữ liệu sender/receiver.
**Source:** TBD (draft) — chưa viết code; dự kiến so sánh `kudos.senderId` với `useSession().user.id`
(danh tính mock mới, xem `plans/260821-1029-kudos-live-board/spec/system/permissions.md`).

**Pseudocode:**
```text
isOwnKudos = kudos.senderId === viewer.id
render HeartButton(disabled = isOwnKudos)
```

#### BR-003_LocResetTrangCarousel
**Linked FR:** FR-008, FR-009
**Applies to:** Trạng thái trang carousel Highlight Kudos (`SM-001`)
**Rule:** Bất kỳ thay đổi bộ lọc nào — chọn/xoá Hashtag, chọn/xoá Phòng ban, hoặc click một hashtag
trong thẻ — đưa carousel Highlight về trang 1, vì tập 5 thẻ nhiều tim nhất có thể đổi hoàn toàn sau
khi lọc.
**Source:** TBD (draft) — chưa viết code; dự kiến state lọc dùng chung (`useState` ở component cha
của cả hai khối) reset `carouselPage` khi filter thay đổi.

**Pseudocode:**
```text
onFilterChange(newFilter):
  sharedFilter = newFilter
  carouselPage = 1  # always reset, regardless of which filter changed
```

#### BR-004_NguongKyTuTimKiemSpotlight
**Linked FR:** FR-011
**Applies to:** Ô tìm kiếm Sunner trên SPOTLIGHT BOARD (`B.7.3`)
**Rule:** Ô tìm kiếm chấp nhận tối đa 100 ký tự (TC `9e689933`); ký tự thứ 101 trở đi không được
nhập thêm, không có thông báo lỗi vì đây là giới hạn `maxLength` chặn ở tầng input, không phải một
lỗi validate riêng.
**Source:** TBD (draft) — chưa viết code; dự kiến `maxLength={100}` trên input trong
`components/kudos/spotlight-search.tsx` (mới).

#### BR-005_TangHangSaoTheoSoKudosNhanDuoc
**Linked FR:** FR-002
**Applies to:** Chỉ báo hoa thị (star) cạnh tên sender/receiver
**Rule:** Số sao hiển thị theo tổng số Kudos một Sunner đã *nhận được*: 1 sao ở mốc 10, 2 sao ở mốc
20, 3 sao ở mốc 50; hover vào hoa thị hiện đúng câu tooltip cố định theo tầng tương ứng (spec
B.3.2/B.3.6), nguyên văn:
- 1 hoa thị: `Sunner đã nhận được 10 Kudos và bắt đầu lan tỏa năng lượng ấm áp đến mọi người xung
  quanh.`
- 2 hoa thị: `Sunner đã nhận được 20 Kudos và chứng minh sức ảnh hưởng của mình qua những hành động
  lan tỏa tích cực mỗi ngày.`
- 3 hoa thị: `Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan
  tỏa tinh thần Sun*.`
**Source:** TBD (draft) — chưa viết code; dự kiến hàm thuần `starTierFor(kudosReceivedCount)` trong
`lib/kudos/star-tiers.ts` (mới).

**Pseudocode:**
```text
if kudosReceived >= 50 → 3 stars, tier3 tooltip
else if kudosReceived >= 20 → 2 stars, tier2 tooltip
else if kudosReceived >= 10 → 1 star, tier1 tooltip
else → no star, no tooltip
```

#### BR-006_HeSoTimNgayDacBietChuaCoCauHinh
**Linked FR:** FR-006
**Applies to:** Số tim cộng cho người gửi khi kudos được thả tim (`C.4.1`, TC `31936b72`)
**Rule:** Spec mô tả "ngày đặc biệt" do admin cấu hình cộng +2 tim thay vì +1, kèm hoàn tác đúng khi
gỡ tim. **Không có mặt bằng cấu hình admin, không có entity lưu ngày đặc biệt, không có nguồn ngày
tháng nào được đặc tả** — quy tắc này KHÔNG buildable ở lượt này và bị loại khỏi phạm vi (dữ liệu
tĩnh không có khái niệm "ngày"); mọi lượt thả tim trong bản dựng này luôn cộng đúng +1, không có
nhánh ngày đặc biệt nào được viết.
**Source:** N/A — không có code nào triển khai quy tắc này ở lượt này (ghi nhận là design defect #9
trong `clarifications.md`).

#### BR-007_SaoChepLinkKhongDuocVoLoi
**Linked FR:** FR-007
**Applies to:** Nút "Copy Link" trên mọi thẻ kudos
**Rule:** Click "Copy Link" gọi `navigator.clipboard.writeText` và hiện toast
"Link copied — ready to share!" khi thành công; nếu trình duyệt từ chối quyền clipboard, lỗi phải
được bắt (guarded) — không được văng unhandled rejection ra console, và không hiện toast thành công
giả.
**Source:** TBD (draft) — chưa viết code; dự kiến `try/catch` quanh `navigator.clipboard.writeText`
trong `components/kudos/kudos-card-actions.tsx` (mới).

### Decision Logic

User-facing decisions với outcome nghiệp vụ thấy được của người dùng cuối.

#### DEC-001_LocLamMoiCaHaiKhoiVaResetTrang
**subtype:** interaction
**Triggers in:** SCR-KudosLiveBoard — chọn/xoá giá trị ở dropdown Hashtag hoặc Phòng ban
(`B.1.1`/`B.1.2`), hoặc click một hashtag bên trong bất kỳ thẻ kudos nào (`B.4.3`/`C.3.7`)
**Involved entities:** `FilterState.hashtag`, `FilterState.department`, `KudosRecord.hashtags`
**user_visible_outcome:** Danh sách thẻ hiển thị ở CẢ hai khối HIGHLIGHT KUDOS và ALL KUDOS đổi
đồng thời theo cùng một bộ lọc, và carousel Highlight quay về thẻ đầu tiên (trang 1) — không phải
hai bộ lọc độc lập cho hai khối.
**Source:** TBD (draft) — chưa viết code; dự kiến state lọc chung sở hữu bởi component cha của cả
hai khối trong `app/kudos/page.tsx`.

```pseudo
onFilterOrHashtagClick(value):
  sharedFilter = applyFilter(sharedFilter, value)
  highlightList = KUDOS_RECORDS.filter(matchesFilter(sharedFilter)).sortByHeartDesc().take(5)
  allKudosList = KUDOS_RECORDS.filter(matchesFilter(sharedFilter))
  carouselPage = 1
```

(Không có DEC-### thứ hai — tìm kiếm Spotlight Board là một điều kiện lọc/tô sáng đơn-field trên một
khối độc lập, không rẽ nhánh đa-predicate và không ảnh hưởng khối khác, nên xử lý ở mức FR/BR
(`FR-011`), không cần mã DEC riêng.)

### State Machines

**`kind` values:**
- `entity` — theo dõi vòng đời một domain object, được persist.
- `ui` — theo dõi trạng thái view-layer, không persist ngoài phiên hiện tại.

#### SM-001_TrangCarouselHighlight
**kind:** ui
**Linked FR:** FR-003
**Source:** TBD (draft) — chưa viết code; dự kiến state cục bộ (`useState<number>`) trong
`components/kudos/highlight-carousel.tsx` (mới).
**States:** page1, page2, page3, page4, page5 — 5 trạng thái loại trừ lẫn nhau, ánh xạ đúng "n/5" ở
chỉ báo `B.5.2`.

```mermaid
stateDiagram-v2
    [*] --> page1
    page1 --> page2: next (80px hoặc 48px arrow)
    page2 --> page3: next
    page3 --> page4: next
    page4 --> page5: next
    page5 --> page4: prev
    page4 --> page3: prev
    page3 --> page2: prev
    page2 --> page1: prev
    page1 --> page1: prev bị disable, không chuyển
    page5 --> page5: next bị disable, không chuyển
```

**Transition rules:**
- `pageN → pageN+1`: guard = `N < 5` VÀ có click một trong hai cặp mũi tên `B.2.1/B.2.2` hoặc
  `B.5.1/B.5.3` (cả hai cặp điều khiển cùng state — design defect #5); side effect = đổi 3 thẻ hiển
  thị, cập nhật chỉ báo "n/5".
- `pageN → pageN-1`: guard = `N > 1` VÀ click mũi tên lùi (cặp nào cũng được); side effect tương tự
  chiều ngược lại.
- Tại `page1`, mũi tên lùi disable; tại `page5`, mũi tên tiến disable — cả hai cặp mũi tên đồng bộ
  trạng thái disable theo cùng `SM-001`.
- Bất kỳ thay đổi bộ lọc nào reset về `page1` (`BR-003`), bất kể đang ở trang nào.

#### SM-002_TienTrinhHienThiAllKudos
**kind:** ui
**Linked FR:** FR-004
**Source:** TBD (draft) — chưa viết code; dự kiến state đếm số thẻ đã hiện (`revealedCount`) trong
`components/kudos/all-kudos-feed.tsx` (mới), tăng khi sentinel cuối danh sách vào viewport.
**States:** collapsed (chỉ hiện lô đầu), revealing (sentinel vào viewport, hiện thêm lô kế tiếp),
exhausted (đã hiện hết dữ liệu tĩnh, sentinel không còn tác dụng) — 3 trạng thái.

```mermaid
stateDiagram-v2
    [*] --> collapsed
    collapsed --> revealing: sentinel vào viewport, còn dữ liệu chưa hiện
    revealing --> revealing: sentinel vào viewport lần nữa, còn dữ liệu chưa hiện
    revealing --> exhausted: đã hiện hết KUDOS_RECORDS đã lọc
    exhausted --> exhausted: sentinel vào viewport, không còn gì để hiện thêm
```

**Transition rules:**
- `collapsed → revealing` / `revealing → revealing`: guard = sentinel cuối feed cắt ngưỡng viewport
  VÀ `revealedCount < filteredList.length`; side effect = tăng `revealedCount` thêm một lô cố định,
  KHÔNG có độ trễ loading giả (`clarifications.md` — "infinite scroll trên danh sách tĩnh, trung
  thực").
- `revealing → exhausted`: guard = `revealedCount === filteredList.length`; side effect = ẩn/vô hiệu
  sentinel, không còn request/tính toán thêm.
- Thay đổi bộ lọc (`DEC-001`) đưa `revealedCount` về lô đầu tiên của danh sách đã lọc mới, quay lại
  `collapsed` hoặc `revealing` tuỳ độ dài danh sách mới.

### Algorithms

None. — tầng sao (`BR-005`) là tra bảng ngưỡng đơn giản, không đủ phức tạp để tách thành thuật toán
riêng; layout word cloud lấy nguyên toạ độ node Figma gốc (không tự tính vị trí mới).

### External Integrations

None. — không có dịch vụ bên thứ ba nào được gọi; `navigator.clipboard` là Web API trình duyệt,
không phải một tích hợp bên ngoài theo nghĩa BL types.

### Verification

- **SC-001** — `/kudos` render đủ 5 khối chính theo đúng thứ tự tài liệu (Banner+pill, HIGHLIGHT
  KUDOS, SPOTLIGHT BOARD, ALL KUDOS, Sidebar), không lỗi console (covers FR-001, FR-004, FR-010,
  FR-013)
- **SC-002** — Carousel Highlight hiển thị đúng 3/5 thẻ tại một thời điểm, hai cặp mũi tên disable
  đúng ở hai đầu (page1/page5), chỉ báo "n/5" đồng bộ (covers FR-001, FR-003, SM-001)
- **SC-003** — Chọn Hashtag hoặc Phòng ban (hoặc click hashtag trong thẻ) lọc lại đồng thời cả
  Highlight lẫn All Kudos, carousel quay về trang 1 (covers FR-008, FR-009, BR-003, DEC-001)
- **SC-004** — Cuộn xuống All Kudos hiện thêm thẻ theo tiến trình tới khi hết dữ liệu tĩnh, không có
  trang giả hay độ trễ loading giả (covers FR-004, SM-002)
- **SC-005** — Thả tim đổi màu (`#999999` ↔ `--badge-danger` `#D4271D`) + tăng đếm đúng một lần mỗi
  người xem; thẻ do chính mock-user gửi có nút tim disable (covers FR-006, BR-001, BR-002)
- **SC-006** — Copy Link ghi clipboard, hiện đúng toast "Link copied — ready to share!"; quyền
  clipboard bị từ chối không văng lỗi console (covers FR-007, BR-007)
- **SC-007** — Ô tìm kiếm Spotlight Board chặn ở 100 ký tự, hover một tên hiện tooltip, và không có
  control Pan/Zoom nào được render ở bất kỳ đâu trong khối (covers FR-010, FR-011, FR-012, BR-004)
- **SC-008** — Sidebar hiện đủ 5 dòng thống kê và bảng xếp hạng 5 dòng, hoặc đúng câu trạng thái rỗng
  khi danh sách trống (covers FR-013, FR-014)
- **SC-009** — Bốn nhóm trigger đích-hoãn (pill gửi kudos, "Xem chi tiết", avatar/tên, "Mở Secret
  Box") đều render, nhận được focus bàn phím, không điều hướng sang một route không tồn tại
  (covers FR-015, FR-016, FR-017, FR-018)

---

**Client behavior:** see
[`behavior-logic.md`](../../generated/behavior-logic.md) (client-side patterns — debounce, optimistic
UI, polling, upload, realtime; word cloud + progressive reveal ở feature này chưa khớp pattern nào
trong danh sách, ghi ở `## Unresolved Questions`),
[`permissions.md`](../../../../docs/vi/system/permissions.md) (danh tính mock-user mới chỉ gate hiển
thị nút tim, không phải một access boundary — xem bản nháp
`plans/260821-1029-kudos-live-board/spec/system/permissions.md`),
[`screen-flow.md`](../../generated/screen-flow.md) (không có guard mới; bốn trigger đích-hoãn không
tạo điều hướng thật nên không có deep-link/unsaved-changes nào phát sinh).

## User Stories

### US001_XemVaLocHighlightKudos — Xem và lọc HIGHLIGHT KUDOS (Priority: P1)

**What happens:** Người dùng mở `/kudos` và thấy khối HIGHLIGHT KUDOS: phụ đề "Sun* Annual Awards
2025", tiêu đề "HIGHLIGHT KUDOS", hai dropdown lọc (Hashtag, Phòng ban), và một carousel hiển thị 3
trong 5 thẻ kudos nhiều tim nhất — thẻ giữa nổi bật, hai thẻ bên mờ và không tương tác được. Mỗi thẻ
đủ thông tin sender (avatar, tên, phòng ban, hoa thị), mũi tên hướng gửi-nhận, receiver, thời gian,
nội dung lời cảm ơn (tối đa 3 dòng), tối đa 5 hashtag một dòng, và action bar (tim, Copy Link,
Xem chi tiết).
**Why this priority:** Đây là khối nổi bật nhất ngay dưới banner, thể hiện tinh thần "được vinh danh
nhiều nhất" của phong trào Kudos — sai nội dung hoặc sai layout ở đây ảnh hưởng ấn tượng đầu tiên của
cả trang.
**Independent Test:** Mở `/kudos`, xác nhận carousel hiển thị 3 thẻ với đủ 6 nhóm thông tin trên mỗi
thẻ, và hai dropdown lọc hiển thị đúng nhãn "Hashtag"/"Phòng ban".

**Acceptance Scenarios:**

1. **Given** người dùng mở `/kudos`, **When** trang tải xong, **Then** thấy khối HIGHLIGHT KUDOS với
   phụ đề, tiêu đề, hai dropdown lọc, và carousel 3 thẻ (giữa nổi bật, hai bên mờ).
2. **Given** carousel đang hiển thị, **When** xem một thẻ ở vị trí trung tâm, **Then** thấy đủ sender
   (avatar/tên/phòng ban/hoa thị), mũi tên hướng, receiver, thời gian, nội dung clamp 3 dòng, tối đa
   5 hashtag, và action bar (tim + đếm, Copy Link, Xem chi tiết).
3. **Given** một sender đã nhận đủ 20 Kudos, **When** hover vào hoa thị cạnh tên sender, **Then**
   thấy tooltip đúng tầng 2 sao theo `BR-005`.

**Requirements fulfilled:**
- **FR-001** Render carousel 5 thẻ kudos nhiều tim nhất, hiển thị 3 tại một thời điểm (giữa active,
  hai bên mờ không tương tác) — dự kiến `components/kudos/highlight-carousel.tsx` (mới)
- **FR-002** Mỗi thẻ hiển thị đủ sender/mũi tên hướng/receiver/thời gian/nội dung clamp 3 dòng/tối đa
  5 hashtag/action bar — dự kiến `components/kudos/kudos-card.tsx` (mới, dùng chung với All Kudos)

**Rules enforced:** BR-005.

**Verification:**
- **SC-001**, **SC-002**

---

### US002_DieuHuongCarouselHighlightKudos — Điều hướng carousel HIGHLIGHT KUDOS (Priority: P2)

**What happens:** Người dùng dùng một trong hai cặp mũi tên (cặp 80px flanking carousel, hoặc cặp
48px cạnh chỉ báo "n/5") để chuyển carousel sang thẻ trước/tiếp theo trong tập 5 thẻ; cả hai cặp mũi
tên điều khiển cùng một trạng thái trang, disable đồng bộ ở hai đầu (trang 1 và trang 5).
**Why this priority:** Là cơ chế bổ trợ cho US001 — người dùng vẫn xem được thẻ đang active mà không
cần điều hướng, nên độ ưu tiên thấp hơn nội dung chính của khối.
**Independent Test:** Click mũi tên tiến 5 lần từ trang 1, xác nhận dừng ở trang 5 và mũi tên tiến bị
disable; click mũi tên lùi xác nhận quay lại đúng thứ tự, disable ở trang 1.

**Acceptance Scenarios:**

1. **Given** carousel đang ở trang 1, **When** click mũi tên lùi (cặp 80px hoặc 48px), **Then** không
   có gì thay đổi vì mũi tên lùi đang bị disable.
2. **Given** carousel đang ở trang 3, **When** click mũi tên tiến, **Then** carousel chuyển sang
   trang 4, chỉ báo đổi thành "4/5".
3. **Given** carousel đang ở trang 5, **When** click mũi tên tiến, **Then** không có gì thay đổi vì
   mũi tên tiến đang bị disable.

**Requirements fulfilled:**
- **FR-003** Hai cặp mũi tên (80px flanking + 48px cạnh chỉ báo) cùng điều khiển một trạng thái
  trang, disable đồng bộ ở hai đầu — dự kiến cùng file `highlight-carousel.tsx`

**State transitions:** SM-001 (`page1 ↔ page2 ↔ ... ↔ page5`)

**Verification:**
- **SC-002**

---

### US003_XemVaCuonAllKudos — Xem và cuộn ALL KUDOS (Priority: P1)

**What happens:** Người dùng cuộn xuống khối ALL KUDOS: phụ đề, tiêu đề "ALL KUDOS", và một feed thẻ
kudos hiện dần khi cuộn tới cuối danh sách đang hiển thị (mô phỏng trung thực "infinity scroll" trên
một tập dữ liệu tĩnh — không có trang giả, không có độ trễ loading giả). Mỗi thẻ có sender, icon
"sent", receiver, thời gian định dạng `HH:mm - MM/DD/YYYY`, nội dung clamp 5 dòng, tối đa 5 thumbnail
đính kèm 88×88, hashtag row, và action bar (tim + đếm, Copy Link). Danh sách rỗng hiện đúng câu
"Hiện tại chưa có Kudos nào.".
**Why this priority:** Là nội dung chính chiếm phần lớn chiều cao trang (~5862px frame) — nơi người
dùng thực sự duyệt toàn bộ hoạt động Kudos, không chỉ 5 thẻ nổi bật.
**Independent Test:** Cuộn tới cuối feed đang hiển thị, xác nhận thẻ mới hiện thêm mà không cần thao
tác nào khác; lọc theo một hashtag không có kudos nào khớp, xác nhận hiện đúng câu rỗng.

**Acceptance Scenarios:**

1. **Given** người dùng cuộn xuống khối ALL KUDOS, **When** feed đang hiển thị lô đầu, **Then** mỗi
   thẻ đủ sender/icon "sent"/receiver/thời gian đúng định dạng/nội dung clamp 5 dòng/tối đa 5
   thumbnail/hashtag/action bar.
2. **Given** người dùng cuộn tới cuối lô đang hiển thị, **When** sentinel cuối feed vào viewport và
   còn dữ liệu chưa hiện, **Then** feed hiện thêm một lô kế tiếp mà không cần thao tác nào khác.
3. **Given** bộ lọc hiện tại không khớp kudos nào, **When** feed render, **Then** hiện đúng câu
   "Hiện tại chưa có Kudos nào." thay vì danh sách trống không giải thích.

**Requirements fulfilled:**
- **FR-004** Progressive reveal thẻ tĩnh khi sentinel vào viewport, dừng khi hết dữ liệu đã lọc — dự
  kiến `components/kudos/all-kudos-feed.tsx` (mới)
- **FR-005** Mỗi thẻ hiển thị đủ sender/icon sent/receiver/thời gian/nội dung clamp 5 dòng/tối đa 5
  thumbnail/hashtag/action bar — dùng chung `kudos-card.tsx` với US001, biến thể "list" thay vì
  "carousel"

**State transitions:** SM-002 (`collapsed → revealing → exhausted`)

**Verification:**
- **SC-001**, **SC-004**

---

### US004_ThaTimKudos — Thả tim (like) một kudos (Priority: P1)

**What happens:** Người dùng click nút tim trên một thẻ kudos (Highlight hoặc All Kudos) để thả hoặc
gỡ tim; đếm tim tăng/giảm đúng một đơn vị mỗi lần, và màu nút đổi giữa `#999999` (chưa thả — màu xám
mờ có sẵn trên frame) và `--badge-danger` `#D4271D` (đã thả — đúng màu đỏ frame đang dùng cho dòng
hashtag; không thêm token mới). Nút tim trên chính thẻ mà người dùng đó là sender bị vô hiệu hoàn
toàn.
**Why this priority:** Là hành động tương tác chính của cả trang — nếu sai, toàn bộ ý nghĩa "ghi nhận
và cảm ơn" của tính năng Kudos không còn đúng.
**Independent Test:** Thả tim một kudos không phải của mình, xác nhận đếm +1 và màu đổi; thả lại lần
hai xác nhận đếm quay về giá trị ban đầu; thử thả tim thẻ do chính mình gửi, xác nhận nút disable.

**Acceptance Scenarios:**

1. **Given** một kudos chưa được người xem thả tim, **When** click nút tim, **Then** đếm tăng đúng 1
   và màu nút đổi sang `--badge-danger` (`#D4271D`).
2. **Given** một kudos người xem đã thả tim, **When** click lại nút tim, **Then** đếm giảm đúng 1 và
   màu nút quay về `#999999`.
3. **Given** một kudos do chính mock-user hiện tại gửi, **When** xem action bar, **Then** nút tim ở
   trạng thái disable, không nhận click.

**Requirements fulfilled:**
- **FR-006** Toggle tim tăng/giảm đúng một đơn vị mỗi người xem, disable trên kudos tự gửi — dự kiến
  `components/kudos/kudos-card-actions.tsx` (mới)

**Rules enforced:** BR-001, BR-002, BR-006 (ghi nhận không buildable ở lượt này).

**Verification:**
- **SC-005**

---

### US005_SaoChepLinkKudos — Sao chép link một kudos (Priority: P2)

**What happens:** Người dùng click "Copy Link" trên action bar của một thẻ kudos; hệ thống ghi một
đường dẫn vào clipboard và hiện toast xác nhận "Link copied — ready to share!". Nếu trình duyệt từ
chối quyền clipboard, thao tác thất bại êm — không có lỗi console, không có toast thành công giả.
**Why this priority:** Là tiện ích chia sẻ phụ trợ, không phải luồng chính của trang.
**Independent Test:** Click "Copy Link" trên một thẻ bất kỳ, xác nhận clipboard nhận đúng nội dung và
toast hiện đúng câu.

**Acceptance Scenarios:**

1. **Given** người dùng xem một thẻ kudos, **When** click "Copy Link", **Then** clipboard nhận nội
   dung liên kết và toast "Link copied — ready to share!" xuất hiện.
2. **Given** trình duyệt từ chối quyền clipboard, **When** click "Copy Link", **Then** không có lỗi
   console không được bắt và không có toast thành công hiện ra.

**Requirements fulfilled:**
- **FR-007** Copy Link ghi clipboard qua `navigator.clipboard.writeText`, hiện toast cố định, guard
  lỗi quyền — dự kiến cùng file `kudos-card-actions.tsx`

**Rules enforced:** BR-007.

**Verification:**
- **SC-006**

---

### US006_LocTheoHashtagPhongBan — Lọc HIGHLIGHT và ALL KUDOS theo Hashtag/Phòng ban (Priority: P1)

**What happens:** Người dùng mở dropdown "Hashtag" hoặc "Phòng ban", chọn một giá trị (hoặc xoá lựa
chọn); cả khối HIGHLIGHT KUDOS lẫn ALL KUDOS lọc lại đồng thời theo cùng bộ lọc, và carousel Highlight
quay về trang 1. Click một hashtag hiển thị bên trong bất kỳ thẻ nào có tác dụng tương đương chọn
đúng hashtag đó ở dropdown.
**Why this priority:** Là cơ chế khám phá chính của trang khi danh sách Kudos lớn dần — không có nó,
người dùng phải cuộn tay toàn bộ ALL KUDOS để tìm nội dung liên quan tới mình.
**Independent Test:** Chọn một hashtag ở dropdown, xác nhận cả hai khối chỉ còn kudos khớp hashtag đó
và carousel về trang 1; xoá lựa chọn, xác nhận cả hai khối trở lại đầy đủ.

**Acceptance Scenarios:**

1. **Given** trang đã tải với đầy đủ dữ liệu, **When** chọn một giá trị ở dropdown "Hashtag", **Then**
   cả HIGHLIGHT KUDOS lẫn ALL KUDOS chỉ còn kudos có hashtag đó, carousel về trang "1/5" (hoặc ít hơn
   nếu tập lọc còn dưới 5 thẻ).
2. **Given** một filter đang áp dụng, **When** click một hashtag hiển thị trong một thẻ bất kỳ,
   **Then** dropdown "Hashtag" cập nhật theo giá trị vừa click và cả hai khối lọc lại tương ứng.
3. **Given** một filter đang áp dụng, **When** xoá lựa chọn ở dropdown, **Then** cả hai khối trở lại
   hiển thị đầy đủ dữ liệu chưa lọc.

**Requirements fulfilled:**
- **FR-008** Hai dropdown filter (Hashtag, Phòng ban) mở/chọn/xoá, áp dụng chung cho cả hai khối — dự
  kiến `components/kudos/kudos-filter-bar.tsx` (mới)
- **FR-009** Click hashtag trong thẻ áp dụng cùng bộ lọc như chọn ở dropdown — cùng file trên, nhận
  callback từ `kudos-card.tsx`

**Rules enforced:** BR-003.

**Decision Logic:** DEC-001 (`onFilterOrHashtagClick`)

**Verification:**
- **SC-003**

---

### US007_XemVaTimKiemSpotlightBoard — Xem và tìm kiếm SPOTLIGHT BOARD (Priority: P2)

**What happens:** Người dùng cuộn tới khối SPOTLIGHT BOARD: phụ đề, tiêu đề "SPOTLIGHT BOARD", tổng
"388 KUDOS" cố định, ô tìm kiếm Sunner (tối đa 100 ký tự), và một word cloud tĩnh ~100 tên lấy từ toạ
độ node gốc của frame. Hover vào một tên hiện tooltip tên/thời gian; gõ vào ô tìm kiếm lọc/tô sáng
tên khớp. **Không có control Pan/Zoom nào được render** — node thiết kế tương ứng (`3007:17479`) là
một frame 30×30 rỗng, không icon, không fill, không text, nên không có gì trung thực để dựng lên.
**Why this priority:** Là nội dung khám phá phụ trợ — thú vị nhưng không phải luồng chính người dùng
tới trang để làm (thả tim, đọc lời cảm ơn).
**Independent Test:** Hover vào một tên bất kỳ trong word cloud, xác nhận tooltip hiện ra; gõ một
chuỗi khớp một phần tên, xác nhận tên đó được tô sáng và các tên khác mờ đi hoặc ẩn.

**Acceptance Scenarios:**

1. **Given** người dùng cuộn tới SPOTLIGHT BOARD, **When** khối render, **Then** thấy tổng
   "388 KUDOS", ô tìm kiếm, và một word cloud tên Sunner tĩnh — không có control Pan/Zoom nào xuất
   hiện ở bất kỳ đâu trong khối.
2. **Given** word cloud đang hiển thị, **When** hover vào một tên, **Then** tooltip tên/thời gian
   xuất hiện tại đúng vị trí tên đó.
3. **Given** người dùng gõ một chuỗi vào ô tìm kiếm, **When** chuỗi khớp một phần tên trong cloud,
   **Then** tên khớp được tô sáng/nổi bật, các tên không khớp mờ đi.

**Requirements fulfilled:**
- **FR-010** Render word cloud ~100 tên từ toạ độ node gốc + tổng "388 KUDOS" cố định — dự kiến
  `components/kudos/spotlight-board.tsx` (mới), dữ liệu `lib/kudos/spotlight-names.ts` (mới)
- **FR-011** Hover hiện tooltip tên/thời gian; ô tìm kiếm lọc/tô sáng, giới hạn 100 ký tự — cùng file
  trên
- **FR-012** KHÔNG render control Pan/Zoom — node thiết kế (`3007:17479`) rỗng, không có nội dung nào
  trung thực để dựng; đây là lược bỏ hoàn toàn, không phải hoãn hành vi trên một nút đã hiện diện —
  cùng file trên

**Rules enforced:** BR-004.

**Verification:**
- **SC-007**

---

### US008_XemThongKeCaNhanVaBangXepHang — Xem thống kê cá nhân và bảng xếp hạng ở sidebar (Priority: P2)

**What happens:** Người dùng xem sidebar bên phải: 5 dòng thống kê cá nhân (Kudos nhận được, Kudos đã
gửi, tim nhận được, Secret Box đã mở, Secret Box chưa mở — cả 5 đều hiển thị `25` theo đúng frame,
xem `## Assumptions`), một divider, nút "Mở Secret Box" (trigger, xem US009), và bảng xếp hạng
"10 SUNNER NHẬN QUÀ MỚI NHẤT" với 5 dòng tên + mô tả phần quà. Danh sách rỗng hiện đúng câu
"Chưa có dữ liệu".
**Why this priority:** Cung cấp ngữ cảnh cá nhân hoá cho một trang chủ yếu đọc nội dung của người
khác — không phải luồng chính nhưng là lý do quay lại trang nhiều lần.
**Independent Test:** Mở `/kudos`, xác nhận sidebar hiện đủ 5 dòng thống kê và 5 dòng bảng xếp hạng
đúng nội dung frame.

**Acceptance Scenarios:**

1. **Given** người dùng mở `/kudos`, **When** xem sidebar, **Then** thấy đủ 5 dòng thống kê với nhãn
   đúng frame và giá trị `25` mỗi dòng.
2. **Given** sidebar đang hiển thị, **When** xem bảng xếp hạng, **Then** thấy tiêu đề
   "10 SUNNER NHẬN QUÀ MỚI NHẤT" và 5 dòng tên + mô tả phần quà.
3. **Given** dữ liệu bảng xếp hạng trống (kịch bản kiểm thử), **When** bảng render, **Then** hiện
   đúng câu "Chưa có dữ liệu" thay vì bảng rỗng không giải thích.

**Requirements fulfilled:**
- **FR-013** Render 5 dòng thống kê cá nhân gắn với danh tính mock-user — dự kiến
  `components/kudos/kudos-sidebar-stats.tsx` (mới), đọc `useSession()`
- **FR-014** Render bảng xếp hạng 5 dòng, empty-state cố định — dự kiến
  `components/kudos/kudos-leaderboard.tsx` (mới), dữ liệu `lib/kudos/leaderboard.ts` (mới)

**Verification:**
- **SC-008**

---

### US009_TruyCapCacDichChuaXayDung — Truy cập các đích điều hướng chưa được xây (Priority: P3)

**What happens:** Bốn nhóm điều khiển tham chiếu tới một đích không có frame riêng — pill nhập kudos
(mở dialog gửi kudos), "Xem chi tiết" trên mỗi thẻ (mở trang chi tiết kudos), avatar/tên sender hoặc
receiver ở bất kỳ đâu (Highlight, All Kudos, bảng xếp hạng — mở trang hồ sơ), và "Mở Secret Box" ở
sidebar (mở dialog Secret Box) — đều render đúng vị trí, nhận được focus bàn phím theo đúng thứ tự
DOM, nhưng không điều hướng sang bất kỳ đâu khi được kích hoạt, vì không có frame nào định nghĩa các
đích đó.
**Why this priority:** Là hành vi placeholder có chủ đích (quyết định `clarifications.md`) — ưu tiên
thấp vì không phải nội dung chính của lượt này, nhưng vẫn cần assert để tránh trông như control bị
hỏng.
**Independent Test:** Tab qua toàn trang bằng bàn phím, xác nhận cả 4 nhóm control nhận được focus
visible; kích hoạt từng nhóm, xác nhận không có điều hướng hay lỗi console nào xảy ra.

**Acceptance Scenarios:**

1. **Given** người dùng focus vào pill nhập kudos ở banner, **When** nhấn Enter hoặc click, **Then**
   control phản hồi (ví dụ đổi trạng thái focus/hover) nhưng không có dialog gửi kudos nào được xây
   để mở ra.
2. **Given** người dùng focus vào "Xem chi tiết" trên một thẻ, **When** kích hoạt, **Then** không có
   điều hướng sang trang chi tiết kudos nào xảy ra (route đó không tồn tại ở lượt này).
3. **Given** người dùng focus vào một avatar hoặc tên (sender/receiver/bảng xếp hạng), **When** kích
   hoạt, **Then** không có điều hướng sang trang hồ sơ nào xảy ra.
4. **Given** người dùng focus vào "Mở Secret Box", **When** kích hoạt, **Then** không có dialog
   Secret Box nào được xây để mở ra.

**Requirements fulfilled:**
- **FR-015** Pill nhập kudos render + focusable, không mở dialog gửi kudos thật — dự kiến
  `components/kudos/kudos-submit-pill.tsx` (mới)
- **FR-016** "Xem chi tiết" render + focusable trên mỗi thẻ, không điều hướng trang chi tiết — cùng
  `kudos-card-actions.tsx`
- **FR-017** Avatar/tên (sender, receiver, bảng xếp hạng) render + focusable, không điều hướng trang
  hồ sơ — dùng chung `kudos-card.tsx` + `kudos-leaderboard.tsx`
- **FR-018** "Mở Secret Box" render + focusable, không mở dialog Secret Box — cùng
  `kudos-sidebar-stats.tsx`

**Verification:**
- **SC-009**

---

### Edge Cases

See [edge-cases.md](edge-cases.md).

## Key Entities

Greenfield — không có bảng CSDL; toàn bộ dữ liệu là hằng số tĩnh trong `lib/kudos/` (module mới,
tách nhiều file theo giới hạn 200 dòng, cùng tiền lệ `lib/awards.ts`).

| Entity | Table | Key Columns | Purpose |
|--------|-------|-------------|---------|
| KudosRecord | N/A (hằng số, `lib/kudos/kudos-records.ts` — dự kiến) | id, senderId, senderName, senderDept, receiverId, receiverName, message, hashtags[], attachments[], heartCount, timestamp | Nguồn dữ liệu duy nhất cho cả HIGHLIGHT KUDOS (top-5 nhiều tim) và ALL KUDOS feed. **8–10 bản ghi soạn từ đúng từ vựng thật của frame** (7 tên word cloud, 4 hạng huy hiệu New/Rising/Super/Legend Hero, phòng ban/hashtag/category có trong dữ liệu) — không transcribe verbatim vì frame chỉ vẽ một kudos lặp lại 7 lần (xem `## Assumptions`) |
| SpotlightEntry | N/A (hằng số, `lib/kudos/spotlight-names.ts` — dự kiến) | name, x, y (toạ độ node gốc Figma) | ~100 tên cho word cloud SPOTLIGHT BOARD |
| LeaderboardEntry | N/A (hằng số, `lib/kudos/leaderboard.ts` — dự kiến) | rank, name, prizeDescription | 5 dòng "10 SUNNER NHẬN QUÀ MỚI NHẤT" ở sidebar |
| FilterVocabulary | N/A (hằng số, `lib/kudos/filters.ts` — dự kiến) | hashtags[], departments[] | Danh sách giá trị cho 2 dropdown lọc dùng chung 2 khối |
| ViewerStats | N/A (hằng số hoặc derived, `lib/kudos/viewer-stats.ts` — dự kiến) | kudosReceived, kudosSent, heartsReceived, secretBoxesOpened, secretBoxesUnopened | 5 dòng thống kê sidebar, gắn với danh tính mock-user hiện tại |
| SessionUser (mở rộng) | N/A (`lib/session/session-provider.tsx` — đã tồn tại, dự kiến sửa thêm field) | id, displayName (2 field mới) | Danh tính mock để "tim tự-loại-trừ" (BR-002) và sidebar (FR-013) biết "bạn" là ai |

## Artifact References

| Artifact | File | Codes Used | Reviewed |
|----------|------|------------|----------|
| System Overview | [overview.md](../../../../docs/vi/system/overview.md) | — | [ ] |
| Architecture | [architecture.md](../../../../docs/vi/system/architecture.md) | — | [ ] |
| Feature List | [feature-list.md](../../generated/feature-list.md) | F013_KudosLiveBoard (provisional) | [ ] |
| API Map | [api-map.md](../../generated/api-map.md) | TBD (draft) — không có route API mới (dữ liệu tĩnh client-side) | [ ] |
| Entities | [entities.md](../../generated/entities.md) | TBD (draft) — không có model mới | [ ] |
| Screens | [screens.md](screens.md) | TBD (draft) — SCR### chưa được cấp | [ ] |
| Behavior Logic | [behavior-logic.md](../../generated/behavior-logic.md) | TBD (draft) — không có background job mới | [ ] |
| Permissions Matrix | [permissions-matrix.md](../../generated/permissions-matrix.md) | TBD (draft) — chưa có PERM### mới được cấp | [ ] |
| User Stories | (local, tài liệu này) | US001–US009 | [x] |

**Rule:** Mọi mã trong cột Codes Used PHẢI tồn tại trong artifact nguồn của nó khi được cấp thật ở
lúc promote; các dòng `TBD (draft)` ở trên phản ánh đúng thực trạng greenfield — không có code nào bị
bịa cho artifact chưa tồn tại.

## Assumptions

- `lib/kudos/` tách nhiều module theo concern (kudos records, spotlight, leaderboard, filters, viewer
  stats), mỗi file dưới 200 dòng, cùng tiền lệ `lib/awards.ts` — không có component nào chứa nội dung
  literal inline.
- Carousel "5 thẻ" là hợp đồng dữ liệu thật dù frame chỉ crop 3 vị trí hiển thị cùng lúc — thẻ thứ 4
  và 5 vẫn tồn tại trong dữ liệu, chỉ không hiển thị đồng thời (design defect #6, `clarifications.md`).
- Toạ độ mỗi tên trong SPOTLIGHT BOARD lấy trực tiếp từ node TEXT gốc của frame — không tự tính lại
  layout mới (không có thư viện word-cloud nào được thêm).
- Kỹ thuật cụ thể cho "infinite scroll" (IntersectionObserver hay scroll-listener throttle) chưa
  chốt — chỉ hành vi (`SM-002`: hiện dần, dừng khi hết dữ liệu, không trang giả) là bắt buộc.
- Danh tính mock-user mới (`id`, `displayName`) tuân theo đúng cảnh báo bảo mật đã có ở
  `lib/session/session-provider.tsx` — không phải một access boundary, chỉ gate hiển thị UI.
- Route `/kudos` vẫn mở công khai — không có gate mới ở lượt này (quyết định 2, `clarifications.md`).
- **Frame vẽ đúng MỘT kudos lặp lại 7 lần** — cả 3 thẻ Highlight và cả 4 thẻ ALL KUDOS chia sẻ cùng
  sender, receiver, phòng ban, category, dòng hashtag và số tim (`1.000`, không phải `10` như spec
  CSV). Seed trong `lib/kudos/kudos-records.ts` **tái tổ hợp** giá trị thật đã có trên frame (7 tên
  word cloud, 4 hạng huy hiệu, phòng ban/hashtag/category thật) thành ~8–10 bản ghi biến thiên —
  không bịa giá trị mới (`clarifications.md`, second pass). Bắt buộc: ít nhất một bản ghi có sender
  trùng danh tính mock-user để `BR-002` có kịch bản thật để assert (TC `63645b03`); và tổ hợp
  hashtag+phòng ban phải có ít nhất một combo không khớp bản ghi nào để trạng thái rỗng lọc được
  assert qua UI (TC `926d92a5`).
- **Hai lỗi chính tả phòng ban là verbatim, không chuẩn hoá:** thẻ Highlight ghi `CECV10`, thẻ ALL
  KUDOS ghi `CEVC10` — cả hai đều đúng nguyên văn frame (không phải cùng một giá trị bị gõ khác
  nhau do lỗi implementation); seed giữ nguyên cả hai tuỳ theo loại thẻ nguồn.
- **Khoảng trắng verbatim được giữ nguyên, không trim:** một dấu cách dẫn đầu + ba dấu cách cuối trên
  placeholder pill nhập kudos, một dấu cách cuối trên placeholder "Tìm kiếm " và trên mỗi tên
  leaderboard, dấu cách đôi trong dòng hashtag trước `#Inspring` cuối cùng, và một ký tự xuống dòng
  thật trong tiêu đề leaderboard ("10 SUNNER NHẬN QUÀ\nMỚI NHẤT").
- Ba câu tooltip đầy đủ theo 3 tầng hoa thị (`BR-005`) là dữ liệu cố định — nguyên văn lấy từ
  `design/kudos-content.md` (spec B.3.2/B.3.6), không còn cần đọc CSV lúc triển khai.
- Màu tim tái dùng token có sẵn của dự án — `--badge-danger` (`#D4271D`, đúng màu hashtag frame đang
  dùng) khi đã thả, `#999999` (màu xám mờ có sẵn trên frame) khi chưa thả — không thêm token mới, vì
  bản thân icon tim (`MM_MEDIA_Heart`) không mang màu nào trong dữ liệu thiết kế.

## Source Code References

Chưa có dòng code nào được viết thêm cho phần nội dung chính của feature này.

Dự kiến tạo mới: `lib/kudos/kudos-records.ts`, `lib/kudos/spotlight-names.ts`,
`lib/kudos/leaderboard.ts`, `lib/kudos/filters.ts`, `lib/kudos/viewer-stats.ts`,
`lib/kudos/star-tiers.ts`, `components/kudos/highlight-carousel.tsx`,
`components/kudos/kudos-card.tsx`, `components/kudos/kudos-card-actions.tsx`,
`components/kudos/kudos-filter-bar.tsx`, `components/kudos/all-kudos-feed.tsx`,
`components/kudos/spotlight-board.tsx`, `components/kudos/spotlight-search.tsx`,
`components/kudos/kudos-sidebar-stats.tsx`, `components/kudos/kudos-leaderboard.tsx`,
`components/kudos/kudos-submit-pill.tsx`, `e2e/kudos-live-board.spec.ts`.

Dự kiến sửa: `app/kudos/page.tsx` (hiện là placeholder — xem nội dung đã đọc ở
`## Source Walkthrough`), `lib/session/session-provider.tsx` (thêm `id`/`displayName` mock, mở rộng
SECURITY NOTE), `components/layout/site-header.tsx` (chuyển mục "Sun* Kudos" sang derive
`aria-current` từ `usePathname()` như hai mục còn lại).

Tái dùng nguyên trạng, không sửa: `components/layout/site-footer.tsx`,
`public/saa/Pen.svg`, `public/saa/Down.svg`, icon Search/Logo đã có trong `public/saa/`.
`components/home/kudos-section.tsx` KHÔNG xuất hiện trên frame này và không được thêm vào.

## Unresolved Questions

1. **Kỹ thuật infinite-scroll cụ thể chưa chọn** — IntersectionObserver là lựa chọn phổ biến nhất cho
   hợp đồng `SM-002` nhưng chưa được quyết định tường minh; để lại cho lúc triển khai.
2. **Route protection vẫn hoãn** (kế thừa từ lượt Login) — TC `71b3ef43` không được assert cho tới
   khi `/`, `/awards`, `/kudos`, `/profile`, `/admin` được gate thật sau `proxy.ts`.
3. **Pan/Zoom cần một đặc tả thiết kế thật (icon, hành vi, zoom range) trước khi có thể xây bất kỳ
   hình thức nào** — node thiết kế hiện tại (`3007:17479`) rỗng nên lượt này lược bỏ hoàn toàn control
   thay vì render một nút không có gì bấm được; TC `cac4b7a3` stays unasserted.
4. **Bảng "10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT" cần một frame riêng hoặc bị bỏ khỏi spec** — spec CSV
   mô tả 2 bảng xếp hạng, frame chỉ vẽ 1 (`D.3`), và chỉ 5/10 dòng.
5. **Hệ số tim ngày đặc biệt (+2) cần một mặt bằng cấu hình admin** trước khi `BR-006` có thể
   buildable ở bất kỳ hình thức nào.

## Source Walkthrough

Thứ tự đọc đề xuất khi triển khai — file đã tồn tại đọc trước để hiểu đúng hợp đồng cần giữ (mock
session, quy ước header, tiền lệ data module), rồi tới file dự kiến viết mới:

1. **File:** `lib/awards.ts:1-30` — tiền lệ data-module tĩnh dùng chung nhiều màn hình; đọc trước để
   `lib/kudos/` theo đúng convention (interface + mảng hằng số + hàm thuần dẫn xuất, không class).
2. **File:** `lib/session/session-provider.tsx:1-40` — hợp đồng mock session hiện có cần mở rộng
   thêm `id`/`displayName`; đọc kỹ SECURITY NOTE trước khi sửa để giữ đúng cảnh báo.
3. **File:** `app/kudos/page.tsx:1-10` — placeholder hiện tại cần thay thế bằng nội dung thật của
   toàn bộ 5 khối.
4. **File:** `components/layout/site-header.tsx:44-56` — nơi 2/3 mục nav đã derive `aria-current` từ
   `usePathname()`; mục "Sun* Kudos" cần chuyển sang cùng cơ chế.
5. **File:** `components/home/kudos-section.tsx:1-20` — tham khảo cách đọc dictionary
   `useI18n()`/copy tĩnh đã dùng cho khối quảng bá Kudos ở trang chủ, để giữ nhất quán convention dù
   component này không xuất hiện trên frame `/kudos`.

### Call Hierarchy

```text
app/kudos/page.tsx (sửa)
  -> SiteHeader (site-header.tsx, sửa aria-current mục "Sun* Kudos")
  -> KudosSubmitPill (mới, trigger-only, US009)
  -> HighlightCarousel (mới) <-> KudosFilterBar (mới, DEC-001 dùng chung với AllKudosFeed)
       -> KudosCard (mới, biến thể carousel) -> KudosCardActions (mới, tim/copy/xem-chi-tiết)
  -> SpotlightBoard (mới) -> SpotlightSearch (mới)
  -> AllKudosFeed (mới, SM-002) -> KudosCard (mới, biến thể list) -> KudosCardActions
  -> KudosSidebarStats (mới, đọc useSession() đã mở rộng) + KudosLeaderboard (mới)
  -> SiteFooter (site-footer.tsx, tái dùng nguyên trạng)
```

**Related files:** xem `## Source Code References` ở trên (đã liệt kê theo trạng thái mới/sửa/tái
dùng — F15 DRY, một danh sách không phải hai).

## DB Impact per Event

N/A — read-only feature, no DB writes. Toàn bộ dữ liệu là hằng số client-side trong `lib/kudos/`;
trạng thái trang carousel (`SM-001`), tiến trình hiện dần của All Kudos (`SM-002`), lượt thả tim
(`BR-001`/`BR-002`), và bộ lọc dùng chung (`DEC-001`) đều là UI state không persist qua reload. Không
có API route hay bảng CSDL nào bị ghi ở feature này.
