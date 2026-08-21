---
phase: 5
title: "Page shell, banner, action bar, filter bar, highlight carousel, chrome routing"
status: done
testPolicy: e2e-red-first
---

# Phase 5 — Shell, banner, filters, carousel, chrome

## Files changed

Created:
- `components/kudos/kudos-banner.tsx` (49 lines)
- `components/kudos/kudos-action-bar.tsx` (44 lines)
- `components/kudos/kudos-filter-bar.tsx` (114 lines)
- `components/kudos/highlight-carousel.tsx` (158 lines)
- `components/kudos/kudos-board.tsx` (69 lines)

Modified:
- `app/kudos/page.tsx` (replaced placeholder with the real server shell, 20 lines)
- `components/layout/site-header.tsx` (`/kudos` joins the `usePathname()` derivation)
- `components/layout/site-footer.tsx` (rewritten: route-derived active item as tinted `<span>`,
  hard-coded `/`/`/awards` treatment retired)

## Composition decision (found during implementation, not in the job card)

Phase 7 landed concurrently while I was working. Reading its shipped
`components/kudos/all-kudos-feed.tsx`, I found it already renders its **own** `<section>` with
the `<h2>ALL KUDOS</h2>` heading and its own `<KudosSidebar />` — the same "owns its full
section" shape `spotlight-board.tsx` uses. My first draft of `kudos-board.tsx` additionally
wrapped `<AllKudosFeed>` in a second `<section>`/`<h2>ALL KUDOS</h2>` and rendered a second
`<KudosSidebar />` alongside it, per the phase file's architecture sketch. That would have
violated dom-contract.md F2 (nested `<section>`) and duplicated both the heading and the
sidebar. Fixed before typecheck: `kudos-board.tsx` now renders `<AllKudosFeed />` directly,
exactly like `<SpotlightBoard />`, supplying its own wrapping `<section>` only for HIGHLIGHT
KUDOS (the one region genuinely composed here from two components — `KudosFilterBar` +
`HighlightCarousel` — that don't own a shared section themselves).

## Toast state — confirmed the accepted deviation, did not re-add it

Per the job card's "Accepted deviation" note, Phase 4's `kudos-card-actions.tsx` mounts one
`KudosToast` per card. I verified this directly in the shipped file. `kudos-board.tsx`
therefore does **not** add a second `useState<toastMessage>` / page-level `<KudosToast>`
despite the phase file's architecture sketch showing one — doing so would have made
`text=Link copied — ready to share!` match twice and broken the strict Copy Link test (TC
`0adfd7ce`). `onCopied` is still threaded through to `AllKudosFeed` as a no-op for signature
parity.

## Carousel implementation

`highlight-carousel.tsx`: `role="group"` track, one `<div className="shrink-0">` wrapper per
filtered `highlightTop5` record (never padded), `translateX(calc(50% - cardWidth/2 -
(page-1)*step))` centers the active card exactly (verified algebraically: card `page`'s natural
left offset is `(page-1)*step`, so after the transform its center lands at exactly 50% of the
viewport for every page). Two arrow pairs share the same `goPrev`/`goNext`/`disabled` state:
- 80px pair (inside the two gradient overlays, `2940:13469`/`2940:13467`) — Vietnamese labels
  `"Lùi một thẻ Kudos"` / `"Tiến một thẻ Kudos"`, containing none of `prev`/`Previous`/`next`/`Next`.
- 48px pagination pair — `aria-label="Previous slide"` / `"Next slide"` (the only English pair).

Both gradient overlays reproduce the frame's real `linear-gradient(90deg/270deg, #00101A 50%,
transparent 100%)` values verbatim (design/kudos-content.md §3.3) — no invented opacity, scale
or blur on the cards themselves (F18). The overlay divs are `pointer-events-none` with the
button re-enabling `pointer-events-auto`, so they don't block clicks on the card underneath.

Empty state (F42): when the filtered highlight set is empty, the carousel region renders
`Hiện tại chưa có Kudos nào.` in place of the track/pagination, while the section's own heading
and filter dropdowns stay mounted (F4 requires the exact `<h2>` text even when the region is
empty).

## Concern: a specific test/data conflict, not something I can fix from this phase

`e2e/kudos-board-interactions.spec.ts:130` (TC `d01729d4`) defines its indicator locator once,
bound to the literal regex `text=/^\d+\/5$/` (line 137), and reuses that same locator variable
both before and **after** clicking a hashtag (line 155: `toHaveText(/^1\//)`). Because Playwright's
`text=/regex/` selector re-matches the live DOM against that embedded regex on every access, this
only works if the indicator's denominator is **still literally "5"** after the filter is applied.

The hashtag actually clicked is the first ALL KUDOS card's first hashtag, which S7 pins to
`#Dedicated`. I counted `lib/kudos/kudos-records.ts` (frozen, Phase 3, not owned by this phase):
only 4 of the 9 records carry `#Dedicated` (`kudos-1..4`). `highlightTop5` (frozen,
`lib/kudos/kudos-queries.ts`) filters before sorting/slicing, so filtering by `#Dedicated` yields
exactly 4 records, not 5 — the denominator becomes `1/4`, not `1/5`.

I implemented per the phase file's own explicit architecture line ("`total = filtered.length`"),
which is also the only implementation that is faithful to BR-003/DEC-001 (the carousel should
show what's actually in the filtered set, not pad or lie about a count). I did not invent a
"denominator pinned to 5 regardless of filter" behavior, since nothing in dom-contract.md or the
clarifications asks for that, and it would contradict F13's "never padded" rule in spirit (the
indicator would claim slides that don't exist).

Flagging this for Phase 8 (tester) rather than resolving it myself, since fixing it would mean
either editing the frozen test file (not permitted by this phase, and not obviously mine to
decide) or changing the frozen seed data in `lib/kudos/kudos-records.ts` (owned by Phase 3, out
of my file ownership). This is the same class of issue dom-contract.md's own "Conflicts Phase 1
must resolve" section already documents for other tests (C1/C2) — I believe this is a similar,
previously-undiscovered case.

## Responsive note

`highlight-carousel.tsx`'s cards are `KudosCard` instances (Phase 4, not owned by this phase),
which hard-code `w-[528px]` for the highlight variant. At the 375px floor, the carousel's
`overflow-hidden` viewport prevents this from causing page-level horizontal scroll, but the side
and even the active card will be visually cropped rather than reflowing to a true 1-up layout.
This is the same "responsive is derived, no mobile frame" situation already flagged in
clarifications.md (defect #8) — noted here rather than worked around by touching a file I don't
own.

## Checks run

- `npx tsc --noEmit` — exit 0, clean (Phase 7's `all-kudos-feed.tsx`/`kudos-sidebar.tsx` had
  already landed by the time I ran this, so no unresolved-import state was ever reported).
- `npm run lint` — 0 errors/warnings in any file this phase owns. The 2 `prefer-const` errors in
  `e2e/kudos-board-feed-interactions.spec.ts` are pre-existing and out of scope (tester-owned).
- `npm run test:unit` — 93 passed, unchanged.
- All owned files are well under the 200-line ceiling (max: `highlight-carousel.tsx` at 158).
- Did not run the e2e suite and did not edit any `e2e/**` file, per this phase's `e2e-red-first`
  scope boundary (Phase 8 owns GREEN and all browser evidence).

## Follow-up fix (2026-08-21, 16:45) — 375px page-level horizontal scroll

Phase 8's visual validation measured `document.scrollWidth` 704px vs `clientWidth` 375px at the
375 viewport, confirming concern #2 above as blocking rather than the standing no-mobile-frame
gap. Bounded fix in `components/kudos/highlight-carousel.tsx` only (Phase 4 is separately making
`KudosCard` itself `w-full max-w-[528px]`, per their own file, not touched here).

**Root change:** replaced the JS pixel constants (`CARD_WIDTH=528`, `GAP=24`) with CSS custom
properties `--slide-w`/`--slide-gap`, set via Tailwind arbitrary properties on the track:
- Default (below 1440px): `--slide-w:100%`, `--slide-gap:0px` — each slide now fills the actual
  rendered width of the carousel viewport (a real 1-up slide), instead of the old hardcoded
  `528px` that always exceeded a 375px or 768px viewport regardless of what `KudosCard` itself
  did.
- `min-[1440px]:` (no default Tailwind breakpoint sits at exactly 1440, hence the arbitrary
  variant): `--slide-w:528px`, `--slide-gap:24px` — the frame's exact numbers.

The `translateX` formula now reads
`calc(50% - var(--slide-w) / 2 - N * (var(--slide-w) + var(--slide-gap)))` instead of the old
`calc(50% - 264px - N * 552px)`. At `>= 1440px` these are algebraically identical
(`528/2 = 264`, `528+24 = 552`), so desktop centering math is byte-for-byte unchanged — the
"1440 must stay pixel-identical" constraint is satisfied by construction, not by visual
re-inspection. Each slide wrapper's width is likewise `var(--slide-w)` instead of being left
unconstrained and inheriting `KudosCard`'s own fixed class.

**Overlays/arrows:** tightened `min-w-[100px]` (both gradient overlay frames, `2940:13469`/
`2940:13467`) to `min-w-16` (64px, exactly enough for the mobile 64px arrow button) below
1440px, restoring `min-[1440px]:min-w-25` (100px, canonical Tailwind class for the same
arbitrary value) at the design width — unchanged from before at 1440. Added `shrink-0` to the
arrow buttons defensively. No opacity/scale/blur was introduced anywhere in this change — the
gradient overlays are untouched (`linear-gradient(90deg/270deg, #00101A 50%, transparent 100%)`,
verbatim as before).

**Did not touch:** the `n/5` indicator, either arrow pair's `aria-label` values, or the
`goPrev`/`goNext`/`disabled` logic — all identical to the version already implemented.

### Verification

1. `npx tsc --noEmit` — exit 0, clean.
2. `npm run lint` — 0 errors/warnings in any file this phase owns (same 2 pre-existing
   `prefer-const` errors in the tester-owned e2e spec, unrelated).
3. `npm run test:unit` — 93 passed, unchanged.
4. **Could not measure `scrollWidth`/`clientWidth` at 375/768/1440 myself** — I do not have
   `mcp__playwright__*` or any other browser-automation tool available (checked my tool list;
   only `mcp__momorph__*`, Read/Write/Edit/Bash/Skill/Agent). Per this agent's own boundary
   ("this agent has no Playwright MCP access. Browser capture belongs to the orchestrator or
   `tester`"), I did not attempt to work around that with an ad hoc Playwright script via Bash.
   I verified the fix **algebraically** (the `>= 1440px` custom-property values reduce to the
   exact pre-existing pixel formula) and **structurally** (no element in
   `highlight-carousel.tsx` now has a fixed pixel width below the `min-[1440px]:` breakpoint;
   every width is either a CSS variable resolving to `100%` or a `min-w-16` (64px) floor that
   fits inside a 327px content column at 375px). I have **not** asserted this is fixed —
   leaving the 375/768/1440 `scrollWidth` vs `clientWidth` measurement to Phase 8, as
   instructed.
5. Advancing/disabling and the 3-up desktop layout: not independently re-verified in a browser
   for the same reason as (4); the change to `goPrev`/`goNext`/`disabled`/rendered-child-count
   logic is zero (no lines in that logic were touched), so I have high confidence in it, but
   this is a static-diff argument, not a live observation — Phase 8 should still confirm.

## Visual value sourcing

All colors/spacing/geometry trace to `design/kudos-content.md` §1–§3.4 or existing project
tokens (`--accent`, `--secondary-button-bg`, `--border-accent`, `--divider`, `--muted-text`).
The only two values I could not source from a frame node text/style field are the 80px overlay
buttons' Vietnamese `aria-label` strings — those are UI copy invented to satisfy dom-contract.md
F16's label-split requirement (the frame carries no accessible-name data at all for these
buttons), not a visual value.
