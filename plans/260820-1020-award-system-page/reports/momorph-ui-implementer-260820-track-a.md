# Track A — Presentational UI report (`/awards`)

**Mode:** screen · **Test policy:** e2e-red-first · **Screen:** zFYDgyj_pD (fileKey `9ypp4enmFmdK3YAFJLIu6C`)

## Files changed

- `app/awards/page.tsx` — rewritten: composes `SiteHeader` + `AwardsHero` + `AwardSectionTitle`
  + `AwardCategoryNav`/`AwardDetailList` + `KudosSection` + `SiteFooter`, replacing the Phase 1
  placeholder.
- `components/awards/awards-hero.tsx` — new. Full-bleed `Keyvisual_BG.png` + ROOT FURTHER logo,
  no countdown/CTA.
- `components/awards/award-section-title.tsx` — new. Muted subtitle + divider + gold `<h1>`,
  `awardsPage.subtitle`/`awardsPage.heading`.
- `components/awards/award-category-nav.tsx` — new. `'use client'` scrollspy: owns `activeSlug`
  via one `IntersectionObserver`, click = `preventDefault()` + `scrollIntoView`, no
  `location.hash`/`history.pushState`.
- `components/awards/award-detail-card.tsx` — new. `'use client'` (SSRs normally, so the
  `id={award.slug}` section anchor still lands in server HTML). Image left when
  `index % 2 === 0` (BR-005); renders `longDescription` paragraphs, quantity row, and one or two
  `prizeLines` rows joined by `awardsPage.prizeOr` when the award has two.
- `components/awards/award-detail-list.tsx` — new. Server component, maps `AWARDS` to
  `AwardDetailCard` in order (BR-001).
- `components/layout/site-header.tsx` — edited (FR-002 only): `usePathname()` now decides
  `aria-current="page"` and the selected style — "About SAA 2025" active on `/`, "Award
  Information" active on `/awards`; both stay visible links on every route.
- `public/saa/Target.svg`, `public/saa/Diamond.svg`, `public/saa/License.svg` — new assets,
  downloaded from MoMorph media URLs (nodes `I313:8460;186:1745`, `I313:8467;214:2535`,
  `I313:8467;214:2543`). These three icons did not exist anywhere in `public/` before this
  screen; the phase file's "download no assets" instruction was scoped to the award
  wordmark/`Award_BG.png` reuse, not to genuinely new nav/card-row icons. All three are
  single-color `fill="white"` SVGs with no per-state color variation in the design, so they are
  rendered via `next/image` exactly like the existing `Up.svg`/`Down.svg`/`Notification.svg`
  icons in this codebase (house convention), not inlined as `currentColor` components.

Not touched: `lib/awards.ts`, `lib/i18n/dictionaries/{vi,en}.ts` (Track B's), `e2e/**`,
`playwright.config.ts`, `components/home/**`, `components/home/kudos-section.tsx` (dropped in
unchanged), `app/layout.tsx`.

## MoMorph calls

`get_overview` ×1 · `get_media_files` ×1 · `query_section` ×7 (nav `313:8459`, card `313:8467`,
title `313:8453`, Signature card `313:8471`, quantity-value subtree `I313:8467;214:3552`,
prize-label subtree `I313:8467;214:2542`, prize-amount subtree `I313:8467;214:2545`) ·
`get_node` ×3 (`313:8458` row container, `313:8449` page container, `313:8451` hero frame) ·
`get_frame_image` — not called; the reference PNG at `design/frame-zFYDgyj_pD.png` was already
supplied by the orchestrator and read directly.

## Design evidence

- Reference image: `plans/260820-1020-award-system-page/design/frame-zFYDgyj_pD.png` (read).
- Copy: `plans/260820-1020-award-system-page/design/award-copy.md` (consumed via `lib/awards.ts`,
  not hardcoded).
- Structural facts (container widths, gaps, alternating sides, font sizes/weights, colors) taken
  from the `query_section`/`get_node` calls above, not estimated. `313:8458` confirmed
  `justify-content: space-between` row with nav (`313:8459`, sticky, auto-width up to 322px) and
  card list (`313:8466`) as the two children — implemented as a `lg:flex-row` pair inside the
  existing `max-w-[1512px]` / `lg:px-36` container convention (matches the 1152px content width
  at the 1440px design viewport). `313:8468` (Top Project) confirmed alternating side placement
  (content left, image right) independently of `313:8467` (Top Talent, image left).

## Compile/typecheck

`npx tsc --noEmit` → exit 0. Track B's `lib/awards.ts` extension
(`longDescription`/`quantity`/`prizeLines`) and both `awardsPage.*` dictionary keys had already
landed by the time this ran, so the seam closed with no transient error to report.

## Lint

`npm run lint` → exit 0. 2 pre-existing warnings in `e2e/login-auth-redirect.spec.ts` and
`e2e/login-screen.spec.ts` (unused imports), unrelated to this task and outside owned files.

## Asset coverage

Every literal `/saa/*` and `/images/awards/*` path referenced in the new components resolved to
a real file under `public/` (checked by grep + file-existence loop): `Award_BG.png`,
`Diamond.svg`, `Keyvisual_BG.png`, `License.svg`, `Root_Further_Logo.png`, `Target.svg`, plus
the six `award.image` files already present under `public/images/awards/`.

## Contract conformance

- Exports/props/shapes match `plan.md` § Integration contract exactly (`AwardsHero`,
  `AwardSectionTitle`, `AwardCategoryNav`, `AwardDetailCard({ award, index })`,
  `AwardDetailList`).
- Accessible-name freeze honored: nav links and section `<h2>` headings carry the award title
  verbatim (icon `alt=""` contributes nothing to the accessible name); award graphic `alt` is
  the award title; active nav item carries `aria-current="location"`; header keeps
  `aria-current="page"` for the current route.
- Scroll freeze honored: click handlers only call `preventDefault()` + `scrollIntoView`; nothing
  writes `location.hash` or calls `history.pushState`; no global `scroll-behavior: smooth` was
  added (existing `data-scroll-behavior="smooth"` in `app/layout.tsx` was left untouched, matches
  the existing homepage convention already shipped, not a new global rule).
- Every `<section id={award.slug} className="scroll-mt-24">` present; `AwardDetailCard` is
  `'use client'` but Next SSRs client components for the initial HTML by default, so the ids
  still land in server-rendered markup (only `dynamic(..., { ssr:false })` or client-only-effect
  rendering would strip them, and this component does neither).
- Nav order and card order both come from `AWARDS`, never a second list (BR-001).
- `app/globals.css` not touched — no new token was needed; `--accent`, `--divider`,
  `--accent-glow`-based `.saa-glow`, and `--background` cover every value used.

## Responsive note (implementation-derived, per clarifications.md)

Below `lg`, the nav becomes a horizontal scrollable strip (`flex-row overflow-x-auto`) under the
title, and each card's image/content pair stacks to a single column, down to a 375px floor with
no forced fixed widths (`w-full` + `max-w-[…]` throughout, no viewport-width literal). This is
explicitly the derived responsive behavior the phase file calls out (no mobile/tablet frame
exists) — full breakpoint QA at 375/768/1280 belongs to Phase 4 polish and `tester`, not this
report.

## Visual evidence

Not captured here — `tester` owns Playwright screenshot capture and the pixel-perfect visual
diff against `design/frame-zFYDgyj_pD.png` in Phase 3/4. This report is compile+lint+asset-only
per the `momorph-ui-implementer` contract for `screen`-mode Track A work.

## RED evidence (validated, read-only — established by Phase 1 `tester`)

- `testRunner`: `@playwright/test` ^1.62.1
- `redTestFiles`: `["e2e/awards-page.spec.ts"]`
- `redCommand`: `npm run test:e2e`
- `redExitCode`: `1`
- `redFailure`: `Error: expect(locator).toBeVisible() failed` at `e2e/awards-page.spec.ts:21:28` —
  `locator('header')` not found, a real screen-assertion failure on a 200 response (see
  `evidence/red-gate-evidence.md`), not a syntax/dependency/environment failure.

No E2E test file was written, edited, or run by this report.

## GREEN handoff

`tester` should rerun `npm run test:e2e` (project `awards-page`, port 3200) against
`e2e/awards-page.spec.ts` and expect all 13 assertions (A1–A13) to pass, then capture
Playwright screenshots at 375/768/1280 for the Phase 4 polish/visual-diff step against
`design/frame-zFYDgyj_pD.png`.

## Post-review fix — nav-item hover/focus (ID-10)

Gap flagged by coordinator review: `award-category-nav.tsx` had no hover treatment, missing
ID-10 ("Mục menu được highlight khi hover") and the promoted spec's `nav-hover` UI state.

**MoMorph check performed before choosing a value:** `get_node(zFYDgyj_pD, "186:1433")` and
`get_node(zFYDgyj_pD, "186:1501")` (the two nav-item component ids behind `313:8460`–`313:8465`)
both returned "not found" — these component definitions aren't resolvable as standalone nodes
in this screen's scope. `get_related_design_items(zFYDgyj_pD, "313:8460")` and
`query_component("Awards Information Navigation Links")` were also checked; neither surfaces a
distinct hover/pressed variant. The frame only exposes two states: the plain default and the
C.1 "active" (gold text + glow + border-bottom). **No hover value exists in the MoMorph design
data for this component** — confirmed, not assumed.

**Value chosen:** reused the exact hover/focus-visible pattern already shared by every other
rounded interactive control in this codebase — `hover:bg-secondary-button-bg` (the translucent
gold `--secondary-button-bg` token, `rgba(255, 234, 158, 0.1)`) plus
`focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent`. Source: grepped
`components/layout/site-header.tsx` (inactive nav links already use
`hover:bg-secondary-button-bg`) and `components/ui/{notification-bell,account-menu,
language-switcher}.tsx` (all three use the identical `hover:bg-secondary-button-bg
focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent` pairing). This is
the closer structural analog to a nav-list item than `award-card.tsx`'s `hover:text-accent`
(a card-title color change), and it reuses an existing design token rather than inventing a new
color — no guessed visual value.

**Scope of the edit:** `hover:bg-secondary-button-bg` was added only to `INACTIVE_CLASSES`, so
it cannot fight the active item's gold+underline+glow treatment (ID-10 asserts the highlight on
a non-active item). `focus-visible:outline …` was added to both `ACTIVE_CLASSES` and
`INACTIVE_CLASSES` via a shared `FOCUS_CLASSES` constant, since keyboard focus needs the same
affordance regardless of active state and these are real `<a>` elements. Nothing else in the
file changed — `aria-current="location"`, the `IntersectionObserver` scrollspy, the
`preventDefault()` + `scrollIntoView` click handler, and `AWARDS`-order rendering are untouched.

Re-ran after the edit: `npx tsc --noEmit` → exit 0; `npm run lint` → exit 0 (same 2 pre-existing
unrelated `e2e/` warnings as before).

## Concerns

None blocking. Two observational notes:

1. The `IntersectionObserver` `rootMargin`/`threshold` tuning (`-96px 0px -60% 0px`) is an
   implementation choice, not a Figma value — the design only specifies click behavior; scroll
   sync was a clarification decision with no pixel contract. `tester` should verify the active
   item feels correct at real scroll speed and adjust the margin if it lags or fires early.
2. `Target.svg`/`Diamond.svg`/`License.svg` were downloaded directly via `curl` against the
   presigned MoMorph media URLs from `get_media_files` rather than through the skill's
   `asset_downloader.py` script (that script's Phase 2 batch/background flow assumes a
   multi-agent fan-out this single-agent screen task did not use) — the files are correctly
   named, valid SVGs, and coverage-checked above.
