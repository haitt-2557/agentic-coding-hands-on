---
phase: 7
title: "ALL KUDOS feed (progressive reveal) and sidebar (stats + leaderboard)"
owner: momorph-ui-implementer
status: complete
priority: P1
effort: 3h
feature: F013
test_policy: e2e-red-first
depends_on: [4]
concurrent_with: [5, 6]
mode: section
---

# Phase 7 — ALL KUDOS feed and sidebar

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `MaZUn5xHXZ`, node `2940:13431`
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`dom-contract.md`](dom-contract.md) §8 (F39–F41), §9 (F42–F43), F25, §12 — **binding**
- [`design/kudos-content.md`](design/kudos-content.md) §5 (feed layout, post cards) and §6 (sidebar, stat rows, `Mở Secret Box`, leaderboard, scrollbar)
- [`spec/kudos-live-board/technical-spec.md`](spec/kudos-live-board/technical-spec.md) — US003/US008/US009, FR-004/005/013/014/018, SM-002, SC-004, SC-008
- Phase 3 exports (`filterRecords`, `VIEWER_STATS`, `leaderboardOrEmpty`, `useSession()`); Phase 4 `KudosCard`
- `AGENTS.md`: Next.js 16.3.1 — read `node_modules/next/dist/docs/` before writing code

## Overview

**Priority:** P1. **Status:** pending.

The tallest region: a 680px feed column that reveals its cards progressively as the sentinel enters the
viewport (SM-002), beside a 422px sidebar holding five personal statistics, the `Mở Secret Box` trigger
and the five-row leaderboard. Both are consumed by Phase 5's shell and both read the shared filter or
the mock viewer, never their own copies.

## Key Insights

- **Reveal batch is 4** — the frame draws four post cards, and the seed contract's S4/S6 constraints are
  calibrated to that number. Changing it silently breaks `0e56cacb`, `159fed13` and `63645b03`, because
  those tests reason about the *rendered* card count.
- **`heartButtons.first()` must be enabled.** The viewer-sent record sits at feed index 1, so the feed
  must preserve `KUDOS_RECORDS` order — no re-sorting, no "newest first" reinterpretation.
- **Progressive reveal over a finite list, honestly**: `revealedCount` grows by one batch when the
  sentinel intersects and `revealedCount < filtered.length`, then stops. No fabricated pages, no
  synthetic loading delay, no spinner (clarifications).
- **Filter change resets the reveal** to the first batch of the new filtered list (SM-002 transition
  rules). The reset is driven by the shell's filter prop, not by a second local filter.
- **Frame is truth for the sidebar** (defects #1, #2, #3, #14): five stat rows not six, one leaderboard
  not two, five rows not ten, every value `25`, and the button reads `Mở Secret Box` — not the spec
  CSV's `Mở quà`.
- **The leaderboard title contains a real newline.** Render `{'10 SUNNER NHẬN QUÀ\nMỚI NHẤT'}` with
  `whitespace-pre-line`. A `<br/>` splits the text node and the frozen `text=` locator stops matching
  (F40).
- **TC `d662780b` is closed at the unit level** — `leaderboardOrEmpty()` from Phase 3. This component
  renders whatever the helper returns and adds no second empty-state branch.

## Requirements

**Functional**
1. `all-kudos-feed.tsx` — the section: subtitle, divider, `<h2>ALL KUDOS</h2>`, then the two-column
   `Frame 502` layout: the feed column and `KudosSidebar`. Owns `revealedCount` (SM-002) and the
   sentinel. Renders `KudosCard variant="post"` per revealed record and the F42 empty state.
2. `kudos-sidebar.tsx` — the `<aside>`, `gap 24`, composing the two blocks.
3. `kudos-sidebar-stats.tsx` — the 422×405 block (`1px #998C5F`, `#00070C`, `radius 17px`, `padding
   24`): five rows with the verbatim labels and value `25`, the D.1.4 inline heart + `x2` artwork, the
   `#2E3940` divider, and the `Mở Secret Box` button (374×60, `#FFEA9E`, `radius 8px`, trailing
   Open Gift icon) as a focusable trigger that opens nothing (FR-018).
4. `kudos-leaderboard.tsx` — the 422×504 block: the two-line centred title, five rows (64×64 avatar,
   name in 22/28/700 `#FFEA9E` keeping its trailing space, prize in 16/24/700 right-aligned `#FFF`),
   the 2×245 `#999999` scroll affordance, and the `Chưa có dữ liệu` state from the helper.

**Non-functional**
- Four files, each under 200 lines. No inline literal content.
- The `<h2>` text is exactly `ALL KUDOS`; the section must not nest another `<section>`.
- Two-column at 1440 → stacked single column with the sidebar **below** the feed under 1440px,
  375px floor, no horizontal overflow (derived — defect #8).
- `IntersectionObserver` guarded (`typeof IntersectionObserver === 'undefined'`) and disconnected on
  unmount, following `components/awards/award-category-nav.tsx`.

## Architecture

```
<section>   ← ALL KUDOS
  subtitle · divider · <h2>ALL KUDOS</h2>
  <div>  row, space-between, gap 80, padding 0 144
    <div> feed column 680px, gap 24
        filtered = filterRecords(KUDOS_RECORDS, filter)          ← prop from the shell
        filtered.slice(0, revealedCount).map(KudosCard variant="post")
        filtered.length === 0  →  "Hiện tại chưa có Kudos nào."
        <div ref=sentinel/>    →  revealedCount += 4   while revealedCount < filtered.length
    <aside> 422px, gap 24
        KudosSidebarStats      VIEWER_STATS + useSession().displayName · Mở Secret Box
        KudosLeaderboard       leaderboardOrEmpty(LEADERBOARD)
```

SM-002: `collapsed → revealing → exhausted`. `revealedCount` starts at 4; the sentinel is rendered only
while `revealedCount < filtered.length`, so `exhausted` is the absence of the sentinel rather than a
flag. A change in the `filter` prop resets `revealedCount` to 4.

Frozen geometry: post card `680×749`, `padding 40/40/16/40`, `radius 24px`, `background #FFF8E1`, no
border; five 88×88 thumbnails at 104px pitch, `1px #998C5F`, `#FFF`, `radius 18px`; dividers 1px
`#FFEA9E`; sidebar blocks at (874, 2530) and (874, 2959); stat labels 22/28/700 right-aligned `#FFF`,
values 32/40/700 `#FFEA9E`; the D.1.4 value box is 80px wide, not 46px.

## Related Code Files

**Create** — `components/kudos/{all-kudos-feed,kudos-sidebar,kudos-sidebar-stats,kudos-leaderboard}.tsx`.
**Modify** — none. **Delete** — none.
**Read for context** — `components/kudos/kudos-card.tsx` (Phase 4),
`lib/kudos/{kudos-queries,viewer-stats,leaderboard}.ts`, `lib/session/session-provider.tsx`,
`components/awards/award-category-nav.tsx` (the guarded-observer idiom), `design/kudos-content.md`
§5–§6, `dom-contract.md`.

## Implementation Steps

1. Read `design/kudos-content.md` §5 and §6 in full, then `components/awards/award-category-nav.tsx`
   for the observer idiom this repo already uses.
2. Build `all-kudos-feed.tsx`: header, two-column layout, `revealedCount` starting at 4, the sentinel,
   the `KudosCard variant="post"` map in `KUDOS_RECORDS` order, and the empty state.
3. Wire the reset: when the `filter` prop changes, `revealedCount` returns to 4. Prefer deriving from a
   key/prop over an effect so there is no post-mount flash.
4. Build `kudos-sidebar.tsx` as the `<aside>` shell — the only `<aside>` on the page.
5. Build `kudos-sidebar-stats.tsx` with the five verbatim labels, each in its own element and each
   appearing exactly once (F39). Reproduce the D.1.4 inline heart + `x2` artwork and its wider value box.
6. Add `Mở Secret Box` as a real focusable `<button>` that opens nothing (FR-018). Frame label wins over
   the spec CSV's `Mở quà` (defect #2).
7. Build `kudos-leaderboard.tsx`. Title as one text node with a real `\n` plus `whitespace-pre-line`
   (F40). Names keep their trailing space. Render the 2×245 scroll affordance as drawn.
8. Empty state comes from `leaderboardOrEmpty()`; add no second branch.
9. Responsive: stack to one column with the sidebar below the feed under 1440px; verify 375px.
10. `npx tsc --noEmit` and `npm run lint` on owned files; asset-coverage check (thumbnails, avatars,
    open-gift, sidebar heart).

## Todo List

- [ ] Four files created, each under 200 lines
- [ ] `<h2>` text exactly `ALL KUDOS`; no nested `<section>`
- [ ] Feed cards are `<article>` (from `KudosCard`), in `KUDOS_RECORDS` order, not re-sorted
- [ ] `revealedCount` starts at 4 and grows by 4 on sentinel intersection
- [ ] Sentinel absent once exhausted; no synthetic delay, no spinner, no fake page
- [ ] Filter change resets the reveal to the first batch
- [ ] `Hiện tại chưa có Kudos nào.` rendered when the filtered list is empty
- [ ] Sidebar is the page's only `<aside>`
- [ ] Five verbatim stat labels, each unique and once; all values `25`
- [ ] D.1.4 inline heart + `x2` artwork and 80px value box reproduced
- [ ] `Mở Secret Box` focusable, opens nothing
- [ ] Leaderboard title is one text node with a real `\n` + `whitespace-pre-line`
- [ ] Five rows, names keep trailing space, prize text right-aligned; scroll affordance drawn
- [ ] Empty state comes only from `leaderboardOrEmpty()`
- [ ] Observer guarded and disconnected on unmount
- [ ] Stacked layout under 1440px, sidebar below feed, 375px floor
- [ ] `npx tsc --noEmit` + `npm run lint` clean; asset coverage verified

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| Feed cards carry all information groups | `40d4ba26` green at Phase 8 | FR-005, SC-001 |
| Progressive reveal works and stops | `d035e3b8` / manual scroll: cards appear, sentinel disappears when exhausted | FR-004, SM-002, SC-004 |
| Heart ownership pair observable in the first batch | `63645b03` green — ≥1 disabled and ≥1 enabled heart | BR-002, SC-005 |
| First heart in the feed is clickable | `7a7ec63e` green | BR-001, SC-005 |
| Copy Link works from a feed card | `0adfd7ce` green | FR-007, SC-006 |
| Empty state in the feed | `926d92a5` green (with Phase 5's highlight half) | SC-003, F42 |
| Sidebar shows five stats and five leaderboard rows | `40d4ba26` green; five labels + the title visible | FR-013, FR-014, SC-008 |
| Leaderboard empty state proven | `lib/kudos/leaderboard.test.ts` green (Phase 3) | TC `d662780b`, SC-008 |
| `Mở Secret Box` reachable and inert | keyboard focus lands; no dialog, no navigation | FR-018, SC-009 |
| No invented visual value | every number traceable to §5–§6 or a Phase 2 token | clarifications |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| Reveal batch changed from 4 → the count-arithmetic filter tests fail for a reason no one connects to this file | Med × **High** | Batch 4 is stated here and in S4/S6; a comment in the component cites the seed contract |
| Feed re-sorted (e.g. newest first) → `heartButtons.first()` lands on the disabled own-kudos card | Med × **High** | Order is `KUDOS_RECORDS` order, explicitly; S6 fixes the viewer record at index 1 |
| `<br/>` used in the leaderboard title → the frozen `text=` locator stops matching | **High** × High | F40 and step 7; the real `\n` plus `whitespace-pre-line` is the only accepted form |
| A second `<aside>` appears (e.g. wrapping the ticker) → `.first()` picks the wrong one | Low × Med | Only this phase renders an `<aside>`; stated in the ownership table |
| A stat label duplicated or split across elements → `text=` resolves to 2 or 0 | Med × High | F39; each label is one element, verified by grep |
| `IntersectionObserver` fires repeatedly and over-reveals in one scroll | Med × Med | Guard on `revealedCount < filtered.length` inside the callback; unobserve when exhausted |
| Reset-on-filter implemented as an effect → a visible flash of stale cards | Med × Low | Derive from the prop/key instead of an effect (step 3) |
| Sidebar `sticky` fights the tall feed at narrow widths | Med × Low | `sticky` only in the two-column layout; static when stacked |

## Security Considerations

Read-only region: no writes, no API, no persistence. The sidebar reads the mock viewer's display name
for presentation only — it is not an ownership or authorization check, and `permissions.md` records
that. `Mở Secret Box`, avatars and names are inert triggers, so no route or dialog can leak. All copy
and imagery is static fixture data; no `dangerouslySetInnerHTML`.

## Next Steps

Runs in parallel with phases 5 and 6. `AllKudosFeed` and `KudosSidebar` are consumed by Phase 5's
shell; report the export signatures against [`dom-contract.md`](dom-contract.md) §12. Phase 8 then
takes GREEN and visual validation.

## Out of scope

`lib/**`, `app/globals.css`, `public/**`, `app/kudos/page.tsx`, `components/layout/**`, `e2e/**`,
`playwright.config.ts`, the card kit internals (Phase 4), the carousel and filter bar (Phase 5), the
spotlight board (Phase 6), the second "thăng hạng" leaderboard (no frame — defect #1), the four
deferred destinations, the special-day heart multiplier, and route protection.
`test_policy: e2e-red-first` — RED is proven in Phase 1; do not write, edit or run E2E tests and do
not claim GREEN. Use Figma design content as mock data source. Do NOT invent data.
