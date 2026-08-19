# Permissions Matrix

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Analysis Scope**: Toàn bộ repo (`app/`, `components/`, `lib/`) — grep `role\b` trên `.tsx`/`.ts` (loại `role="menuitem"`/`role="status"`/`role="button"`/`role="menu"` — thuộc tính ARIA, không phải session role), đối chiếu `data-model.md` § SessionState/DISC-001, `screen-list.md` SCR001, `route-list.md` ROUTE005.

> **Raw PERM### matrix.** Machine-generated inventory of every permission item with full
> per-permission detail. The plain-language curated view lives at
> [permissions.md](./permissions.md). This file is written FIRST; the curated view is
> derived from it.

**Code Format**: `PERM###_NameSlug`

## ⚠️ Hệ thống này KHÔNG có access control

Đây là điều quan trọng nhất trong tài liệu này, nên nói thẳng trước bảng: **không có
authorization theo VAI TRÒ ở phía server**. `role` (`'guest' | 'user' | 'admin'`) đến từ
`localStorage` (key `saa.mock-role`) hoặc fallback env `NEXT_PUBLIC_MOCK_ROLE`
(`lib/session/session-provider.tsx:21,43-49`) — hoàn toàn phía client, bất kỳ ai mở
DevTools cũng gõ được `localStorage.setItem('saa.mock-role', 'admin')` để tự cấp quyền.
Không có session server, không có JWT/cookie xác thực, không có route guard nào đọc
`role`. `/admin` (ROUTE005) render được cho **bất kỳ ai** gõ thẳng URL, bất kể `role` —
comment nguồn tại `app/admin/page.tsx:1-4` nói tường minh: "this page is NOT
access-controlled and must not be treated as protected: real authorization has to be
enforced server-side when real auth arrives (see ADR-001)".

**Cập nhật 2026-08-19**: dòng trên từng ghi thêm "không có `middleware.ts`" — điều đó
không còn đúng. `proxy.ts` (tên mới của `middleware.ts` từ Next 16) nay chặn mọi route,
NHƯNG nó gate theo **thời gian** (`NEXT_PUBLIC_EVENT_START_AT` tới/qua hạn hay chưa), đọc
đúng 2 tham số: `pathname` và đồng hồ server — không đọc `role`/session ở bất kỳ đâu. Kết
luận "không có authorization theo vai trò" ở trên do đó KHÔNG bị ảnh hưởng: `/admin` vẫn
xem được bởi bất kỳ ai gõ đúng URL, với điều kiện MỚI (áp dụng như nhau cho mọi role) là
gate đếm-ngược phải đã mở trước. Không cấp `PERM###` mới cho gate này — nó không phải một
permission theo vai trò, xem `docs/vi/features/countdown-prelaunch/technical-spec.md` và
`docs/vi/system/architecture.md` § Request-Interception Layer.

Toàn bộ 3 mục PERM### dưới đây là **UI visibility gating** (ẩn/hiện phần tử giao diện),
không phải access control thật. Không suy diễn thêm permission nào ngoài 3 mục này —
grep `role\b` trên toàn repo (`components/`, `lib/`, `app/`) chỉ trả về đúng 3 điểm rẽ
nhánh theo session role, còn lại là thuộc tính ARIA (`role="menuitem"`, `role="status"`,
`role="button"`, `role="menu"`) không liên quan quyền hạn.

**Permission Types** (canonical 12 — chỉ dùng 1 loại cho tài liệu này):
`route-guard`, `screen-permission`, `action-permission`, `data-permission`, `role-based`,
`resource-ownership`, `field-permission`, `api-scope`, `feature-flag`, `experiment`,
`env-gate`, `locale-gate`.

Cả 3 mục dưới đây đều là `screen-permission` (UI element visibility rule) — không có
`route-guard` nào tồn tại vì không có route nào thực sự bị chặn.

**Note**: Feature mapping thuộc `feature-list.md` (Wave 5, chưa tồn tại — `_session-context.md`
§ Counts: `feature_count: <pending-W5>`). Tài liệu này không mang F### reference nào.

## Permissions Index

| Code | Name | Type | Enforced At |
|------|------|------|-------------|
| PERM001_AccountMenuVisibility | Account Menu Visibility | screen-permission | client (React render, `components/ui/account-menu.tsx:16`) |
| PERM002_AdminDashboardLinkVisibility | Admin Dashboard Link Visibility | screen-permission | client (React render, `components/ui/account-menu.tsx:51`) |
| PERM003_NotificationBellVisibility | Notification Bell Visibility | screen-permission | client (React render, `components/ui/notification-bell.tsx:16`) |

---

## PERM001_AccountMenuVisibility: Account Menu Visibility

**Type**: screen-permission
**Enforced At**: client (React early-return, `components/ui/account-menu.tsx:16`)

### Description

`AccountMenu` trả về `null` toàn bộ (không render gì, kể cả nút trigger) khi
`role === 'guest'`. `user` và `admin` đều thấy menu với 2 mục cơ bản: "Profile"
(link tới `/profile`) và "Sign out" (nút UI, **không có logic đăng xuất thật** — không
có session nào để xóa). Đây là kiểm tra client-side thuần túy trong thân component;
không có server nào tham gia quyết định này.

### Related Routes

- (page) `/profile` — đích của mục "Profile" trong menu

### Related Screens

- SCR001_Home - Home (AccountMenu chỉ xuất hiện trên SiteHeader của Home)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | Component trả về `null` — không render trigger, không cách nào mở menu |
| user | ✓ | Thấy "Profile" + "Sign out" (không có "Admin Dashboard") |
| admin | ✓ | Thấy "Profile" + "Sign out" + "Admin Dashboard" (xem PERM002) |

### Related Modules

- `components/ui/account-menu.tsx`
- `lib/session/session-provider.tsx`

---

## PERM002_AdminDashboardLinkVisibility: Admin Dashboard Link Visibility

**Type**: screen-permission
**Enforced At**: client (conditional render, `components/ui/account-menu.tsx:51`)

### Description

Trong menu đã mở (chỉ khả dụng khi PERM001 = allow), mục "Admin Dashboard" (link tới
`/admin`) chỉ render khi `role === 'admin'`. Đây là **ẩn một mục menu, không phải chặn
truy cập route**: `/admin` (ROUTE005) không có bất kỳ guard nào ở tầng route hay server —
bất kỳ ai gõ thẳng URL `/admin` đều xem được trang, kể cả `guest`/`user` chưa từng thấy
mục menu này. Comment nguồn tại `app/admin/page.tsx:1-4` xác nhận tường minh: trang
"is NOT access-controlled and must not be treated as protected".

### Related Routes

- (page) `/admin` — đích của link, KHÔNG có server-side enforcement nào phía sau

### Related Screens

- SCR001_Home - Home (mục menu nằm trong AccountMenu, dropdown con của SiteHeader)
- SCR005_AdminDashboard - AdminDashboard (đích đến — route reachable bởi mọi role, kể cả không có mục menu)

### Permission Rules

| Role | Allow (thấy mục menu) | Có thể truy cập `/admin` bằng URL trực tiếp? |
|------|------------------------|-----------------------------------------------|
| guest | ✗ (menu không hiện — PERM001 chặn trước) | ✓ — route không có guard, ai cũng vào được |
| user | ✗ (mục ẩn dù menu hiện) | ✓ — route không có guard, ai cũng vào được |
| admin | ✓ (mục hiện) | ✓ |

### Related Modules

- `components/ui/account-menu.tsx`
- `app/admin/page.tsx`
- `lib/session/session-provider.tsx`

---

## PERM003_NotificationBellVisibility: Notification Bell Visibility

**Type**: screen-permission
**Enforced At**: client (React early-return, `components/ui/notification-bell.tsx:16`)

### Description

`NotificationBell` trả về `null` toàn bộ khi `role === 'guest'`; `user`/`admin` đều
thấy chuông với panel dropdown. Badge số (đếm chưa đọc) chỉ render khi `unreadCount > 0`
(`components/ui/notification-bell.tsx:30`) — đây không phải một permission riêng (không
gắn theo role), chỉ là điều kiện hiển thị dữ liệu, nên không cấp mã PERM riêng; ghi chú
tại đây để không bị hiểu nhầm là quyền thứ 4. Panel bên trong luôn hiện cùng một
empty-state cố định — chưa có nguồn dữ liệu thông báo thật (đối chiếu `behavior-logic.md`
— không có BL nào loại `notification`).

### Related Routes

_(none — không có route đích, panel không điều hướng đi đâu)_

### Related Screens

- SCR001_Home - Home (NotificationBell chỉ xuất hiện trên SiteHeader của Home)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | Component trả về `null` |
| user | ✓ | Thấy chuông + panel empty-state; badge hiện nếu `unreadCount > 0` (không theo role) |
| admin | ✓ | Giống `user` — không có khác biệt hành vi nào giữa `user` và `admin` ở component này |

### Related Modules

- `components/ui/notification-bell.tsx`
- `lib/session/session-provider.tsx`

---

## Summary

- **Total Permission Items**: 3
- **By Type**: route-guard: 0, screen-permission: 3, action-permission: 0, data-permission: 0, role-based: 0, resource-ownership: 0, field-permission: 0, api-scope: 0, feature-flag: 0, experiment: 0, env-gate: 0, locale-gate: 0

**Ghi chú về locale-gate**: `lib/i18n/locale-provider.tsx` chọn dictionary theo
`locale` (DISC-002, `data-model.md`), nhưng đây là đổi ngôn ngữ hiển thị toàn trang
(FR-002/BR-006), không phải một nhánh hành vi/permission có-hoặc-không theo locale
(kiểu "chỉ locale X mới thấy tính năng Y") — không đạt định nghĩa `locale-gate` của
permission (so với ví dụ "JP-only payment methods" trong template). Không cấp PERM###.

---

## Cross-Reference Validation

- [x] All PERM### codes are unique
- [ ] All PERM### codes are referenced in FeatureList.md — pending Wave 5 (`feature-list.md` chưa tồn tại, cùng cơ chế "—" mà `route-list.md`/`screen-list.md` đã áp dụng)
- [x] All related route references are valid — `/profile` (ROUTE004), `/admin` (ROUTE005) đối chiếu `route-list.md`
- [x] All related screen references are valid — SCR001_Home, SCR005_AdminDashboard đối chiếu `screen-list.md`
- [x] All related module references are valid — 3 file component + 1 file provider, đều tồn tại trong repo
- [x] No orphaned permission references
