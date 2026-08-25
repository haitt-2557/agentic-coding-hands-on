---
status: implemented
authored_by: takumi
created: 2026-08-25
lang: vi
---

## Screen List

Feature này **không thêm màn hình mới**. Nó thay đổi hành vi của các thành phần đã có trên một
màn duy nhất.

| Route | Màn hình | MoMorph | Feature này đụng vào |
|-------|----------|---------|----------------------|
| `/kudos` | Sun* Kudos - Live board | `MaZUn5xHXZ` | nút tim (B.4.4 / C.4.1), dòng sidebar D.1.4 |

Không có route mới, không có màn admin (ngày đặc biệt cấu hình bằng SQL — clarifications quyết
định 4).

**Các thành phần trên `/kudos` bị ảnh hưởng:**

| Spec row | Thành phần | Thay đổi |
|----------|-----------|----------|
| B.4.4 | Thanh hành động thẻ HIGHLIGHT | nút tim đọc/ghi dữ liệu thật |
| C.4 / C.4.1 | Thanh hành động thẻ trong feed ALL KUDOS | nút tim đọc/ghi dữ liệu thật |
| D.1.4 | Dòng "Số tim bạn nhận được:" | đọc sổ cái thật thay vì hằng số 25 |
| B.2 / B.2.3 | Carousel HIGHLIGHT (xếp theo số tim) | thứ hạng nay tính trên số tim thật + tĩnh |

**Không đụng vào:** Copy Link (C.4.2), Xem chi tiết, bộ lọc Hashtag/Phòng ban (B.1.1/B.1.2),
Spotlight board (B.7), bốn dòng còn lại của khối D.1, và toàn bộ luồng gửi kudos.

## User Journey

**Luồng chính — thả tim rồi rút lại**

```
/kudos (đã đăng nhập)
   │
   │ server nạp: slug người xem + số tim mỗi kudos + tập kudos người xem đã thả tim
   v
[thẻ kudos hiện ra: tim xám, số = tĩnh + thật]
   │
   │ bấm tim
   v
[ghi dòng kudos_likes + cờ is_special]  ──> tim đỏ, số +1, sổ cái người gửi +1 (hoặc +2)
   │
   │ reload trang
   v
[vẫn đỏ, số vẫn thế]   ← đây là điểm khác biệt so với hôm nay
   │
   │ bấm tim lần nữa
   v
[xoá dòng]  ──> tim xám, số về cũ, sổ cái trừ đúng số đã cộng (đọc từ cờ đã lưu)
```

**Luồng bị chặn — kudos của chính mình**

```
/kudos → thẻ có senderId == slug người xem
   → nút tim render disabled, aria-label "Không thể like kudos của chính bạn"
   → bấm không có tác dụng; nếu client cố gọi thẳng thì database từ chối (BR-002)
```

**Luồng khách — chưa đăng nhập**

```
/kudos (không session)
   → bảng load bình thường, số tim thật hiển thị đầy đủ
   → mọi nút tim disabled, aria-label giải thích cần đăng nhập
   → KHÔNG redirect sang /login (live board vốn để công khai)
```

**Luồng ngày đặc biệt**

```
special_days có dòng phủ ngày hôm nay
   → thả tim ghi is_special = true, sổ cái người gửi +2
   → ngày đặc biệt kết thúc
   → rút tim vẫn trừ 2, vì đọc cờ trên dòng chứ không tính lại theo hôm nay
```
