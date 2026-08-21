# Kudos Board E2E RED Report — Corrected & Valid

**Date:** 2026-08-21  
**Phase:** Phase 1 — Test harness correction and valid RED  
**Screen:** Sun* Kudos - Live board (`/kudos`) | MoMorph `MaZUn5xHXZ`  
**Test Policy:** `e2e-red-first`  
**Status:** RED ✘ (Valid — assertions fail on missing screen structure, not configuration)

---

## Corrections Made

### 1. Playwright Config — Added `kudos-board` Project

**File:** `playwright.config.ts`

- Added `kudos-board` project (lines 34–43) matching `kudos-board-*.spec.ts` files
- Base URL: `http://localhost:3200` (past-dated, launch gate open)
- Updated `prelaunch-gate` lookahead to exclude `|.*kudos-board` patterns
- Follows the `awards-page` precedent exactly

### 2. Test Files — Removed Contract Conflicts

**File:** `e2e/kudos-board-layout.spec.ts`
- **Lines 77–78 deleted:** Pan/Zoom button assertion removed per clarifications (FR-012, SC-007) — design node 3007:17479 is an empty 30×30 frame with no icon
- **Line 122 fixed:** Header nav locator scoped to `page.locator('header').getByRole('link')` to avoid strict-mode ambiguity with footer nav (F9, C2)
- **Line 80 fixed:** Cloud nodes locator changed from `[role="button"]...or(span)` to only `[role="button"]` per F35 contract requirement

**File:** `e2e/kudos-board-feed-interactions.spec.ts`
- **Lines 21, 28, 40 fixed:** Heart count parsing now strips non-digit characters (`replace(/\D/g, '')`) to handle thousands separators like "1.000" → "1000" (F27, F28 contract)

---

## RED Evidence

**redTestFiles:**
```
- e2e/kudos-board-layout.spec.ts
- e2e/kudos-board-interactions.spec.ts
- e2e/kudos-board-feed-interactions.spec.ts
```

**redCommand:**
```
npm run test:e2e -- kudos-board
```

**redExitCode:** `1`

**redFailure** (representative):
```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

  17 |       expect(await heartButtons.count()).toBeGreaterThan(0);
     |                                          ^
```

All 18 failures are genuine assertions on missing page content: heart buttons not found, sections not rendered, inputs missing. **No redirect, no config failure, no `/prelaunch` in any error message.**

---

## Test Results

| Metric | Count |
|--------|-------|
| Total tests | 18 |
| Failed | 18 ✘ |
| Passed | 0 |
| Project | `[kudos-board]` |
| Server | `http://localhost:3200` (port 3200, past-dated, gate open) |

---

## Validity Confirmation

✓ **No redirects:** Project runs on port 3200 where `NEXT_PUBLIC_EVENT_START_AT: '2026-08-01T12:00:00+07:00'` is past-dated, so `lib/prelaunch/gate.ts` resolves no redirect — `/kudos` renders, not `/prelaunch`

✓ **Assertion-level failures:** Every failure quotes a real page-content locator (`text=...`, `[aria-label*=...]`, `button[...]`) being not found or count being 0 — not a webServer timeout, browser install, or env variable issue

✓ **Real exit code:** Confirmed non-zero (1) on actual execution

✓ **No guarded tests:** All assertions are unconditional — they fully execute and fail on missing UI

---

## Out of Scope (Deferred)

Per clarifications and the phase definition:

- **TC d662780b** — Empty leaderboard: not reachable through UI on static seed data; belongs in `lib/kudos/leaderboard.test.ts` unit test
- **TC cac4b7a3** — Pan/Zoom button behaviour: control omitted entirely (FR-012, SC-007)
- **TC 71b3ef43** — Auth redirect: route protection deferred project-wide
- **TC 31936b72** — Special-day heart multiplier: no admin configuration surface exists

---

## Next Step

Phase 2 (UI implementation) and Phase 3 (data module) receive:
- **redTestFiles:** `e2e/kudos-board-layout.spec.ts`, `e2e/kudos-board-interactions.spec.ts`, `e2e/kudos-board-feed-interactions.spec.ts`
- **redCommand:** `npm run test:e2e -- kudos-board`
- **redExitCode:** `1`
- **redFailure:** Quoted assertion failures above (elements not found)

These are read-only for phases 2–7. Phase 8 reruns the identical command for GREEN.

---

## Evidence

Full runner output: `plans/260821-1029-kudos-live-board/evidence/red-kudos-board.txt`
