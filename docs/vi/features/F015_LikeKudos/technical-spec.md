---
status: implemented
fcode: F015
authored_by: takumi
created: 2026-08-25
lang: vi
---

# F015_LikeKudos

**Priority**: P1
**Type**: ui + data
**Screen**: Sun* Kudos - Live board (`MaZUn5xHXZ`, node `2940:13431`)
**Nguồn spec**: row **C.4.1 `Hearts`** (`I3127:21871;256:5175`), phụ trợ B.3 / B.4.4 / C.4 / D.1.4

## Overview

Biến nút trái tim trên thẻ Kudos từ state cục bộ thành một lượt thả tim **có thật, lưu trong
Supabase**. Hôm nay nút tim chỉ là `useState(false)` — reload một cái là mất sạch, và không ai
biết ai đã thả tim cho ai.

Feature này thêm ba thứ: bảng lượt thả tim có ràng buộc "một người một lượt", một sổ cái tim
cộng cho **người gửi** kudos, và cầu nối danh tính giữa `auth.uid()` với profile slug để chặn
người gửi tự thả tim cho kudos của chính mình.

Bảng `/kudos` **vẫn đọc dữ liệu tĩnh** từ `lib/kudos/kudos-records.ts`. Đường nối giữa kudos gửi
đi và bảng live board vẫn để nguyên như F014 đã ghi nhận — đó là feature khác.

## Polymorphic Behavior

Nút tim xuất hiện ở hai nơi với cùng một hành vi, khác nhau chỉ ở phần trang trí:

| Vị trí | Spec row | Khác biệt |
|--------|----------|-----------|
| Thẻ HIGHLIGHT trong carousel | B.4.4 | có thêm nút "Xem chi tiết" cạnh Copy Link |
| Thẻ trong feed ALL KUDOS | C.4 | không có "Xem chi tiết" |

Logic thả tim, quy tắc chặn, số đếm và sổ cái **giống hệt nhau** ở cả hai. Không tách nhánh.

## Cross-Cutting Logic
### Requirements

- **FR-001** — Người dùng đã đăng nhập bấm tim trên một kudos thì hệ thống ghi một dòng vào
  `kudos_likes`; số tim trên thẻ tăng và trạng thái đỏ/`aria-pressed=true` giữ nguyên sau khi
  reload trang.
- **FR-002** — Bấm tim lần nữa thì xoá dòng đó; số tim trở về giá trị trước khi thả, trạng thái
  về xám/`aria-pressed=false`, và cũng giữ nguyên sau reload.
- **FR-003** — Số tim hiển thị trên thẻ = `heartCount` tĩnh của record + số dòng `kudos_likes`
  thật của kudos đó.
- **FR-004** — Người xem mà slug profile trùng `senderId` của kudos thì nút tim render `disabled`.
- **FR-005** — Người xem chưa đăng nhập vẫn đọc được bảng và thấy số tim thật, nút tim render
  `disabled` kèm `aria-label` giải thích.
- **FR-006** — Mỗi lượt thả tim cộng vào sổ cái tim của **người gửi kudos** đúng số lượng mà
  ALG-001 tính ra.
- **FR-007** — Huỷ thả tim trừ lại **đúng số lượng đã cộng lúc thả**, đọc từ cờ `is_special` lưu
  trên chính dòng lượt thả tim đó.
- **FR-008** — Dòng sidebar "Số tim bạn nhận được:" (D.1.4) đọc sổ cái thật của người đang đăng
  nhập. Bốn dòng còn lại của khối D.1 giữ nguyên placeholder tĩnh `25`.

### Business Rules

- **BR-001** — Một người dùng chỉ có **đúng một** lượt thả tim cho một kudos. Ràng buộc này phải
  do database giữ (`unique (kudos_id, user_id)`), không chỉ do UI chặn.
- **BR-002** — Người gửi kudos **không được** thả tim cho kudos của chính mình. Chặn ở cả UI
  (`disabled`) lẫn database (RLS/`check`).
- **BR-003** — Ngày thường: một lượt thả tim = **+1 tim** cho người gửi kudos.
- **BR-004** — Ngày đặc biệt (có dòng trong `special_days` phủ ngày hiện tại): một lượt thả tim
  = **+2 tim**.
- **BR-005** — Số tim thu hồi khi huỷ **phải bằng** số đã cộng lúc thả, kể cả khi ngày đặc biệt
  đã kết thúc trong lúc đó. Vì vậy phải lưu cờ, không được tính lại theo ngày hiện tại.
- **BR-006** — Một client không được ghi dòng `kudos_likes` mang danh người khác; `user_id` bị ép
  bằng `auth.uid()` trong `with check` của policy, không tin payload.

### Decision Logic

- **DEC-001** — Trạng thái nút tim quyết định theo thứ tự: chưa đăng nhập → `disabled` (FR-005);
  ngược lại nếu slug người xem == `senderId` → `disabled` (BR-002); ngược lại → bật, màu theo
  việc người xem đã có dòng like hay chưa.
- **DEC-002** — Slug người xem lấy từ `profiles.auth_user_id = auth.uid()`. Không tìm thấy dòng
  nào → người xem coi như **không trùng người gửi nào**, nút tim vẫn bật (họ đăng nhập thật,
  chỉ là chưa gắn với profile tĩnh nào trên bảng).

### State Machines

- **SM-001 — vòng đời một lượt thả tim**

```
        ┌──────────────────── unlike (xoá dòng, trừ ALG-001 theo cờ đã lưu) ───────┐
        v                                                                          │
  [chưa thả tim]  ── like (ghi dòng + cờ is_special, cộng ALG-001) ──>  [đã thả tim]
        │
        └── bị chặn khi: chưa đăng nhập (FR-005) | là người gửi (BR-002)
```

Không có trạng thái trung gian được lưu. Optimistic UI trên client là chuyện hiển thị; nguồn sự
thật luôn là dòng trong `kudos_likes`.

### Algorithms

- **ALG-001 — số tim của một lượt thả**

```
heartsGranted(likeRow) = likeRow.is_special ? 2 : 1
```

Lúc **ghi** dòng, `is_special` được tính một lần từ `special_days` với ngày hiện tại rồi lưu
cứng vào dòng. Lúc **xoá**, đọc lại cờ đó — tuyệt đối không tính lại từ ngày hiện tại (BR-005,
đúng theo ghi chú QA của row C.4.1).

### External Integrations

- **INT-001** — Supabase local (API `127.0.0.1:54421`, DB `127.0.0.1:54422`). Migration mới +
  bổ sung `supabase/seed.sql`. Danh tính lấy từ `auth.uid()` qua `requireSupabaseUser()` đã có
  sẵn trong `lib/kudos/send/auth-gate.ts` — nhưng ở đây **không redirect**, vì bảng vẫn public
  (FR-005); cần một biến thể "lấy user nếu có, `null` nếu không".
- **INT-002** — `config.toml` không bật `auto_expose_new_tables`, nên mọi bảng mới **bắt buộc**
  phải có `grant` tường minh. Thiếu grant thì mọi thao tác fail bằng "permission denied for
  table …" — nhìn y hệt như RLS đang hoạt động đúng, rất dễ chẩn đoán nhầm.

### Verification

- **SC-001** (FR-001, FR-002) — thả tim → reload → số và màu giữ nguyên; huỷ → reload → trở lại.
- **SC-002** (BR-001) — gọi insert hai lần cho cùng cặp (kudos, user) → lần hai bị database từ chối.
- **SC-003** (BR-002) — đăng nhập bằng user gắn slug là người gửi `kudos-2` → nút tim `disabled`.
- **SC-004** (FR-005) — chưa đăng nhập → bảng load được, số tim thật hiển thị, nút tim `disabled`.
- **SC-005** (BR-003, BR-004) — thêm dòng `special_days` phủ hôm nay → một lượt thả tim cộng 2.
- **SC-006** (BR-005) — thả tim trong ngày đặc biệt, xoá dòng `special_days`, rồi huỷ tim → trừ
  đúng 2, không phải 1.
- **SC-007** (BR-006) — client cố ghi `user_id` của người khác → RLS chặn.
- **SC-008** (FR-008) — dòng "Số tim bạn nhận được:" khớp với tổng sổ cái của người đang đăng nhập.

**Client behavior:** see behavior-logic.md, permissions.md, screen-flow.md

## User Stories

- **US001** — Là một Sunner đang xem live board, tôi muốn thả tim cho một lời cảm ơn tôi thấy hay,
  để người viết nó biết là nó chạm được tới người khác. Tim của tôi phải còn đó khi tôi quay lại.
- **US002** — Là một Sunner, tôi muốn rút lại lượt thả tim nếu tôi bấm nhầm, và số tim tôi đã tặng
  phải được thu hồi đúng bằng số đã cộng.
- **US003** — Là người viết kudos, tôi không muốn tự thả tim cho bài của mình, và hệ thống nên
  chặn hẳn chuyện đó thay vì trông chờ tôi tự giác.
- **US004** — Là ban tổ chức, tôi muốn cấu hình ngày đặc biệt để một lượt thả tim đáng giá gấp
  đôi, nhằm đẩy tương tác vào đúng khung thời gian của sự kiện.
- **US005** — Là khách chưa đăng nhập, tôi vẫn muốn đọc được live board và thấy số tim thật, dù
  chưa thả tim được.

### Edge Cases

See edge-cases.md.

## Key Entities

| Thực thể | Mô tả | Ghi chú |
|----------|-------|---------|
| `kudos_likes` | Một dòng = một lượt thả tim của một người cho một kudos | `kudos_id text` (chứa được cả id tĩnh `kudos-1` lẫn uuid sau này), `user_id uuid`, `is_special boolean`, `created_at`; unique `(kudos_id, user_id)` |
| `special_days` | Khoảng ngày admin cấu hình để nhân đôi tim | seed rỗng; chưa có màn admin nào |
| `profiles.auth_user_id` | Cột mới, nullable — cầu nối `auth.uid()` ↔ slug profile | cho phép BR-002 chạy trên danh tính thật |
| sổ cái tim | Tổng số tim một profile đã nhận | dẫn xuất bằng aggregate trên `kudos_likes`, **không** lưu cột đếm riêng (tránh lệch số) |

## Artifact References

- `plans/260825-1237-like-kudos-supabase/clarifications.md` — 6 quyết định chốt, không mở lại
- MoMorph `MaZUn5xHXZ` — 64 spec rows, 41 test case
- `plans/260821-1029-kudos-live-board/dom-contract.md` — F26/F27/F29/F30 ràng buộc nút tim
- `plans/260824-0912-send-kudos-wishes/clarifications.md` — đường nối bảng/DB vẫn để mở

## Assumptions

1. Sổ cái tim **tính bằng aggregate**, không nuôi cột đếm. Với 9 record tĩnh thì chi phí không
   đáng kể, và tránh hẳn lớp bug "số đếm lệch với dữ liệu thật" (YAGNI).
2. `kudos_id` để kiểu `text` chứ không FK sang `kudos.id`. Bảng live board đang chạy trên id tĩnh;
   ép FK bây giờ sẽ buộc phải seed 9 record vào DB, tức là làm luôn feature rewire đã hoãn.
   Đánh đổi: mất ràng buộc toàn vẹn tham chiếu — ghi rõ ở edge-cases.md.
3. `special_days` seed rỗng, nên mặc định mọi lượt thả tim là +1. Đường +2 vẫn phải test được
   bằng cách chèn dòng trong test setup.
4. Quy tắc "hoa thị" (BR-005 của F013) vẫn ăn theo `kudosReceived` tĩnh, không đọc sổ cái mới.
5. **Sai lệch có chủ ý so với spec**: row C.4.1 mâu thuẫn — câu cộng ghi "tài khoản gửi", câu thu
   hồi ghi "tài khoản nhận". Theo clarifications quyết định 3, cộng cho **người gửi**; chữ "nhận"
   ở câu thu hồi coi là lỗi soạn spec.

## Source Code References

| Order | File | Vai trò |
|-------|------|---------|
| 1 | `supabase/migrations/20260824031123_kudos_send_tables.sql` | khuôn mẫu RLS + grant đang dùng |
| 2 | `lib/kudos/kudos-records.ts` | 9 record tĩnh, `senderId`, `heartCount`, `formatHeartCount` |
| 3 | `components/kudos/kudos-card-actions.tsx:33` | nút tim hiện tại (`useState`) |
| 4 | `components/kudos/kudos-card.tsx` | phải giữ hookless để render được ở server |
| 5 | `lib/kudos/send/auth-gate.ts` | `requireSupabaseUser()` — mẫu để làm biến thể không redirect |
| 6 | `lib/kudos/viewer-stats.ts` | khối D.1, nơi dòng "Số tim" đang là `25` tĩnh |
| 7 | `app/kudos/page.tsx` | server shell, nơi nạp số tim + tập đã-thả-tim |

## Unresolved Questions

- Chưa có frame MoMorph nào cho màn admin cấu hình ngày đặc biệt. `special_days` để sẵn cho lúc có.
- Sổ cái tim cộng cho **slug profile** chứ không phải auth user, nên người đăng nhập chỉ thấy số
  của mình khi cầu nối `auth_user_id` trỏ tới một slug có viết record tĩnh. Chuyện này tự hết khi
  bảng live board đọc dữ liệu thật.

## Source Walkthrough

1. **File:** `supabase/migrations/20260824031123_kudos_send_tables.sql` — đọc trước để nắm khuôn
   RLS + grant mà repo đang theo; migration mới phải khớp khuôn này.
2. **File:** `lib/kudos/kudos-records.ts:60-95` — hiểu `senderId` là slug và `heartCount` là số
   tĩnh, tức là số hiển thị phải cộng thêm delta thật.
3. **File:** `components/kudos/kudos-card-actions.tsx:33-45` — nơi state giả đang sống và sẽ bị thay.
4. **File:** `app/kudos/page.tsx` — điểm vào server, nơi nạp dữ liệu like trước khi render.

### Call Hierarchy

```text
app/kudos/page.tsx (server)
  -> lib/kudos/viewer-identity.ts       resolveViewerSlug(auth.uid()) -> slug | null
  -> lib/kudos/likes/queries.ts         likeCountsByKudosId(), likedSetForViewer()
  -> components/kudos/kudos-board.tsx   nhận viewerSlug + counts + likedSet
       -> kudos-card.tsx (hookless)     truyền xuống nguyên vẹn
            -> kudos-card-actions.tsx   ('use client') render + gọi server action
                 -> lib/kudos/likes/toggle-like.ts  ('use server') ghi/xoá dòng
```

**Related files:** see `## Source Code References` above.

## DB Impact per Event

| Event/Endpoint | Table | Columns | Operation | Value Derivation | Source |
|-----------------|-------|---------|-----------|-------------------|--------|
| bấm tim (chưa thả) | `kudos_likes` | `kudos_id, user_id, is_special` | INSERT | `user_id` ép từ `auth.uid()` trong policy; `is_special` tính một lần từ `special_days` với ngày hiện tại | `[INFERRED]` — spec row C.4.1 + clarifications quyết định 4 |
| bấm tim (đã thả) | `kudos_likes` | — | DELETE | khớp `(kudos_id, auth.uid())`; số tim thu hồi đọc từ `is_special` của chính dòng bị xoá | `[INFERRED]` — spec row C.4.1 ghi chú QA |
| seed cầu nối danh tính | `profiles` | `auth_user_id` | UPDATE | gán uuid của user e2e cho một slug, idempotent | `[INFERRED]` — clarifications quyết định 2 |
