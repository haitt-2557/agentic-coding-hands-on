# Phase 7 — ALL KUDOS feed and sidebar

**Mode:** section
**Test policy:** e2e-red-first (RED evidence supplied by tester, read-only; not re-run here)

## Files created (exactly the owned list)

- `components/kudos/all-kudos-feed.tsx` (110 lines) — `AllKudosFeed({ filter, viewerId, onHashtagClick, onCopied })`. Client component (owns `revealedCount`/sentinel). Renders the `<section>` with subtitle, divider, `<h2>ALL KUDOS</h2>`, the two-column row (feed + `KudosSidebar`), progressive reveal (batch 4, guarded `IntersectionObserver`, disconnected on unmount/exhaustion), filter-driven reset derived during render (no effect flash), and the `Hiện tại chưa có Kudos nào.` empty state.
- `components/kudos/kudos-sidebar.tsx` (18 lines) — `KudosSidebar()`, the page's only `<aside>`, composes stats + leaderboard with `gap-6`.
- `components/kudos/kudos-sidebar-stats.tsx` (63 lines) — five verbatim stat rows from `STAT_ROWS`, the D.1.4 inline heart+`x2` artwork with the wider 80px value box, the divider, and the real `<button>Mở Secret Box</button>` (inert, focusable, no handler).
- `components/kudos/kudos-leaderboard.tsx` (59 lines) — `LEADERBOARD_TITLE` rendered as one text node with `whitespace-pre-line` (real `\n`, no `<br/>`), five rows from `LEADERBOARD` via `leaderboardOrEmpty()`, names untouched (no `.trim()`), and the drawn scroll-affordance rectangle.

No other file was touched. `components/kudos/kudos-card*.tsx`, `kudos-hashtag-row.tsx`, `star-tier-tooltip.tsx`, `kudos-toast.tsx`, `spotlight-*.tsx`, `kudos-board.tsx`, `kudos-banner.tsx`, `kudos-action-bar.tsx`, `kudos-filter-bar.tsx`, `highlight-carousel.tsx`, `app/kudos/page.tsx`, `site-header.tsx`, `site-footer.tsx` were only read, never edited.

## MoMorph calls

None made in this session — all needed geometry/copy/tokens were already captured in `design/kudos-content.md` §5–§6 and `dom-contract.md`. One targeted `get_node(MaZUn5xHXZ, "I2940:13497;186:1766")` was run to confirm the `Mở Secret Box` trailing icon has no distinct fill in the design data (it's an asset instance, not a vector) before deciding to render it via `<Image>` like the codebase's other static icons (`Pen.svg`, `Logo.png`) rather than inlining.

## Design evidence

- `design/kudos-content.md` §5.1–5.2 (header, layout), §5.3–5.4 (post-card container reused from Phase 4), §6.1–6.5 (sidebar stats, button, leaderboard, scroll affordance), §8 (token inventory).
- `dom-contract.md` §8 (F39–F41), §1 (F2, F4, F7, F25), §9 (F42), §12 (integration signatures).
- `clarifications.md` Sessions 2026-08-21 (progressive reveal, defects #1/#2/#3/#14).
- Existing code read for pattern reuse: `components/kudos/kudos-card.tsx`, `kudos-card-people.tsx`, `kudos-card-actions.tsx` (asset/icon conventions), `components/awards/award-category-nav.tsx` (guarded-observer idiom), `lib/kudos/{kudos-records,kudos-queries,viewer-stats,leaderboard}.ts`, `app/globals.css` (token confirmation), `public/saa/` listing (asset existence).

## Compile/typecheck

`npx tsc --noEmit` — clean, exit 0. No errors, including no unresolved-import errors against Phase 5's concurrent files (I do not import `kudos-board.tsx` or `app/kudos/page.tsx`).

## Lint

`npm run lint` — exit reported 2 errors, both pre-existing `prefer-const` in `e2e/kudos-board-feed-interactions.spec.ts:28-29` (tester-owned, not touched). Zero errors or warnings from any of the four owned files (confirmed separately via `npx eslint` scoped to just those four paths — clean).

## Unit tests

`npm run test:unit` — 93 passed, 0 failed. Unchanged from the stated baseline.

## Asset coverage

- `/saa/Heart.svg` — sidebar D.1.4 inline heart artwork (reused as-is; already downloaded by an earlier phase). Note: the design's node (`3241:14932`, 34×40, raster background-image) is not literally this file, but this project's `Heart.svg` is the only heart asset present and matches the frame's real red hue (`#D4271D`, the same value `kudos-card-actions.tsx` already uses for the liked heart state) — reused rather than invented.
- `/saa/Open_Gift.svg` — `Mở Secret Box` trailing icon, rendered via `<Image>` (static, non-interactive, matching the existing `Pen.svg`/`Logo.png` convention in `kudos-card.tsx`) rather than inlined, since the asset's own white fill is the exported value and nothing here needs to recolor it dynamically.
- `/saa/Avatar_Leaderboard.png` — the five leaderboard row avatars.
All three confirmed present on disk before use; none invented.

## Visual evidence

Not captured here — visual-contract screenshot comparison belongs to Phase 8's tester per the job card. No screenshots taken.

## RED evidence

Read-only, as instructed — not re-run:
- `redTestFiles`: `e2e/kudos-board-layout.spec.ts`, `e2e/kudos-board-interactions.spec.ts`, `e2e/kudos-board-feed-interactions.spec.ts`
- `redCommand`: `npm run test:e2e -- kudos-board`
- `redExitCode`: `1`
- `redFailure`: 18 failed / 0 passed (placeholder page renders no structure)
- Source: `plans/260821-1029-kudos-live-board/evidence/red-kudos-board.txt` (verified this file exists and matches the job card's summary)

## GREEN handoff

Phase 8's tester should rerun `npm run test:e2e -- kudos-board` once Phase 5 wires `AllKudosFeed`/`KudosSidebar` into `app/kudos/page.tsx` via `KudosBoard`. This phase's files alone do not make the suite green — Phase 5 (shell, filter state, header/footer) and Phase 6 (spotlight board) are concurrent dependencies for several of the 18 assertions (e.g. the header/footer/banner/spotlight tests). The tests this phase's work specifically targets:
- `40d4ba26` (sidebar stats + leaderboard heading, feed cards present)
- `7a7ec63e`, `63645b03` (heart toggle, own-kudos disable — composed via `KudosCard`)
- `0adfd7ce` (Copy Link + toast — composed via `KudosCard`)
- `926d92a5` (ALL KUDOS half of the empty-state test)

## Notable decisions worth flagging

1. **D.1.4 heart artwork approximation.** The design's exact raster asset (`image 35`, node `3241:14932`) is not `MM_MEDIA_`-named and was never exported by an earlier phase (per `design/kudos-content.md` §9, item 21, and clarifications defect #20's asset-resolution pass, which only resolved `New Hero`, the spotlight arrow, and the spotlight board layers — this specific heart icon was not on that list). I reused the project's existing `/saa/Heart.svg` (same red hue already used for the liked-heart state) rather than leaving the row without an icon or fabricating a new asset. Flagging this as a `DONE_WITH_CONCERNS`-worthy note rather than a silent substitution.
2. **Header block internal spacing (subtitle → divider → `<h2>`) is an approximated `gap-8` (32px).** `design/kudos-content.md` §5.1 gives absolute node positions for this sub-frame but does not declare it as an auto-layout frame with a stated `gap`, unlike §5.2's `Frame 502` (explicit `gap: 80px`) — so I derived a reasonable, round spacing value rather than inventing a false precision from the absolute-position arithmetic (which does not cleanly resolve to a round number). All colors, type sizes, and copy in that block are exact per §5.1.
3. **`onCopied` prop is accepted but unused**, matching the job card's explicit instruction not to mount a second `KudosToast` (Phase 4's per-card toast is the accepted single instance). This satisfies `dom-contract.md` §12's frozen `AllKudosFeed` signature for Phase 5's typed call site without creating a second toast consumer.

## Status

**Status:** DONE_WITH_CONCERNS
**Summary:** All four owned files implemented, composing Phase 4's `KudosCard` and Phase 3's data/query modules with no re-implementation of either. `tsc`, scoped `eslint`, and `npm run test:unit` are all clean; no owned file exceeds 200 lines; no file outside the owned list was edited.
**Concerns/Blockers:** One design-fidelity concession (D.1.4 heart icon reuses `/saa/Heart.svg` in place of the frame's un-exported raster asset) and one approximated non-color spacing value (header block internal gap) — both stated above with rationale, neither is a color, type, or copy invention. Full E2E GREEN cannot be claimed or attempted by this agent per test policy; several of the 18 RED assertions depend on Phase 5/6 work still in flight.
