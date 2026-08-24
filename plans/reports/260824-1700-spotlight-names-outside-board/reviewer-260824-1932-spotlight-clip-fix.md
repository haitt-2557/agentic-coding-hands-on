# Review — spotlight names painting outside the SPOTLIGHT BOARD

## Scope
- Files: `components/kudos/spotlight-name-cloud.tsx`, `components/kudos/spotlight-board.tsx`, `e2e/kudos-board-layout.spec.ts`
- Lines: 107 changed (32 removed / 87+51+1 added, see diff --stat)
- Depth: full read of all three files, the data file (`lib/kudos/spotlight-names.ts`), the two sibling components sharing the board's coordinate space (`spotlight-search.tsx`, `spotlight-ticker.tsx`), `clarifications.md`, `dom-contract.md`, `playwright.config.ts`

## Assessment
Sound, minimal fix. Root cause (4/106 nodes with `relY` past `BOARD_HEIGHT`, no clip on the board) is correctly diagnosed and the fix — clip on an inner `absolute inset-0 overflow-hidden` layer, not the board container — is the right call given the tooltip is a sibling of that layer, not a child of it. Verified independently, not just re-stated from the handoff:

- `npx tsc --noEmit` — clean.
- `eslint` on all three changed files — clean.
- `npm run test:e2e -- kudos-board` — 19/19 pass, independently re-run.
- **Adversarial RED check**: `git stash`'d only `spotlight-name-cloud.tsx` (kept the `data-testid` fix in `spotlight-board.tsx` since without it the test errors on locator-not-found rather than testing anything), re-ran the regression test alone → real failure, naming exactly `Lê Kiều Trang, Nguyễn Văn Quy, Nguyễn Bá Chức, Nguyễn Hoàng Linh`. Popped the stash, `git diff --stat` confirmed byte-identical restoration. This is the strongest evidence in the review: the test fails for the right reason, not a config/harness accident, and it fails on precisely the four coordinates the root-cause analysis names.
- Visually compared the before/after screenshots — after-fix (1440px) shows a clean rounded box with the ticker text fully inside the border and no floating names below it.

## Critical
None.

## High
None.

## Medium

1. **`data-testid="spotlight-board"` is load-bearing for the regression test's failure mode, undocumented.** If someone strips the `data-testid` in a future refactor (it looks like a harmless, decorative addition — the file's own comment doesn't call out that the E2E regression test depends on it), the test degrades from "real failure naming the escaping nodes" to a 30s locator timeout that gives no signal about *what* regressed. Not a defect in this diff, but worth a one-line comment tying the attribute to the test that consumes it. `components/kudos/spotlight-board.tsx:59`.

## Suggestion / Low

1. **The regression test runs at the `kudos-board` project's default Desktop Chrome viewport (1280×720), not literally 1440.** The acceptance criterion reads "no spotlight name paints outside the board at 1440." The fix is viewport-size-independent (CSS `overflow: hidden` clips regardless of container width), and the 1440 screenshot in evidence corroborates it visually, so this isn't a functional gap — but the automated proof and the stated criterion don't quite line up on the literal number. No action needed beyond noting it; would be nice if a future pass captured the 1440 case as an automated assertion too, not just a screenshot. `e2e/kudos-board-layout.spec.ts:170`.
2. **The near-375px tooltip-clipping justification (code comment, `spotlight-name-cloud.tsx:56-59`) is architecturally sound but empirically untested** — no test or screenshot at the 375px floor demonstrates the specific scenario the comment invokes to justify clipping the inner layer instead of the container. This doesn't weaken the fix (inner-layer clipping is the safer choice regardless of whether that exact scenario materializes at 375px), so I'm not blocking on it. If the team wants the reasoning airtight rather than "structurally guaranteed to be at least as safe," a 375px capture would close the loop.

## Edge Cases Turned Up

- **Stacking order between the clip layer and `SpotlightTicker`**: `SpotlightTicker`'s `<p>` elements render *after* the clip layer in DOM order and default to `pointer-events: auto`. Several ticker lines (`relY` 410–505) geometrically overlap several name-cloud nodes. This was already true before this diff (the ticker was already a later sibling of the name nodes) — the fix does not change this relative order, so it's a pre-existing characteristic, not a regression. Flagging only because a reviewer scanning for "does the clip layer's stacking break anything" should know this particular interaction predates the fix.
- **Pointer-events restoration confirmed structurally, not just by test count**: the clip layer is `pointer-events-none` and sits *after* `SpotlightSearch` in DOM order (later paint = on top, same stacking context, no z-index). Because it's `pointer-events-none`, hit-testing over the search box correctly falls through to the input beneath. Each button re-asserts `pointer-events-auto` for itself, unaffected by the parent's `none`. The existing search (`9e689933`) and tooltip (`33ca8f8a`) tests both still pass, which is consistent with this reasoning holding at runtime.
- **`borderRadius: 'inherit'` correctness**: verified this is not a silent 0. `border-radius` is not a naturally-inherited CSS property, but the explicit `inherit` keyword is a universal CSS-wide keyword available on any property — it forces the child to take the *parent's computed value*, which the browser has already resolved from `cqw(47.14)` into an actual px number by the time the child reads it. The clip div is a direct child of the bordered container, so this resolves correctly, and `overflow: hidden` clips to the resulting rounded rect, not a rectangular bounding box. Confirmed visually in the after-fix screenshot (rounded corners intact, ticker text unclipped inside them).
- **Tooltip is structurally outside the clip subtree**: the tooltip `<div role="tooltip">` is a sibling of the clip layer inside the `SpotlightNameCloud` fragment (both become direct children of the bordered board container), not a descendant of the `overflow-hidden` div. So it is categorically un-clippable by this change regardless of viewport width — the 375px-floor scenario in the comment is the *motivation* for choosing this placement, not something the placement depends on to be correct.
- **No `data-testid` collision**: grepped the repo — `spotlight-board` is used nowhere else.
- **F35 (dom-contract.md)**: "no `[title]`/`[role=button]` element may precede the cloud nodes inside this section" — wrapping the 106 buttons in a div doesn't change document order relative to `SpotlightSearch` (which has neither attribute), so this contract is untouched.
- **106-node count and CSS variable scaling unaffected**: node positions are computed the same way (`% of BOARD_WIDTH/BOARD_HEIGHT`) against a wrapper that spans the identical box (`inset-0` on a `position: relative` ancestor) — no coordinate drift introduced.

## Done Well

- The code comment in `spotlight-name-cloud.tsx` explains *why* the clip sits on an inner layer and *why* `pointer-events-none`/`auto` is required — a reviewer six months from now doesn't have to reverse-engineer the reasoning.
- The regression test asserts **paint**, not layout, and explicitly documents why a `boundingBox()` check would be worthless here (`overflow: hidden` doesn't change bounding boxes). That's the correct test design for this specific class of bug, and it's rare to see the "why not the naive approach" reasoning written into the test itself.
- Chose not to invent a corrected `BOARD_HEIGHT` to make the geometry "work out" — respects the clarifications.md constraint against inventing visual values. The four clipped names are a data problem in the source design, not something CSS can or should paper over by resizing the container.
- Verified RED before GREEN with an actual failing run, not just a static claim.

## Actions In Order
1. (Optional, low-cost) Add a one-line comment on `components/kudos/spotlight-board.tsx:59` noting the `data-testid` backs the paint-regression test in `e2e/kudos-board-layout.spec.ts`, so a future refactor doesn't strip it blind.
2. (Optional) Capture a 375px viewport screenshot demonstrating the tooltip-would-be-clipped scenario, to make the architectural justification fully evidenced rather than logically sound-but-unobserved.

## Numbers
- Type coverage: n/a (no `any` introduced; `tsc --noEmit` clean)
- Test coverage: 1 new E2E test, independently verified RED (pre-fix, names exactly the 4 escaping nodes) → GREEN (post-fix); 19/19 `kudos-board` project, 122/122 full suite (reported, and `kudos-board` re-verified directly by this review)
- Lint findings: 0

## Still Unresolved
None blocking. Two low-severity suggestions above (viewport-literal mismatch in the acceptance criterion's wording, and the untested 375px tooltip scenario) are documentation/thoroughness nits, not defects.

**Status:** DONE
**Summary:** Fix is correct and the regression test genuinely detects the bug — independently reproduced RED naming the exact four escaping names, and GREEN with the fix restored. No critical or high findings; two low-severity suggestions noted for future hardening.
