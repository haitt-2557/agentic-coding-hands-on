---
phase: 5
title: "Integration, review and docs reconciliation"
owner: [reviewer, doc-writer]
status: in-progress
priority: P2
effort: 1h
depends_on: [4]
---

# Phase 5 — Integration + Review

## Context Links

- Plan: [`plan.md`](plan.md) · Phase 4 evidence in `plans/260819-0913-countdown-prelaunch/design/`
- Review completed: `plans/reports/reviewer-260819-1040-prelaunch.md` (8/10, 0 critical)
- Spec drafts to promote: [`spec/countdown-prelaunch/`](spec/countdown-prelaunch/), [`spec/system/architecture.md`](spec/system/architecture.md)
- Live docs: `docs/vi/system/architecture.md`, `docs/vi/generated/feature-list.md`, `docs/decisions/`
- Design defects to report: [`clarifications.md`](clarifications.md) § Design defects (5 items)

## Overview

**Priority:** P2 · **Status:** in-progress (code review complete, doc reconciliation in progress)

Code review complete: 8/10, 0 critical, 2 High findings both addressed (clock-skew loop fixed via
sessionStorage; High was pre-implementation). Docs reconciliation in progress via `doc-writer`
(concurrent with delivery tracker). No new behaviour, documentation only.

## Key Insights

- **Code review complete (8/10, 0 critical).** Reviewer flagged 1 High (clock-skew redirect loop —
  fixed via sessionStorage throttle), 2 Medium (Phase 5 docs not yet done, stray artifacts).
- **Clock-skew High fixed before review submission.** Was never a test coverage gap (single-shot
  guard correct in isolation); required cross-mount reasoning not visible in a single mount.
  `sessionStorage` flag survives unmount, 30s throttle prevents immediate re-fire.
- `docs/vi/system/architecture.md` currently states the project has **no** middleware. That sentence
  is now false and is the single highest-value doc fix in this phase.
- The plan-local `spec/system/architecture.md` delta says "middleware.ts (dự kiến)". Shipped as
  `proxy.ts` per Next 16 convention. Promote with the wording corrected — do not promote the stale name.
- The gate changes the *reachability* of every existing route. Any doc that describes `/` as the
  entry point needs a pre-launch caveat, not a rewrite.
- Two decisions deserve an ADR because a future reader will otherwise re-litigate them: fail-open on
  invalid config, and gating at the proxy layer instead of per-page.

## Requirements

**Functional** — reviewer verdict on the full diff with every finding graded and carrying a concrete
fix; F010 registered; architecture reconciled; changelog entry; 5 design defects filed back to the
design owner.

**Non-functional** — markdown files under `docs.maxLoc: 800`; no AI references in commits; spec
promotion is surgical, not a rewrite.

## Architecture

Documentation and review only. No runtime change.

## Related Code Files

**Create:** `docs/decisions/ADR-002-prelaunch-gate-at-proxy-layer.md`,
`plans/reports/reviewer-260819-phase05-code-review.md`,
`plans/260819-0913-countdown-prelaunch/reports/design-defects-260819-prelaunch.md`
**Modify:** `docs/vi/system/architecture.md`, `docs/vi/generated/feature-list.md`,
`docs/vi/features/countdown-prelaunch/**` (promoted spec)
**Delete:** none
**Must not touch:** all application code, `e2e/**`, `playwright.config.ts`

## Implementation Steps

1. `reviewer` reads the full branch diff: redirect-loop safety, matcher coverage, hydration, the
   single-shot redirect guard, file sizes, and whether anything reads the mock session.
2. Address critical and warning findings in the owning track; re-run Phase 4's command after any fix.
3. `doc-writer` corrects the "no middleware" claim in `docs/vi/system/architecture.md` and adds the
   request-interception layer plus the `/prelaunch` route row.
4. Promote the spec drafts to `docs/vi/features/countdown-prelaunch/`, replacing "middleware.ts" with
   `proxy.ts` and closing the resolved Unresolved Questions (matcher list, fail-open).
5. Register F010 in `docs/vi/generated/feature-list.md`.
6. Write ADR-002: gate at the proxy layer, fail-open on invalid config, and what should trigger
   replacing the env var with an endpoint.
7. File the 5 design defects back to the design owner, plus the two still-open items (font file,
   sub-1512px responsive) with what each blocks.

## Todo List

- [x] Reviewer verdict filed at `plans/reports/reviewer-260819-1040-prelaunch.md` (8/10, 0 critical)
- [x] High findings closed: clock-skew loop fixed via sessionStorage throttle (30s)
- [ ] `docs/vi/system/architecture.md` — "no middleware" corrected, layer + route documented (in-progress: doc-writer)
- [ ] Spec promoted to `docs/vi/features/countdown-prelaunch/` with `proxy.ts` wording
- [ ] F010 registered in the feature list
- [ ] ADR-002 written (fail-open + gate-at-proxy-layer)
- [ ] Design defects + open items reported back (5 defects + 2 open: font file, sub-1512px responsive)
- [x] `npm run lint` clean · `npm run build` succeeds · `npm run test:e2e` 55 passed (verified orchestrator)

## Success Criteria

- No unaddressed critical or warning finding.
- No doc still claims the project has no request-interception layer, and none names `middleware.ts`
  as the shipped file.
- The three commands above pass on the final tree.
- `docs.maxLoc: 800` respected on every markdown file touched.

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| Review deferred because the suite is green | Med | High | Phase 5 is a gate on the branch, not optional polish |
| Spec promoted with stale "middleware.ts" wording | Med | Med | Explicit step 4 and success criterion |
| Docs rewritten wholesale instead of surgically | Med | Med | Delta-only instruction inherited from the spec-authoring contract |
| The gate ships to production with a target date already passed and nobody notices | Low | Med | Fail-open is documented in ADR-002 as intended, observable behaviour |

## Security Considerations

The review must confirm the shipped gate reads no role, no cookie and no session state, and that no
document describes it as authorization. Confirm nothing beyond `NEXT_PUBLIC_*` reached the client and
no `.env*` file other than `.env.example` is tracked.

## Next Steps

Merge `feat/countdown-prelaunch`. Rollback is a per-phase revert; reverting `proxy.ts` alone restores
full app navigation and leaves `/prelaunch` reachable but unenforced — the safest partial rollback if
the gate misbehaves in production. Outstanding: the "Digital Numbers" font file (drop into
`public/fonts/`, no code change) and design-owner confirmation of the sub-1512px scaling.
