---
status: draft
authored_by: takumi
created: 2026-08-21
lang: vi
---

## Screen List

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|----------------|------------------|
| Sun* Kudos - Live board | SCR008_KudosLiveBoard | Header dùng chung (mục "Sun* Kudos" đang chọn); banner + ô mời gửi lời cảm ơn; khối HIGHLIGHT KUDOS (carousel tối đa 5 lời cảm ơn nhiều tim nhất, 2 dropdown lọc); khối SPOTLIGHT BOARD (bảng tên nổi bật 106 tên, ô tìm kiếm); khối ALL KUDOS (danh sách đầy đủ, hiện dần theo lô 4 khi cuộn); sidebar thống kê cá nhân + bảng xếp hạng; footer dùng chung | Lọc theo hashtag hoặc phòng ban (ảnh hưởng cả khối nổi bật lẫn danh sách đầy đủ); chuyển trang khối nổi bật bằng mũi tên; thả/gỡ tim cho một lời cảm ơn không phải của mình; sao chép liên kết một lời cảm ơn; tìm kiếm tên trong bảng tên nổi bật; cuộn để xem thêm lời cảm ơn; mở ô mời gửi lời cảm ơn, xem chi tiết, xem hồ sơ, hoặc mở hộp quà bí mật (bốn thao tác này chỉ mở ra được tới bước bấm, chưa dẫn tới đâu — xem `technical-spec.md` US009) |

## User Journey

1. Người dùng mở trang Sun* Kudos - Live board (từ header, từ khối quảng bá ở trang chủ/trang giải
   thưởng, hoặc gõ thẳng URL) và thấy ngay banner cùng khối HIGHLIGHT KUDOS.
2. Người dùng chọn một hashtag hoặc phòng ban ở khối lọc — cả khối nổi bật lẫn danh sách đầy đủ bên
   dưới cùng lọc lại theo lựa chọn đó.
3. Người dùng thả tim cho một lời cảm ơn mình đồng cảm, thấy đếm tim tăng ngay lập tức; thử thả tim
   một lời cảm ơn do chính mình gửi thì thấy nút đó không bấm được.
4. Người dùng cuộn xuống bảng tên nổi bật, gõ tên một đồng nghiệp vào ô tìm kiếm để tìm nhanh, rồi
   tiếp tục cuộn xuống danh sách đầy đủ — danh sách hiện thêm dần theo đà cuộn.
5. Người dùng nhìn sang khu vực thống kê cá nhân và bảng xếp hạng bên phải để biết vị trí của mình
   trong phong trào.
6. Người dùng sao chép liên kết một lời cảm ơn để chia sẻ ra ngoài trang, thấy thông báo xác nhận đã
   sao chép thành công.

```mermaid
journey
    title Hành trình người dùng trên trang Sun* Kudos - Live board
    section Khám phá nội dung nổi bật
      Mở trang, xem khối nổi bật: 5: Người xem
      Lọc theo hashtag/phòng ban: 4: Người xem
    section Tương tác
      Thả tim một lời cảm ơn: 5: Người xem
      Sao chép liên kết chia sẻ: 3: Người xem
    section Khám phá thêm
      Tìm tên trong bảng nổi bật: 4: Người xem
      Cuộn xem toàn bộ danh sách: 4: Người xem
      Xem thống kê cá nhân: 3: Người xem
```
