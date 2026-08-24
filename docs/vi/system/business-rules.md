<!-- layout-exempt: rebuild-spec owns all docs/system|features|generated|flows paths — all references here are output targets or internal definitions -->
# Business Rules

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18

{Quy tắc bằng ngôn ngữ thường, viết lại từ các mục BR-### trong technical spec cho đối
tượng phi kỹ thuật. Hệ thống này không có backend/database (xem `data-model.md`,
`behavior-logic.md`) — toàn bộ quy tắc dưới đây là logic phía trình duyệt, tính từ hằng
số nội bộ hoặc hàm thuần, không có gọi mạng nào đứng sau.}

### Đếm ngược hiển thị đúng trạng thái theo thời điểm sự kiện

**Applies when:** Người dùng mở trang chủ và nhìn vào khối đếm ngược ở phần hero.
**Says:** Hệ thống tính số ngày/giờ/phút còn lại tới thời điểm sự kiện đã cấu hình. Một
khi thời điểm đó đã qua, đồng hồ không hiển thị số âm — nó chuyển sang trạng thái "đã hết
hạn" với mọi ô hiển thị 00. Đồng hồ tự làm mới mỗi phút để số liệu luôn đúng mà không cần
người dùng tải lại trang.
**Source artifact:** [Entities — CountdownResult](./data-model.md)

---

### Đếm ngược không được phép vỡ trang khi thiếu cấu hình thời điểm sự kiện

**Applies when:** Thời điểm sự kiện chưa được cấu hình, hoặc giá trị cấu hình sai định
dạng.
**Says:** Thay vì làm hỏng trang hay hiện lỗi cho người dùng, hệ thống coi đây là trạng
thái "không hợp lệ" và hiển thị cùng giao diện 00 như trạng thái "đã hết hạn" — người
dùng không thấy khác biệt giữa hai trạng thái này trên màn hình, nhưng hệ thống có phân
biệt nội bộ để phục vụ việc kiểm thử/gỡ lỗi sau này.
**Source artifact:** [Entities — CountdownResult](./data-model.md)

---

### Mỗi hạng mục giải thưởng có một trang chi tiết cố định, không có cấu hình động

**Applies when:** Người dùng bấm "Chi tiết" trên một thẻ giải thưởng ở trang chủ, hoặc
bấm thẳng vào một mục trong danh sách giải thưởng.
**Says:** Hệ thống điều hướng người dùng tới đúng phần nội dung của hạng mục đó trên
trang Giải thưởng (cuộn tới đúng vị trí bằng liên kết neo). Danh sách 6 hạng mục giải
thưởng (Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 -
Creator, MVP) là cố định trong bản dựng hiện tại — không có màn hình quản trị nào để
thêm/sửa/xóa hạng mục, và không có cách nào để một hạng mục "biến mất" khỏi danh sách khi
đang chạy.
**Source artifact:** [Entities — MODEL001_Award](./data-model.md)

---

### Thẻ giải thưởng không có định danh hợp lệ thì không nhảy tới vị trí cụ thể

**Applies when:** Một thẻ giải thưởng được hiển thị mà không có định danh hạng mục hợp
lệ đi kèm (trường hợp dữ liệu bất thường, hiện chưa xảy ra với 6 hạng mục có sẵn).
**Says:** Hệ thống vẫn đưa người dùng tới trang Giải thưởng nói chung thay vì báo lỗi hay
dẫn tới một trang không tồn tại, chỉ là sẽ không tự cuộn tới một mục cụ thể nào.
**Source artifact:** [Entities — MODEL001_Award](./data-model.md)

---

### Ngôn ngữ hiển thị được ghi nhớ cho lần truy cập sau

**Applies when:** Người dùng chọn tiếng Việt hoặc tiếng Anh từ nút chuyển ngôn ngữ trên
thanh điều hướng.
**Says:** Toàn bộ văn bản trên trang đổi sang ngôn ngữ vừa chọn ngay lập tức, và lựa chọn
này được hệ thống nhớ lại trên chính trình duyệt đó cho lần truy cập kế tiếp — không cần
chọn lại mỗi lần vào trang. Nếu chưa từng chọn, hệ thống mặc định hiển thị tiếng Việt.
**Source artifact:** [Entities — I18nState/Locale](./data-model.md)

---

### Biểu tượng tài khoản và thông báo chỉ hiện với người dùng đã có "vai trò"

**Applies when:** Người dùng mở trang chủ ở trạng thái mặc định (chưa có vai trò nào
được thiết lập) so với trạng thái đã có vai trò `user`/`admin`.
**Says:** Ở trạng thái mặc định, hai biểu tượng tài khoản và thông báo trên thanh điều
hướng không xuất hiện — không hiện mờ, không hiện khóa, mà biến mất hoàn toàn. Ngay khi
có vai trò, cả hai biểu tượng xuất hiện đầy đủ. Đây thuần túy là quy tắc hiển thị giao
diện, không phải một ranh giới bảo mật — chi tiết và cảnh báo quan trọng về giới hạn của
quy tắc này nằm ở tài liệu Permissions.
**Source artifact:** [Permissions](./permissions.md)

---

### Đã đăng nhập Google rồi thì không thấy lại màn đăng nhập (thêm 2026-08-19)

**Applies when:** Một actor đã hoàn tất đăng nhập Google (có phiên Supabase hợp lệ) cố mở
lại `/login`.
**Says:** Hệ thống kiểm tra thật ở phía máy chủ (không phải đọc trình duyệt) trước khi hiện
bất kỳ nội dung nào của màn hình — nếu actor đã có phiên hợp lệ, họ được đưa thẳng về trang
chủ, không thấy lại nút đăng nhập. Đây là kiểm tra THẬT đầu tiên trong hệ thống, khác với
mọi quy tắc `role` mock ở trên — nhưng phạm vi của nó chỉ dừng ở đúng màn hình này, không mở
rộng ra bảo vệ trang nào khác.
**Source artifact:** [Permissions](./permissions.md), [Entities — Supabase Session](../generated/entities.md)

---

### Huỷ hoặc lỗi khi đăng nhập Google không làm vỡ trang, chỉ hiện một thông báo cố định (thêm 2026-08-19)

**Applies when:** Actor huỷ màn đồng ý của Google, hoặc bước trao đổi phiên đăng nhập với
Supabase thất bại vì bất kỳ lý do gì.
**Says:** Hệ thống luôn đưa actor trở lại màn đăng nhập kèm một thông báo lỗi CỐ ĐỊNH, chung
cho mọi loại lỗi — không bao giờ lộ ra lý do kỹ thuật thật (thông điệp lỗi gốc từ Google hay
Supabase) cho người dùng cuối, và không bao giờ hiển thị một trang lỗi riêng.
**Source artifact:** [Entities — Supabase Session](../generated/entities.md), `docs/vi/generated/behavior-logic.md` BL002

---

### Số thông báo chưa đọc chỉ hiện khi có ít nhất một thông báo

**Applies when:** Biểu tượng thông báo đang được hiển thị (tức người dùng không ở trạng
thái mặc định).
**Says:** Huy hiệu số đỏ trên biểu tượng chuông chỉ xuất hiện khi số thông báo chưa đọc
lớn hơn 0; bằng 0 thì huy hiệu ẩn hoàn toàn, chỉ còn lại biểu tượng chuông trơn. Bảng
danh sách thông báo khi mở ra hiện cùng một nội dung "chưa có thông báo nào" cho mọi
trường hợp — hệ thống hiện tại chưa có nguồn dữ liệu thông báo thật đứng sau con số này.
**Source artifact:** [Entities — SessionState](./data-model.md)

---

### Mỗi người chỉ thả được một tim cho một lời cảm ơn, không thả được cho lời cảm ơn của chính mình (thêm 2026-08-21)

**Applies when:** Người dùng xem một thẻ Kudos trên trang Sun* Kudos - Live board (`/kudos`) và
bấm nút tim.
**Says:** Mỗi người xem chỉ thả được đúng một tim cho một lời cảm ơn — bấm lại lần hai sẽ gỡ tim
đó ra, không cộng dồn thêm. Với lời cảm ơn do chính người xem đó gửi, nút tim luôn ở trạng thái
khoá — không ai tự vinh danh được chính mình. Đây là quy tắc dữ liệu tĩnh phía trình duyệt, không
đồng bộ giữa nhiều tab hay nhiều thiết bị của cùng một người.
**Source artifact:** [Technical Spec — F013_KudosLiveBoard § BR-001/BR-002](../features/kudos-live-board/technical-spec.md)

---

### Số hoa thị bên cạnh tên tăng theo mốc Kudos đã nhận được (thêm 2026-08-21)

**Applies when:** Người xem nhìn vào tên người gửi hoặc người nhận trên một thẻ Kudos ở trang
Sun* Kudos - Live board.
**Says:** Một Sunner nhận đủ 10 Kudos được gắn 1 hoa thị, đủ 20 Kudos được 2 hoa thị, đủ 50 Kudos
được 3 hoa thị — dưới 10 Kudos thì chưa có hoa thị nào. Hover vào hoa thị hiện đúng một câu ghi
nhận cố định theo mốc đó. Đây là một ngưỡng tra bảng đơn giản trên số Kudos đã nhận, không phải
một huy hiệu do quản trị viên gán tay.
**Source artifact:** [Technical Spec — F013_KudosLiveBoard § BR-005](../features/kudos-live-board/technical-spec.md)
