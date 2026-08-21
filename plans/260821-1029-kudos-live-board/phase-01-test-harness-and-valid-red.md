---
phase: 1
title: "Test harness correction and valid RED for /kudos"
owner: tester
status: complete
priority: P1
effort: 1.5h
feature: F013
test_policy: e2e-red-first
depends_on: []
concurrent_with: []
mode: test-harness
---

# Phase 1 — Test harness correction and valid RED

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`plan.md`](plan.md) · [`dom-contract.md`](dom-contract.md) (this phase resolves C1–C4)
- [`../reports/tester-260821-1035-kudos-board-red.md`](../reports/tester-260821-1035-kudos-board-red.md) — the RED report being corrected
- Precedent: [`../260820-1020-award-system-page/phase-01-strict-red-e2e-contract.md`](../260820-1020-award-system-page/phase-01-strict-red-e2e-contract.md) and the `awards-page` project comment at `playwright.config.ts:22-30`
- `AGENTS.md`: Next.js 16.3.1 — read the relevant guide under `node_modules/next/dist/docs/` before touching config

## Overview

**Priority:** P1 — hard gate. **Status:** pending.

The three kudos spec files exist and exit non-zero, but for the wrong reason. They match no
dedicated Playwright project, so they fall through the `prelaunch-gate` negative lookahead onto
`http://localhost:3000`, where `NEXT_PUBLIC_EVENT_START_AT` is future-dated and
`lib/prelaunch/gate.ts:19` `ALWAYS_ALLOWED = ['/login', '/auth/callback']` does not include
`/kudos`. Every `page.goto('/kudos')` therefore 307s to `/prelaunch`. A RED caused by a gate
redirect is a config failure, not a screen assertion failure, and the `e2e-red-first` rule does not
accept it. This phase repoints the harness, removes one assertion that contradicts the sealed
contract, and re-records a RED that is genuinely about the missing screen.

## Key Insights

- The awards run hit the identical trap and solved it with a second project on port 3200 (past-dated,
  gate open). Follow that precedent exactly; do **not** add `/kudos` to `ALWAYS_ALLOWED` — that would
  change production gate behaviour and force an edit to `lib/prelaunch/gate.test.ts`.
- `e2e/kudos-board-layout.spec.ts:77-78` asserts a Pan/Zoom **button is visible**. Clarifications
  (second pass), FR-012 and SC-007 all require the control to be **omitted entirely** because its
  design node `3007:17479` is a 30×30 frame with zero children. No implementation can satisfy both.
  Deleting the assertion is contract alignment, not weakening.
- Two assertions are sharper than they look and must be left **untouched** — they are the reason
  several seed and DOM rules exist: `parseInt(heartButton.textContent) + 1` (F27/F28/S2) and the
  department-option walk in the empty-state test (F21/S5).
- `page.getByRole('navigation').locator('a:has-text("Sun* Kudos")')` currently matches two elements
  (header nav + footer nav). That is fixed in Phase 5 by making the footer's current-route item a
  non-link — **not** by editing this test.

## Requirements

**Functional**
1. A `kudos-board` project in `playwright.config.ts` with `testMatch: /kudos-board.*\.spec\.ts$/`
   and `baseURL: 'http://localhost:3200'`.
2. `\|.*kudos-board` added to the `prelaunch-gate` project's negative lookahead so the specs no
   longer run twice, once against a locked gate.
3. `e2e/kudos-board-layout.spec.ts:77-78` (the Pan/Zoom `panZoomButton` locator and its
   `toBeVisible()`) deleted, with a one-line comment citing FR-012 and the clarification.
4. A re-recorded RED: real exit code, failure text proving the failures come from missing screen
   structure on a page that actually rendered (not a `/prelaunch` redirect).

**Non-functional**
- No new dependency, no runner scaffolding, no `webServer` added — port 3200 already exists.
- Spec files stay under 200 lines each.
- No other assertion in the three files is relaxed, guarded, skipped or deleted.

## Architecture

```
playwright.config.ts
  ├── prelaunch-gate      testMatch (?! … |.*kudos-board … )   :3000  gate LOCKED
  ├── awards-page         /awards-page.*\.spec\.ts$/           :3200  gate OPEN
  └── kudos-board  (NEW)  /kudos-board.*\.spec\.ts$/           :3200  gate OPEN
webServer[2] (existing): next build && next start --port 3200
                         NEXT_PUBLIC_EVENT_START_AT=2026-08-01T12:00:00+07:00
                         NEXT_DIST_DIR=.next-unlocked
```

Data flow: `npm run test:e2e` → project resolution by filename → `:3200` server → `proxy.ts` →
`resolveGateRedirect('/kudos', past-date)` returns no redirect → `app/kudos/page.tsx` renders → the
assertions fail on missing elements. That last hop is what makes the RED valid.

## Related Code Files

**Modify**
- `playwright.config.ts` — add the `kudos-board` project; extend the `prelaunch-gate` lookahead.
- `e2e/kudos-board-layout.spec.ts` — delete the two Pan/Zoom lines only.

**Create**
- `plans/260821-1029-kudos-live-board/evidence/red-kudos-board.txt` — raw runner output.

**Delete** — none.

**Read for context**
- `lib/prelaunch/gate.ts`, `proxy.ts` (understand the redirect, change neither).
- `e2e/kudos-board-interactions.spec.ts`, `e2e/kudos-board-feed-interactions.spec.ts` (verify no
  other assertion conflicts with [`dom-contract.md`](dom-contract.md)).

## Implementation Steps

1. Cut branch `feat/kudos-live-board` from `main`.
2. Read `playwright.config.ts:20-60` and the `awards-page` project block plus its comment.
3. Append the `kudos-board` project after `awards-page`, mirroring its shape and adding a comment
   that states why 3200 (the gate) — future readers will ask.
4. Add `|.*kudos-board` to the `prelaunch-gate` `testMatch` lookahead, in the same style as the
   existing alternatives.
5. Delete `e2e/kudos-board-layout.spec.ts:77-78` and leave a comment:
   `// Pan/Zoom is omitted entirely — design node 3007:17479 is empty (FR-012, SC-007, clarifications).`
6. Re-read the two remaining spec files against [`dom-contract.md`](dom-contract.md) §1–§10. Report
   any further contradiction as a finding; do **not** silently adjust anything else.
7. Run `npm run test:e2e -- kudos-board` and capture stdout/stderr verbatim to
   `evidence/red-kudos-board.txt`.
8. Confirm validity: exit code non-zero; at least one failure quotes a locator for page content
   (e.g. `text=Hệ thống ghi nhận và cảm ơn`); **no** failure mentions `/prelaunch`, a 307, a browser
   install, or a webServer timeout.
9. Record `redTestFiles`, `redCommand`, `redExitCode`, `redFailure` in the completion message —
   phases 4–7 receive them read-only.

## Todo List

- [x] Branch `feat/kudos-live-board` cut from `main`
- [x] `kudos-board` project added on `:3200` with an explanatory comment
- [x] `prelaunch-gate` lookahead excludes `kudos-board`
- [x] Pan/Zoom assertion deleted with a cited comment
- [x] Remaining two spec files re-read against `dom-contract.md`; contradictions reported
- [x] `npm run test:e2e -- kudos-board` run; output saved to `evidence/red-kudos-board.txt`
- [x] RED validity confirmed (no redirect / infra cause in any failure)
- [x] `redTestFiles` / `redCommand` / `redExitCode` / `redFailure` reported

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| The specs run against a gate-open server | `evidence/red-kudos-board.txt` shows `[kudos-board]` as the project and no `/prelaunch` in any failure | C2 |
| RED is real and caused by the screen | non-zero exit; ≥1 failure quotes a page-content locator | `e2e-red-first` rule |
| No test weakened | `git diff` on `e2e/` touches only the two Pan/Zoom lines | MoMorph rule 3 |
| Pan/Zoom conflict closed | no assertion anywhere expects a pan/zoom control | FR-012, SC-007, C1 |
| Unassertable cases recorded, not faked | TC `d662780b` → unit test (F43); `cac4b7a3`, `71b3ef43`, `31936b72` → declared unasserted | C3, C4 |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| The new project's `testMatch` also captures a future `kudos-*` spec that wants the locked gate | Low × Med | Match the full `kudos-board` prefix, not `kudos`; document it in the config comment |
| Removing the Pan/Zoom lines looks like weakening a test in review | Med × Med | Comment cites FR-012 + SC-007 + the clarification; this file is the written justification |
| Port 3200 is shared with three other projects and `reuseExistingServer: false` — build time grows | Med × Low | Accept; the server is already built for `awards-page`, no fourth server is added |
| A further hidden contradiction surfaces at Phase 8 instead of now | Med × High | Step 6 is a deliberate full re-read of both remaining files against the frozen contract |
| The corrected RED accidentally passes some test that was previously "failing" on the redirect | Med × Low | Expected and fine — record the real pass/fail split in the evidence file rather than forcing failures |

## Security Considerations

None new. `lib/prelaunch/gate.ts` and `proxy.ts` are read-only here: the launch gate keeps its
production behaviour, and `/kudos` gains no exemption. Route protection stays deferred project-wide
(TC `71b3ef43`). No secret, token or `.env` value enters the config or the evidence file — the
evidence is runner output only.

## Next Steps

Unblocks Phase 2 and Phase 3, which run concurrently. Phases 4–7 receive the RED tuple read-only
and may not edit `e2e/**` or `playwright.config.ts`. Phase 8 re-runs the identical command for GREEN.

## Out of scope

`lib/prelaunch/**` and `proxy.ts` (no gate change), `ALWAYS_ALLOWED`, any application code, any new
test file, any new spec assertion, installing or scaffolding a runner, and the four deferred
destinations. `test_policy: e2e-red-first`.
