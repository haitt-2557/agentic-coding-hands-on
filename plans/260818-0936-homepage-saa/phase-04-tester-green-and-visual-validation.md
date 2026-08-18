---
phase: 4
title: "Tester GREEN + Playwright-MCP visual validation"
owner: tester
status: completed
priority: P1
effort: 2h
test_policy: e2e-red-first
depends_on: [2, 3]
---

# Phase 4 — GREEN Rerun + Visual Validation

## Context Links

- RED evidence (Phase 1 report): `plans/reports/` — `redTestFiles`, `redCommand`, `redExitCode`, `redFailure`
- Phase 1 spec files: [`phase-01-strict-red-e2e-contract.md`](phase-01-strict-red-e2e-contract.md)
- Rendered design (comparison target): [`design/homepage-saa-full.png`](design/homepage-saa-full.png) (1512×4480)
- Clarifications (copy precedence + design defects): [`clarifications.md`](clarifications.md)
- Test cases: [`design/test-cases-i87tDx10uM.csv`](design/test-cases-i87tDx10uM.csv) — **ID-14 STALE**
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM · testPolicy `e2e-red-first`

## Overview

**Priority:** P1 · **Status:** pending

Rerun the **exact** `redCommand` to GREEN, then validate the rendered page against the design via
Playwright MCP. Owns all browser evidence for this run.

## Key Insights

- The command must be byte-identical to the recorded `redCommand`. A rerun with different file args,
  a different config, or a skipped project is not the same contract.
- GREEN with a weakened assertion is a failed phase. Tests are never edited to fit the code; a
  genuine spec defect gets escalated as a plan amendment, not a quiet edit.
- The same false-RED signature table applies in reverse: a run that never reaches the
  `\d+ (passed|failed)` summary line is not a GREEN either, it is infrastructure noise.
- Hover/focus/pressed rows (ID-23, ID-46, ID-51) are validated **here**, visually — they were
  deliberately left out of the E2E.
- Two logged design defects must **not** appear in the build and must not be flagged as mismatches:
  "Comming soon" (build says `Coming soon`) and "thuộc vè" (build says `thuộc về`). The frame's
  event details (`26/12/2025`, `Âu Cơ Art Center`, Livestream) are correct; the CSV's are stale.
- Responsive check needs three viewports: desktop 3 columns, tablet 2, mobile 2 (BR-004).

## Requirements

**Functional** — the recorded `redCommand` exits 0 with every assertion from Phase 1 passing;
visual comparison covers header, hero + countdown, Root Further copy, awards grid, Kudos promo,
floating widget, footer, plus the hover states and the three viewports.

**Non-functional** — no console errors and no hydration warnings on load; the `/awards` hash anchors
actually scroll; no broken links (ID-59); evidence artifacts are reproducible and archived.

## Architecture

```
redCommand ──► playwright.config.ts ──► chromium :3000    (valid env; Clock drives zero state)
                                    └─► invalid-env :3100 (unparseable env; fallback zero state)
                                          │
                                          ▼  exit 0 + "N passed"
Playwright MCP ──► navigate /  ──► capture desktop · tablet · mobile
                └─► hover nav link, CTA, award card  ──► compare against design/homepage-saa-full.png
                                          │
                          material mismatch │──► bounded fix task ──► momorph-ui-implementer
                                            └──► (max 2 rounds, then escalate)
```

## Related Code Files

**Modify:** none by default. `e2e/**` and `playwright*.config.ts` remain tester-owned and are edited
only to fix a genuine test defect — never to accommodate failing implementation.
**Create:** the evidence report in `plans/reports/`.
**Must not touch:** `app/**`, `components/**`, `lib/**`, `public/**`, `next.config.ts`, `.env.example`

## Implementation Steps

1. Kill stray dev servers on :3000 / :3100 so `reuseExistingServer` cannot attach to a foreign tree.
2. Run the recorded `redCommand` verbatim. Record exit code and the summary line.
3. On any failure: classify it as implementation defect vs test defect vs infrastructure. Only the
   middle case may touch a spec, and only with the reason written down.
4. Playwright MCP: load `/`, capture at desktop / tablet / mobile, and compare region by region
   against `design/homepage-saa-full.png` — header, hero, countdown, Root Further, awards grid,
   Kudos, widget, footer.
5. Hover-state validation: nav "Award Information" (ID-23), "ABOUT AWARDS" CTA (ID-46), an award
   card (ID-51).
6. Click through the six award cards; confirm `/awards#<slug>` lands on the matching section.
7. Check the console for errors and hydration warnings across all three viewports.
8. Package a bounded fix list (region, expected, actual, evidence) for `momorph-ui-implementer` on
   any material mismatch. Rerun steps 2–7 after the fix returns.
9. Write the evidence report to `plans/reports/`.

## Todo List

- [x] Stray dev servers cleared
- [x] `redCommand` rerun verbatim → exit 0 with summary line (39 passed, +1 new ID-59 link-integrity test)
- [x] Desktop / tablet / mobile captures taken and compared
- [x] Hover states ID-23, ID-46, ID-51 validated
- [x] Six hash anchors verified on `/awards`
- [x] Console clean across all viewports
- [x] All bounded fixes applied and integrated
- [x] Evidence report in `plans/reports/`

## Success Criteria

- The exact `redCommand` exits **0**, with a `N passed` summary line and no skipped project.
- Every TC ID listed in Phase 1's success criteria passes — **ID-0 through ID-13, ID-15 through
  ID-22, ID-24 through ID-45, ID-47 through ID-50, ID-52 through ID-60, ID-62**.
- Visual-only rows confirmed by capture: **ID-23, ID-46, ID-51**.
- Responsive columns confirmed 3 / 2 / 2 at desktop / tablet / mobile (**ID-15, ID-16**).
- **ID-14 is not asserted and not reported as a gap** — it is stale.
- No assertion was relaxed, skipped, or deleted between the RED and GREEN runs — provable by diffing
  the spec files against their Phase 1 state.

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| Tests quietly weakened to reach GREEN | Med | High | Diff spec files against the Phase 1 commit; any change needs a written test-defect justification |
| GREEN claimed from a run that never executed (infra failure, exit 0 with 0 tests) | Low | High | Require the `N passed` summary line and a non-zero test count |
| Endless visual fix loop | Med | Med | Two bounded rounds, then escalate with the outstanding deltas listed |
| Stale design defects reported as mismatches | Med | Low | The three superseded strings are named in Key Insights |
| Flaky first-load timing under Turbopack cold compile | Med | Low | Keep default timeouts; rely on auto-retrying assertions |
| Fix scope creep into `lib/**` or `e2e/**` from the UI agent | Low | Med | Fix tasks are bounded to `app/**`, `components/**`, `public/**` |

## Security Considerations

Role-gated assertions verify **UI visibility of a client-side mock**, nothing more. A green run is
not evidence that anything is access-controlled — there is no server-side check to exercise. Say so
plainly in the evidence report so a later reader cannot mistake this suite for a security test. Keep
screenshots and traces free of anything resembling a real credential; the mock identities are
fixtures.

## Next Steps

On GREEN plus a clean visual pass, release Phase 5 (integration, review, docs). On a failed GREEN or
a material mismatch, the phase is incomplete: return a bounded fix to `momorph-ui-implementer`
without weakening the test.
