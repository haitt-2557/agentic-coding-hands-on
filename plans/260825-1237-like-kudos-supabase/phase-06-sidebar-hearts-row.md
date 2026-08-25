# Phase 06 — Sidebar hearts row reads the real ledger

## Context Links

- [technical-spec.md](spec/like-kudos/technical-spec.md) — FR-008, SC-008
- [clarifications.md](clarifications.md) — decision 6 (this row only), Known Consequences 2 and 4
- [dom-contract.md](../260821-1029-kudos-live-board/dom-contract.md) — F39, F41
- Files: `lib/kudos/viewer-stats.ts`, `components/kudos/kudos-sidebar-stats.tsx`; label asserted by `e2e/kudos-board-layout.spec.ts:107`

## Overview

**Priority:** P2 · **Status:** done · **Effort:** ~0.75h
One of five sidebar numbers stops being a placeholder. The other four stay `25`, on purpose.

## Key Insights

- **Only the number this feature owns becomes true.** Clarifications decision 6 is explicit. Turning the other four real would mean inventing data the board cannot source, and Known Consequence 4 already records that the four will visibly disagree once the seam closes.
- **The label is asserted, the value is not.** `e2e/kudos-board-layout.spec.ts` checks all five label strings and nothing checks `25`, so changing the third value breaks no existing test. Verified before planning — do not change any label text.
- **The row's artwork is positional.** `HEART_ROW_INDEX = 2` drives the inline heart + `x2` graphic, the 80px value box and the divider underneath. Keep row order and array length exactly as they are; the frame's irregular layout is reproduced deliberately.
- **`STAT_ROWS` must become a function.** It is a module-level constant today, so a per-viewer value cannot flow through it. `buildStatRows(heartsReceived)` keeps the label order and text in one place (DRY) while making the third value a parameter.
- **`kudos-sidebar-stats.tsx` needs `'use client'`.** It is already inside the client bundle via `AllKudosFeed`, but it must declare the directive before it may call `useLikes()`. `kudos-sidebar.tsx` stays untouched — no prop passes through it.
- An unbridged viewer reads `0`, not `25` and not an error (edge-case row 13). Zero is the honest number: nobody has hearted a kudos they wrote, because the board has none of theirs.

## Requirements

- **FR-008** — the row "Số tim bạn nhận được:" shows the real weighted ledger for the signed-in viewer.
- The other four rows keep the static `25` placeholder.
- Logged-out or unbridged viewer → `0`.
- Non-functional: labels byte-identical; F39/F41 layout untouched; both files well under 200 lines.

## Architecture

```
lib/kudos/viewer-stats.ts
  VIEWER_STATS                      -> unchanged, still 25 for the other four
  buildStatRows(heartsReceived: number): StatRow[]   -> same 5 labels, index 2 = parameter
  (STAT_ROWS removed; every consumer goes through buildStatRows)

components/kudos/kudos-sidebar-stats.tsx ('use client')
  const { heartsReceived } = useLikes();
  const rows = buildStatRows(heartsReceived);
  … existing JSX, HEART_ROW_INDEX = 2 unchanged …
```

`heartsReceived` was already computed server-side in phase 03 (`heartsReceivedBySlug`) and carried by phase 04's provider — this phase adds no query.

## Related Code Files

**Modify:** `lib/kudos/viewer-stats.ts`, `components/kudos/kudos-sidebar-stats.tsx`
**Create:** none · **Delete:** none
**Not touched:** `kudos-sidebar.tsx`, `kudos-leaderboard.tsx`

## Implementation Steps

1. In `viewer-stats.ts`, replace the exported `STAT_ROWS` constant with `export function buildStatRows(heartsReceived: number): StatRow[]`, returning the same five rows in the same order with `value: heartsReceived` at index 2 and `VIEWER_STATS` values elsewhere.
2. Update the file header: FR-008 makes row 3 real; the remaining four stay design defect #3 placeholders per clarifications decision 6 and Known Consequence 4.
3. `grep -rn "STAT_ROWS" .` and update every consumer. If any non-sidebar consumer exists, it passes `VIEWER_STATS.heartsReceived` so its behaviour is unchanged.
4. Add `'use client'` at the top of `kudos-sidebar-stats.tsx`, import `useLikes` and `buildStatRows`, and build `rows` from the context value.
5. Leave `HEART_ROW_INDEX`, the artwork block, the 80px value box, the divider and every label string exactly as they are.
6. `npm run lint`, `npm run build`, then re-run `npx playwright test --project=kudos-board e2e/kudos-board-layout.spec.ts` to confirm the label assertions still pass.

## Todo List

- [x] `buildStatRows()` replaces `STAT_ROWS`, labels unchanged
- [x] All `STAT_ROWS` consumers migrated
- [x] `'use client'` added; `useLikes()` consumed
- [x] Artwork, indices, box widths and divider untouched
- [x] `kudos-board-layout.spec.ts` still green
- [x] Lint + build clean

## Success Criteria

- **SC-008** — with the fixture session and a known set of like rows on kudos authored by the viewer's slug, the row's number equals the weighted ledger total (proved in phase 07).
- Logged-out visitor sees `0` on that row and `25` on the other four.
- All five labels still render, in order, with the heart artwork on the third.
- No new database query is issued by this phase.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Row order or count changes → artwork lands on the wrong row | Low × High | `HEART_ROW_INDEX` and the array shape are frozen; layout spec re-run in this phase |
| A label edited while touching the file | Low × High | Labels are copied, not retyped; the layout spec asserts all five |
| Another `STAT_ROWS` consumer missed → build break | Med × Low | Step 3 greps for it explicitly |
| Sidebar shows `0` and reads as a bug | Med × Low | Documented as Known Consequence 2 and edge-case row 13; the value is honest |
| `'use client'` pushes something unexpected into the client bundle | Low × Low | The component is already client-rendered through `AllKudosFeed` |

## Security Considerations

- `heartsReceived` is the viewer's own aggregate, already sent to the client in phase 04. No other profile's total is exposed.
- The ledger derives from `kudos_likes` rows that are publicly readable anyway; the aggregate reveals nothing new.
- Reading it does not depend on the mock session, which remains non-authoritative.

## Next Steps

Runs in parallel with phase 05 and phase 07. Feeds phase 08's GREEN run.
