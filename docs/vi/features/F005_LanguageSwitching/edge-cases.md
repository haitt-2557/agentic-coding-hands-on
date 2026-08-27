---
status: implemented
authored_by: takumi
created: 2026-08-26
lang: vi
fcode: F005
---

| Scenario | Input | Expected | Severity |
|----------|-------|----------|----------|
| `localStorage` bị chặn (private mode/quyền trình duyệt từ chối) | `window.localStorage.getItem`/`setItem` throw exception | Không được crash trang trắng; fallback về `DEFAULT_LOCALE = 'vi'` cho phiên hiện tại, đổi locale trong UI vẫn hoạt động nhưng không persist qua lần tải sau — hiện `lib/i18n/locale-provider.tsx:29-31` CHƯA có try/catch quanh `localStorage.getItem`, đây là gap cần vá | medium |
| `localStorage.saa.locale` chứa giá trị rác (vd `"fr"`, `"1"`, chuỗi rỗng) | `resolvePersistedLocale()` đọc giá trị không hợp lệ | `isLocale()` trả `false` → fallback về `'vi'` (đã có coverage đúng theo code hiện tại, `lib/i18n/locale-provider.tsx:24-31`) — không đổi hành vi, chỉ cần asserted lại trong revision test | low |
| `public/saa/Flag_EN.svg` load lỗi (404/asset thiếu do build sai) | `<Image src="/saa/Flag_EN.svg">` không tải được | Next.js `Image` hiện icon vỡ mặc định trình duyệt thay vì crash component; label `EN` vẫn đọc được, layout dòng không vỡ (kích thước `width`/`height` cố định giữ chỗ) | medium |
| Double-click rất nhanh vào cùng 1 dòng | Click dòng `EN` 2 lần liên tiếp trong <100ms | Lần 1: `setLocale('en')` + đóng menu; lần 2 không có gì để click vì menu đã unmount — không có lỗi console, không set locale 2 lần gây race | low |
| Chọn bằng bàn phím thuần (không dùng chuột) | Tab tới trigger → Enter mở → Tab tới dòng `EN` → Enter/Space chọn | Dòng nhận focus phải có chỉ báo focus-visible rõ, Enter/Space trên dòng phải trigger `onClick` giống chuột (hiện dòng menu là `<button role="menuitem">` nên hành vi bàn phím mặc định của `<button>` áp dụng — cần verify khi thêm style mới không phá `focus-visible`) | medium |
| Locale đổi khi đang giữa quá trình hydrate (SSR render `vi`, client có `saa.locale = 'en'` trong storage) | Tải trang lần đầu khi đã có `en` lưu sẵn | Server render `vi` (mặc định), sau mount `useEffect` đọc lại và re-render sang `en` — có 1 nhịp "nháy" ngắn từ vi→en, đã là hành vi hiện tại (`lib/i18n/locale-provider.tsx:53-61`) và KHÔNG đổi trong revision này; chỉ cần đảm bảo panel/trigger style mới không làm nhịp nháy này rõ hơn (vd không có animation riêng che mất) | low |
| Thiếu 1 khoá dictionary ở 1 locale (vd `language.optionEn` bị xoá nhầm khỏi `en.ts` khi sửa code) | Build/type-check | Không thể xảy ra ở runtime vì `en.ts` được gõ kiểu `Record<DictionaryKey, string>` (`import type { DictionaryKey } from './vi'`) — thiếu khoá là lỗi biên dịch (`npm run build`/`tsc`), không phải lỗi runtime; nếu vẫn lọt qua, `translate()` fallback trả về chính `key` (`lib/i18n/locale-provider.tsx:34-37`) thay vì crash | low |
