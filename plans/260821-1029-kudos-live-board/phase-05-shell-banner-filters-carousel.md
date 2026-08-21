---
phase: 5
title: "Page shell, banner, action bar, filter bar, highlight carousel, chrome routing"
owner: momorph-ui-implementer
status: complete
priority: P1
effort: 4h
feature: F013
test_policy: e2e-red-first
depends_on: [4]
concurrent_with: [6, 7]
mode: section
---

# Phase 5 — Page shell, banner, filters, carousel, chrome

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `MaZUn5xHXZ`, node `2940:13431`
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`dom-contract.md`](dom-contract.md) §1–§5, §9, §12 — **binding**; F1–F24, F42
- [`design/kudos-content.md`](design/kudos-content.md) §1 (banner), §2 (pills), §3.1–§3.4 (header, filters, carousel, pagination), §7 (header/footer)
- [`spec/kudos-live-board/technical-spec.md`](spec/kudos-live-board/technical-spec.md) — US001/US002/US006/US009, SM-001, BR-003, BR-004, DEC-001
- Precedent: `app/awards/page.tsx` (the shell shape), `components/ui/language-switcher.tsx` (the dropdown idiom)
- `AGENTS.md`: Next.js 16.3.1 — read `node_modules/next/dist/docs/` before writing code

## Overview

**Priority:** P1. **Status:** pending.

Turn the placeholder into the real page: the server-component shell, the banner, the submit pill +
Sunner search row, the HIGHLIGHT KUDOS header with its two filter dropdowns, the 3-of-5 carousel with
its two arrow pairs and `n/5` indicator, and the header/footer current-page state. This phase owns the
**single shared filter state** that DEC-001 requires — the one piece of state that both this region
and the ALL KUDOS feed read.

## Key Insights

- **`/kudos` currently renders no header or footer at all.** The placeholder is a bare `<main>`; the
  shell has to be built, not patched.
- **The footer change is not cosmetic — it unblocks a test.**
  `page.getByRole('navigation').locator('a:has-text("Sun* Kudos")')` matches both navs today, which is
  a strict-mode error no implementation can pass. Rendering the current-route footer item as a
  `<span aria-current="page">` leaves exactly one `<a>`, is the correct treatment for the current
  page, and reproduces the frame's tinted variant. It also retires the footer's route-independent
  hard-coded `aria-current="page"` on `/` (a latent bug on every other page). Verified safe: all
  `About SAA 2025` link assertions are header-scoped (F10).
- **Only one arrow pair may carry `prev`/`next` in its `aria-label`** (F16). The frame draws two pairs
  (defect #5) and both must work, but `.click()` and `toBeDisabled()` are strict — two matches is an
  error, not an ambiguity.
- **Both filter triggers must keep their literal labels after a selection** (F20): the empty-state
  test re-clicks `button:has-text("Phòng ban")` in a loop *after* a department is already chosen.
- **Inactive card dimming comes from the frame's own two gradient overlays** (`2940:13469`,
  `2940:13467`), which also host the 80px arrows. There is no opacity, scale or blur value anywhere in
  the design; inventing one is forbidden (defect #7).
- The indicator's denominator is the filtered highlight count, which is 5 unfiltered — that is what
  makes `/^\d+\/5$/` match on load and `1/…` match after a hashtag click.

## Requirements

**Functional**
1. `app/kudos/page.tsx` — server component: `SiteHeader` → `<main>` → `KudosBoard` → `SiteFooter`.
2. `kudos-board.tsx` — `'use client'`; owns `KudosFilter` and the toast message; renders the five
   sibling `<section>`s in the F3 order and passes `filter`, `viewerId`, `onHashtagClick`, `onCopied`
   down. Any filter change resets carousel page and feed batch (BR-003, DEC-001).
3. `kudos-banner.tsx` — title `Hệ thống ghi nhận và cảm ơn` (36/44/700 `#FFEA9E`), the KUDOS wordmark
   (`alt` containing `KUDOS` — the page's only such image, F6), the star mark, the KV background and
   its `Cover` gradient.
4. `kudos-action-bar.tsx` — the read-only submit pill (verbatim placeholder with its 1 leading + 3
   trailing spaces) and the Sunner search input (`Tìm kiếm profile Sunner`), both 68px radius.
5. `kudos-filter-bar.tsx` — the section header (subtitle, divider, `<h2>HIGHLIGHT KUDOS</h2>`) plus
   two `DropdownMenu` filters on the existing primitive.
6. `highlight-carousel.tsx` — `role="group"` track, one child per filtered record, SM-001 paging,
   both arrow pairs, the `n/5` indicator, the two gradient overlays, and the F42 empty state.
7. `site-header.tsx` — `/kudos` joins the `usePathname()` derivation with `aria-current="page"`.
8. `site-footer.tsx` — active item derived from `usePathname()`, rendered as a tinted `<span>`.

**Non-functional**
- Every file under 200 lines; `site-header.tsx` (71) and `site-footer.tsx` (61) stay well under.
- No second dropdown primitive — reuse `components/ui/dropdown-menu.tsx` (DRY).
- Cards must appear in the server-rendered HTML even though the shell is `'use client'` (the house
  pattern — see `components/home/award-card.tsx`).
- Responsive: 3-up → 1-up below 1440px, 375px floor, no horizontal overflow (derived — defect #8).

## Architecture

```
app/kudos/page.tsx  (server)
  SiteHeader                       ← aria-current="page" on /kudos
  <main>
    KudosBoard  ('use client')     ← useState<KudosFilter>, useState<toastMessage>
      <section> KudosBanner
      <section> KudosActionBar
      <section> KudosFilterBar + HighlightCarousel     highlightTop5(filter)
      <section> SpotlightBoard                          (Phase 6, filter-independent)
      <section> AllKudosFeed + KudosSidebar             filterRecords(filter)  (Phase 7)
      KudosToast message={toastMessage}
  SiteFooter                       ← tinted <span> on the active route
```

Filter flow (DEC-001): dropdown select **or** in-card hashtag click → `setFilter(next)` →
`highlightTop5` and `filterRecords` both recompute → carousel `page` reset to 1 and feed
`revealedCount` reset to its first batch. One state, two consumers, no duplication.

Carousel (SM-001): `page ∈ 1..total`, `total = filtered.length`; `next` guarded by `page < total`,
`prev` by `page > 1`; both pairs call the same two handlers and share the same `disabled`.
Transform centres card `page`; the two 400×525 gradient overlay frames sit above the track.

Frozen geometry: banner `1152×160 at (144,184)`, wordmark group `593×104`; submit pill `738×72`,
Sunner search `381×72`, both `border 1px #998C5F`, `background rgba(255,234,158,.10)`, `radius 68px`,
`padding 24/16`; filter buttons `136×56` and `158×56`, `radius 4px`, `padding 16`, trailing
`MM_MEDIA_Down` 24×24; track `gap 24`, cards at x 0 / 552 / 1104; 80px arrows at (80,935) and
(1220,935); 48px arrows at (612,1280) and (779,1280) with the indicator at (692,1278) in 28/36/700
`#999999`.

## Related Code Files

**Create** — `components/kudos/{kudos-board,kudos-banner,kudos-action-bar,kudos-filter-bar,highlight-carousel}.tsx`.
**Modify** — `app/kudos/page.tsx` (replace the placeholder), `components/layout/site-header.tsx`,
`components/layout/site-footer.tsx`.
**Delete** — none.
**Read for context** — `app/awards/page.tsx`, `components/ui/{dropdown-menu,language-switcher}.tsx`,
`lib/kudos/{filters,kudos-queries}.ts`, `design/kudos-content.md`, `dom-contract.md`.

## Implementation Steps

1. Read `app/awards/page.tsx` and copy its shell shape and container/padding ladder.
2. Read `components/ui/dropdown-menu.tsx` and `language-switcher.tsx` before writing the filter bar —
   the primitive already handles open state, Escape and outside-click.
3. Build `kudos-board.tsx` with the shared filter state and the five sibling sections. It will not
   typecheck until phases 6 and 7 land — that is the seam closing, not a blocker.
4. Build `kudos-banner.tsx`. Exactly one image on the page may have `KUDOS` in its `alt`; every other
   image here uses `alt=""` (F6).
5. Build `kudos-action-bar.tsx`. The submit pill is `<input readOnly aria-haspopup="dialog">` with the
   verbatim placeholder — do not trim the spaces. No dialog is built (FR-015).
6. Build `kudos-filter-bar.tsx`: `<h2>HIGHLIGHT KUDOS</h2>` exactly, options as
   `<button type="button" role="menuitem">` in `filters.ts` order with `Tất cả` last, and triggers
   that keep the literal `Hashtag` / `Phòng ban` text plus the selection as a suffix.
7. Build `highlight-carousel.tsx`: `role="group"` on the track, one child per filtered record,
   SM-001 handlers shared by both pairs, `aria-label`s per F16 (48px pair gets `Previous slide` /
   `Next slide`; 80px pair gets Vietnamese labels containing none of `prev`/`Previous`/`next`/`Next`),
   real `disabled` at the ends, indicator `` `${page}/${total}` `` alone in its element, and the F42
   empty state.
8. Reproduce the two gradient overlays exactly as drawn. Add no opacity, scale, filter or blur to the
   side cards.
9. `site-header.tsx`: extend the existing ternary pattern to `/kudos` with `aria-current="page"` and
   `ACTIVE_NAV_CLASSES`. Leave the other two items untouched.
10. `site-footer.tsx`: add `usePathname()`; the matching item renders as a tinted
    `<span aria-current="page">`, the rest as `<Link>`; remove the hard-coded `aria-current` on `/`
    and the hard-coded tint on `/awards`.
11. Responsive pass down to 375px: carousel to 1-up, action bar stacks, no horizontal overflow.
12. `npx tsc --noEmit` and `npm run lint`. Re-run once phases 6 and 7 report done.

## Todo List

- [ ] `app/kudos/page.tsx` is a server component composing header → `<main>` → footer
- [ ] Five sibling `<section>`s inside `<main>`, F3 order, none nested
- [ ] `<h2>` text exactly `HIGHLIGHT KUDOS`
- [ ] Banner title verbatim; exactly one `alt`-`KUDOS` image page-wide
- [ ] Submit pill `readOnly`, verbatim placeholder with 1 leading + 3 trailing spaces, focusable
- [ ] Sunner search placeholder `Tìm kiếm profile Sunner`, outside the spotlight section
- [ ] Filter triggers keep `Hashtag` / `Phòng ban` text after selection
- [ ] Options are `role="menuitem"`, static order, `Tất cả` last, single-select
- [ ] `role="group"` track; one child per filtered record; never padded
- [ ] Indicator element text is exactly `n/total`; reads `1/5` on load
- [ ] Exactly one `prev`- and one `next`-labelled button in the section; both pairs wired to SM-001
- [ ] `disabled` at page 1 / page 5, synchronised across pairs
- [ ] Filter change resets carousel to page 1 (BR-003)
- [ ] Both regions show `Hiện tại chưa có Kudos nào.` when empty
- [ ] Gradient overlays reproduced; no invented opacity/scale/blur
- [ ] Header: `/kudos` derives `aria-current="page"`
- [ ] Footer: active item is a tinted `<span>`; `/` hard-coding removed
- [ ] 375px floor, no horizontal overflow
- [ ] `npx tsc --noEmit` + `npm run lint` clean after the seam closes

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| Page renders all regions in order, no console error | `40d4ba26` green at Phase 8 | FR-001, FR-013, SC-001 |
| Carousel shows 3 of 5, arrows disable at both ends, indicator syncs | `81446f61` green | FR-001, FR-003, SM-001, SC-002 |
| Both dropdowns open, select and clear; both regions re-filter | `0e56cacb`, `159fed13` green | FR-008, SC-003 |
| In-card hashtag click re-filters both regions and resets to page 1 | `d01729d4` green | FR-009, BR-003, DEC-001, SC-003 |
| Empty combination shows the copy in both regions | `926d92a5` green | SC-003, F42 |
| Header marks `/kudos` current | `aria-current="page"` on the header link only | FR-001, SC-001 |
| Footer highlight moves to `/kudos` | tinted `<span>`; homepage/awards suites still green | defect #17 (design), F9/F10 |
| Submit pill reachable and inert | `A.1 deferred` test green; no navigation | FR-015, SC-009 |
| No invented visual value | every number traceable to §1–§3.4 or a Phase 2 token | clarifications, defect #7 |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| Both arrow pairs labelled `prev`/`next` → strict-mode error that looks like a product bug | **High** × **High** | F16 fixes the label split explicitly; step 7 restates it; Phase 8 confirms |
| The footer change red-lights the homepage or awards suites | Med × **High** | F10 records the audit: all `About SAA 2025` link assertions are header-scoped; Phase 8 runs the full suite, not just kudos |
| A wrapper `<section>` around the regions makes `:has(h2)` select the wrapper and merge both card sets | Med × High | F2 forbids nesting; `<main>` is the only wrapper; step 3 states it |
| Filter trigger label replaced by the selected value → later `has-text` lookups fail | Med × High | F20; selection renders as a suffix |
| Indicator element carries extra text so `/^\d+\/5$/` never matches | Med × High | Indicator is its own element containing only `page/total` |
| An invented opacity/scale for the side cards | Med × Med | Defect #7 and step 8; review rejects any such value |
| Reaching for a new dropdown primitive because the existing one has no arrow-key roving | Med × Med | Reuse is mandated (F19); no test requires arrow keys; note the a11y gap for a later run |
| Responsive collapse is derived, not designed (no mobile frame) | High × Low | Follow the precedent set by prelaunch/login/awards; flagged as defect #8 |

## Security Considerations

No authentication, no authorization, no data write. The submit pill is read-only and opens nothing.
The viewer identity comes from the mock session and only reaches the card kit. `/kudos` stays a public
route — route protection remains deferred (TC `71b3ef43`), and this phase must not add a gate,
redirect or `proxy.ts` change. No user input is echoed into markup.

## Next Steps

Runs in parallel with phases 6 and 7. When all three report done, re-run `tsc`/`lint`, then Phase 8
takes over for GREEN and visual validation.

## Out of scope

`lib/**` and `app/globals.css` and `public/**` (phases 2 and 3 own those), `e2e/**` and
`playwright.config.ts`, the card kit internals (Phase 4), the spotlight board (Phase 6), the feed and
sidebar (Phase 7), any Pan/Zoom control (omitted — FR-012), the four deferred destinations, the
special-day heart multiplier, route protection, and `components/home/**`.
`test_policy: e2e-red-first` — RED is proven in Phase 1; do not write, edit or run E2E tests and do
not claim GREEN. Use Figma design content as mock data source. Do NOT invent data.
