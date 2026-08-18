# Reviewer Report — Phase 5, Homepage SAA (`feat/homepage-saa`)

## Scope

- Files reviewed: all uncommitted changes on `feat/homepage-saa` — `app/{layout,page,globals.css}.tsx`,
  `app/awards/page.tsx`, `app/kudos/page.tsx`, `components/layout/*.tsx`, `components/home/*.tsx`,
  `components/ui/*.tsx`, `lib/countdown.ts` (+test), `lib/awards.ts` (+test),
  `lib/session/session-provider.tsx`, `lib/i18n/{locale-provider.tsx,dictionaries/*.ts}`,
  `e2e/*.spec.ts`, `playwright*.config.ts`, `.env.example`, `.gitignore`, `package.json`.
- Lines: 2,276 across the listed files (largest: `e2e/homepage.spec.ts` at 635).
- Depth: full read of every listed file, plus `node_modules/next/dist/docs` cross-check for the
  Next 16 `preload`/`priority`/`viewport` claims and a DST arithmetic sanity check for `computeCountdown`.
- Already verified by the orchestrator, not re-run: E2E 38/38, unit 16/16, `tsc --noEmit`, `eslint`,
  `next build`, zero console errors/warnings, the 3 accessibility fixes, and the 8 de-fanged
  `.catch(() => {})` assertions.

## Assessment

No critical findings. The mock-session/i18n hydration pattern is correct and well-commented, the
countdown math is pure and DST-safe, `preload` (not the deprecated `priority`) is used correctly per
the bundled Next 16 docs, and `themeColor` correctly lives in the `viewport` export. The shared
`DropdownMenu` primitive genuinely de-duplicates the four consumers rather than papering over
copy-paste. The two real gaps worth fixing before merge: two account-menu links point at routes that
don't exist, and one E2E assertion (ID-25) cannot fail regardless of what the code does — a second,
undetected instance of the vacuous-assertion pattern the orchestrator already cleaned up eight of.

## Critical

None.

## High / Warning

1. **Broken links: `/profile` and `/admin` don't exist.**
   `components/ui/account-menu.tsx:37` (`href="/profile"`) and `:54` (`href="/admin"`) are real,
   reachable `Link`s for `user`/`admin` roles — clicking either 404s (`app/profile/`, `app/admin/` were
   never created). `clarifications.md` explicitly resolved placeholder stubs for `/awards` and
   `/kudos` but never mentions `/profile` or `/admin`, so this is an unresolved gap, not an accepted
   deferral. It also goes undetected: `e2e/homepage.spec.ts`'s `test.beforeEach` seeds
   `saa.mock-role: 'guest'` (line 8), under which `AccountMenu` returns `null` (line 16), so the
   ID-59 "no broken links" test (line 230) never renders, let alone visits, these two links.
   **Fix:** add the same bare-stub treatment given to `/awards`/`/kudos` (`app/profile/page.tsx`,
   `app/admin/page.tsx`), or explicitly record deferring them in `clarifications.md` and drop/comment
   the links until real routes exist.

2. **`e2e/homepage.spec.ts:278` — assertion that cannot fail.**
   ```ts
   test('language switch to EN changes interface (ID-25)', ...) {
     ...
     await enOption.click();
     // Some UI text should switch to English (this is a basic check)
     await expect(page).toBeTruthy();
   }
   ```
   `page` is a Playwright `Page` object — always truthy. This is the test's *only* assertion after
   the click, so ID-25 currently has zero real coverage: the test passes whether or not the locale
   switch works at all. Under `testPolicy: e2e-red-first` this test carries no RED capability, which
   is exactly the defect class already found and fixed for 8 other IDs — this one was missed.
   **Fix:** assert on actual translated text. The dictionaries already give a clean signal for this
   key — `nav.awards` is "Award Information" (vi) vs **"Award System"** (en) — so
   `await expect(page.getByRole('link', { name: 'Award System' })).toBeVisible()` after the EN click
   would give this test real teeth.

3. **`role="button"` on `<Link>` without Space-key activation** — `components/home/hero-cta.tsx:19,27`.
   Native `<a>` elements activate on Enter only; the ARIA APG button pattern that `role="button"`
   announces to assistive tech requires Space to work too. Neither CTA link has a `onKeyDown` handler
   for Space, so a keyboard/AT user told "this is a button" will find Space silently does nothing.
   **Fix:** either add a `Space`-key handler (`preventDefault` + `router.push`/click), or drop
   `role="button"` and keep native link semantics (the CSS already makes it look like a button —
   the ARIA override isn't needed for the visual).

4. **`dropdown-menu.tsx` under-delivers the ARIA `menu`/`menuitem` contract it declares.**
   `role="menu"` (line 96) / `role="menuitem"` (in every consumer) commits to the full APG Menu
   widget: arrow-key navigation, Home/End, type-ahead, and focus moving to the first item on open.
   None of that is implemented — only toggle/click-outside/Enter/Space/Escape (matching TC ID-30–35
   exactly, but not the ARIA role's implied contract). A screen-reader user told "menu" will expect
   arrow-key traversal that doesn't exist. Worth noting: none of the four consumers are actually
   command menus — they're groups of navigation links (language options, profile/sign-out/admin
   links, kudos/awards links) — which per APG shouldn't use `menu`/`menuitem` at all.
   **Fix:** either implement minimal arrow-key nav + focus-first-item-on-open, or switch these four
   consumers to a plain list-of-links disclosure (no `menu`/`menuitem` roles) since APG explicitly
   reserves that pattern for application-style command menus, not navigation.

## Medium

5. **`DropdownTriggerProps` doesn't type-carry `data-dropdown-trigger="true"`.**
   `dropdown-menu.tsx:17-23` defines the trigger prop contract; the Escape-key refocus logic
   (`dropdown-menu.tsx:61-63`) locates the trigger via
   `querySelector('[data-dropdown-trigger="true"]')`, but that attribute is not part of
   `DropdownTriggerProps` — every consumer (`language-switcher.tsx:28`, `account-menu.tsx:26`,
   `notification-bell.tsx:26`, `quick-action-widget.tsx:25`) has to remember to add it by hand. A
   future 5th consumer that forgets it loses Escape-refocus with no compile error and no runtime
   warning — `?.focus()` just silently no-ops. **Fix:** bake the attribute into what `trigger()`
   receives (spread it as part of the returned props object) so it can't be forgotten.

6. **`e2e/homepage.spec.ts:583-598` — "ID-62" E2E test doesn't test ID-62.**
   Every `AWARDS` entry (`lib/awards.ts`) carries a real slug, so this test just clicks a normal
   Chi-tiết link and loosely asserts `url.toContain('/awards')` — which trivially passes and is
   already covered by ID-49/50. The comment even admits it ("In current implementation, all cards
   should have hashtags... handles the fallback case"). Real ID-62 coverage is solid, but it lives in
   `lib/awards.test.ts:50-53` (`awardHref(undefined)`/`awardHref('')`), not here. **Fix:** rename this
   E2E test to state what it actually checks, or remove it as a duplicate of ID-49/50.

7. **File-size rule: `e2e/homepage.spec.ts` is 635 lines.**
   Phase 5's own non-functional requirement states "every source file under 200 lines"
   (`plans/260818-0936-homepage-saa/phase-05-integration-and-review.md:48`), and
   `development-rules.md` sets the same bar project-wide. This file is over 3x that. It already has
   natural seams — its own `test.describe` blocks — so a clean split costs little:
   `e2e/homepage-structure-and-copy.spec.ts`, `homepage-countdown.spec.ts`, `homepage-navigation.spec.ts`,
   `homepage-dropdown-menus.spec.ts`, `homepage-role-gating.spec.ts`, `homepage-awards-grid.spec.ts`,
   `homepage-widget-and-kudos.spec.ts`.

8. **Duplicate accessible name + destination inside one award card** —
   `components/home/award-card.tsx:44-70`. The image-wrapping `Link` (accessible name from
   `award.title` via the image `alt`) and the `h3 > Link` both render with the exact same accessible
   name ("Top Talent", etc.) and the exact same `href`. This is why
   `e2e/homepage.spec.ts:506` has to fall back to `.first()` to pick between two functionally
   identical, indistinguishably-named links — a real ambiguity, not defensive boilerplate (contrast
   with the header-logo `.first()` uses at lines 21/74/172, which are just defensive since there's
   only one match). Keyboard/screen-reader users tab through 3 links per card (image, title, "Chi
   tiết") to reach one destination. **Fix:** consolidate to fewer link targets per card (e.g., one
   card-level link plus one visually-secondary "Chi tiết" link), or give the duplicate links distinct
   accessible names.

## Low / Suggestion

9. `components/home/root-further-content.tsx:39,47` — `key={paragraph.slice(0, 24)}` works today
   (static content, stable order) but is a fragile key-derivation habit; an index or a stable id
   would read more clearly.
10. `components/layout/site-footer.tsx:56-58` — `<p contentEditable={false} suppressContentEditableWarning>`
    on static copyright text has no explained purpose. Either drop it or comment the defense it's for.
11. `e2e/homepage-invalid-env.spec.ts:9` — the same vacuous `await expect(page).toBeTruthy();` pattern
    as finding #2, but here it's one line among several real assertions in the same test, so it's
    dead weight rather than a coverage hole. Safe to delete.
12. `e2e/homepage.spec.ts:611-614` — the quick-action-widget test only checks the second menu item is
    *visible*, not that its text is "Về SAA 2025"/"About SAA 2025" per FR-019; a wrong link in that
    slot would still pass.
13. `release-manifest.json` and `.repomixignore` are untracked at the repo root (per `git status`) but
    unrelated to the homepage feature — confirm they're intentional tooling artifacts before they get
    swept into a commit for this branch.

## Edge Cases Turned Up

- **DST correctness confirmed, not a bug.** `computeCountdown` (`lib/countdown.ts`) does pure
  epoch-ms subtraction (`targetMs - now.getTime()`), never calendar arithmetic, so DST transitions
  can't skew it — verified with a direct Node check across a US spring-forward boundary
  (23h real elapsed, correctly not 24h). No test needed; math is DST-safe by construction.
- **Malformed-but-not-empty date string** (`'2026-99-99T99:99:99Z'`) is exercised only by the
  "never throws" test (`lib/countdown.test.ts:92-98`), which checks it doesn't throw but not that
  `isInvalid` is set for that specific input — a narrow gap, low value to close given `Date.parse`
  already returns `NaN` for it per spec.
- **Session/locale hydration** is correct: SSR and first client paint both use the hard default
  (`guest`/`vi`), the real value only lands post-mount inside `useEffect`, and the `eslint-disable`
  comments are narrowly scoped to the one `setState` call each actually needs. Confirmed no mismatch
  path exists.
- **Security boundary claims are consistent everywhere** — grepped all of `app/`, `components/`,
  `lib/` for role-gated logic; the mock session only ever gates UI visibility (early-return `null`
  for guest in `account-menu.tsx`/`notification-bell.tsx`), never a data fetch or a route guard. No
  comment overstates it as real auth; the warning block in `session-provider.tsx:3-10` is accurate
  and prominent. No `NEXT_PUBLIC_*` value leaks anything that should have stayed server-side (there
  is no server-side secret in this app at all).

## Done Well

- `lib/countdown.ts` is a clean, provably pure function with `now` injected — no `Date.now()` inside,
  which is exactly what makes both the unit suite and the Playwright Clock-driven E2E tests
  deterministic.
- The SSR-default → `useEffect`-reconcile hydration pattern in both providers and `CountdownTimer` is
  applied consistently and each `eslint-disable-next-line` is justified with the real hydration-mismatch
  scenario it avoids, not just silenced.
- The shared `DropdownMenu` (`components/ui/dropdown-menu.tsx`) is a genuine abstraction win: outside-click,
  Escape, and Enter/Space toggle logic live in exactly one place for four otherwise-unrelated UI pieces.
- `preload` correctly replaces the deprecated `priority` prop and `themeColor` correctly lives in the
  `viewport` export, both verified against the version-exact bundled Next 16 docs rather than memory.
- Frame-vs-CSV precedence decisions are applied faithfully and consistently in code (event info text,
  "Award Information" nav label, footer copyright), matching `clarifications.md` exactly.

## Actions In Order

1. Add `/profile` and `/admin` stub routes (or explicitly defer them in `clarifications.md`) — closes
   the one real broken-link gap and the ID-59 blind spot.
2. Fix `e2e/homepage.spec.ts:278` (ID-25) to assert real translated content instead of
   `expect(page).toBeTruthy()`.
3. Resolve the `role="button"`/Space-key gap on the two hero CTA links (#3).
4. Decide on the `menu`/`menuitem` ARIA scope for the four dropdown consumers — implement minimal
   arrow-key nav, or drop to a lighter link-list pattern (#4).
5. Bake `data-dropdown-trigger` into `DropdownTriggerProps` (#5); rename or drop the vacuous ID-62
   E2E test (#6); split `e2e/homepage.spec.ts` under 200 lines per file (#7).
6. Sweep the Low/Suggestion items opportunistically; confirm `release-manifest.json`/`.repomixignore`
   aren't meant to be committed with this branch.

## Numbers

- Type coverage: not separately measured; `tsc --noEmit` exits 0 (orchestrator-verified, not re-run).
- Test coverage: 38/38 E2E + 16/16 unit green (orchestrator-verified); ID-25's E2E coverage is real in
  name only (finding #2) — functionally uncovered until fixed.
- Lint findings: 0 (`eslint .` exit 0, orchestrator-verified, not re-run).
- Findings this review: 0 critical, 4 warning, 4 medium, 5 suggestion.

## Still Unresolved

None from my side. `/profile` and `/admin` need an explicit decision (stub route vs. recorded
deferral) before Phase 5 can honestly claim "no broken links."
