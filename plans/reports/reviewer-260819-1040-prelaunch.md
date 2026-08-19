# Review — Countdown Prelaunch + Launch-Timing Gate

**Branch:** `feat/countdown-prelaunch` vs `main` · **Plan:** `plans/260819-0913-countdown-prelaunch/`

## Scope

- Committed: `9d2a5ac` (proxy.ts, lib/prelaunch/{gate.ts,gate.test.ts,use-prelaunch-countdown.ts}, i18n keys, .env.example)
- Uncommitted: `app/prelaunch/page.tsx`, `components/prelaunch/{prelaunch-countdown,countdown-unit,digit-box}.tsx`, `app/globals.css` (`@font-face`), `e2e/prelaunch-*.spec.ts` (3 new), `e2e/homepage-{countdown,navigation,structure-and-copy}.spec.ts` (re-pointed), `playwright.config.ts`, `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`, `.gitignore`, `public/saa/Prelaunch_BG.png`
- Lines: ~205 in the committed diff, ~10 small new files in the working tree, all under the 200-line cap
- Depth: full read of every touched file plus `lib/countdown.ts`, `lib/session/session-provider.tsx`, `components/home/countdown-timer.tsx` for pattern comparison

## Assessment

Solid. The gate/countdown/UI seam is exactly what the plan's integration contract specified, fail-open is real and unit-tested at the boundary (`now === target` and `target - 1ms`), the matcher correctly excludes static assets, and the gate never touches `lib/session/session-provider.tsx`. Visual values (border color, gradient, blur, radius, clamp scaling) match `clarifications.md` line for line. Two real findings below — one behavioral edge case the test suite doesn't cover, one process gap (Phase 5 docs not done) — plus stray debug artifacts to clean before merge. Nothing here blocks the merge on correctness or security grounds.

## Critical

None.

## High

**1. T-0 redirect can loop under client/server clock skew — `lib/prelaunch/use-prelaunch-countdown.ts:29-48`**

`hasRedirected` guards only within one mount. The guard resets on every fresh mount of the hook — and a bounce-back *causes* a fresh mount: if the client's clock reads past target but the server's (in `proxy.ts`) does not yet, `router.replace('/')` fires, `proxy.ts` redirects that request straight back to `/prelaunch` (full navigation, new mount), `hasRedirected` is `false` again, `tick()` runs synchronously on mount, computes `isExpired` from the client clock again, and redirects again. This repeats every mount until the server's clock also crosses the target. For a normal few-hundred-ms skew this self-resolves almost instantly and is invisible; for a user with a meaningfully wrong system clock (fast by minutes/hours — not rare on real devices) this is a continuous flicker loop between `/` and `/prelaunch` for as long as the skew persists, rather than the single clean redirect the plan and RED suite assume.

This is exactly the concurrency/ordering case the review brief asked to check ("that the redirect cannot fire repeatedly") — it doesn't fire repeatedly *within* a mount, but the mount boundary isn't the right scope to reason about it in, because the server disagreeing with the redirect is itself what re-triggers a mount.

Fix: don't let a server-rejected redirect retry immediately. Cheapest correct option — have the hook only trust its own redirect once per page lifetime using something that survives the bounce (e.g. a `sessionStorage` flag checked before calling `router.replace`, cleared once the app actually reaches `/`), or simply stop calling `router.replace` from the client at all once `isExpired` and instead poll a tiny server timestamp before redirecting so the client only ever agrees with a server that's already unlocked. Given launch timing tolerates being briefly wrong far better than it tolerates a loop, the simplest fix is a short exponential backoff (skip the immediate re-fire, retry the redirect at most once per few seconds) rather than once-per-mount.

Not critical: it doesn't affect any other user, leaks nothing, and is self-limiting for realistic (sub-minute) clock drift. But it is a real, previously-unconsidered edge case worth a fix or at least a recorded, deliberate trade-off before shipping — right now it's neither tested nor mentioned anywhere in `clarifications.md` or the plan's risk table.

## Medium

**2. Phase 5 documentation reconciliation not done — `docs/vi/system/architecture.md:7`, `docs/vi/generated/feature-list.md`, `docs/decisions/`**

`phase-05-integration-and-review.md` lists this as an owned deliverable with its own Success Criteria, and none of it has landed:

- `docs/vi/system/architecture.md:7` still reads *"không có `middleware.ts`"* — false now that `proxy.ts` gates every route. A reader of that doc has no idea a request-interception layer exists.
- No `F010` entry in `docs/vi/generated/feature-list.md`.
- No `docs/decisions/ADR-002-*` (fail-open + gate-at-proxy-layer) — `docs/decisions/` still holds only `ADR-001`.
- No `docs/vi/features/countdown-prelaunch/` promoted spec.
- The 5 design defects and 2 unresolved questions live in `clarifications.md` (plan-local) but were not filed anywhere the design owner would see them, per phase step 7.

This is inherited scope, not a defect in the code that was written — but per the review mandate's "Completeness" check, it's an acceptance criterion the plan recorded that is unmet, and it should not be silently dropped when the branch merges. Flagging so it's a conscious decision (ship code now, docs in a follow-up) rather than a gap nobody notices until the next reader trusts the stale architecture doc.

**3. Stray debug artifacts left in the working tree — `capture-prelaunch.mjs`, `test-output.log`**

Both are untracked at the repo root. `capture-prelaunch.mjs` is the ad hoc Playwright script used to produce the three `plans/.../design/prelaunch-*px.png` screenshots — useful during the build, not part of the shipped feature. `test-output.log` is a leftover run log ending in `Error: http://localhost:3000 is already used...` — noise from a port conflict during development, not something that should ever land in the tree. Neither is committed, so neither is currently a merge risk, but delete both (or move the capture script into a `scripts/` dir with a real purpose) before `git add`, and consider a `*.log` gitignore entry to prevent recurrence.

## Low

**4. `aria-label` + visible text on the same node may double-announce — `components/prelaunch/countdown-unit.tsx:20-23`**

The container carries `aria-label="{value} {label}"` while its children (`DigitBox` × 2 + the label `span`) are also plain visible text, not `aria-hidden`. A `<div>` with no ARIA role doesn't reliably suppress its children's accessible names in every screen reader — behavior here is AT-dependent, and some (not all) will read the `aria-label` and then walk into the children and read the digits and label again. If double-announcement turns out to matter for this screen, mark the two `DigitBox` glyph spans and the label span `aria-hidden="true"` inside a unit that already carries the composed `aria-label`, mirroring what `digit-box.tsx`'s decorative background layer already does. Not blocking — the 1s-tick-hostile-to-`aria-live` reasoning in the code comment is correct, this is a second-order nit on top of that decision.

## Edge Cases Turned Up

- **Fail-open confirmed at both boundaries**: `resolveGateRedirect` returns `null` for `undefined`, `''`, and `'not-a-date'` regardless of `pathname` (`gate.test.ts:39-52`) — a config typo genuinely never locks the site, matching the clarification.
- **Matcher correctness verified by inspection**: `'/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'` excludes any path containing a dot anywhere after the leading slash (not just the four literal alternatives) — this is what actually protects `/saa/Prelaunch_BG.png`, `/fonts/digital-numbers.woff2`, and any future dotted asset, not merely the three named exclusions. Worth knowing this is *why* it works, since the comment only names the literal alternatives.
- **Hydration match confirmed**: `usePrelaunchCountdown`'s `SSR_DEFAULT` (`00/00/00`) is only replaced inside the mount `useEffect`, never during render — same shape as `CountdownTimer` and `SessionProvider`. No hydration mismatch risk found.
- **Digit DOM contract verified**: `CountdownUnit`'s rendered text is exactly `{tens}{ones}{label}` with no separator node, matching the `^\d{2}HOURS$`-style E2E assertions — confirmed by reading the JSX tree, not just trusting the comment.
- **Responsive scaling math checked, not just eyeballed**: every `clamp(min, Nvw, max)` pair is calibrated so `N% × 1512px = max` and `N% × 375px = min` (e.g. digit box width `clamp(19.05px, 5.079vw, 76.8px)`: `5.079% × 1512 ≈ 76.8`, `5.079% × 375 ≈ 19.05`). The scaling is linear and bottoms out exactly at the 375px floor the plan named as derived-not-designed — sound, no overflow found at any of the three captured widths.
- **Border color traced through the token layer**: `digit-box.tsx`'s `border-accent` resolves via `--color-accent: var(--accent)` → `#ffea9e`, matching the spec's `#FFEA9E` — not to be confused with the similarly-named `--color-border-accent` (`#998c5f`), which is a different, unused token here. Worth noting because the two are one letter apart in the CSS and an easy mix-up for the next person touching this file.
- **Single-mount redirect guard confirmed correct in isolation** (`hasRedirected.current` + `clearInterval` before `router.replace`) — see High finding #1 for the cross-mount case this doesn't cover.
- **No `.env` committed, `.env.example` carries no secret** — confirmed by history and content read.
- **Homepage suite re-pointing verified deliberate, not sloppy**: the `homepage-with-open-gate` project comment explicitly explains why `homepage-invalid-env` must be excluded from the `homepage.*` glob (double-match + false-positive pass) — read the regex myself and confirmed the exclusion is necessary and correctly written, not just asserted in a comment.

## Done Well

- Fail-open is genuinely enforced at the pure-function boundary and unit-tested at both extremes (invalid target, exact zero, zero−1ms) — this is the hardest part of the feature to get right and it's right.
- Clean single-direction dependency: `gate.ts` and the display hook both derive from the one `computeCountdown`, so they provably cannot disagree on the target instant — matches the plan's stated non-negotiable.
- The three-webServer Playwright setup (distinct `NEXT_DIST_DIR` per port, per-project `testMatch` regex with a documented reason for the exclusion) is more careful than most projects bother to be, and the `.gitignore`/`eslint.config.mjs`/`tsconfig.json` follow-on edits for `.next-*` are the right, complete set — nothing was missed there.
- Every E2E assertion I checked is falsifiable: no `toContain('/')`, no swallowed rejections, no `toBeTruthy()` on a value that's always truthy. The `homepage-navigation.spec.ts` fix (`new URL(page.url()).pathname` instead of `.toContain('/')`) is exactly the right correction and is commented with why.
- Design-token fidelity is high: gradient, blur, radius, opacity, border color, and typography all trace back to `clarifications.md`'s table without deviation beyond the explicitly accepted ones (font fallback, sub-1512 derivation, vertical centering).

## Actions In Order

1. Decide and implement a fix (or a recorded, deliberate accept) for the clock-skew redirect loop in `use-prelaunch-countdown.ts` (High #1).
2. Delete `capture-prelaunch.mjs` and `test-output.log` from the working tree before staging (Medium #3).
3. Complete or explicitly defer Phase 5's doc reconciliation (`architecture.md` middleware claim, F010, ADR-002) — pick one and make it visible in the plan status rather than leaving it silently open (Medium #2).
4. Optional: `aria-hidden` the redundant child text nodes in `countdown-unit.tsx` if AT double-announcement is confirmed to matter (Low #4).

## Numbers

- Type coverage: `npx tsc --noEmit` clean (orchestrator-verified, not re-run)
- Test coverage: 55 E2E + 32 unit passing (orchestrator-verified, not re-run); no weakened assertions found on inspection
- Lint findings: 0 (orchestrator-verified `npm run lint` clean)
- Files reviewed: 19 code/config files + 4 plan/clarification docs

## Still Unresolved

- Whether the clock-skew loop (High #1) is worth fixing now or accepting as a known, documented trade-off is a product call, not something I can resolve as reviewer.
- Phase 5 docs: confirm with the plan owner whether doc-writer runs before or after this merges.
