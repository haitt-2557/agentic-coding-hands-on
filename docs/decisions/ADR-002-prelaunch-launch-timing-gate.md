---
status: Accepted
date: 2026-08-19
deciders: takumi (orchestrator), user
---

# ADR-002: Gate theo thời gian ở `proxy.ts`, fail-open khi cấu hình hỏng, unlock kép server+client

## Status

Accepted (2026-08-19).

## Context

Spec item 1 (Days) của màn Countdown/Prelaunch (MoMorph screen `8PJQswPZmU`) ghi: *"Khi
chưa về 0: toàn bộ điều hướng đến các trang khác bị khóa. Khi về 0: mở khóa."* Phiên
clarification 2026-08-19 (`plans/260819-0913-countdown-prelaunch/clarifications.md`) đọc
quy tắc này theo nghĩa đen — khóa toàn bộ 5 route hiện có (`/`, `/awards`, `/kudos`,
`/profile`, `/admin`), không chỉ một dòng ghi chú thiết kế bị bỏ qua. Ba quyết định kiến
trúc chốt cùng lúc trong phiên đó, cả ba cùng ảnh hưởng tới toàn bộ hệ thống chứ không
riêng màn Prelaunch, nên gộp vào một ADR thay vì rải rác trong feature spec.

## Decision

### 1. Gate thực thi ở `proxy.ts`, không phải ở từng page

`proxy.ts` (tên mới của quy ước `middleware.ts` — Next 16 deprecated `middleware.ts`, xem
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`) chặn
MỌI request trước khi route tương ứng render, gọi hàm thuần `resolveGateRedirect()`
(`lib/prelaunch/gate.ts`) để quyết định redirect hay pass-through.

**Vì sao không đặt kiểm tra này ở đầu mỗi `page.tsx`** (5 route hiện có, cộng route mới
`/prelaunch`):

- Một điểm chặn duy nhất nghĩa là không route nào có thể "quên" gọi guard — thêm route thứ
  6 (`/prelaunch`) tự động được matcher bao phủ, không cần nhớ dán thêm một dòng kiểm tra
  vào file mới.
- Chặn ở tầng trước-render loại bỏ hoàn toàn "flash of gated content": nếu kiểm tra nằm
  trong thân `page.tsx` và redirect bằng `useEffect`/`redirect()` phía Server Component,
  vẫn có một khung hình HTML của trang bị khóa được gửi xuống trước khi redirect kịp xảy
  ra. Chặn ở `proxy.ts` nghĩa là response duy nhất trình duyệt nhận được đã là redirect.
- Logic gate là MỘT quyết định áp dụng như nhau cho MỌI route (xem § 2, gate không đọc
  `role` nên không có biến thể theo actor) — đặt nó ở một tầng dùng chung đúng theo DRY,
  thay vì lặp lại cùng một điều kiện trong 6 file khác nhau.

**Đây là gate theo THỜI GIAN (launch-timing), không phải một ranh giới ủy quyền
(authorization)**: `resolveGateRedirect()` chỉ nhận `pathname`, biến môi trường
`NEXT_PUBLIC_EVENT_START_AT`, và đồng hồ server — không có tham số `role`/session/cookie
nào. Nó không đọc `lib/session/session-provider.tsx` (mock phía client, đã tự ghi rõ
không phải access control — xem ADR-001 và `docs/vi/system/permissions.md`). Mọi actor
(guest/user/admin) nhận cùng một quyết định khóa/mở. Không cấp mã `PERM###` mới cho gate
này vì nó không phải một permission theo vai trò — xem
`docs/vi/generated/permissions-matrix.md`.

### 2. Fail-open khi `NEXT_PUBLIC_EVENT_START_AT` thiếu hoặc không parse được

`resolveGateRedirect()` trả `null` (không khóa gì) bất kể `pathname` khi
`computeCountdown()` trả `isInvalid: true` (`lib/prelaunch/gate.ts:33-35`, unit-test tại
`lib/prelaunch/gate.test.ts` mục "fail-open on invalid config" cho cả 3 giá trị
`undefined`, `''`, `'not-a-date'`).

**Vì sao fail-open thay vì fail-closed**: nhất quán với tiền lệ BR-003 đã có ở đếm ngược
trang chủ (biến env hỏng → zero-state, không throw) — coi `isInvalid` giống hệt
`isExpired` ở quyết định gate. So sánh hai hướng thất bại:

- Fail-open: một lỗi gõ sai định dạng ngày trong `.env` khiến gate "im lặng không hoạt
  động" — site vẫn phục vụ được mọi route như thể chưa từng có gate nào.
- Fail-closed: cùng một lỗi gõ sai đó khóa cứng TOÀN BỘ site sau `/prelaunch` vĩnh viễn,
  không có cách nào thoát ra ngoài redeploy — một lỗi cấu hình nhỏ tạo ra sự cố nghiêm
  trọng hơn nhiều so với thứ nó đáng ra bảo vệ.

Fail-closed luôn tệ hơn cái nó phòng ngừa, nên fail-open là lựa chọn duy nhất chấp nhận
được cho một gate không mang tính bảo mật.

### 3. Unlock kép: gate phía server (`proxy.ts`) + unlock phía client (`use-prelaunch-countdown.ts`)

`proxy.ts` chỉ chặn ở request MỚI. Một actor đang mở sẵn `/prelaunch` đúng lúc đếm ngược
chạm 0 không tự phát sinh request nào để proxy can thiệp — chỉ có nửa server thì actor đó
bị "kẹt" ở `00 00 00` cho tới khi tự tải lại, đúng lúc trang này tồn tại để phục vụ họ.

`lib/prelaunch/use-prelaunch-countdown.ts` bù lại: tick mỗi 1 giây, gọi
`router.replace('/')` ngay khi client tính được `isExpired`/`isInvalid`. Việc gọi
`router.replace` phía client là một client tự tin vào đồng hồ CỦA CHÍNH NÓ — nếu đồng hồ
đó lệch (chạy nhanh hơn server), `proxy.ts` sẽ bounce request `/` đó về lại `/prelaunch`
(server chưa đồng ý gate đã mở), component remount, và một guard chỉ scope trong một lần
mount sẽ reset rồi bắn lại ngay lập tức — nhấp nháy liên tục `/` ↔ `/prelaunch` suốt thời
gian lệch đồng hồ.

**Giải pháp đã chọn**: throttle việc "được thử redirect" qua `sessionStorage`
(`UNLOCK_ATTEMPT_KEY`, `lib/prelaunch/use-prelaunch-countdown.ts:37-63`) — tối đa 1 lần thử
mỗi 30 giây, sống sót qua remount vì `sessionStorage` không bị xóa khi navigate. Một client
lệch đồng hồ retry mỗi 30s thay vì mỗi giây, và vẫn tự về `/` một khi server cũng đồng ý,
không cần actor tải lại tay.

**Giới hạn đã biết, ghi nhận có chủ đích (không phải bỏ sót)**: throttle giảm tần suất
nhấp nháy xuống còn tối đa 1 lần/30 giây, KHÔNG loại bỏ hoàn toàn hiện tượng nhấp nháy khi
đồng hồ máy actor lệch server tới mức phút/giờ (không hiếm trên thiết bị thật). Đây là một
đánh đổi có chủ đích: launch-timing chịu được việc thỉnh thoảng sai một khoảnh khắc ngắn
tốt hơn nhiều so với một vòng lặp vô hạn hoặc một unlock hoàn toàn không tồn tại. Nếu
`sessionStorage` không khả dụng (private mode, cookie bị tắt), `claimUnlockAttempt()` mặc
định trả `true` (luôn cho phép thử) — ưu tiên unlock hoạt động được hơn là throttle một
edge case không thể phát hiện từ phía code.

## Consequences

**Được**:

- Một điểm chặn duy nhất (`proxy.ts`) bao phủ mọi route hiện tại lẫn tương lai, không cần
  nhớ dán guard vào từng `page.tsx` mới.
- Không có "flash of gated content" — response đầu tiên trình duyệt nhận đã là redirect.
- Fail-open nghĩa là một lỗi cấu hình không bao giờ là sự cố nghiêm trọng nhất có thể xảy
  ra với site.
- Actor đang xem trang không bị kẹt ở `00:00:00` chờ tải lại tay.

**Trả giá / rủi ro**:

- Gate không phải access control — nếu ai đó sau này đọc nhầm `proxy.ts` là một lớp bảo
  mật, họ sẽ sai. Comment nguồn trong `proxy.ts` và `lib/prelaunch/gate.ts` nói tường minh
  điều này, cộng tài liệu này và `docs/vi/system/architecture.md` § Request-Interception
  Layer.
- Nhấp nháy `/` ↔ `/prelaunch` vẫn có thể xảy ra (tần suất thấp, tối đa mỗi 30 giây) với
  actor có đồng hồ máy lệch nhiều — đã ghi nhận, không phải một bug chưa biết. Nếu sau này
  cần loại bỏ hoàn toàn, hướng khả dĩ là actor client tin vào một timestamp do SERVER trả
  về trước khi tự redirect, thay vì tin đồng hồ của chính nó (đổi bài toán "hai đồng hồ có
  thể lệch" thành "một đồng hồ duy nhất").
- Fail-open có nghĩa gate im lặng không hoạt động khi cấu hình sai — không có cảnh báo nào
  hiển thị cho đội vận hành rằng gate đã "tắt" ngoài ý muốn; chấp nhận được vì hậu quả vẫn
  là "site hoạt động bình thường", không phải một lỗi người dùng nhìn thấy.

## Alternatives Considered

| Lựa chọn | Vì sao không chọn |
|---|---|
| Kiểm tra gate trong thân mỗi `page.tsx` | Phải lặp lại ở 6 file, dễ quên khi thêm route mới, và Server Component redirect vẫn có thể để lọt một khung hình nội dung bị khóa trước khi chuyển hướng |
| Fail-closed khi env không hợp lệ | Biến một lỗi gõ sai `.env` thành sự cố khóa cứng toàn site không có lối thoát ngoài redeploy — tệ hơn nhiều so với gate "vô tình tắt" |
| Chỉ gate phía server, không có unlock phía client | Actor đang xem `/prelaunch` đúng lúc đếm ngược về 0 sẽ kẹt ở `00:00:00` tới khi tự tải lại — hỏng đúng mục đích tồn tại của trang |
| Client tự redirect không throttle (one-shot `useRef` per mount, không `sessionStorage`) | Đã thử trong bản đầu — gây vòng lặp nhấp nháy liên tục khi đồng hồ client/server lệch (client → `/`, server bounce về `/prelaunch`, remount, redirect lại ngay) — xem review `plans/reports/reviewer-260819-1040-prelaunch.md` mục High #1 |

## Cross-references

- `docs/vi/system/architecture.md` § Request-Interception Layer (Prelaunch Gate)
- `docs/vi/features/countdown-prelaunch/technical-spec.md` — BR-004, BR-005, BR-010, DEC-001
- `docs/vi/generated/permissions-matrix.md` — vì sao không có `PERM###` mới cho gate này
- `plans/260819-0913-countdown-prelaunch/clarifications.md` — phiên 2026-08-19, mọi câu hỏi/trả lời gốc
- `plans/reports/reviewer-260819-1040-prelaunch.md` — mục High #1 (clock-skew), Medium #2
- `proxy.ts`, `lib/prelaunch/gate.ts`, `lib/prelaunch/use-prelaunch-countdown.ts`
