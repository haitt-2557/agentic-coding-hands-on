# Frozen DOM + seed contract — `/kudos`

Derived by reading the three RED spec files line by line
(`e2e/kudos-board-layout.spec.ts`, `e2e/kudos-board-interactions.spec.ts`,
`e2e/kudos-board-feed-interactions.spec.ts`). **These tests are owned by `tester` and no
implementation phase may edit them.** Everything below is therefore a constraint on the
implementation, not a suggestion. Playwright locators are strict: a locator that resolves to
2+ elements is an error, not a pass — most of the rules below exist for that reason.

Legend: **F** = frozen (an implementation choice the tests pin down), **S** = seed-data
constraint, **C** = conflict that Phase 1 must resolve in the test file.

---

## 1. Page skeleton

| # | Rule | Why |
|---|---|---|
| F1 | `app/kudos/page.tsx` is a server component composing `SiteHeader` → `<main>` → `SiteFooter`, exactly like `app/awards/page.tsx`. The route currently renders **no** header/footer at all. | `header`/`footer` visibility assertions |
| F2 | The five content regions are **sibling `<section>` elements inside `<main>`**. No `<section>` may wrap another `<section>`. | `section:has(h2:text-is(...))` + `.first()` would otherwise select an outer wrapper and pull both regions' cards into one scope |
| F3 | Region order: (1) banner, (2) action bar, (3) HIGHLIGHT KUDOS, (4) SPOTLIGHT BOARD, (5) ALL KUDOS (feed + `<aside>` sidebar). | `page.locator('section').first()` must be the banner |
| F4 | Region headings are `<h2>` whose text is **exactly** `HIGHLIGHT KUDOS`, `SPOTLIGHT BOARD`, `ALL KUDOS` — `text-is` is exact, so no trailing space, no nested extra text. | section scoping |
| F5 | The banner section contains the title `Hệ thống ghi nhận và cảm ơn` and the wordmark image. The submit pill and Sunner search live in region 2, **not** in the banner. | banner "display-only" test |
| F6 | Exactly **one** `<img>` on the whole page has `alt` containing `KUDOS` (the wordmark). No other image `alt` or `src` may contain `KUDOS` or `kudos` (case-sensitive). | `img[alt*="KUDOS"], img[src*="KUDOS"], img[alt*="kudos"]` is asserted visible → must be 1 element |
| F7 | The sidebar is an `<aside>`. | `aside, [role="complementary"]` |

## 2. Header and footer chrome

| # | Rule | Why |
|---|---|---|
| F8 | `site-header.tsx`: the `Sun* Kudos` item derives from `usePathname()` like the other two, carrying `aria-current="page"` and `ACTIVE_NAV_CLASSES` on `/kudos`. | `header nav marks /kudos with aria-current="page"` |
| F9 | `site-footer.tsx`: the footer `<nav>` derives active state from `usePathname()`. **The active item renders as a `<span aria-current="page">` carrying the tint, not as a `<Link>`.** The hard-coded `aria-current="page"` on `/` (line 34) and the hard-coded tint on `/awards` (lines 39-44) both go away. | `page.getByRole('navigation').locator('a:has-text("Sun* Kudos")')` matches **both** the header and footer navs today → strict-mode violation. Making the current-route footer item a non-link leaves exactly one `<a>`. It is also the correct treatment for the current page and reproduces the frame, where the footer's Kudos item is the tinted variant. |
| F10 | Regression guard for F9: on `/`, footer About becomes a `<span>`. Verified safe — every `About SAA 2025` link assertion in `e2e/` is scoped to `header` (`homepage-structure-and-copy.spec.ts:81`, `awards-page-header.spec.ts:19`), and the only footer link assertions are `Award Information` and `Sun* Kudos` on `/` (`homepage-structure-and-copy.spec.ts:63-64`), both still links there. | no collateral red |

## 3. Banner, submit pill, Sunner search

| # | Rule |
|---|---|
| F11 | Submit pill is an `<input readOnly>` whose `placeholder` is the verbatim frame string, leading and trailing spaces intact: `" Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?   "`. It must be visible, **enabled** (`readOnly` still counts as enabled) and focusable. Add `aria-haspopup="dialog"`; no dialog is built (FR-015). |
| F12 | Sunner search is an `<input>` with placeholder exactly `Tìm kiếm profile Sunner`, rendered **outside** the SPOTLIGHT BOARD section. |

## 4. HIGHLIGHT KUDOS — carousel and pagination

| # | Rule | Why |
|---|---|---|
| F13 | The carousel track carries `role="group"`. Its **direct children** are one element per record in the currently filtered highlight set (≤ 5) — never padded, never duplicated. | `[role="group"] > *` is counted and every child is asserted to contain the clicked hashtag |
| F14 | The page indicator is its own element whose entire text matches `/^\d+\/5$/` on first load — i.e. `"1/5"`, digits and slash only, no surrounding text in the same element. Unfiltered highlight set is therefore **exactly 5 records**; format is `` `${page}/${total}` ``. | `text=/^\d+\/5$/` and `toHaveText(/^1\//)` |
| F15 | Paging is **one record per click**, pages 1..5 (four `next` clicks reach page 5), matching SM-001. | `next disabled on slide 5` clicks next 4× then asserts the indicator reads `5` |
| F16 | **Exactly one** button inside the HIGHLIGHT section may have an `aria-label` containing `prev` or `Previous`, and **exactly one** containing `next` or `Next`. The frame draws two arrow pairs (defect #5); both are built and both drive SM-001, but only the 48 px pagination pair gets those labels — e.g. `aria-label="Previous slide"` / `"Next slide"`. The 80 px overlay pair uses Vietnamese labels containing none of those four substrings (e.g. `aria-label="Lùi một thẻ Kudos"` / `"Tiến một thẻ Kudos"`). | `.click()`, `toBeVisible()` and `toBeDisabled()` are all strict — two matches is a hard error |
| F17 | Both arrows use the real `disabled` attribute at the ends (page 1 → prev disabled, page 5 → next disabled), synchronised across both pairs. | `toBeDisabled()` |
| F18 | Inactive side cards are dimmed **only** by the frame's two `#00101A → transparent` gradient overlay frames (`2940:13469`, `2940:13467`). No invented `opacity`, `scale`, `filter` or `blur`. | clarifications, defect #7 |

## 5. Filter dropdowns

| # | Rule | Why |
|---|---|---|
| F19 | Built on the existing `components/ui/dropdown-menu.tsx` following the `components/ui/language-switcher.tsx` idiom. Options are `<button type="button" role="menuitem">`. No second dropdown primitive. | tests locate `[role="option"], [role="menuitem"]` page-wide; DRY |
| F20 | The two triggers **always** contain the literal text `Hashtag` and `Phòng ban` respectively, even after a value is selected. Render the selection as a suffix inside the same button (e.g. `Phòng ban: CEVC10`) — never replace the label. | `button:has-text("Phòng ban")` is re-clicked in a loop **after** a selection has been made |
| F21 | Option order is data order from `lib/kudos/filters.ts` and is **static** — never narrowed by the other filter's current value. Selecting an option **replaces** that filter's value (single-select), and the clear item (`Tất cả`) is the **last** item in each menu. | the empty-state test walks `options.nth(i)` for a fixed `deptCount` captured before the loop |
| F22 | Options render only while their menu is open — no permanently-mounted `role="menuitem"` anywhere on the page. `Escape` closes the menu (already true of the primitive). | `page.locator('[role="option"], [role="menuitem"]').first()` is page-wide |
| F23 | One shared filter state, owned above both regions (`components/kudos/kudos-board.tsx`), resets the carousel to page 1 and the feed to its first batch on every change (BR-003, DEC-001). | `toHaveText(/^1\//)` after a hashtag click |
| F24 | Hashtags inside a card are individual `<button>` elements whose text starts with `#` (the frame draws one text blob; splitting it is required by FR-009/B.4.3/C.3.7). Clicking one sets the hashtag filter. | `button:has-text("#")` |

## 6. Kudos cards, hearts, Copy Link, toast

| # | Rule | Why |
|---|---|---|
| F25 | Feed cards are `<article>` elements. Highlight cards are the `role="group"` children (also `<article>`, but in a different section). | `div[role="article"], article` scoped per section |
| F26 | The heart button's `aria-label` always contains the lowercase substring `like` — e.g. `Thả tim kudos này (like)` / `Bỏ tim kudos này (like)` / `Không thể like kudos của chính bạn`. Disabled state uses the real `disabled` attribute. `aria-pressed` reflects the liked state. | `button[aria-label*="heart"], button[aria-label*="like"]`, `[disabled]`, `:not([disabled])`, `aria-pressed` |
| F27 | **The heart button's entire text content is the count digits and nothing else.** The icon is an `<img alt="">`; the accessible name comes from `aria-label`; no `sr-only` text inside the button. | `parseInt(await button.textContent())` must equal the count, then `count + 1` |
| F28 | **Heart counts render as plain integers with no thousands separator.** `parseInt("1.000") === 1`, so the frame's verbatim `1.000` cannot survive `count + 1` arithmetic. Seed counts stay in the 10–999 band so the question never arises, and no formatting helper is written (KISS). Recorded as design defect #19. | `expect(countAfterFirst).toBe(initialCount + 1)` |
| F29 | Heart state is per-`(viewerId, kudosId)` React state; a second click removes the like and returns the count to its seed value exactly (BR-001). Own-kudos hearts are disabled (BR-002). | toggle test |
| F30 | `Copy Link` buttons carry the literal visible text `Copy Link`. Click writes the clipboard inside `try/catch` and shows a toast whose text is exactly `Link copied — ready to share!` (em dash). A rejected clipboard permission must not throw an unhandled rejection and must not show the toast (BR-007). | `button:has-text("Copy Link")`, `text=Link copied — ready to share!` |
| F31 | Feed (post) cards have 5 attachment thumbnails and **only** `Copy Link`. Highlight cards have **no** attachment row and **both** `Copy Link` and `Xem chi tiết`. The right-hand highlight card gets its receiver badge and `Xem chi tiết` label rendered (defect #17 — an addition the frame clips away). | design §3.3, §5.3 |
| F32 | **At most one element with `role="tooltip"` may exist in the DOM at any moment.** Every tooltip — spotlight hover, star-tier (BR-005) — is conditionally mounted only while hovered/focused. | `page.locator('[role="tooltip"]')` is strict and page-wide |

## 7. SPOTLIGHT BOARD

| # | Rule | Why |
|---|---|---|
| F33 | The count label element's text is exactly `388 KUDOS`. | `text=388 KUDOS` |
| F34 | The board search input carries `maxLength={100}` (attribute value `"100"`) and a placeholder containing `Tìm kiếm` — the verbatim `"Tìm kiếm "` with its trailing space. It is the **only** input inside this section. | `getAttribute('maxlength') === '100'` |
| F35 | Each word-cloud name renders as `<button type="button" role="button" title={name} …>`. The explicit `role` is deliberate: the frozen locator `[role="button"]` matches the **attribute**, not the tag name, so a bare `<button>` would not be found. No `[title]` or `[role="button"]` element may precede the cloud nodes inside this section. | `[role="button"], span[title], div[title]` → `.first()` must be a name node with non-empty text |
| F36 | Hovering a cloud node mounts one `[role="tooltip"]` containing that node's name (plus the time, per B.7). | `toContainText(nodeName)` |
| F37 | **No Pan/Zoom control is rendered anywhere** (FR-012, SC-007, clarifications second pass). See C1. | — |
| F38 | Name positions come verbatim from the 106-row coordinate table in `design/kudos-content.md` §4.7, board-relative (`relX`/`relY`, origin 142,1658), scaled to the container. No word-cloud library, no recomputed layout. | — |

## 8. Sidebar

| # | Rule |
|---|---|
| F39 | The five stat labels each sit in their own element with exactly this text (`text=` matching is whitespace-normalised substring, so each must be unique and appear once): `Số Kudos bạn nhận được:`, `Số Kudos bạn đã gửi:`, `Số tim bạn nhận được:`, `Số Secret Box bạn đã mở:`, `Số Secret Box chưa mở:`. |
| F40 | The leaderboard heading is a **single text node** containing a real newline — `{'10 SUNNER NHẬN QUÀ\nMỚI NHẤT'}` with `whitespace-pre-line`. **Not** `<br/>`: with a `<br/>` the element's textContent loses the whitespace and `text=10 SUNNER NHẬN QUÀ MỚI NHẤT` no longer matches. |
| F41 | Frame is truth: 5 stat rows (not 6), one leaderboard (not two), 5 rows (not 10), all five stat values `25`, button label `Mở Secret Box` (not `Mở quà`). Leaderboard names keep their trailing space. |

## 9. Empty states

| # | Rule |
|---|---|
| F42 | When the shared filter matches nothing, **both** the HIGHLIGHT and the ALL KUDOS sections render the literal `Hiện tại chưa có Kudos nào.` — one empty and one stale list fails the test. |
| F43 | The leaderboard empty state is `Chưa có dữ liệu`. Not reachable through the UI on static data (TC `d662780b`), so the choice lives in a **pure helper in `lib/kudos/leaderboard.ts` unit-tested by `lib/kudos/leaderboard.test.ts`** under `playwright.unit.config.ts`; the component renders whatever the helper returns. |

## 10. Seed-data contract (`lib/kudos/kudos-records.ts`)

Recombined from real frame vocabulary only — the 7 word-cloud names, the 4 badge tiers
(`New Hero`, `Rising Hero`, `Super Hero`, `Legend Hero`), the two verbatim department spellings
(`CEVC10` on post-card-derived records, `CECV10` on highlight-derived records — defect #15,
both kept), the two hashtags (`#Dedicated`, `#Inspring`), the category `IDOL GIỚI TRẺ`.
Reveal batch **B = 4** (the frame draws four post cards).

| # | Constraint | Test it satisfies |
|---|---|---|
| S1 | Exactly **5** records form the unfiltered highlight set (top 5 by heart count) → indicator denominator is `5`. Total records: **9**. | F14, `81446f61` |
| S2 | Heart counts are distinct integers in 10–999 so "most hearted" is a real ordering and no separator is ever formatted. | F28 |
| S3 | Filter vocabularies, in menu order: hashtags `['#Dedicated', '#Inspring', 'Tất cả']`, departments `['CEVC10', 'CECV10', 'Tất cả']`. | F21 |
| S4 | `#Dedicated` (hashtag option 1) is carried by **≥ 4** records → filtered feed count stays `4 = initialCount`. Same for `CEVC10` (department option 1). | `0e56cacb` asserts the count lands in `{initial, initial-1, initial-2}`; `159fed13` likewise |
| S5 | **No record carries both `#Dedicated` and `CECV10`.** That combination is the reachable empty state — found at `options.nth(1)` of the department menu, before the trailing `Tất cả`. | `926d92a5` |
| S6 | ≥ 1 record is sent by the mock viewer, and it sits **inside the first batch of 4 but not at position 1** — the toggle test clicks `heartButtons.first()`, which must be enabled, while the disabled-heart test needs ≥ 1 disabled **and** ≥ 1 enabled heart in the initially rendered feed. | `7a7ec63e`, `63645b03` |
| S7 | Every record carries ≥ 1 hashtag rendered as a button, and the first card's first hashtag is `#Dedicated`. | `d01729d4` |
| S8 | Verbatim whitespace preserved everywhere: `Huỳnh Dương Xuân Nhật `, `Huỳnh Dương Xuân `, `Mai phương Thúy `, `Tìm kiếm `, the leaderboard names, the double space in the hashtag line, the real `\n` in the D.3 title, the pill placeholder's 1 leading + 3 trailing spaces. Highlight and post cards keep their **two different** message-body strings (defect #13). | clarifications |

## 11. Conflicts Phase 1 must resolve (tester-owned)

| # | Conflict | Resolution |
|---|---|---|
| C1 | `e2e/kudos-board-layout.spec.ts:77-78` asserts a Pan/Zoom **button is visible**. The sealed contract says the control is **omitted entirely** (clarifications second pass, FR-012, SC-007, defect #7). | Delete those two lines. This is contract alignment, not weakening: the assertion demands something the design does not contain and the spec forbids rendering. No implementation can satisfy both. |
| C2 | The three `kudos-board-*.spec.ts` files match **no dedicated project** in `playwright.config.ts`, so they fall through the `prelaunch-gate` lookahead onto **port 3000**, where `NEXT_PUBLIC_EVENT_START_AT` is future-dated and `lib/prelaunch/gate.ts:19` `ALWAYS_ALLOWED = ['/login','/auth/callback']` does not include `/kudos` → every `page.goto('/kudos')` 307s to `/prelaunch`. The recorded RED is therefore caused by a gate redirect, not by missing screen structure, which is **not a valid RED** under the `e2e-red-first` rule. | Add a `kudos-board` project on `http://localhost:3200` (the past-dated, gate-open server) and add `\|.*kudos-board` to the `prelaunch-gate` negative lookahead — exactly the `awards-page` precedent. Do **not** touch `ALWAYS_ALLOWED`. Then re-run and record the corrected RED. |
| C3 | TC `d662780b` (empty leaderboard) has no UI route on static data. | Stays out of E2E; covered by the pure helper unit test in F43. |
| C4 | TC `cac4b7a3` (Pan/Zoom) and `71b3ef43` (auth redirect) stay unasserted. `31936b72` (special-day heart multiplier) is not implementable — no admin configuration surface exists. | Recorded, not built. |

---

## 12. Integration contract (A ↔ B seam, frozen before either track starts)

| Module (owner phase) | Export | Shape | Consumed by |
|---|---|---|---|
| `lib/kudos/kudos-records.ts` (3) | `KudosRecord`, `KUDOS_RECORDS` | `id, senderId, senderName, senderDept, senderBadge, senderKudosReceived, receiverId, receiverName, receiverDept, receiverBadge, receiverKudosReceived, category, message, hashtags[], attachments[], heartCount, timestamp, variant: 'highlight' \| 'post'` | 4, 5, 7 |
| `lib/kudos/kudos-queries.ts` (3) | `KudosFilter`, `matchesFilter`, `filterRecords`, `highlightTop5` | pure; `highlightTop5` = filter → sort `heartCount` desc → take 5 | 5, 7 |
| `lib/kudos/filters.ts` (3) | `HASHTAG_OPTIONS`, `DEPARTMENT_OPTIONS`, `CLEAR_OPTION_LABEL` | static, ordered per S3 | 5 |
| `lib/kudos/spotlight-names.ts` (3) | `SpotlightNode`, `SPOTLIGHT_NODES`, `SPOTLIGHT_TOTAL_LABEL`, `SPOTLIGHT_TICKER_LINE` | 106 rows `{ id, name, relX, relY, fontSize, highlighted }`; board box 1157×548 | 6 |
| `lib/kudos/leaderboard.ts` (3) | `LeaderboardEntry`, `LEADERBOARD`, `leaderboardOrEmpty()` | pure helper → rows or the `Chưa có dữ liệu` sentinel (TC `d662780b`) | 7 |
| `lib/kudos/viewer-stats.ts` (3) | `VIEWER_STATS`, `STAT_ROWS` | 5 labelled rows, all `25` (defect #3) | 7 |
| `lib/kudos/star-tiers.ts` (3) | `starTierFor(kudosReceived)` | `{ stars: 0..3; tooltip: string }`, thresholds 10/20/50 (BR-005) | 4 |
| `lib/session/session-provider.tsx` (3) | `SessionState` **extended additively** with `userId`, `displayName` | `role`/`unreadCount` byte-unchanged; SECURITY NOTE extended | 4, 7 |
| `components/kudos/kudos-card.tsx` (4) | `KudosCard` | `({ record, variant, viewerId, onHashtagClick }) => JSX` | 5, 7 |
| `components/kudos/kudos-card-actions.tsx` (4) | `KudosCardActions` | `({ record, viewerId, showDetailButton, onCopied }) => JSX` — owns heart state + clipboard | 4 |
| `components/kudos/kudos-toast.tsx` (4) | `KudosToast` | `({ message }) => JSX \| null`, single instance mounted by the shell | 5 |
| `components/kudos/kudos-board.tsx` (5) | `KudosBoard` | `'use client'`; owns the one shared `KudosFilter` + the toast (DEC-001, BR-003) | `app/kudos/page.tsx` (5) |
| `components/kudos/all-kudos-feed.tsx` (7) | `AllKudosFeed` | `({ filter, viewerId, onHashtagClick, onCopied }) => JSX` — owns `revealedCount` (SM-002) | 5 |
| `components/kudos/kudos-sidebar.tsx` (7) | `KudosSidebar` | `() => JSX` — renders the `<aside>` with stats + leaderboard | 5 |
| `components/kudos/spotlight-board.tsx` (6) | `SpotlightBoard` | `() => JSX` — owns its own search term; no shared filter | 5 |
