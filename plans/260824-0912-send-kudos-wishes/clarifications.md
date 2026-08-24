# Clarifications — Gửi lời chúc Kudos (`/kudos/send`)

**Screen:** Gửi lời chúc Kudos
**MoMorph:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/JsTvi8KVQA
**fileKey:** `9ypp4enmFmdK3YAFJLIu6C` · **screenId:** `JsTvi8KVQA` · **figma node:** `1612:5056`
**testPolicy:** `e2e-red-first`

**Source data — read this before trusting any "the spec says" claim below.**
The target frame `JsTvi8KVQA` has **zero spec items and zero test cases** of its own
(`spec_status: none`). Its single child is an INSTANCE of the component frame
**`ihQ26W78P2` "Viết Kudo"** (`spec_status: done`), which carries **26 spec items (all rows
`completed`) and 57 test cases** — that is the authoritative behavioural source for this screen.
Two further frames were read for vocabulary:

| Frame | screenId | What it supplied |
|-------|----------|------------------|
| Viết Kudo | `ihQ26W78P2` | 26 specs (A–H.2), 57 test cases (ID-0 … ID-56) |
| Dropdown list hashtag | `p9zO-c4a4x` | 10 specs — the hashtag vocabulary and its toggle/disable rules |
| Dropdown list người nhận muốn gửi lời chúc | `QIMJNgFb8K` | **no specs** — recipient dropdown behaviour comes from `ihQ26W78P2` row B only |

**Prior context:** builds on `plans/260818-0936-homepage-saa/`,
`plans/260819-0913-countdown-prelaunch/`, `plans/260819-1432-login-supabase-auth/`,
`plans/260820-1020-award-system-page/` and `plans/260821-1029-kudos-live-board/`. Their
`clarifications.md` files remain authoritative for everything they settled — those decisions are
inherited, not re-asked. In particular this run **is** the "real persistence" item the Kudos Live
board run recorded under its Next Steps, taken up only as far as the decisions below go.

---

## Session 2026-08-24

- Q: This repo has no application tables at all — every screen shipped so far runs on static modules
  in `lib/`, and `supabase/seed.sql` seeds only the login e2e auth fixture. How far should Supabase
  persistence reach for this screen? → A: **Write-only; the board is untouched.** A new `kudos` table
  (plus migration) receives real rows, and the send page may read back its own submission. `/kudos`
  keeps reading static `lib/kudos/` — rewiring the highlight ranking, spotlight cloud, leaderboard and
  viewer stats to the database is a separate feature. The seam is deliberate and is recorded under
  Known Consequences: **a kudos you send will not appear on the board.**
- Q: The request says "page", but the shipped submit pill on `/kudos`
  (`components/kudos/kudos-action-bar.tsx`) is a deferred dialog trigger carrying
  `aria-haspopup="dialog"` (FR-015 of the Kudos Live board run). Which shape wins? → A: **A real page
  at `/kudos/send`.** The pill changes from a read-only dialog-trigger input into a link, and the
  quick-action widget's "Viết Kudos" item (`components/layout/quick-action-widget.tsx`, currently
  `href="/kudos"`) is repointed at it. Deep-linkable and directly testable. This **supersedes** the
  earlier `aria-haspopup="dialog"` contract; that attribute must be removed, not left lying.
- Q: A real database write needs a trustworthy sender, but `role`/`userId` in
  `lib/session/session-provider.tsx` are a client-side mock anyone can edit from DevTools, and route
  protection has been deliberately deferred since the F011 login run. → A: **Require a real Supabase
  session.** `/kudos/send` redirects to `/login` when no Supabase session is present; the sender comes
  from `auth.users` and RLS policies key off `auth.uid()`. This is the first genuinely gated route in
  the app and it matches test cases **ID-0** (authenticated → form opens) and **ID-1** (unauthenticated
  → redirected to login). The mock session is **not** consulted for sender identity.
- Q: The design's Image field shows five 80×80 thumbnails with remove badges and "Tối đa 5"; Supabase
  Storage is enabled in `supabase/config.toml`. → A: **Upload to Supabase Storage.** A new bucket with
  policies; files upload on submit and the row stores their paths. Type validation follows the test
  cases: `.jpg`/`.png` accepted (ID-21, ID-22), `.pdf`/`.mp4`/`.txt` rejected with a format error
  (ID-23, ID-24, ID-55).
- Q: Test cases ID-27 … ID-33 assert the toolbar really formats text (bold, italic, strikethrough,
  numbered list, link, quote) and that `@name` opens a mention autocomplete. Implementing that fully
  means a new editor dependency — and because the board stays static, **nothing in the app renders a
  formatted kudos today.** → A: **Markdown-lite with a real toolbar.** A plain `<textarea>`; each of
  the six buttons transforms the current selection into markdown (`**bold**`, `*italic*`,
  `~~strike~~`, numbered lines, `[text](url)`, `> quote`). The value is stored as plain text — no
  stored HTML, so no sanitisation surface. `@name` remains a plain-text convention: **the mention
  autocomplete is deferred**, which leaves ID-12, ID-13 and ID-33 unassertable this run (recorded
  under Unresolved).
- Q: The hashtag dropdown spec says the vocabulary is loaded "dynamic từ DB", and `ihQ26W78P2` row B
  requires the recipient to be "a valid existing Sunner" — which needs a real id to store. → A: **Both
  become seeded tables.** A `hashtags` table seeded with the eight design values, and a `profiles`
  table seeded from the real Sunner names already transcribed into `lib/kudos/`. Recipient and hashtag
  selections are stored as real foreign keys, not free strings.
- Q: The target frame adds a required **Danh hiệu** field that appears in **no spec anywhere** —
  placeholder "Dành tặng một danh hiệu cho đồng đội", helper lines "Ví dụ: Người truyền động lực cho
  tôi." and "Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn." → A: **Required free text, max 100
  characters**, stored as the kudos `title`. The helper text reads as a user-authored phrase, so it is
  not constrained to the four badge tiers in `lib/kudos/star-tiers.ts`. Its required-ness comes from
  the `*` in the frame; its length cap is a decision made here, not a design fact.
- Q: `ihQ26W78P2` row H says the Gửi button "closes the modal when successful" — but this is a page,
  so there is no modal to close. → A: **Redirect to `/kudos` and show a success toast**, reusing the
  existing `components/kudos/kudos-toast.tsx`. The "Chúc mừng" frame (`SOzErYSp_S`) was **not** scoped
  into this run, so no on-page confirmation state is built.

---

## Behaviour taken directly from `ihQ26W78P2` (not re-asked)

These are spec/test-case facts, recorded so the implementation is not re-derived from the image:

- **Field order** (ID-3): Người nhận → textarea → Hashtag → Image → anonymous checkbox → footer.
  The target frame inserts **Danh hiệu** after Người nhận and the **Nickname ẩn danh** field after the
  checkbox; both are additions to the spec'd component.
- **Required fields:** Người nhận (B.2), message body (D), Hashtag min 1 / max 5 (E). Image is
  explicitly **not** required (F, `required: false`). Anonymous checkbox is **not** required (G).
- **Gửi button is disabled** until every required field is filled (H.2, ID-48, ID-49) — validation
  errors on click are additionally specified (ID-50 … ID-56: red border + "Không được để trống").
- **Hủy** is always enabled, discards everything, saves nothing (H.1, ID-45).
- **Anonymous checkbox defaults to unchecked** (ID-6); checking it reveals the nickname field,
  unchecking hides it (ID-43, ID-44). Note the frame image shows the *checked* state.
- **Image add button hides at 5** and reappears when one is removed (F.5, ID-19, ID-38, ID-40).
- **Hashtag vocabulary** (from `p9zO-c4a4x`), eight values, selected by toggling rows with a check
  icon — **not** free-text entry: `#High-perorming`, `#BE PROFESSIONAL`, `#BE OPTIMISTIC`,
  `#Be A Team`, `#THINK OUTSIDE THE BOX`, `#GET RISKY`, `#GO FAST`, `#WASSHOI`. At five selected,
  unselected rows are **disabled**.
- **Recipient field** (B, B.2): input 514×56px, 8px radius, border `#998C5F`, placeholder
  **"Tìm kiếm"**, dropdown arrow icon, autocomplete filtering as you type, input trimmed (ID-10).

## Design defects and discrepancies recorded (not silently resolved)

1. **`Danh hiệu` has no spec row in any frame** — it exists only as pixels in `JsTvi8KVQA`. Everything
   about it beyond "required free text titled by the user" is a decision, not a design fact.
2. **The recipient placeholder disagrees with the frame.** Spec B.2 says the placeholder is
   "Tìm kiếm"; the frame image shows a *filled* value, "Dương Huỳnh Xuân Nhật B". Treated as the filled
   state of the same control — the empty state uses the spec's placeholder.
3. **"Tiêu chuẩn cộng đồng" link has no spec row and no scoped destination.** It sits in the toolbar
   row (node `I1612:5057;3053:11619`) but `ihQ26W78P2` row C lists only the six format buttons. A
   frame for it exists (`xms7csmDhD`, iOS only) but was not scoped. Rendered as a focusable link with
   its destination deferred — the F013 "triggers real, destinations deferred" precedent.
4. **The 1.000 character cap is a frame fact with no spec backing.** The counter reads `0/1.000` in
   the image; spec D.1 mentions a counter but leaves `maxLength` empty. Implemented as a hard 1000
   cap.
5. **Spec C.3 mistypes the strikethrough button** as `others` / `decorative` while its own description
   says it toggles strikethrough. Treated as a real toggle, matching ID-29.
6. **Row E contradicts the hashtag dropdown spec.** E says "Nhập: tạo chip" (typing creates a chip);
   `p9zO-c4a4x` describes a fixed pick-list from the database with no text entry. The dropdown spec is
   more specific and wins — hashtags are picked, never typed.
7. **`#High-perorming` is misspelled in the design** (should presumably be "High-performing"), and the
   same misspelling already exists in the frame's chip row. Seeded verbatim; not silently corrected.
8. **Two frames share the name "Gửi lời chúc Kudos"** (`JsTvi8KVQA` and `RO7O6QOhfJ`). Only the
   requested `JsTvi8KVQA` is in scope.
9. **The design is self-contradictory about how validation is triggered.** Row `H.2` + ID-48/ID-49
   require the Gửi button to be DISABLED while a required field is empty; ID-7/ID-11/ID-14/ID-50 …
   ID-56 require CLICKING Gửi in that same state to raise the errors. A disabled button cannot be
   clicked. This is the most consequential defect found in the design — it is not resolvable by
   reading harder, only by choosing. Resolution recorded in Session 2026-08-24 (second pass):
   disabled button retained, validation on blur.
10. **Row E of `ihQ26W78P2` says the hashtag field accepts typing** ("Nhập: tạo chip") while the
    dedicated dropdown frame `p9zO-c4a4x` describes a fixed database pick-list with no text entry.
    Already recorded as defect 6 above; noted again here because it recurred during blueprint as a
    proposal to render the list inline. The dropdown-frame reading stands: picked, never typed, and
    opened by the `+ Hashtag` button.

## Session 2026-08-24 (second pass — found during blueprint, after the RED gate)

- Q: **The design contradicts itself on validation.** Spec row `H.2` and test cases ID-48/ID-49 state
  the Gửi button is DISABLED while any required field is empty. Test cases ID-7, ID-11, ID-14 and
  ID-50 … ID-56 state that CLICKING Gửi with an empty required field shows a red border and
  "Không được để trống". Both cannot hold: a disabled button cannot be clicked, and Playwright
  auto-waits for actionability, so four validation tests are unpassable as written. → A: **Keep the
  button disabled and validate on blur.** The disabled-button rule is the one already sealed by row
  H.2 and by decision 8's field contract, so it wins. Each required field renders its error on
  **blur** when left empty, and the form also validates on submit for the paths where Gửi is
  reachable (e.g. a field emptied after being filled). The four affected tests are corrected to blur
  the field rather than click a disabled button — this is a contradiction being resolved, NOT a test
  being weakened, and no assertion about the error message or the red border is dropped.
- Q: Should the hashtag pick-list render inline and always-visible? Six test sites click
  `[role="option"]` without opening anything first, which would need an always-open list. → A: **No —
  it is a dropdown opened by the `+ Hashtag` button.** The frame `JsTvi8KVQA` shows the list CLOSED
  (four chips plus the `+ Hashtag / Tối đa 5` button, no options visible), spec row E says
  explicitly *"Click '+ Hashtag': mở dropdown để thêm"*, and `p9zO-c4a4x` exists as a SEPARATE frame
  precisely because the open list is a separate state. The tests must click `+ Hashtag` first. An
  always-visible list would contradict the design to suit the tests, which is backwards.
- Q: The test data uses the recipient search string `'Thái Anh'` in five places, but only seven real
  Sunner names exist in `lib/kudos/` and none of them is "Thái Anh". → A: **Change the query string
  to `'Trang'`,** which matches seeded data. Inventing a profile to satisfy a test string would
  violate the standing "do NOT invent data" rule.
- Q: The success redirect assertion `toHaveURL(/\/kudos$/)` is anchored, so no query parameter may
  appear on the post-submit URL — but a Server Action `redirect()` is the obvious implementation. →
  A: **The Server Action returns a result instead of redirecting**; the client stores the toast
  signal in `sessionStorage` and navigates. Recorded because it reshapes the whole submit contract,
  and because the constraint came from a test rather than from the design.

**Assumptions made explicit for the unresolved items** (still unresolved in the design; these are
implementation decisions, not design facts): the Storage bucket is **private** (nothing renders
kudos images this run), the per-file cap is **5 MiB**, and `Hủy` navigates to **`/kudos`**.
Accepted caveat: if the row insert fails after images upload, those Storage objects are orphaned —
no compensating transaction this run.

## Session 2026-08-24 (third pass — copy fidelity, found during Track A forge)

- Q: The message textarea placeholder differs between sources. Frame `JsTvi8KVQA` renders
  *"Hãy gửi lời cảm ơn và ghi nhận đến đồng đội tại đây nhé!"*, while spec row `D` of `ihQ26W78P2`
  and test case ID-5 both give *"Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!"*
  ("gửi gắm", "cám ơn"). → A: **Follow the spec + test-case wording.** Two independent design
  sources agree against one frame rendering, and `ihQ26W78P2` is the frame this screen's behaviour
  is drawn from by the Source-data rule at the top of this file. Recorded as a design inconsistency
  for the designer to settle, not silently normalised.
- Q: The anonymous checkbox label was implemented as the short *"Gửi ẩn danh"* to satisfy the RED
  suite's substring locator `text=Gửi ẩn danh` (dom-contract D9). → A: **Wrong direction — restore
  the design's copy.** The visible label is *"Gửi lời cám ơn và ghi nhận ẩn danh"* in the frame
  image, in spec row `G` ("nhãn hiển thị 'Gửi lời cám ơn và ghi nhận ẩn danh'") and in test case
  ID-41. `"Gửi ẩn danh"` is the **Figma node NAME** of `I1612:5057;520:14099`, not user-visible text;
  a locator was built from the node name and then the product copy was bent to match the locator.
  Design is authoritative for copy (MoMorph critical rule 1) and tests are corrected to the design,
  never the reverse. The label is restored to the long form and the D9 locator is rewritten to target
  the checkbox by role and accessible name instead of a text substring — a substring match is what
  created the ambiguity in the first place, since the long label also contains "Gửi" and would
  collide with the Gửi button under loose text matching.

- Q: The add-image control renders `"Thêm ảnh"` (`sendKudos.imageAddButton`), following `dom-contract`
  D12 ("add button's visible text contains 'Thêm'"). The frame shows that affordance reading
  **"Image"** with **"Tối đa 5"** beneath it, exactly mirroring the `+ Hashtag / Tối đa 5` control. →
  A: **Restore `"Image"`.** `"Thêm"` appears nowhere in the design; D12 invented it, almost certainly
  to avoid a locator collision with the *"Image"* field label that sits to the left of the thumbnail
  row. That is the same mistake as the anonymous-label case — product copy bent to make a text
  locator unambiguous. The correct fix is a **structural** locator: D11 already guarantees exactly
  one `input[type="file"]`, so the add control is addressable without depending on its text at all.
  Third instance of this class in one run, which is why the rule below is stated as standing.

**Standing rule reaffirmed:** when a test locator and the design disagree about user-visible copy,
the copy wins and the locator is fixed. A test may constrain structure (what element, what role,
what order); it may not dictate what the product says to a user.

## Known consequences of the decisions above

- A kudos sent from this page **will not appear anywhere in the UI** — the board reads static data by
  decision 1. The submission is verifiable only in the database (or by the page reading back its own
  write).
- `/kudos/send` becomes the **first route in the app with a real auth gate**, sitting beside the
  still-mocked `role` used for header gating. Two identity systems now coexist; neither is being
  unified this run.

## Unresolved (recorded, not blocking)

1. **Mention autocomplete (ID-12, ID-13, ID-33) is deferred** by the editor decision. Those three test
   cases cannot be asserted this run.
2. **"Tiêu chuẩn cộng đồng" has no web frame** — only the iOS `xms7csmDhD`. Its destination stays
   deferred until a web frame exists.
3. **No spec defines behaviour when the recipient is the sender themselves.** Self-kudos is neither
   permitted nor forbidden by any row or test case. Not gated this run.
4. **No spec defines image size limits** — only file type. No byte cap is asserted; a practical limit
   is an implementation decision, recorded in the plan.
5. **The "Chúc mừng" frame (`SOzErYSp_S`) was never scoped** and may be the intended success state
   rather than the toast chosen in decision 8.

## Next Steps (out of scope for this run)

- Migrating the `/kudos` board surfaces (feed, highlight ranking, spotlight, leaderboard, viewer
  stats) onto the new tables, so sent kudos become visible.
- Mention autocomplete and a renderer for the stored markdown.
- Route protection for the remaining app routes, still deferred since the F011 login run.
- Like/heart persistence and the special-day multiplier, still carried forward from the F013 run.
- A mobile frame for this screen — the responsive behaviour is otherwise derived, not designed.
