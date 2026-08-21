---
phase: 6
title: "SPOTLIGHT BOARD region — 106-node cloud, search, tooltip, ticker"
owner: momorph-ui-implementer
status: complete
priority: P2
effort: 3h
feature: F013
test_policy: e2e-red-first
depends_on: [2, 3]
concurrent_with: [4, 5, 7]
mode: section
---

# Phase 6 — SPOTLIGHT BOARD region

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `MaZUn5xHXZ`, node `2940:13431`
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`dom-contract.md`](dom-contract.md) §7 (F33–F38), F32, §12 — **binding**
- [`design/kudos-content.md`](design/kudos-content.md) §4 in full — header, board box, count label, search pill, the empty Pan/Zoom node, the six ticker lines, the 106-row coordinate table
- [`spec/kudos-live-board/technical-spec.md`](spec/kudos-live-board/technical-spec.md) — US007, FR-010/011/012, BR-004, SC-007
- Phase 2 tokens (`--spotlight-highlight`, `--muted-text`) and artwork; Phase 3 `SPOTLIGHT_NODES`
- `AGENTS.md`: Next.js 16.3.1 — read `node_modules/next/dist/docs/` before writing code

## Overview

**Priority:** P2. **Status:** pending.

The one region that shares no state with anything else: a 1157×548 bordered board holding the
`388 KUDOS` label, a 100-character-capped search, six ticker lines, and 106 absolutely-positioned name
nodes laid out from the frame's own coordinates. It reads only `lib/kudos/spotlight-names.ts`, so it
runs in parallel with the card kit and both card-consuming regions.

## Key Insights

- **The Pan/Zoom control is omitted entirely.** Its design node `3007:17479` is a 30×30 frame with
  zero children — no icon, no fill, no text — and its behaviour was deferred in the first
  clarification pass. Shipping a visible dead button would be worse than the honest gap (FR-012,
  SC-007, defect #7). Phase 1 removes the assertion that expected one.
- **Cloud nodes must carry an explicit `role="button"`.** The frozen locator is
  `[role="button"], span[title], div[title]`, and CSS attribute matching does **not** match a bare
  `<button>` element by tag. The redundant role is deliberate and must be commented as such (F35).
- **Exactly one `role="tooltip"` may exist at a time** (F32). Render one shared tooltip element, or
  mount per-node conditionally — never 106 hidden tooltips.
- **No word-cloud library.** The 106 positions come verbatim from §4.7 as board-relative `relX`/`relY`
  against the 1157×548 box (origin 142, 1658). Recomputing the layout would discard the design.
- **Exactly one name is tinted** — `2940:14198` (`Nguyễn Hoàng Linh`, 11.34px) at `#F17676`. The other
  105 are white. Font sizes are four discrete values, not a scale to interpolate.
- The six ticker lines are the **same string** repeated at a 19px pitch (`3004:15995`–`15999` plus the
  original `2940:14230`). No spec row documents them; reproduce as drawn.
- `image 24` (`2940:14178`) carries no `background` URL in the design data — if Phase 2's audit found
  nothing to export, render nothing there rather than substituting artwork.

## Requirements

**Functional**
1. `spotlight-board.tsx` — the section: subtitle, divider, `<h2>SPOTLIGHT BOARD</h2>`, the full-bleed
   `#00101A` backdrop, the bordered board container (`1px #998C5F`, `radius 47.14px`), the two artwork
   layers, the `388 KUDOS` label, and the search + cloud + ticker children. Owns the search term.
2. `spotlight-search.tsx` — input with `maxLength={100}`, placeholder `"Tìm kiếm "` (trailing space
   intact), 16×16 search icon, `radius 46.404px`, `border 0.682px`, the frame's 10.92px/500 text.
3. `spotlight-name-cloud.tsx` — 106 absolutely-positioned nodes, each
   `<button type="button" role="button" title={name}>`; search term filters/highlights; hover or focus
   mounts the single tooltip.
4. `spotlight-ticker.tsx` — six lines, 14/20/700 `#FFF`, 565×23, x=191, 19px pitch.
5. No Pan/Zoom control anywhere in the region.

**Non-functional**
- Four files, each under 200 lines; the coordinate data stays in `lib/kudos/` (Phase 3), never inline.
- The board keeps its aspect and scales with its container down to 375px; no horizontal overflow.
- No new colour, radius or asset; Phase 2 owns those.
- Search matching is a plain case-insensitive substring — no debounce, no fuzzy library (YAGNI).

## Architecture

```
<section>
  subtitle · divider · <h2>SPOTLIGHT BOARD</h2>
  <div>  full-bleed #00101A backdrop (Rectangle 60, 1440×903)
    <div> board 1157×548, 1px #998C5F, r47.14  (position: relative; the cloud's coordinate space)
       ├─ artwork layers (image 25 screen-blend, Root further base under a rgba(0,0,0,.70) scrim)
       ├─ "388 KUDOS"            36/44/700 #FFF at rel (470, 14)
       ├─ SpotlightSearch        219×39 at rel (25, 26)     ← searchTerm state lives in the parent
       ├─ SpotlightNameCloud     106 × <button role="button" title>   absolute rel(X,Y)
       │     └─ one [role="tooltip"] mounted for the hovered/focused node only
       └─ SpotlightTicker        6 lines, rel y 410…505, pitch 19
```

Data flow: `searchTerm` (parent state) → `spotlight-name-cloud` → per node
`matches = term === '' || name.toLowerCase().includes(term.toLowerCase())`; non-matching nodes dim,
matching nodes highlight. The one frame-highlighted node keeps `#F17676` regardless of search state —
it is a design value, not a search result.

Positioning: `left: (relX / 1157) * 100%`, `top: (relY / 548) * 100%` with `font-size` scaled by the
same container ratio, so the cloud keeps its arrangement at every width. This is a rendering technique,
not an invented visual value — the numbers are the frame's.

## Related Code Files

**Create** — `components/kudos/{spotlight-board,spotlight-name-cloud,spotlight-search,spotlight-ticker}.tsx`.
**Modify** — none. **Delete** — none.
**Read for context** — `lib/kudos/spotlight-names.ts`, `design/kudos-content.md` §4,
`dom-contract.md`, `plans/260821-1029-kudos-live-board/design/asset-coverage.md` (Phase 2's verdicts).

## Implementation Steps

1. Read `design/kudos-content.md` §4 end to end, including the 106-row table, before writing anything.
2. Read Phase 2's `asset-coverage.md` to learn which of the three board artwork layers actually exist.
3. Build `spotlight-board.tsx`: the section, the backdrop, the board box, the artwork layers, the
   `388 KUDOS` label, and the `searchTerm` state.
4. Build `spotlight-search.tsx` with `maxLength={100}` and the verbatim placeholder (trailing space).
5. Build `spotlight-name-cloud.tsx`. Each node is
   `<button type="button" role="button" title={node.name} …>` with a comment citing F35 so the
   redundant role is not "cleaned up" by a later refactor. Position and scale per the ratio formula.
6. Add the single tooltip: `role="tooltip"`, mounted only while a node is hovered or focused,
   containing that node's name plus its time (B.7). Confirm no second tooltip can coexist (F32).
7. Build `spotlight-ticker.tsx` — six lines, same string, 19px pitch, as drawn.
8. Confirm by grep that no `pan`, `zoom`, or Pan/Zoom control exists anywhere in the region.
9. Responsive pass to 375px: the board scales, the cloud keeps its arrangement, nothing overflows.
10. `npx tsc --noEmit` and `npm run lint` on owned files; asset-coverage check.

## Todo List

- [ ] Four files created, each under 200 lines
- [ ] `<h2>` text exactly `SPOTLIGHT BOARD`
- [ ] `388 KUDOS` in its own element with exactly that text
- [ ] Search input `maxlength="100"`, placeholder `"Tìm kiếm "` with trailing space
- [ ] Search input is the only `input` inside this section
- [ ] 106 nodes rendered, all from `SPOTLIGHT_NODES`, none inline
- [ ] Each node `<button type="button" role="button" title>` with the F35 comment
- [ ] `2940:14198` tinted `#F17676`; the other 105 white
- [ ] Hover/focus mounts exactly one `[role="tooltip"]` containing the node's name
- [ ] Search filters and highlights; case-insensitive substring, no debounce
- [ ] Six ticker lines, same string, 19px pitch
- [ ] No Pan/Zoom control rendered (grep clean)
- [ ] 375px floor, no horizontal overflow
- [ ] `npx tsc --noEmit` + `npm run lint` clean; asset coverage verified

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| Board renders with total, search and a static cloud; no Pan/Zoom anywhere | `40d4ba26` + `d035e3b8` at Phase 8; grep finds no pan/zoom control | FR-010, FR-012, SC-007 |
| Search enforces the 100-character ceiling | `9e689933` green — `maxlength === '100'` and value ≤ 100 | FR-011, BR-004, SC-007 |
| Hover shows a tooltip carrying that node's name | `33ca8f8a` green | FR-011, SC-007 |
| Cloud fidelity | 106 nodes; positions match §4.7; exactly one `#F17676` | FR-010, SC-007 |
| Search filters and highlights | typing a partial name highlights matches, dims the rest | US007 AS3 |
| No invented visual value | every number traceable to §4 or a Phase 2 token | clarifications |
| Region is state-independent | no import of `KudosFilter`; parallel with 4/5/7 without conflict | plan file ownership |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| Cloud nodes rendered as bare `<button>` → the frozen locator finds nothing and the tooltip test fails | **High** × **High** | F35 mandates the explicit role, step 5 adds an in-code comment so a refactor cannot silently remove it |
| 106 hidden tooltips make `[role="tooltip"]` resolve to many → strict-mode error | Med × **High** | One conditionally-mounted tooltip (step 6); F32 applies app-wide |
| An element with `[title]` or `role="button"` precedes the cloud and becomes `.first()` | Med × High | Nothing before the cloud in this section carries either attribute; verified in step 8 |
| Someone renders a Pan/Zoom button "for completeness" | Med × High | FR-012 is a positive requirement to omit; step 8 is a grep gate |
| Percentage positioning distorts the arrangement at narrow widths | High × Med | Font size scales by the same ratio as position; visual check at 375/768/1440 in Phase 8 |
| Missing board artwork (`image 24` has no URL) is substituted with a guess | Low × Med | Step 2 reads Phase 2's verdict; "render nothing" is the accepted outcome |
| 106 absolutely-positioned buttons hurt interaction performance | Low × Low | Static nodes, no animation, no observers; measure at Phase 8 if it appears sluggish |

## Security Considerations

None new. Static fixture names, no user data, no persistence. The search input is capped at 100
characters and its value is used only for client-side substring matching — never injected into markup,
a URL or a query. Node click follows the deferred-detail decision and navigates nowhere.

## Next Steps

Runs in parallel with phases 4, 5 and 7. `SpotlightBoard` is consumed by Phase 5's shell; report the
export signature against [`dom-contract.md`](dom-contract.md) §12 when done.

## Out of scope

`lib/**`, `app/globals.css`, `public/**`, `app/kudos/page.tsx`, `e2e/**`,
`playwright.config.ts`, the card kit, the carousel, the feed, the sidebar, any Pan/Zoom behaviour
(TC `cac4b7a3` stays unasserted until a real interaction spec exists), and click-through to a kudos
detail page. `test_policy: e2e-red-first` — RED is proven in Phase 1; do not write, edit or run E2E
tests and do not claim GREEN. Use Figma design content as mock data source. Do NOT invent data.
