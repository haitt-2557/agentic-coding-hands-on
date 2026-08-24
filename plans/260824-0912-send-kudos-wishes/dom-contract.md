# DOM / Seed Contract — `/kudos/send`

Extracted line-by-line from the six tester-owned RED specs (`e2e/send-kudos-*.spec.ts`,
23 tests, `redCommand: npm run test:e2e -- --project=send-kudos`, exit 1). Playwright
locators are strict: a locator matching two elements is an error no implementation can
pass. **Phases cite rule ids (D#, E#, S#, C#); they do not restate them.**

Implementation phases MUST NOT edit `e2e/**` or `playwright.config.ts`. Test-vs-spec
contradictions live in section C and are resolved only in phase-07 (tester-owned).

---

## D — `/kudos/send` markup

| id | Rule | Asserted by |
|----|------|-------------|
| D1 | Exactly ONE `input` whose placeholder contains `Tìm kiếm` = the recipient field. `/kudos/send` MUST NOT render `KudosActionBar` — its Sunner-search input (`Tìm kiếm profile Sunner`) would collide. | layout:48, interactions:15, validation:32/52/92/129, submit:21, submission:16 |
| D2 | Recipient options are `role="option"` inside a `role="listbox"`, present ONLY while filtering, and the listbox **closes on selection**. Recipient markup precedes the hashtag picker in DOM order (frame field order guarantees this). | interactions:22-36, submit:24-27 |
| D3 | Hashtag rows are **8** `role="option"` elements, always present AND visible — an inline listbox with no "open" click. Row = `<button role="option" aria-selected>`; at 5 selected every unselected row carries `disabled`. | validation:23-25/66/105, submit:47, interactions:54-68 |
| D4 | D2+D3 share `[role="option"]`, so `[role="option"]`.first() means: a recipient option while that listbox is open, otherwise the first hashtag row. Both readings are asserted in the same file — neither may break. | submit:24 then submit:47 |
| D5 | Exactly ONE `input[placeholder*="Dành tặng một danh hiệu"]`, `maxLength=100`. | validation:16/101/137/163 |
| D6 | Exactly ONE `<textarea>` on the page; placeholder begins `Hãy gửi gắm lời cám ơn`; `maxLength=1000` (hard cap, value never exceeds 1000). | layout:64-68, interactions:177-202 |
| D7 | ONE element whose text matches `/\d+\/1[.,]?000/` → render `0/1.000` (dotted thousands, verbatim from the frame). | interactions:195 |
| D8 | 6 toolbar buttons. The bold button carries visible text containing `B` **and** `aria-label="Bold"`; clicking it wraps the textarea selection in `**`. **No button earlier in DOM order on this page may have text containing a capital `B`.** Header is safe today (nav items are `<a>`; no header copy has a capital B) — do not render `kudosPage.secretBoxButton` (`Mở Secret Box`) here. | interactions:186-192 |
| D9 | Exactly ONE `input[type="checkbox"]`, unchecked on load; its visible label text contains `Gửi ẩn danh`. Tests locate via `getByRole('checkbox', { name: /Gửi ẩn danh/i })` — not text-based matching, since "Gửi" appears in button copy too. | layout:85-93, interactions:138-160 |
| D10 | The nickname `<label>Nickname ẩn danh</label>` **and** `input[placeholder*="Nickname"]` are ALWAYS in the DOM, hidden via `hidden`/`display:none` while the checkbox is unchecked. Conditional rendering (`{isAnon && …}`) fails ID-3, which reads `page.locator('label').allTextContents()` regardless of visibility. | layout:22-27 vs interactions:139-161 |
| D11 | Exactly ONE `input[type="file"]`, and it must satisfy Playwright visibility. Give it a real bounding box overlaying the add button with `opacity-0` — **not** `sr-only`, `hidden`, `display:none` or zero-size. (Playwright treats `opacity:0` with a box as visible, so frame fidelity and the assertion both hold.) | interactions:94-97 |
| D12 | Image upload uses exactly ONE `input[type="file"]` overlaying a visible button (see D11 structural contract). The button is removed from the DOM entirely at 5 images and returns on removal (SM-001). Tests query via structural locator `input[type="file"]` — not text content, since design copy varies (YAGNI). | interactions:117-120 |
| D13 | Exactly ONE button with accessible name matching `/Gửi/i` and exactly ONE matching `/Hủy/i`. `Gửi ẩn danh` must be a `<label>` on a checkbox, never a button (it would break `/Gửi/i` strict mode). `Gửi` is `disabled` until all four required fields are filled; `Hủy` is always enabled and navigates to `/kudos`. | submit:15-54, submit:79-84, layout:31-34 |
| D14 | Field error copy is exactly `Không được để trống`, rendered next to the offending field. Several may show at once (`.first()` is used). | validation:34/74/113/148 |
| D15 | `<label>` elements exist containing `Người nhận`, `Danh hiệu`, `Hashtag`, `Nickname ẩn danh`; `label:has-text("Người nhận")` must be visible. | access:24, layout:22-27 |
| D16 | Final URL of the page is exactly `/kudos/send` — no redirect, no query string. | access:21, layout:19 |

## E — Entry points and the `/kudos` landing

| id | Rule | Why |
|----|------|-----|
| E1 | The submit pill keeps its `readOnly <input>` with the verbatim placeholder `' Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?   '` (1 leading + 3 trailing spaces, never trimmed), still visible, enabled and focusable. | `kudos-board-layout.spec.ts:38-45,148-153` and `kudos-board-feed-interactions.spec.ts:194-200` focus it and read `document.activeElement.getAttribute('placeholder')` |
| E2 | `aria-haspopup="dialog"` is REMOVED from that input (superseded by clarifications decision 2). Verified safe: `grep haspopup e2e/` → zero hits. | clarifications decision 2 |
| E3 | A `<Link href="/kudos/send">` is added as a sibling that **precedes** the input in DOM order, absolutely positioned over the pill (`absolute inset-0`) with an accessible name. Preceding matters: the new spec's union locator resolves `.first()` in document order and must land on the anchor. An `<input>` nested inside `<a>` is invalid HTML and swallows the click. | `send-kudos-submission.spec.ts:108-117` |
| E4 | Quick-action widget: change item 1's href `/kudos` → `/kudos/send`. Keep exactly TWO menuitems, in order (Viết Kudos, Về SAA 2025) — do not add a third. | `homepage-widget-and-kudos.spec.ts:22-24` asserts `getByRole('menuitem').nth(1)` |
| E5 | The success toast on `/kudos` must be the ONLY `[role="status"]`/`[role="alert"]` node, and is triggered via `sessionStorage` — **never a query param**, because `toHaveURL(/\/kudos$/)` forbids `?sent=1`. Per-card `KudosToast` returns `null` when idle, so it does not collide; `notification-bell`'s `role="status"` badge only renders for a non-guest role with `unreadCount > 0`, and the e2e contexts are `guest`/0. | `send-kudos-submission.spec.ts:43-47` |

## S — Seed constraints

| id | Rule |
|----|------|
| S1 | `hashtags` = the 8 design values verbatim, including the misspelling `#High-perorming` (clarifications defect 7). D3 needs ≥6 rows; the existing `lib/kudos/filters.ts` has only 2 hashtags and is NOT the source. |
| S2 | `profiles` = the 7 real Sunner names + kebab slugs from `lib/kudos/kudos-records.ts`, verbatim: `nguyen-ba-chuc`/`Nguyễn Bá Chức`, `do-hoang-hiep`/`Đỗ hoàng Hiệp`, `mai-phuong-thuy`/`Mai phương Thúy ` (trailing space is load-bearing), `duong-thuy-an`/`Dương thúy An`, `le-kieu-trang`/`Lê Kiều Trang`, `nguyen-van-quy`/`Nguyễn Văn Quy`, `nguyen-hoang-linh`/`Nguyễn Hoàng Linh`. Mixed capitalization preserved. |
| S3 | **No Sunner named "Thái Anh" exists** anywhere in the repo. Inventing one violates "Use Figma design content as mock data source. Do NOT invent data." → the specs' query string changes instead (C3). |
| S4 | `supabase/seed.sql` additions stay idempotent (`on conflict … do nothing`) — the file re-runs on every `supabase db reset` and is consumed by the login e2e fixture (`e2e-login@example.com`, id `11111111-1111-1111-1111-111111111111`). |
| S5 | Recipient filtering is case- and substring-tolerant over `display_name`, trimming the query first (ID-10). |

## C — Test/spec contradictions — phase-07 only

| id | Conflict | Resolution |
|----|----------|-----------|
| C1 | **4 validation tests are structurally unpassable.** `send-kudos-validation.spec.ts` tests 1–4 call `submitButton.click()` with a required field empty, but BR-007/DEC-001/ID-48/ID-49 — asserted by `send-kudos-submit.spec.ts:18-54` — require `Gửi` to be `disabled` in exactly that state. Playwright auto-waits for actionability, so the click times out. The suite contradicts itself; no implementation can satisfy both. | Trigger validation **without** clicking `Gửi`: blur a touched-then-emptied required field. Implementation MUST render `Không được để trống` on blur of an empty touched required field *as well as* on an attempted submit (D14), so either resolution finds the DOM. Cite FR-011, SC-008, ID-50…ID-56. Never enable `Gửi` to make the click land. |
| C2 | **The quick-action-widget test cannot resolve its locator.** `DropdownMenu` renders children only when `open` (`components/ui/dropdown-menu.tsx:101`), so at `send-kudos-submission.spec.ts:134-138` the item is absent → 0 matches → `toBeVisible()` fails. | Click the trigger first, mirroring `homepage-widget-and-kudos.spec.ts:12-14`: `getByRole('button', { name: /widget|action|quick/i })`. |
| C3 | **`'Thái Anh'` matches no seeded profile** (5 sites: interactions:18 uses `'Thái'`; validation:53/93/130, submit:22, submission:17/65 use `'Thái Anh'`). The recipient is then never selected, so `toBeEnabled()` (submit:54) and `expect(fillValue).toBeTruthy()` (interactions:33) fail. | Replace with a substring of a real seeded name — recommend `'Trang'` (unique to `Lê Kiều Trang`). See S2/S3. |
| C4 | **Unfailable tests.** `send-kudos-interactions.spec.ts:43-81` (hashtag) contains zero `expect()` calls, its disable assertion is commented out at :69, and several `if (await …isVisible())` / `.catch(() => false)` guards let assertions be skipped. `red-evidence.json` claims "no catch() guards" — that claim is wrong for this file. | Being revised concurrently. Confirm the revision landed before any GREEN claim; a phase may not report GREEN against a test that cannot go red. |
| C5 | `type Browser` imported but unused in all 6 spec files; port `3200` hardcoded in every spec, duplicating the project `baseURL`. | Lint/tidy in phase-07. Cosmetic, non-blocking. |

## Environment facts that constrain every phase

- The `send-kudos` project already exists in `playwright.config.ts` (name `send-kudos`,
  `testMatch /send-kudos.*\.spec\.ts$/`, `baseURL http://localhost:3200`), and
  `prelaunch-gate`'s negative lookahead already excludes `.*send-kudos`.
  **No phase may edit `playwright.config.ts`** — it is shared by all 7 projects and a bad
  `testMatch` silently orphans other suites. Orphan baseline: 120 tests / 26 files.
- Port 3200 runs `next build && next start` — a **production build**. Any type error,
  unused import or half-wired module blocks the entire suite, not just one test. This is
  why `app/kudos/send/page.tsx` is created once, fully wired, in phase-08.
- `/kudos/send` is NOT in `lib/prelaunch/gate.ts` `ALWAYS_ALLOWED` and must not be added —
  that would change production gate behaviour and force an edit to `gate.test.ts`. The
  suite relies on port 3200 being past-dated instead. `proxy.ts` needs no change.
- Next.js 16.3.1: `middleware.ts` is renamed `proxy.ts`; `searchParams`/`cookies()` are
  Promises. `AGENTS.md` requires reading `node_modules/next/dist/docs/` before writing
  routing/proxy/server-action code. There is **no `'use server'` anywhere in the repo yet**
  — phase-05 writes the first Server Action.
- `lib/i18n/dictionaries/en.ts` is typed `Record<DictionaryKey, string>` off `vi.ts`, so a
  key added to `vi.ts` without `en.ts` **fails typecheck**. Both files have one owner.
- Default locale is `vi` and SSR renders `vi`, so the specs' hardcoded Vietnamese resolves.
</content>
