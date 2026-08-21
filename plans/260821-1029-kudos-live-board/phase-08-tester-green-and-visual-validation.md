---
phase: 8
title: "Tester GREEN and visual validation for /kudos"
owner: tester
status: complete
priority: P1
effort: 2h
feature: F013
test_policy: e2e-red-first
depends_on: [5, 6, 7]
concurrent_with: []
mode: verification
---

# Phase 8 — Tester GREEN and visual validation

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `MaZUn5xHXZ`, node `2940:13431`
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`phase-01-test-harness-and-valid-red.md`](phase-01-test-harness-and-valid-red.md) — the RED tuple this phase must invert
- [`dom-contract.md`](dom-contract.md) — the rule any failure should be traced back to
- [`design/kudos-content.md`](design/kudos-content.md) — the reference for every visual comparison
- Precedent: [`../260820-1020-award-system-page/phase-04-tester-green-and-visual-validation.md`](../260820-1020-award-system-page/phase-04-tester-green-and-visual-validation.md)

## Overview

**Priority:** P1. **Status:** pending.

Re-run the exact command Phase 1 recorded, prove GREEN without touching a single assertion, then own
all browser evidence: Playwright MCP captures at 1440 / 768 / 375 compared against the frame, plus a
console-error sweep and a keyboard pass over the four deferred triggers. Regression matters as much as
the new suite — Phase 5 changed shared chrome, so the whole E2E suite runs, not just the kudos files.

## Key Insights

- **A failure here is a bounded fix request, not a licence to edit tests.** Every failure should be
  traceable to a numbered rule in [`dom-contract.md`](dom-contract.md); the fix goes back to the phase
  that owns the file. Weakening, guarding or skipping an assertion is out of bounds.
- **Phase 5 touched `site-footer.tsx` and `site-header.tsx`**, both rendered on every page. The
  homepage, awards, prelaunch and login suites are the real regression surface for this run.
- The strict-mode traps to watch specifically: two `prev`/`next` labels (F16), two nav `<a>`s named
  `Sun* Kudos` (F9), more than one `[role="tooltip"]` (F32), more than one `alt`-`KUDOS` image (F6),
  a duplicated stat label (F39).
- **Counting-based filter assertions can fail on data, not on UI** (S4/S6). If `0e56cacb`,
  `159fed13` or `63645b03` fails, check the seed before touching a component — the fix is likely
  Phase 3's.
- TC `d662780b` is verified by `npm run test:unit`, not by the browser. Run both.

## Requirements

**Functional**
1. `npm run test:e2e -- kudos-board` GREEN, exit code 0, zero skips.
2. `npm run test:e2e` (full suite) GREEN — no regression from the chrome changes.
3. `npm run test:unit` GREEN — including `leaderboard.test.ts` (TC `d662780b`) and
   `kudos-records.test.ts` (the seed contract).
4. Playwright MCP captures at 1440, 768 and 375 saved under `evidence/`, each compared against
   `get_frame_image` for the corresponding region.
5. A console/`pageerror` sweep across a full page visit with zero uncaught errors.
6. A keyboard pass proving the four deferred triggers receive visible focus and navigate nowhere.
7. A written verdict per SC-001…SC-009.

**Non-functional**
- No assertion added, relaxed, guarded, skipped or deleted. No `test.fixme`, no `test.skip`.
- `npx tsc --noEmit` and `npm run lint` clean across the repo.
- Evidence filenames say what they show; captures include the region and the viewport width.

## Architecture

```
npm run test:e2e -- kudos-board   → project kudos-board :3200 (gate open)   → GREEN
npm run test:e2e                  → all 6 projects                          → no regression
npm run test:unit                 → playwright.unit.config.ts (testDir ./lib) → GREEN

Playwright MCP → /kudos at 1440 / 768 / 375
   ├─ banner + action bar          vs design §1–§2
   ├─ highlight header + carousel  vs design §3.1–§3.4   (incl. gradient overlays)
   ├─ spotlight board              vs design §4          (no Pan/Zoom present)
   ├─ all kudos feed               vs design §5
   └─ sidebar                      vs design §6
```

## Related Code Files

**Modify** — none in application code. `e2e/**` and `playwright.config.ts` are owned here but should
need no change; any change is a reported finding first.
**Create** — `evidence/green-kudos-board.txt`, `evidence/green-full-suite.txt`,
`evidence/unit.txt`, `evidence/kudos-{1440,768,375}-*.png`, and the report at
`plans/reports/tester-{date}-kudos-board-green.md`.
**Read for context** — the three kudos spec files, `dom-contract.md`, `design/kudos-content.md`.

## Implementation Steps

1. Confirm phases 5, 6 and 7 report done and `npx tsc --noEmit` is clean (the concurrent-window seam
   is closed).
2. Run `npm run test:e2e -- kudos-board`; save output. If red, map each failure to its
   `dom-contract.md` rule and its owning phase before doing anything else.
3. Run the full `npm run test:e2e`; save output. Treat any homepage/awards failure as a Phase 5 chrome
   regression, not as an unrelated flake.
4. Run `npm run test:unit`; save output.
5. Playwright MCP: visit `/kudos` at 1440, capture each region; repeat at 768 and 375. Compare each
   against `get_frame_image` for that region.
6. Verify by inspection, not by assertion: no Pan/Zoom control anywhere; the side carousel cards are
   dimmed only by the two gradient overlays; the leaderboard title wraps into two lines; verbatim
   whitespace survives (the pill placeholder, the trailing-space names, the double space in the
   hashtag row).
7. Sweep console and `pageerror` across a full visit including a filter change, a heart toggle, a Copy
   Link, a spotlight search and a scroll to exhaustion.
8. Keyboard pass: Tab to the submit pill, `Xem chi tiết`, an avatar/name, and `Mở Secret Box`;
   activate each; confirm visible focus and no navigation.
9. Write the report: GREEN evidence, the visual diff verdict per region, responsive findings, the
   SC-001…SC-009 table, and the unasserted set (`cac4b7a3`, `71b3ef43`, `31936b72`) restated.
10. Any material mismatch → a bounded fix request to the owning phase, with the rule id and the
    capture attached.

## Todo List

- [ ] `tsc --noEmit` + `lint` clean repo-wide
- [ ] `npm run test:e2e -- kudos-board` GREEN, exit 0, zero skips
- [ ] Full `npm run test:e2e` GREEN — no chrome regression
- [ ] `npm run test:unit` GREEN incl. `leaderboard.test.ts` and `kudos-records.test.ts`
- [ ] Captures at 1440 / 768 / 375 for all five regions, saved under `evidence/`
- [ ] Each region compared against `get_frame_image`; verdict written
- [ ] No Pan/Zoom control present anywhere
- [ ] Side-card dimming is the gradient overlays only
- [ ] Verbatim whitespace verified in the rendered DOM
- [ ] Console/`pageerror` sweep clean across every interaction
- [ ] Keyboard pass over the four deferred triggers
- [ ] Report written to `plans/reports/`; no assertion weakened

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| GREEN on the same command as the RED | exit 0 on `npm run test:e2e -- kudos-board`; identical file set | `e2e-red-first` rule |
| No test weakened | `git diff` on `e2e/` is empty for this phase | MoMorph rule 3 |
| No regression from shared chrome | full suite green, homepage + awards included | F9, F10 |
| Unit contract holds | `test:unit` green; seed assertions still true | TC `d662780b`, S1–S7 |
| Visual fidelity | per-region verdict against `get_frame_image` at 1440 | SC-001…SC-008 |
| Responsive holds to the 375px floor | no horizontal overflow at 768 or 375 | edge-cases row 8 |
| Deferred triggers reachable and inert | keyboard pass recorded | FR-015–FR-018, SC-009 |
| Clean console | zero uncaught errors during a full interaction pass | SC-001, BR-007 |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| Temptation to relax an assertion to reach GREEN | Med × **High** | Every failure is mapped to a `dom-contract.md` rule and returned to the owning phase; `git diff` on `e2e/` must be empty |
| A chrome regression surfaces only in the homepage suite and is dismissed as unrelated | Med × High | Step 3 names Phase 5 as the prime suspect for any homepage/awards red |
| A count-based filter test fails and gets "fixed" in a component when the seed is wrong | Med × High | Step 2 requires mapping to the rule first; S4/S6 point at Phase 3 |
| Visual comparison is done by eye on the whole 5862px page and misses regional drift | High × Med | Region-by-region capture and comparison, not one full-page screenshot |
| Flake from the four `waitForTimeout` calls in the carousel tests | Med × Med | Re-run twice; report flake rather than adding a retry or a longer timeout |
| Port 3200 build contention with three other projects extends the run | Med × Low | Accept; record wall time in the report |
| Declaring GREEN while a test is skipped | Low × High | Assert zero skips explicitly in the evidence |

## Security Considerations

Evidence must carry no secret: no `.env` contents, no Supabase key, no token in a capture or a log.
Screenshots contain only fixture data. The clipboard test grants browser permissions inside the test
context only. Confirm this phase changed no gate behaviour: `/kudos` is still public and route
protection is still deferred (TC `71b3ef43` remains unasserted).

## Next Steps

On GREEN, hand to Phase 9 for review, docs and status reconciliation. On a material mismatch, return a
bounded fix to the owning phase (4, 5, 6 or 7) and re-run this phase — do not proceed to 9.

## Out of scope

Application code (`app/**`, `components/**`, `lib/**`) — findings go back to the owning phase;
Pan/Zoom behaviour (`cac4b7a3`), route protection (`71b3ef43`), the special-day heart multiplier
(`31936b72`), the four deferred destinations, and any new test file or new assertion.
`test_policy: e2e-red-first`.
