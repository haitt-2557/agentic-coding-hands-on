# Plan Reconciliation — Countdown Prelaunch Delivery

**Date:** 2026-08-19 · **Plan:** `plans/260819-0913-countdown-prelaunch/plan.md`  
**Status:** Phases 1-4 complete; Phase 5 in progress (code review done, docs in progress)

## Verified Delivered State

| Metric | Evidence |
|--------|----------|
| E2E tests | 55 passed, exit 0 across 4 Playwright projects |
| Unit tests | 40 passed (32 pre-existing + 8 new in `lib/prelaunch/`) |
| Lint | `npm run lint` clean |
| Type check | `npx tsc --noEmit` clean |
| Build | `npm run build` succeeds |
| Visual | Captures at 1512/768/375px in `plans/260819-0913-countdown-prelaunch/design/verified-prelaunch-*.png` |
| Code review | 8/10, 0 critical findings in `plans/reports/reviewer-260819-1040-prelaunch.md` |

## Phases: Plan vs. Delivered

| Phase | Plan Status | Delivered | Notes |
|-------|-------------|-----------|-------|
| 1 | pending | **complete** | RED proven valid round 2 after orchestrator fixes (D1/D2/D3). 14 genuine assertion failures, 41 passing. |
| 2 | pending | **complete** | Track A presentational UI built; all design values match clarifications.md table. Font degrades to fallback as expected. |
| 3 | pending | **complete** | Track B gate + countdown behavior; seam landed first, unblocking A. Ran concurrently with Phase 2. |
| 4 | pending | **complete** | GREEN proven; homepage suite (re-pointed to `:3200`) remains green. Visual validation at 3 widths. |
| 5 | pending | **in-progress** | Code review complete (8/10, 0 critical). Doc reconciliation in progress via `doc-writer`. |

## Deviations from Blueprint (Intentional and Recorded)

### Built, Not Planned
1. **`middleware.ts` → `proxy.ts`** — Next 16 convention change. Already recorded in plan; wording corrected in Phase 5 spec promotions.
2. **Red gate iterations** — First RED submission rejected (4 connection failures + 3 contract defects). Orchestrator applied fixes; round 2 valid. Recorded in `evidence/red-gate-evidence.md`.
3. **Reviewer High (pre-implementation)** — Clock-skew redirect loop fixed before review. Now guarded by `sessionStorage` throttle (30s), self-heals instead of flickering.
4. **Latent bug fix** — Days unit truncated above 99 (`122` → `12`). Fixed via `capDisplayDays` in `lib/prelaunch/display.ts` + 8 regression tests in `lib/prelaunch/display.test.ts`.
5. **Responsive retuning** — Orchestrator adjusted responsive floors from pure proportional to hold 45% of frame below ~680px, preserving 2:1 digit-to-label ratio.
6. **Orchestrator collateral fixes** — `eslint.config.mjs` (`.next-*/**` exclusion), `homepage-navigation.spec.ts:20` (false-positive assertion), overlapping Playwright testMatch.

### Still Open (Documented)
1. **Digital Numbers font** — `public/fonts/digital-numbers.woff2` not supplied. `@font-face` fallback degrades gracefully; 404 on font per load, expected. Zero-code-change swap-in once file lands.
2. **Sub-1512px responsive** — Derived, not designed. Verified at 1512/768/375px; responsive math checked (clamp scaling calibrated correctly). Flagged to design owner.
3. **Days > 99** — Plateau at 99 by decision. A prelaunch page 99+ days ahead will show `99`.

## Files Updated

- `plan.md` — status: pending → complete; phases 1-4 marked complete; Phase 5 in-progress
- `phase-01-red-gate-contract-reconciliation.md` — status: pending → complete; todo list checked
- `phase-02-track-a-presentational-ui.md` — status: pending → complete; todo list checked
- `phase-03-track-b-gate-and-countdown-behaviour.md` — status: pending → complete; Key Insights updated with delivered fixes; todo list checked
- `phase-04-green-and-visual-validation.md` — status: pending → complete; Key Insights updated; todo list checked
- `phase-05-integration-and-review.md` — status: pending → in-progress; Key Insights updated; todo list reflects code review done, docs pending

## Discrepancies Found

None. Every phase file's status and checkboxes are now consistent with:
- Orchestrator-verified test results (55 E2E, 40 unit, lint, tsc, build all passing)
- Reviewer verdict (8/10, 0 critical)
- Visual evidence (design/verified-prelaunch-*.png captures)
- Code inspection (proxy.ts, use-prelaunch-countdown.ts, gate.ts all match plan intent)

## Unresolved (Recorded, Not Resolved)

Phase 5 doc reconciliation is in progress via `doc-writer` (concurrent with delivery tracker). Still pending:
- `docs/vi/system/architecture.md` — "no middleware" claim needs correction
- `docs/vi/generated/feature-list.md` — F010 registration
- `docs/decisions/ADR-002-*` — fail-open + gate-at-proxy-layer
- Spec promotion to `docs/vi/features/countdown-prelaunch/`
- Design defects filing (5 items + 2 open items)

All Phase 5 ownership and success criteria remain in the plan file; no changes to that delegation.

## Summary

Blueprint vs. delivered: **Phase 1-4 complete with no correctness regressions.** Deviations are intentional (Next 16 convention), pre-implementation fixes (clock-skew loop), or documented improvements (responsive retuning, latent bug fix). All test evidence independently verified by orchestrator. Phase 5 documentation work is in parallel and tracked separately. Ready for merge pending Phase 5 completion.
