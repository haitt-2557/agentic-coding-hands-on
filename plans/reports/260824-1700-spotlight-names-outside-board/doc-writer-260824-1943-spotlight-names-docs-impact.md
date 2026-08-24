# Docs impact — spotlight names painting outside the board

**Verdict: docs updated (small, surgical) — three files touched, none skipped that should have been.**

## What I read before writing anything

- `plans/260821-1029-kudos-live-board/clarifications.md` (full, 306 lines) — confirmed defects
  #1–#20 and the withdrawn item; none of them covers a name escaping the board's own bounds.
  Defect #20 (unfetchable background layers) is adjacent but distinct — it explains *why* the
  escape was invisible until now, not the escape itself.
- `docs/vi/features/kudos-live-board/technical-spec.md` (all 800 lines, two reads), `edge-cases.md`,
  `screens.md`, `screens/SCR008_KudosLiveBoard/spec.md`, `business-context.md`.
- Source: `components/kudos/spotlight-board.tsx` (95 lines), `components/kudos/spotlight-name-cloud.tsx`
  (120 lines), `lib/kudos/spotlight-names.ts` (137 lines, confirmed the four `relY` values 555/561/
  578/593 at lines 133–136 against `BOARD_HEIGHT = 548` at line 18), `e2e/kudos-board-layout.spec.ts`
  (confirmed the new regression test at lines 161–210, `data-testid="spotlight-board"` at
  `spotlight-board.tsx:67`).
- `docs/vi/generated/screen-list.md`, `docs/vi/system/architecture.md`, `docs/vi/system/overview.md`
  — grepped for "spotlight" to check System-layer impact.

## Changes made

### 1. `docs/vi/features/kudos-live-board/edge-cases.md` (18 → 19 lines)
Added one table row: a spotlight-board name whose design-data coordinate falls outside the board's
height is now clipped rather than painted below the box, no user-facing message. This is a
paint-behavior edge case, not a new FR/BR — no code fabricated.

### 2. `docs/vi/features/kudos-live-board/technical-spec.md` (799 → 799 lines, net-zero)
This file was one line under the 800 ceiling, so every edit swapped text in place rather than
appending:
- `Source Code References` table: `spotlight-board.tsx:1-86` → `1-95` (actual current length) plus
  a note that its `data-testid` is the regression test's hook; `spotlight-name-cloud.tsx:1-97` →
  `1-120` plus a note on the fix and a pointer to `edge-cases.md`.
- `### E2E` result line: `e2e 18/18; suite dự án 96/97 (1 fail có từ trước...); unit 93/93` →
  `e2e 19/19 (3 file kudos-board-*); suite e2e dự án 122/122; unit 127/127`, dated 2026-08-24. These
  numbers are the ones stated as verified in the task brief (evidence gate SEALED); the previously
  recorded pre-existing `login-auth-redirect` failure is gone from the current count, so I dropped
  that parenthetical rather than carry a stale caveat forward.
- Left the `## User Stories`, `## Key Entities`, and `## Assumptions` sections untouched — the fix
  changes no FR/BR contract, no entity shape, and no data assumption; US007's existing text ("word
  cloud tĩnh 106 tên") and `SpotlightNode`'s entity row are still accurate as written.

### 3. `plans/260821-1029-kudos-live-board/clarifications.md`
Added design defect **#21** under a new `### Added during bug fix (2026-08-24)` heading: the four
out-of-bounds nodes by id and `relY`, why Figma never surfaced it (the same unfetchable background
layers as defect #20), the fix taken (CSS clip, not an invented `BOARD_HEIGHT`), the visible
consequence (4/106 names now clipped from view), and the open question for the design owner
(move the nodes, or grow `BOARD_HEIGHT`). This is genuinely new — not a restatement of #20 — so it
gets its own number rather than folding into an existing entry.

## What I did not touch, and why

- **`docs/vi/generated/*`** — grepped `screen-list.md` (`SpotlightBoard`, `SpotlightSearch`,
  `SpotlightEntry` rows describing the component's existence and purpose, not its paint behavior).
  This fix adds no route, screen, entity, or feature; the existing rows are still accurate. No
  change needed, as anticipated in the brief.
- **`docs/vi/system/architecture.md` and `overview.md`** — both mention `/kudos` and the word cloud
  at a route/composition level ("SPOTLIGHT BOARD (word cloud 106 tên)"). A scoped CSS overflow fix
  doesn't change the route, the component tree, or the data source described there. Confirmed by
  reading the matching lines, not assumed.
- **`screens/SCR008_KudosLiveBoard/spec.md`** — its `## UI States` and `## Layout Regions` tables
  describe filter/reveal/heart states and region behavior, not per-node paint clipping at this
  granularity; adding a row here would duplicate `edge-cases.md` at a level of detail this file
  doesn't otherwise carry (e.g. it doesn't itemize which of the 106 nodes render where). Left as is.
- **`business-context.md`, `screens.md`, `US007` prose in `technical-spec.md`** — none describe the
  board's edges or claim all 106 names are always visible; nothing there is made false by the fix.
- **No new FR/BR/SC code was minted.** The fix is a rendering correctness change inside an already-
  loosely-specified area (US007/FR-010/FR-011 already carry several "design doesn't say" caveats);
  it doesn't add a new requirement, it closes a rendering gap the requirements didn't anticipate.

## Unresolved

None from this pass. The open question left for the design owner (move the 4 nodes vs. grow
`BOARD_HEIGHT`) is recorded in `clarifications.md` defect #21, same pattern as the file's existing
unresolved items.

**Status:** DONE
**Summary:** Added an edge-case row, made two net-zero-line factual corrections plus an updated
E2E result line in the near-ceiling `technical-spec.md`, and logged a new numbered design defect
(#21) in the plan's `clarifications.md`. No changes needed in `docs/vi/generated/*` or
`docs/vi/system/*` — confirmed by reading, not assumed.
**Concerns/Blockers:** None.
