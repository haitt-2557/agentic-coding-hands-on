# Reviewer report — SAA 2025 Award System page (`/awards`)

**Branch:** `feat/awards-system-page` vs `main` · **Depth:** full diff + working tree, re-executed every gate

## Scope

- Files reviewed: `lib/awards.ts`, `lib/awards.test.ts`, `app/awards/page.tsx`,
  `components/awards/{awards-hero,award-section-title,award-category-nav,award-detail-card,award-detail-list}.tsx`,
  `components/layout/site-header.tsx`, `lib/i18n/dictionaries/{vi,en}.ts`, `playwright.config.ts`,
  `e2e/awards-page-{layout,header,navigation,deep-links,kudos}.spec.ts`,
  `public/saa/{Target,Diamond,License}.svg`, `docs/vi/features/award-system-page/**`,
  `docs/vi/generated/feature-list.md`, `docs/vi/.rebuild-state.json`.
- Lines: ~330 changed/added across app+lib+components, 317 lines of new E2E across 5 files.
- Depth: full — read every touched file, diffed every shared/blast-radius file against `main`, re-ran
  every command in "verified state going in" myself rather than trusting the numbers.

## Assessment

Ships to spec. `lib/awards.ts` is additive exactly as the contract requires (verified by diff — zero
change to `description`, `image`, `EXPECTED_AWARD_SLUGS`, `awardHref()`). The scrollspy nav, the six
alternating detail cards and the reused Kudos/header/footer chrome all match the frame and the
resolved clarifications. Copy in `lib/awards.ts` is byte-identical to `design/award-copy.md` for all
six long descriptions, quantities and prize lines — checked side by side, including em dashes and
curly quotes. The two flagged design defects (#6 missing prize notes on Best Manager/MVP, #8 the
`Hoặc` separator at `#2E3940` on `#00101a`) are reproduced faithfully, not "fixed" — confirmed
`--divider: #2e3940` in `app/globals.css` is the exact color used, matching the disclosed defect.

I independently re-ran every command the evidence claims rather than accepting the numbers:

| Command | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 (2 pre-existing warnings in `e2e/login-*`, unrelated) |
| `npm run test:unit` | exit 0 — 68 passed |
| `npm run test:e2e -- --project=awards-page` | exit 0 — 10 passed |
| `npm run test:e2e -- --project=homepage-with-open-gate` | exit 0 — 38 passed (regression suite) |
| `npm run test:e2e` (whole suite) | exit 1 — 78 passed, 1 failed |
| `npx playwright test --list --project=awards-page` | 10 tests in 5 files, none over 200 lines |

The one whole-suite failure is `e2e/login-auth-redirect.spec.ts` at
`e2e/support/supabase-session.ts:65`, `INFRA: Supabase signInWithPassword failed: Invalid login
credentials` — reproduced myself, matches the pre-existing infra gap (no OAuth credentials supplied)
disclosed in `phase-04-orchestrator-correction.md`. Not a regression from this diff, not scored down.

The orchestrator's Phase 4 correction (widened `testMatch`, deleted the duplicate 290-line spec file,
fixed two stray braces) holds up: `--list` shows exactly 10 tests collected under `[awards-page]` from
the 5 split files, and `grep -c "expect("` across the 5 files sums to 51, matching the claimed parity
with the original file.

**Addendum — two criteria upgraded from "accepted on Phase 4's evidence" to independently verified.**
The first pass of this review left the hover highlight (TC ID-10) and the 375/768 responsive floor
resting on Phase 4's screenshots rather than my own re-check. On follow-up I closed that gap myself: I
started a plain `next dev` server on an unused port with no `NEXT_PUBLIC_EVENT_START_AT` override (the
launch gate fails open with no target date — confirmed against `lib/prelaunch/gate.test.ts`'s
"fail-open on invalid config" cases — so `/awards` serves normally without needing the built 3200
server), then ran a small standalone Playwright script against it:
- **Hover (TC ID-10):** the first nav item's computed `background-color` moved from `rgba(0,0,0,0)` to
  `rgba(255,234,158,0.1)` on `.hover()` — the `hover:bg-secondary-button-bg` class is live, not just
  present in source.
- **No horizontal overflow at 375 / 768 / 1440:** `document.documentElement.scrollWidth` equaled
  `window.innerWidth` exactly at all three viewports (375/375, 768/768, 1440/1440).
Both criteria are now independently proven rather than accepted secondhand; the standalone script
lived only in the scratchpad and touched no file under `app/**`, `components/**`, `lib/**` or
`e2e/**`.

## Critical

None found.

## High

None found.

## Medium

1. **Stray untracked state file left in `docs/`.** `docs/.spec-promote-pending.json` is untracked, not
   in `.gitignore`, and has no prior history in the repo (`git log --all -- docs/.spec-promote-pending.json`
   returns nothing). It looks like a doc-promotion tool's working file that never got consumed or
   cleaned up. It's harmless at runtime but shouldn't ride into a commit un-triaged — either it's
   tooling state that belongs in `.gitignore`, or it's a leftover that should be deleted before merge.
   *Location:* `docs/.spec-promote-pending.json:1`.

2. **A7's "previous item loses active" is not independently exercised.** The plan's A7 requires
   asserting that the previously-active item loses `aria-current` when a new one is clicked. The test
   at `e2e/awards-page-navigation.spec.ts:31-53` clicks "Top Project" from a cold `/awards` load and
   then checks "Top Talent" has no `aria-current`, but it never first proves Top Talent *was* active
   before the click — it relies on Top Talent very plausibly being the scrollspy's initial pick (it's
   the first section, near the top of a cold load). The assertion is correct in outcome but doesn't
   pin the "loses it" transition as tightly as A7's wording promises; a true regression where Top Talent
   was never marked active in the first place would pass this test just as well. Not a false claim —
   just a weaker proof of the transition than the contract implies.
   *Location:* `e2e/awards-page-navigation.spec.ts:31-53`.

## Low

1. `AwardCategoryNav`'s scrollspy tie-break (`components/awards/award-category-nav.tsx:51`) picks the
   first entry when two sections report equal intersection ratio, relying on `Map` insertion order
   rather than an explicit tie-break rule. In practice ties are rare given the `-96px / -60%`
   window and the sections' height, and it never surfaces two active items at once (only one `isActive`
   can be true), so this is a note for future maintainers rather than a defect.
2. `award-detail-card.tsx:89` keys the prize-line map on `prize.amount` — fine today since amounts are
   unique per award, but would collide if a future award ever had two identical amounts in one
   `prizeLines` array. Low risk given the data is hand-authored and small.

## Edge Cases Turned Up (scouting pass)

- **Lazy-loaded images during full-page capture** — already correctly diagnosed by the orchestrator as
  a capture artifact, not a page defect; I did not need to re-litigate it, but confirmed the reasoning
  is sound (images use no `priority`/`preload`, so default lazy-loading is expected and correct here —
  only the hero and logo use `preload` for LCP, appropriately).
- **Scroll gaps between sections** — `AwardDetailList` sections are separated only by flex `gap-16`/`gap-20`
  (no dead space wide enough to fully exit the `-96px/-60%` observer window at normal scroll speed), so
  the "active goes stale mid-scroll" risk called out in the task brief does not materialize in practice.
- **Keyboard activation** — nav items are real `<a href="#slug">` elements, so `Tab` + `Enter` fires the
  same `click` handler as a mouse click (browsers dispatch `click` on `Enter` for anchors), and
  `focus-visible` outlines are present. Keyboard access works even though the promoted spec marks this
  `unknown`.
- **`aria-current="location"` is a valid token** (ARIA spec: page/step/location/date/time/true/false),
  correctly distinct from the header's `aria-current="page"` per the frozen contract — no collision
  between the two "current" concepts on the same page.
- **Heading hierarchy** — one `<h1>` (`AwardSectionTitle`), six `<h2>` (each award title) plus the
  Kudos block's `<h2>Sun* Kudos</h2>` — no skipped levels, no duplicate `<h1>`.
- Homepage regression surface: `components/home/{award-card,awards-section,kudos-section}.tsx` and
  `e2e/homepage-awards-grid.spec.ts` show **zero diff** against `main` (`git diff main --stat --
  components/home/ e2e/homepage-awards-grid.spec.ts` is empty) — the run's stated highest-risk item
  produced no changes at all, confirmed by diff rather than by re-reading behavior.

## Done Well

- The A ↔ B integration contract in `plan.md` was actually held: every frozen export name, accessible
  name, and the "no `location.hash`/`history.pushState`" rule show up unmodified in the code.
- Copy fidelity is exact — no paraphrase, no re-wrapped em dashes, no dropped curly quotes, verified by
  direct comparison against `design/award-copy.md` for all six awards.
- The three design defects reproduced as-drawn (missing prize notes, low-contrast `Hoặc`, duplicate
  `description` text across three awards from the earlier homepage run) were correctly left alone
  rather than "fixed" by an agent inventing distinct copy — consistent with the "frame wins" rule and
  with not silently diverging from the design source.
- The orchestrator's three-defect correction to the spec-file split (dead file left in place, unmatched
  `testMatch`, two syntax errors) is real and verified — `--list` now shows 10/10 collected correctly,
  and the file-size rule is honestly met (max 133 lines).
- `AwardCategoryNav` cleans up its `IntersectionObserver` on unmount and guards for SSR
  (`typeof IntersectionObserver === 'undefined'`) — no leak, no crash on the server render pass.

## Actions In Order

1. Decide on `docs/.spec-promote-pending.json` before merge — gitignore it if it's expected tooling
   output, delete it if it's a stray leftover. Neither blocks this review.
2. Optional, non-blocking: strengthen `e2e/awards-page-navigation.spec.ts`'s A7 test to explicitly
   click "Top Talent" first (establishing it as active) before clicking "Top Project", so the
   "previous item loses active" transition is pinned rather than inferred from initial scrollspy state.

## Numbers

- Type coverage: `npx tsc --noEmit` exit 0, no `any` introduced in the reviewed files.
- Test coverage: 68/68 unit tests, 10/10 awards E2E, 38/38 homepage regression E2E, 78/79 whole-suite
  (1 pre-existing unrelated infra failure).
- Lint findings: 0 errors, 2 pre-existing warnings outside this diff's files.

## Still Unresolved

- None from this review. The plan's own "Next Steps" (route protection for `/awards` et al., a
  mobile/tablet Figma frame, the `/he-thong-giai` vs `/awards` canonical-URL ruling) are explicitly
  out of scope for this run and correctly recorded as such in `clarifications.md`.

## Note — acceptance criterion 14 was amended by the orchestrator post-hoc

`study-context.json`'s last acceptance criterion originally demanded the whole `npm run test:e2e`
suite exit 0. That was never achievable in this run: `e2e/login-auth-redirect.spec.ts` fails on
unsupplied Google OAuth credentials, identically in the Phase 1 RED baseline before this run's code
existed. The orchestrator corrected the criterion in `study-context.json` to the real bar — the
`awards-page` project exits 0, and the whole suite gains no NEW failure versus the RED baseline — with
the date, author and reason recorded inline in the criterion string itself, disclosed rather than
quietly softened.

I stand behind the amendment: it matches what I independently verified twice in this review — the
whole suite reproduced as 78 passed / 1 failed both times, with the one failure being the same
`INFRA: Supabase signInWithPassword failed: Invalid login credentials` error at
`e2e/support/supabase-session.ts:65` on both runs, i.e. no new failure was introduced. The
`inspection-verdict.json` `acceptanceCovered` array now echoes the amended criterion string verbatim
(including its inline disclosure), per the evidence gate's exact-match requirement.
