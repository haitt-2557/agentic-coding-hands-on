---
status: implemented
authored_by: takumi
created: 2026-08-25
lang: vi
promote_target: docs/vi/system/architecture.md
promote_mode: append-delta
---

# Architecture — Delta: Thả tim Kudos (like) trên Live board

> **Forward-draft.** Viết ở giai đoạn spec, trước khi code. Được promote vào
> `docs/vi/system/architecture.md` theo kiểu append-delta ở implement-start, rồi đối chiếu lại
> với as-built khi lần chạy Core kế tiếp của `rebuild-spec` diễn ra.

## 1. Bảng thứ hai của app có ghi từ người dùng cuối

Trước delta này, mọi thao tác ghi vào database đều đến từ luồng gửi kudos (`/kudos/send`, F014).
Live board `/kudos` hoàn toàn read-only trên dữ liệu tĩnh trong `lib/kudos/`.

Feature này mở đường ghi thứ hai, và nó nằm **ngay trên trang tĩnh đó**. `/kudos` từ nay vừa đọc
9 record cứng trong `lib/kudos/kudos-records.ts`, vừa đọc/ghi bảng `kudos_likes` thật. Đây là chỗ
dễ hiểu nhầm nhất trong kiến trúc hiện tại, nên nói thẳng: **một trang, hai nguồn dữ liệu, cố ý.**

```
/kudos (Server Component)
  ├── lib/kudos/kudos-records.ts     → nội dung thẻ (tĩnh, biên dịch vào bundle)
  └── Supabase                        → số lượt thả tim + tập kudos người xem đã tim (thật)
        ↓
   hợp nhất khi render: count = record.heartCount + delta thật
```

## 2. Vì sao `kudos_likes.kudos_id` là `text` chứ không phải khoá ngoại

Bảng `kudos` (F014) chứa kudos người dùng gửi thật. Live board thì hiển thị 9 record tĩnh có id
kiểu `kudos-1` … `kudos-9`. Hai tập này không giao nhau.

Ép `kudos_id` làm khoá ngoại sang `kudos.id` sẽ buộc phải seed 9 record tĩnh vào database — tức
là làm luôn phần rewire bảng live board mà F014 đã cố ý hoãn. Nên cột để kiểu `text`, chứa được
cả id tĩnh hôm nay lẫn uuid sau này khi seam được đóng.

**Cái giá phải trả, ghi rõ:** không có ràng buộc toàn vẹn tham chiếu. Một dòng like có thể mồ côi
nếu record tĩnh bị xoá khỏi `lib/kudos/kudos-records.ts`. Tầng render bỏ qua dòng mồ côi thay vì
lỗi. Đây là nợ kỹ thuật có chủ ý, tự tan khi seam đóng lại.

## 3. Sổ cái tim là aggregate, không phải cột đếm

Số tim của một người được tính bằng `count(*)` có trọng số trên `kudos_likes`, không nuôi một cột
`hearts_total` riêng.

Lý do: với quy mô hiện tại (9 record) chi phí query không đáng kể, và cột đếm luôn kéo theo cả
một lớp bug "số đếm lệch với dữ liệu thật" — đúng loại bug khó phát hiện nhất, vì nhìn vào không
thấy sai. Không nuôi cột thì không có gì để lệch (YAGNI).

Nếu sau này bảng live board đọc dữ liệu thật và số lượng kudos tăng mạnh, đây là chỗ đầu tiên cần
xem lại — ghi vào Unresolved bên dưới.

## 4. `is_special` đông cứng tại thời điểm ghi

Bảng `special_days` cấu hình những ngày mà một lượt thả tim đáng giá 2 tim thay vì 1.

Giá trị đó **không** được tính lại lúc huỷ tim. Nó được tính một lần lúc ghi dòng like rồi lưu
cứng vào chính dòng đó. Nếu tính lại theo ngày hiện tại, một lượt tim thả trong ngày đặc biệt rồi
huỷ vào hôm sau sẽ chỉ bị trừ 1 dù đã cộng 2 — sổ cái phình lên vĩnh viễn. Ghi chú QA của spec
row C.4.1 nêu đúng rủi ro này.

## 5. Biến thể auth "lấy user nếu có"

`lib/kudos/send/auth-gate.ts` cung cấp `requireSupabaseUser()` — hàm này **redirect** khi không có
session. Live board không dùng được nó, vì `/kudos` vẫn phải xem được khi chưa đăng nhập.

Delta này thêm một biến thể trả `null` thay vì redirect. Cả hai đều đi qua `getUser()`, không bao
giờ `getSession()` — nguyên tắc đã có của repo giữ nguyên: cookie session là dữ liệu do client
điều khiển, phải xác thực lại với Supabase Auth mỗi lần.

## 6. Cầu nối danh tính `auth.uid()` ↔ profile slug

Hai không gian danh tính vẫn tồn tại song song (`auth.users` uuid so với `profiles.id` dạng slug).
Delta này **không hợp nhất chúng** — nó chỉ bắc một cây cầu hẹp: cột `profiles.auth_user_id`
nullable.

Đủ để trả lời đúng một câu hỏi: "người đang đăng nhập có phải người gửi kudos này không?" (BR-002).
Không dùng cho bất cứ mục đích phân quyền nào khác.

## Tech Stack — bổ sung

Không có dependency mới. Toàn bộ delta chạy trên `@supabase/ssr` + `@supabase/supabase-js` đã có.

## Unresolved / out of scope cho delta này

- Sổ cái tim bằng aggregate sẽ cần xem lại nếu số lượng kudos tăng đáng kể sau khi seam đóng.
- Chưa có màn admin cho `special_days`; cấu hình bằng SQL.
- Quy tắc "hoa thị" (star tier) vẫn ăn theo `kudosReceived` tĩnh, chưa đọc sổ cái mới.
- Seam giữa kudos gửi đi và live board vẫn mở — delta này không đóng nó.
