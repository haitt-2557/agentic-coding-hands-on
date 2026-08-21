# Phase 6 — SPOTLIGHT BOARD region

**Mode:** section · **Test policy:** e2e-red-first (RED already proven by tester per job card; this run implements against it, does not run or claim GREEN)

## What shipped

- `components/kudos/spotlight-board.tsx` (86 lines) — section shell: subtitle, divider,
  `<h2>SPOTLIGHT BOARD</h2>` (via `t('kudosPage.spotlightHeading')`), owns `searchTerm`
  state, renders the 1157×548 board (`border: 1px solid var(--border-accent)`,
  `border-radius: 47.14px` scaled via `cqw`), the `388 KUDOS` label
  (`SPOTLIGHT_TOTAL_LABEL`), and composes the three children below.
- `components/kudos/spotlight-search.tsx` (73 lines) — controlled `<input maxLength={100}>`
  with placeholder `t('kudosPage.spotlightSearchPlaceholder')` (`"Tìm kiếm "`, verbatim
  trailing space, sourced from the existing i18n dictionary key rather than retyped), 16×16
  inline search SVG using `currentColor` (rule 2a), border/radius/background from §4.4.
- `components/kudos/spotlight-name-cloud.tsx` (97 lines) — all 106 `SPOTLIGHT_NODES` render
  unfiltered as `<button type="button" role="button" title={node.name}>` (F35 comment
  included), positioned/sized by `relX/relY/fontSize` scaled through the board's `cqw`
  container-query unit. One shared `[role="tooltip"]` mounts only for the hovered/focused
  node id (F32). Search dims non-matches and tints matches with the existing `--accent`
  token; the one frame-highlighted node (`2940:14198`) always stays `--spotlight-highlight`
  regardless of search state.
- `components/kudos/spotlight-ticker.tsx` (48 lines) — six `SPOTLIGHT_TICKER_LINE` lines at
  the frame's 19px pitch, 14/20/700/`#FFF` via `text-white`.

No Pan/Zoom control is rendered anywhere; grep across the four files for `pan.zoom` /
`pan/zoom` / `panzoom` returns no match.

## Data traceability (design/kudos-content.md §4)

| Value | Source |
|---|---|
| Board 1157×548, border 1px `#998C5F`, radius 47.14px | §4.2 |
| `388 KUDOS` at rel(470,14), 36/44/700/#FFF | §4.3 (`SPOTLIGHT_TOTAL_LABEL` from lib) |
| Search 219×39 at rel(25,26), border 0.682px, bg `rgba(255,234,158,.10)` (= existing `--secondary-button-bg` token), radius 46.404px, placeholder 10.919px/500 | §4.4 |
| 106 node positions/fontSizes/highlight flag | §4.7, consumed verbatim from `lib/kudos/spotlight-names.ts` (Phase 3), never re-transcribed |
| Ticker relX 49 (191−142), relY 410/429/448/467/486/505, 14/20/700/#FFF | §4.6 |
| Highlight colour `#F17676` | existing `--spotlight-highlight` token |

## Known gaps recorded honestly, not papered over

1. **Board background artwork omitted.** `image 25` (`2940:14181`), `Root further mo rong 1`
   (`2940:14173`) are recorded (per the job card) as genuinely unfetchable via any MoMorph
   tool this run. `image 24` (`2940:14178`) carries no background URL in the design data at
   all. All three are rendered as nothing — the board's own border/radius sits over the page's
   `--background` ground, per clarifications ("render nothing rather than substitute").
2. **Tooltip carries the node's name only, not a time.** dom-contract.md F36 and spec B.7
   describe "name plus time" on hover, but `SpotlightNode` (the Phase 3 data contract this
   phase must consume, not re-author) has no per-node timestamp field — only `id, name, relX,
   relY, fontSize, highlighted`. Rendering a time would mean inventing data, which the job
   card and MoMorph rules forbid. The e2e success-criteria row for this test case
   (`33ca8f8a`) only requires `toContainText(nodeName)`, which the tooltip satisfies.
3. **Search box padding reconciled, not invented.** §4.4 records `padding: 16.378px 10.919px`
   on the 219×39 instance; the vertical figure doesn't reconcile with the stated height once
   the ~17px text row is added (looks extracted from a nested auto-layout node, not the outer
   instance). Rather than fabricate a corrected vertical number, vertical centering uses flex
   alignment (no numeric value invented) and only the horizontal figure (a real, reconcilable
   design value) is applied as `padding-inline`. Documented inline in
   `spotlight-search.tsx`.
4. **Some word-cloud relY values (555–593) exceed the 548px board height** in
   `lib/kudos/spotlight-names.ts` (rows near the end of the table). Rendered as given —
   position is percentage-of-container so those nodes sit slightly past the bottom edge; no
   coordinate was altered, since the frame's own numbers are authoritative and this phase
   does not own that data file.
5. **375px responsive floor is derived, not designed** (only the 1440 frame exists, standing
   gap #8 in clarifications.md). The board keeps its aspect ratio and the cloud/ticker/total
   label scale via `cqw` container-query units tied to the board's own inline size; header
   text (subtitle/h2) gets a modest fixed mobile size as a derived fallback since no mobile
   frame specifies one.

## Checks run

- `npx tsc --noEmit` — clean (no output).
- `npm run lint` — 2 pre-existing errors in tester-owned `e2e/kudos-board-feed-interactions.spec.ts` (not touched by this phase); 0 new errors/warnings on the four owned files.
- `npm run test:unit` — 93 passed, unchanged from baseline.
- `wc -l` on owned files: 86 / 73 / 97 / 48 — all under 200.
- `node -e` count against `lib/kudos/spotlight-names.ts`: 106 node rows, exactly 1 `highlighted: true`.
- `grep -in "pan.zoom\|pan/zoom\|panzoom"` across owned files: no match.
- `git status --porcelain` confirms only `components/kudos/` is new from this run; `lib/`, `app/globals.css`, `e2e/` changes pre-date this phase.

Not run (per phase boundary): the e2e suite itself — GREEN and all browser/visual evidence belong to Phase 8's tester.

**Status:** DONE
**Summary:** Built the four owned SPOTLIGHT BOARD components (board shell, search, 106-node
name cloud with shared tooltip, ticker) strictly from `lib/kudos/spotlight-names.ts` and
`design/kudos-content.md` §4, satisfying dom-contract.md F32–F38 (explicit `role="button"`,
single tooltip, `maxLength=100`, verbatim placeholder, exact `388 KUDOS`/`SPOTLIGHT BOARD`
text, no Pan/Zoom control). Typecheck, lint (no new issues), and unit tests all pass; no file
exceeds 200 lines; no file outside the assigned four was modified.
**Concerns/Blockers:** None blocking. Two honest gaps carried forward for Phase 8/reviewer
awareness: (1) tooltip shows name only, no time, because the data contract has no per-node
timestamp; (2) three background artwork layers are omitted per the confirmed asset gap. Both
are documented in-code and above rather than worked around with invented values.
