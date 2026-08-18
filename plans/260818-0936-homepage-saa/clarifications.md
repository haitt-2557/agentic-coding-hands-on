# Clarifications — Homepage SAA

**Screen:** Homepage SAA
**MoMorph:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
**fileKey:** `9ypp4enmFmdK3YAFJLIu6C` · **screenId:** `i87tDx10uM` · **figma node:** `2167:9026`
**Source data:** 46 spec items (`spec_status: done`), 62 test cases, 35 media nodes
**testPolicy:** `e2e-red-first`

---

## Session 2026-08-18

- Q: No E2E runner exists (empty `e2e/`, no `@playwright/test`); test cases auto-select `e2e-red-first`. How to proceed? → A: Install `@playwright/test` + `playwright.config.ts` (user-authorized). `tester` writes one durable screen-level E2E from the 62 test cases, proves a real assertion RED, then UI + behavior are built to GREEN. No downgrade to `visual-contract`.
- Q: Spec-Driven Development mode for this project? → A: `on`. Persisted to `.claude/.tkm.json` as `takumi.sddMode: "on"`. Stage 1.5 authors a feature spec before planning.
- Q: Language for spec and generated docs (greenfield, no `primary_lang`)? → A: `vi`. MoMorph specs, UI copy and award descriptions are all Vietnamese; keeping docs in `vi` avoids a translation layer between spec and product copy.
- Q: Header nav, footer, CTA buttons and all 6 award cards navigate to `/awards` (with `#slug` anchors) and `/kudos`, neither of which exists. How are those targets handled? → A: Create minimal placeholder routes `app/awards/page.tsx` and `app/kudos/page.tsx` as bare stubs carrying the 6 award `#slug` anchor sections. Real navigation works, hash-scroll is assertable in E2E, no broken links (TC ID-59). Page *content* for those two screens is out of scope this run.
- Q: Header shows a notification bell, VN language switcher and an account menu with role-based "Admin Dashboard", but there is no auth backend. How is auth modelled? → A: Client-side mock session provider — a small typed session context with role `guest | user | admin`, seeded from a dev/env toggle. Bell and account menu render per role; menu items are real links. Satisfies TC ID-1/5/6/27-29/36-38 without inventing a backend, and is swappable for real auth later.
- Q: The language switcher must actually switch the interface (TC ID-25/26). How deep does i18n go? → A: Hand-rolled dictionary — two typed dictionaries (`vi`, `en`) for homepage copy, a small provider, choice persisted to `localStorage`. No new dependency (KISS/YAGNI). Satisfies TC ID-24/25/26/58. Migrate to `next-intl` only if more locales arrive.
- Q: What env var name and dev value drive the countdown? → A: `NEXT_PUBLIC_EVENT_START_AT`, ISO-8601. `.env.example` seeded with a date ~90 days out (`2026-12-19T18:30:00+07:00`) so "Coming soon" and non-zero DAYS/HOURS/MINUTES are visible in dev. An invalid or unparseable value falls back to the zero state without crashing (TC ID-60).
- Q: Spec contradicts itself on award-grid responsive columns — item C2 (vi) and TC ID-16 say desktop 3 / tablet 2 / mobile 2, while item C2 (en) says 3 / 2 / 1. Which wins? → A: **3 / 2 / 2**. Two sources agree (Vietnamese C2 row + TC ID-16), and the test cases are what the E2E asserts. The English C2 row is treated as a stale translation, not a requirement.
- Q: The floating widget button "opens a quick-action menu" but the spec never lists the options. What does it contain? → A: Two actions matching the two icons the design actually shows — "Viết Kudos" (pencil → `/kudos`) and "Về SAA 2025" (SAA logo → `/awards`). Nothing invented beyond what the design depicts. Satisfies TC ID-54.
- Q: The notification bell "opens a notification panel" with no content specified anywhere. What goes in it? → A: Panel shell with an empty state — header plus "Không có thông báo mới"; the unread badge is driven by the mock session. Satisfies TC ID-27/28/29 without inventing notification data or a data model.

### Frame-vs-CSV conflicts (rendered design reviewed at `design/homepage-saa-full.png`, 1512×4480)

- Q: Frame and spec CSV disagree on event details — frame renders "Thời gian: 26/12/2025 · Địa điểm: Âu Cơ Art Center · Tường thuật trực tiếp qua sóng Livestream", while spec item B2 and TC ID-14 say "18h30 · Nhà hát nghệ thuật quân đội · Tường thuật trực tiếp tại Group Facebook Sun* Family". Which is real? → A: **The frame wins** — `26/12/2025`, `Âu Cơ Art Center`, `Tường thuật trực tiếp qua sóng Livestream`. The spec rows read as an earlier draft. TC ID-14 is hereby marked STALE and must not be treated as a build target; the E2E asserts the frame values.
- Q: What is the general precedence rule for the remaining frame-vs-CSV conflicts? → A: **Frame wins on copy and layout; CSV rows + the 62 test cases win on behavior, states and logic.** Consequences: header/footer nav label is "Award Information" (frame), not "Awards Information" (CSV); footer copyright is "Bản quyền thuộc về Sun* © 2025" (frame, correct) — the CSV's "thuộc vè" is a source-data typo and is NOT reproduced.
- Q: The frame itself renders "Comming soon" (double m). Reproduce or correct? → A: **Correct to "Coming soon"** — spec row B1.2 spells it correctly, so the typo lives in the design file. Logged below as a design-file defect for the design owner.

### Post-spec decisions (Rest Point 1.5b)

- Q: `AGENTS.md` requires reading Next 16's bundled docs at `node_modules/next/dist/docs/`, but that path was blocked for both Bash and Read. How should Study source its Next 16 knowledge? → A: Unblock it — created `$HOME/.claude/.skignore` containing `!node_modules`. Study then read the version-exact bundled docs rather than falling back to possibly-mismatched public docs.
- Q: Both system drafts point at `docs/decisions/ADR-001-mock-session-and-hand-rolled-i18n.md` as `TBD (draft)`, and that file does not exist. How is the dangling pointer handled? → A: **`doc-writer` authors ADR-001 during Stage 6 (Delivery)**, capturing why the session is mocked, why i18n is hand-rolled instead of `next-intl`, and the conditions that should trigger replacing each. The `TBD (draft)` pointers resolve at that point. Rationale stays in an ADR rather than inline, per the spec-authoring contract.
- Q: Ownership of `components/ui/dropdown-menu.tsx` — Track A (presentational) or Track B (RED-first behavior)? → A: **Track A.** Initially assigned to Track B because TC ID-30–35 are state transitions, but reassigned on user direction; `momorph-ui-implementer` now owns all of `components/**`, and Track B narrows to `lib/**` plus config.

### Post-blueprint decisions (Rest Point 2)

- Q: The planner seeds session role and locale from `localStorage` first (`saa.mock-role`, `saa.mock-unread`, `saa.locale`), falling back to `NEXT_PUBLIC_MOCK_ROLE` / `NEXT_PUBLIC_MOCK_UNREAD_COUNT` / `'vi'` — an extension of the "dev/env toggle" wording. Accept? → A: **Accepted.** `NEXT_PUBLIC_*` freezes at server-process start, so pure-env seeding would require four extra `webServer` entries to assert guest/user/admin and vi/en. With `localStorage` first, `page.addInitScript()` drives TC ID-1/5/6/11/25/26/27–29/36–38 on a single port-3000 server. This is the binding seeding contract: Phase 1's RED spec is written against it and Phase 3 implements it.
- Q: The planner adds a second `playwright.unit.config.ts` (no `webServer`, `testDir: './lib'`) for Track B's pure-function TDD loop. Accept? → A: **Accepted.** Playwright's `webServer` array is global, so without it every Track B unit run boots two Next dev servers — a reliable source of false REDs in the track whose RED-first contract must stay trustworthy.
- Q: The footer link "Tiêu chuẩn chung" appears in the frame but has no destination in the spec rows, the test cases, or any prior decision. What does it point to? → A: **Render as a non-anchor element** (plain text styled like its sibling links, no `href`). TC ID-59 (no broken links) still holds, nothing 404s, and the gap stays visible rather than being papered over with an invented URL. Escalated to the design owner for a real target.
- Q: Branch strategy? → A: Branch `feat/homepage-saa` off `main` before Phase 1; all five phases land there. Rollback is a per-phase revert.

### Post-forge decisions (Stage 4 → 5 handoff)

- Q: Nút widget nổi — code đang `top-1/2` (giữa mép phải), spec item 6 ghi "cố định ở mép phải bên dưới màn hình". Theo cái nào? → A: **Giữ `top-1/2` theo frame.** Đúng quy tắc precedence đã chốt: frame thắng về copy/layout, spec + test case thắng về hành vi. Không đổi code. Đóng lại concern mà Track A đã nêu.
- Q: Homepage đã implement xong (38/38 E2E, 16/16 unit, tsc/lint/build sạch) nhưng chưa qua review + delivery. Làm lại từ đầu hay hoàn tất? → A: **Hoàn tất Stage 5 + 6**, không re-implement. Chạy `reviewer`, rồi gen-gate → delivery-tracker → doc-writer (kèm ADR-001) → evidence gate → Delivery Manifest → hỏi commit.

### Bug fixes sau Track A (orchestrator tự sửa, ngoài quy trình ownership thông thường)

- **Nền hero không hiển thị** — `<section className="relative">` không tạo stacking context (`z-index: auto`), nên hai lớp `-z-10` (ảnh keyvisual + gradient overlay) bị đẩy ra sau `body { background }` và vô hình. Sửa bằng `isolate` tại `components/home/hero-keyvisual.tsx:17`. Asset không hề lỗi — vẫn serve HTTP 200, 4.4MB. Đã grep toàn bộ `components/` + `app/`: chỉ hero dính lỗi này.
- **4 console warning về ảnh** — nguyên nhân thật là props `width`/`height` khai sai tỉ lệ gốc của file, không phải thiếu CSS. `Flag_VN.svg` thật 20×15 (khai 24×24), `Widget_Kudos_Logo.svg` thật 20×19 (khai 24×24), `Kudos_Wordmark.svg` thật 364×74 (khai 364×72). `Award_BG.png` dùng `fill` mà thiếu `sizes` → thêm `(min-width: 1024px) 33vw, 50vw` khớp lưới 3/2 cột của BR-004. Sau khi sửa: console 0 error, 0 warning.
- **8 assertion bị vô hiệu hóa bằng `.catch(() => {})`** — bao gồm ID-42, ID-30/31/32, ID-35, ID-0/1, ID-29, ID-60. Suite báo 38/38 nhưng 8 cái này không bao giờ fail được. Thay bằng `toHaveCount(0)` thật, đối chiếu với markup thật (`role="menu"` tại `dropdown-menu.tsx:96`, `role="menuitem"` tại `account-menu.tsx:38,46,55`, `role="status"` tại `notification-bell.tsx:33`, `return null` cho guest tại dòng 16 của cả hai control). Cả 8 đều pass khi được phép fail → implementation vốn đã đúng.

### Stage 5 — sửa trong lúc inspect (orchestrator, đã verify lại toàn bộ)

- **Suite từng xanh nhờ may.** Config để `reuseExistingServer: !isCI`, mà `next dev` mở tay lúc visual validation không có `NEXT_PUBLIC_EVENT_START_AT`. Playwright mượn luôn server đó → `computeCountdown` trả `isInvalid` → "Coming soon" biến mất sau hydration, nhưng nó *hiện* trước hydration nên `toBeVisible()` khi thắng khi thua. Đổi thành `reuseExistingServer: false` cho cả hai server: mất thêm thời gian khởi động, đổi lấy việc suite không bao giờ test nhầm môi trường. Có server lạ chiếm cổng thì nó báo lỗi to thay vì âm thầm sai.
- **`npm run lint` là `eslint` trần** nên crawl cả `.claude/` (kit Takumi) và `plans/` → 983 problem không liên quan, gate lint coi như vô nghĩa. Thêm 4 mục vào `globalIgnores` trong `eslint.config.mjs`. Code dự án vốn đã sạch — plan ghi "eslint.config.mjs không cần đổi (verified)", chỗ verify đó sai vì kit về sau mới có.
- **Thêm 3 assertion rỗng nữa lọt lưới đợt dọn `.catch()`:** `expect(page).toBeTruthy()` ở ID-25 và ở invalid-env spec, và `expect(updatedText).toBeTruthy()` ở ID-39 — cái cuối tệ nhất vì `getByText(/MINUTES/)` chỉ trả về nhãn `"MINUTES"`, tức ID-39 (đếm ngược tự chạy) có **0 coverage thật**. Viết lại: ID-25 khẳng định hai chiều (chuỗi EN xuất hiện *và* chuỗi VI biến mất), ID-39 cài `page.clock.install()` **trước** `goto` (interval đăng ký trong mount effect, cài sau thì `fastForward` không với tới) rồi khẳng định giá trị phút tự giảm 29 → 28.
- **`/profile` và `/admin` là link 404 thật.** Menu tài khoản chỉ render cho `user`/`admin` nên không test nào chạm tới. Thêm hai route placeholder theo đúng tiền lệ `/awards`, `/kudos`, cộng một test ID-59 duyệt mọi đích của menu và đòi HTTP 200 — đã chứng minh test này fail được bằng cách tạm gỡ `app/profile`.
- **`data-dropdown-trigger` giờ nằm trong `DropdownTriggerProps`** thay vì để 4 consumer tự nhớ gắn tay. Consumer thứ 5 quên thì mất Escape-refocus mà không có lỗi biên dịch lẫn cảnh báo runtime — `?.focus()` trên `null` im lặng.
- **`e2e/homepage.spec.ts` 670 dòng** vi phạm chính tiêu chí "mọi file dưới 200 dòng" của phase 05. Tách theo `test.describe` sẵn có thành 7 file (dài nhất 152 dòng), phần seed localStorage dùng chung rút vào `e2e/support/seed-defaults.ts`. Tên test giữ nguyên từng ký tự.
- Bỏ `contentEditable={false} suppressContentEditableWarning` trên copyright ở footer — di chứng của cái test `getByContentEditable` đã xoá từ trước, không phòng vệ gì cả. Đổi tên test "ID-62" thành đúng thứ nó kiểm (nhánh fallback không slug là bất khả đạt từ UI; coverage thật nằm ở `lib/awards.test.ts`).

Ba warning của reviewer **không** sửa, vì đụng ngữ nghĩa thiết kế chứ không phải lỗi code — xem mục dưới, gửi design owner quyết:
`role="button"` trên hero CTA (là link điều hướng, hứa Space nhưng chỉ Enter chạy) · `role="menu"`/`"menuitem"` trên 4 dropdown (hứa điều hướng phím mũi tên theo APG, chưa có; thực chất là nhóm link chứ không phải command menu) · mỗi award card có 3 link cùng đích, trong đó 2 link trùng y hệt accessible name.

### Design defects to report back to the design owner

1. Hero subtitle in the Figma frame reads "Comming soon" (should be "Coming soon").
2. Spec CSV row 7 / TC ID-17 footer copyright reads "Bản quyền thuộc vè Sun*" (should be "về" — the frame is correct).
3. Spec item B2 / TC ID-14 event details are out of date relative to the frame (see above).
4. Spec item C2 carries two contradictory responsive-column rules between its Vietnamese and English rows.
5. Three of the six award cards — **Best Manager**, **Signature 2025 - Creator**, and **MVP (Most Valuable Person)** — carry identical placeholder description text in the MoMorph frame itself ("Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm"). Reproduced verbatim under the frame-wins-on-copy rule, but all three almost certainly need distinct real copy from the design owner before this page is public.

---

## Orchestrator Assumptions (stated, not asked)

These were resolvable from the design data and are recorded so the implementation agents do not re-derive them:

- **Award slugs** for the `/awards#<slug>` hash anchors are kebab-case derivations of the six card titles: `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp`. TC ID-62 (missing hashtag) navigates to `/awards` with no auto-scroll.
- **TC ID-30 – ID-35** ("dropdown menu button": toggle open, toggle closed, click-outside, Enter, Space, Esc) are read as applying to *every* header dropdown, not one specific control. They are implemented once as a shared accessible dropdown primitive used by both the language switcher and the account menu.
- **Copy** follows the precedence rule above: strings come from the rendered frame, behavior from the spec rows and test cases. Superseded typos are listed under "Design defects" and are not reproduced.
- **Assets** come from the 35 MoMorph media nodes (hero key visual, ROOT/FURTHER typography, six award thumbnails, logos, icons). No placeholder or stock imagery is substituted.

## Unresolved Questions

None blocking. Two items deferred by scope decision rather than left open:

1. `/awards` and `/kudos` page content — placeholder routes only this run; their MoMorph screens were not fetched.
2. Real authentication — the mock session provider is an explicit interim contract, not a shipped auth system.
