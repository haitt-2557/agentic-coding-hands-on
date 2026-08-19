---
phase: 1
title: "RED gate — E2E contract reconciliation"
owner: tester
status: complete
priority: P1
effort: 2h
test_policy: e2e-red-first
depends_on: []
blocks: [2, 3, 4, 5]
---

# Phase 1 — RED Gate: Contract Reconciliation (BLOCKING)

## Context Links

- RED evidence accepted round 2: [`plans/260819-0913-countdown-prelaunch/evidence/red-gate-evidence.md`](evidence/red-gate-evidence.md)
- Decisions (authoritative): [`clarifications.md`](clarifications.md)
- Requirements: [`spec/countdown-prelaunch/technical-spec.md`](spec/countdown-prelaunch/technical-spec.md) (FR-002/003, BR-004–BR-007, DEC-001, SM-001)
- Gate architecture: [`spec/system/architecture.md`](spec/system/architecture.md)
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU · testPolicy `e2e-red-first`

## Overview

**Priority:** P1 · **Status:** complete

RED proven valid in round 2 after orchestrator applied fixes to the three contract defects (D1/D2/D3)
from round 1. Final state: `npm run test:e2e` exit 1 with 14 genuine assertion failures (no
connection/dependency/timeout failures), 41 tests passing. Phases 2 and 3 released concurrently
without merge barrier.

## Key Insights — the three defects

**D1 · The client-unlock test cannot pass while the server gate is locked.** `page.clock` moves the
*browser* clock only. Port 3000 carries a future date, so `proxy.ts` sees real server time and keeps
the gate shut; `router.replace('/')` therefore issues a request the gate bounces straight back to
`/prelaunch`, and `expect(page.url()).not.toContain('/prelaunch')` can never hold. **Fix:** a fourth
project + `webServer` (port 3300) whose env is computed at config load —
`NEXT_PUBLIC_EVENT_START_AT: new Date(Date.now() + 90_000).toISOString()` — running the unlock test
on the **real** clock, no `page.clock`. Server and browser then cross zero together and the assertion
becomes a true end-to-end proof of BR-005 + BR-006. Budget the wait inside the test timeout.

**D2 · The zero-state test races the redirect it also demands.** `shows 00 hours and 00 minutes at
target` installs the clock at exactly the target, which is the instant BR-006 requires the page to
leave. **Fix:** install at `eventTime - 1000`. One second of remaining interval renders `00/00/00` on
all three units with `isExpired: false`, so the digits are assertable and no redirect is owed.

**D3 · Shipping the gate turns the homepage suite red.** Project `chromium` points at port 3000
(future date). Once the gate exists, every `/` request there redirects to `/prelaunch` and all 40
homepage assertions fail — not a regression, the gate working as specified. **Fix:** re-point the
homepage specs at port 3200 (past date ⇒ gate open) and shift the clock times inside
`homepage-countdown.spec.ts` to sit *before* `2026-08-01T12:00:00+07:00`, so the display still counts
while the server gate stays open. Port 3000 stays future-dated for the locked prelaunch specs.
**Rejected alternative:** a `NEXT_PUBLIC_PRELAUNCH_GATE=off` kill switch — it would keep the suite
untouched at the price of a production knob that can silently disable the gate. YAGNI; test topology
is the cheaper place to absorb this.

**Not a defect — keep it exactly as written.** `getByText(/^\d{2}HOURS$/)` + `toHaveText('01HOURS')`
pins the DOM: a unit container whose normalized text is *precisely* digits+label. `getByText(/\bDAYS\b/)`
resolves to the label alone (the `\b` fails against `00DAYS`). Both are quoted into Phase 2 as the
structural contract — do not loosen them to make room for an implementation.

## Requirements

**Functional** — one durable screen-level contract for `/prelaunch` across four server states:
locked/future (3000), invalid env (3100), unlocked/past (3200), and crossing-zero-live (3300).
Assertions come from the 17 test cases plus `clarifications.md`. Unreachable-range rows
(`-1`, `25`, `60`) stay out of the E2E — `computeCountdown` cannot produce them; they are unit-test
work in Phase 3.

**Non-functional** — user-facing locators only; auto-retrying `expect()`; no `waitForTimeout` as a
synchronisation device; existing homepage specs keep passing after the re-point.

## Architecture

```
playwright.config.ts
├── chromium            → :3200 (past date, gate OPEN)   e2e/homepage-*.spec.ts  ← re-pointed (D3)
├── invalid-env         → :3100 ('not-a-date' ⇒ fail-open) e2e/homepage-invalid-env.spec.ts
├── prelaunch-locked    → :3000 (future date, gate SHUT) e2e/prelaunch-countdown.spec.ts
├── prelaunch-unlocked  → :3200                          e2e/prelaunch-countdown-unlocked.spec.ts
└── prelaunch-crossing  → :3300 (now + 90s, real clock)  e2e/prelaunch-unlock-live.spec.ts  ← NEW (D1)
```

## Related Code Files

**Create:** `e2e/prelaunch-unlock-live.spec.ts`
**Modify:** `playwright.config.ts` (project re-point + 4th project/webServer),
`e2e/prelaunch-countdown.spec.ts` (D2; move the unlock describe out to the live spec),
`e2e/homepage-countdown.spec.ts` (D3 clock shift)
**Delete:** none
**Must not touch:** `app/**`, `components/**`, `lib/**`, `proxy.ts`, `public/**`, `package.json`

## Implementation Steps

1. Re-point project `chromium` to `:3200` and adjust the `testMatch` set; confirm all 8 homepage
   specs still pass with the gate absent (they must, before the gate exists).
2. Shift `homepage-countdown.spec.ts` clock instants below `2026-08-01T12:00:00+07:00`.
3. Fix D2 in `prelaunch-countdown.spec.ts` (`eventTime - 1000`).
4. Move the two unlock tests into `e2e/prelaunch-unlock-live.spec.ts` on the new `:3300` project,
   real clock, timeout ≥ 150s.
5. Re-run `npm run test:e2e`. Confirm a `\d+ (passed|failed)` summary line, non-zero exit, and that
   every prelaunch failure names a **screen or redirect assertion** — never a port, boot timeout,
   browser binary or TS diagnostic.
6. Re-record `redTestFiles`, `redCommand`, `redExitCode`, `redFailure` into `plans/reports/`; pass
   them read-only into Phases 2 and 3.

**redCommand (exact):** `npm run test:e2e`

## Todo List

- [x] D3 — `chromium` project re-pointed to `:3200`; 8 homepage specs green pre-gate
- [x] D3 — `homepage-countdown.spec.ts` clock instants moved before the 3200 target
- [x] D2 — zero-state test installs the clock at `eventTime - 1000`
- [x] D1 — `:3300` project + dynamic-env webServer; unlock tests moved to `prelaunch-unlock-live.spec.ts`
- [x] `npm run test:e2e` re-run: non-zero exit, summary line present, failures are screen assertions
- [x] RED evidence re-recorded to `evidence/red-gate-evidence.md`; Phases 2 and 3 released together
- [x] `npm run lint` clean over `e2e/`

## Success Criteria

- Exit code non-zero with a printed summary line and `expect(...)`-shaped diffs.
- `redFailure` names a screen/redirect assertion (title absent, `/awards` not redirected).
- Homepage specs pass on `:3200` **before** the gate lands and are expected to keep passing after it.
- No assertion was weakened to accommodate an unwritten implementation.

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| D3 left unfixed → Phase 4 reads 40 gate-induced failures as regressions | High | High | Fixed here, before either track starts; Phase 4 re-checks |
| Four dev servers on one run push the suite past its timeouts | Med | Med | `:3300` is dev-mode and single-spec; keep `webServer.timeout` at 120s |
| The 90s live-unlock wait reads as flaky | Med | Med | Real crossing is the only honest proof; generous test timeout, one spec only |
| A defect is "fixed" by loosening an assertion instead of re-siting it | Low | High | Defect fixes are enumerated above; anything else is a plan amendment |
| Stray `next dev` on a port serves a different tree | Med | High | `reuseExistingServer: false` already set on every entry |

## Security Considerations

Nothing here authenticates or authorizes. `NEXT_PUBLIC_EVENT_START_AT` is a public event date; the
port-3300 value is generated at config load and is not a secret. The mock session must not be read as
access control anywhere in the suite.

## Next Steps

On valid RED, release Phase 2 and Phase 3 **concurrently** with `redTestFiles`, `redCommand`,
`redExitCode`, `redFailure` passed read-only to both. On repeated false RED, report BLOCKED with the
failure signature rather than weakening an assertion.
