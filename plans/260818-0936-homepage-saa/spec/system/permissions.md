---
status: draft
authored_by: takumi
created: 2026-08-18
lang: vi
---

# Permissions — Homepage SAA 2025 (Draft)

> Bản nháp plan-local. Chưa có mã `PERM###` nào được cấp phát — việc cấp mã là công việc máy
> (rebuild-spec extraction pass, chạy tại reconcile sau khi code tồn tại). Bảng dưới đây mô tả
> khả năng (capability) bằng ngôn ngữ thường, KHÔNG dùng mã, để không bịa mã. Đây cũng là view
> "plain-language curated" — bản raw machine-generated inventory (`docs/generated/permissions-matrix.md`,
> với mã `PERM###` thật) do Core pass tạo sau, KHÔNG phải việc của bản nháp này.

## ⚠️ Cảnh báo quan trọng nhất trong file này

**Nguồn của role KHÔNG phải một hệ thống auth thật.** Role (`guest | user | admin`) đến từ
`SessionProvider` — một client-side context được seed bằng dev/env toggle (xem
`architecture.md` § Client Providers). Nó KHÔNG phải một security boundary: bất kỳ ai mở
DevTools cũng có thể sửa state client và tự cấp cho mình role `admin`. Toàn bộ bảng quyền dưới
đây chỉ chi phối **UI hiển thị cái gì cho ai** trong bản build này, không chặn được request nào
ở tầng server vì chưa có tầng server.

**Hệ quả bắt buộc cho tương lai**: khi có auth thật (backend xác thực + session server-side),
TOÀN BỘ rule dưới đây phải được suy luận lại và enforce phía server (route guard,
API middleware) — không được coi bảng này là đã "xong" phần bảo mật chỉ vì UI đã ẩn/hiện đúng
theo role mock.

## Roles

| Role | Nguồn | Mô tả |
|---|---|---|
| `guest` | Mặc định khi `SessionProvider` chưa seed user | Người dùng chưa đăng nhập (mock) |
| `user` | Seed dev/env toggle | Người dùng đã đăng nhập, quyền thường |
| `admin` | Seed dev/env toggle | Người dùng đã đăng nhập, quyền quản trị |

## Capability Matrix

| Capability | `guest` | `user` | `admin` | Bằng chứng (TC ID) |
|---|---|---|---|---|
| Xem nội dung public của Homepage | ✓ | ✓ | ✓ | ID-0 |
| Thấy chuông thông báo (notification bell) | ✗ | ✓ | ✓ | ID-1, ID-11 |
| Mở panel thông báo | ✗ | ✓ | ✓ | ID-27, ID-28, ID-29 |
| Mở account menu | ✗ | ✓ | ✓ | ID-1, ID-5, ID-6, ID-36 |
| Thấy mục "Profile" trong account menu | ✗ | ✓ | ✓ | ID-36, ID-38 |
| Thấy mục "Sign out" trong account menu | ✗ | ✓ | ✓ | ID-36, ID-38 |
| Thấy mục "Admin Dashboard" trong account menu | ✗ | ✗ | ✓ | ID-5, ID-6, ID-37, ID-38 |

Ghi chú đọc bảng:

- `guest` không có bell, không có account menu — TC ID-0 chỉ khẳng định nội dung public hiển thị
  đầy đủ, không nhắc đến bell/account menu; TC ID-1 khẳng định ngược lại rằng bell + account menu
  + "personalized options" xuất hiện KHI đã đăng nhập → suy ra guest thì không có.
- `user` và `admin` giống nhau ở bell/panel/Profile/Sign out; khác nhau CHỈ ở mục
  "Admin Dashboard" — đây là điểm phân role duy nhất được test case xác nhận (ID-5 vs ID-6,
  ID-37 vs ID-38 là hai cặp test đối xứng cố ý).
- Không có capability nào cho `data-permission` (field-level) hay `resource-ownership` trong tập
  test case này — Homepage SAA không có form nhập liệu hay tài nguyên sở hữu theo user.

## Enforcement điểm (client-only — nhắc lại cảnh báo)

Toàn bộ 7 dòng trên được enforce bằng **conditional rendering phía client** trong
`components/layout/site-header.tsx` (đọc `useSession().role`), KHÔNG có route guard, KHÔNG có middleware,
KHÔNG có kiểm tra phía server nào. Loại permission gần nhất theo `code-formats.md` là
`screen-permission` / `role-based` (UI-visibility) — không có `route-guard`, `action-permission`
thật, hay `api-scope` nào trong scope này vì không có route nào bị chặn và không có API nào tồn
tại.

Mã `PERM###` thật cho từng dòng: `TBD (draft)` — cấp phát tại bước reconcile (Core pass) sau khi
`components/layout/site-header.tsx` được viết và scout được vị trí `useSession().role` cụ thể.

## Ngoài phạm vi

- Không có role thứ tư hay quyền phân cấp sâu hơn (vd. `super-admin`) — chỉ 3 role theo
  clarifications.
- Không có `/awards`, `/kudos` permission — hai route đó là placeholder công khai, không role-gate.
- Không có persistence cho role đã chọn ngoài phiên (session/localStorage dev toggle) — không có
  logic "remember me" hay refresh-token nào để suy luận quyền.

## Cross-references

- Quyết định nguồn: `plans/260818-0936-homepage-saa/clarifications.md` (phiên 2026-08-18,
  mục "Header shows a notification bell... How is auth modelled?").
- Test cases: `plans/260818-0936-homepage-saa/design/test-cases-i87tDx10uM.csv` — ID-1, ID-5,
  ID-6, ID-11, ID-27, ID-28, ID-29, ID-36, ID-37, ID-38.
- Kiến trúc provider: `plans/260818-0936-homepage-saa/spec/system/architecture.md` § Client
  Providers.
