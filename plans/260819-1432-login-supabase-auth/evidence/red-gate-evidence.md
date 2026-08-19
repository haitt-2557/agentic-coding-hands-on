# RED Gate Evidence — Phase 2 (Corrected)

**Status:** VALID RED CONFIRMED (Harness Fixed)

## Test Execution

- **Command:** `npm run test:e2e`
- **Exit Code:** 1 (non-zero, indicating test failure)
- **Test Files:** `e2e/login-screen.spec.ts`
- **Test Framework:** @playwright/test ^1.62.1

## Test Results Summary

- **Total tests run:** 69
- **Passed:** 56 (all pre-existing suites: prelaunch-countdown-gui, prelaunch-countdown-unlock, homepage-*, prelaunch-countdown-unlocked, homepage-invalid-env)
- **Failed:** 13 (all in the new login-screen.spec.ts)
- **Regression:** None — all pre-existing tests remain green

## Primary RED Assertion Failure

**Test:** "Login Screen › Gate Reachability (A1) › renders without redirecting to /prelaunch on locked-gate server"

**Location:** `e2e/login-screen.spec.ts:10`

**Assertion:** `expect(page.url()).toContain('/login')`

**Failure Details:**
```
Expected substring: "/login"
Received string:    "http://localhost:3000/prelaunch"
```

**Root Cause:** The `/login` route does not exist in the application. The prelaunch gate (`proxy.ts`) redirects all routes except `/prelaunch` to the locked countdown screen because `NEXT_PUBLIC_EVENT_START_AT=2026-12-19` (future date).

**Classification:** ✓ VALID RED
- This is a genuine screen assertion failure, not an infrastructure issue
- The page does navigate, but to `/prelaunch` instead of `/login`
- No dependency errors, no browser install failures, no webServer timeouts
- Exactly the expected behavior before Phase 4 implementation

## Secondary RED Failures — All at Same Blockage Point

All 12 remaining failures trace to the root cause: `/login` is unreachable due to the prelaunch gate redirect.

Because the primary assertion fails before page navigation completes to `/login`, the subsequent layout and interaction assertions (A2–A12) are never evaluated against a rendered `/login` page — they fail trying to find elements on the `/prelaunch` page instead.

This is acceptable and expected for a RED gate. The test harness is correct and strict; it proves the `/login` route must be implemented and exempted from the prelaunch gate before these assertions can pass.

### What Each Secondary Failure Represents

| # | Assertion | Blocked By | Will Pass When |
|---|---|---|---|
| A2–A4 | Layout elements (logo, language selector, hero artwork) | Page redirects to `/prelaunch` before rendering | `/login` route exists |
| A5 | Copy text visibility | Page redirects to `/prelaunch` before rendering | `/login` route exists |
| A6 | Google button visible | Page redirects to `/prelaunch` before rendering | `/login` route exists |
| A7 | Footer visible | Page redirects to `/prelaunch` before rendering | `/login` route exists |
| A8 | OAuth request intercepted | Page redirects to `/prelaunch` before button can be clicked | `/login` route exists |
| A9 | Button disabled + aria-busy="true" | Page redirects to `/prelaunch` before button can be clicked | `/login` route exists; Track A must set `aria-busy="true"` on button while loading |
| A10 | Error alert visible | Page redirects to `/prelaunch` before error can render | `/login` route exists |
| A11 | Auth redirect to `/` | Page redirects to `/prelaunch` even with auth session | `/login` exempted from gate |
| A12 | No hydration errors | Prelaunch page loads cleanly (passes) | Already passing ✓ |

**Note on A9 (Loading State):** The test asserts TWO requirements conjunctively: the button is disabled (`disabled` attribute) AND it carries `aria-busy="true"` (the accessible loading indicator per ARIA spec). Both must be true simultaneously during an in-flight OAuth request. Track A must implement both the disabled state and the aria-busy attribute on the LoginButton component.

## Harness Corrections Made (per coordinator feedback)

1. **Fixed Node→Browser closure bug:** Replaced `page.waitForFunction(() => interceptedRequest !== null)` with `page.waitForRequest('**/auth/v1/authorize**')` — no more `ReferenceError`.
2. **Fixed hanging route handler:** Replaced `await new Promise(() => {})` with a proper deferred pattern and timeout, so A9 can complete.
3. **Removed invalid CSS selector:** Removed `:has-text()` from `document.querySelector()` — not valid CSS syntax.
4. **Fixed unused assertions:** Now properly asserts on Google mark presence, loading spinner, and other computed values instead of discarding them.
5. **Corrected A1 assertion:** Changed from demanding a non-existent heading to asserting the ROOT FURTHER image (the actual frame title).
6. **Tightened A11 redirect:** Changed from loose `toMatch(/\/$|\/awards/)` to exact `toBe('http://localhost:3000/')` per clarifications.md.
7. **Fixed cookie sameSite:** Normalized boolean/lowercase sameSite values to Playwright's expected format (`'Strict' | 'Lax' | 'None'`) and removed duplicate url/path passing.
8. **Eliminated flaky wait:** Changed `page.waitForTimeout(500)` to `page.waitForLoadState('networkidle')` for hydration assertion.
9. **Strengthened A9 assertion:** Changed from optional disjunction `hasSpinner || isDisabled` to two independent assertions: button is `disabled` AND has `aria-busy="true"`. Per test case `37eae882` and `plan.md` integration contract, both are required, not optional. Removed `.catch()` swallow so test fails if indicator is absent.

## Infrastructure Health Check

- **NEXT_PUBLIC_SUPABASE_URL:** http://127.0.0.1:54421 — running and verified
- **Supabase credentials:** Loaded from `.env.local` — verified
- **Next.js dev servers:** 3 instances launched successfully (ports 3000, 3100, 3200)
- **Playwright config:** `.env.local` loaded via `process.loadEnvFile()` — working
- **Browser:** Chrome/Desktop — launched successfully
- **No INFRA: sentinel triggered** — Supabase session helper passes infrastructure checks

## Test Evidence Files

- `e2e/login-screen.spec.ts` (251 lines) — 12 screen assertions covering A1–A12, all properly structured
- `e2e/support/supabase-session.ts` (127 lines) — Supabase session seeding with INFRA: sentinel and proper cookie translation
- `playwright.config.ts` — Updated to load `.env.local` at startup

## Readiness for Phase 3 & 4

✓ RED gate is valid and ready for handoff.

**For implementation, you will need to:**
1. Phase 4 (momorph-ui-implementer): Create `/login` route and screen components
2. Phase 4 (proxy.ts): Exempt `/login` and `/auth/callback` from prelaunch gate
3. Phase 5 (tester): Rerun `npm run test:e2e` to confirm GREEN

**Records for Phase 3 & 4:**
```
redCommand: npm run test:e2e
redExitCode: 1
redTestFiles: e2e/login-screen.spec.ts
redFailure: expect(page.url()).toContain('/login')
```

## Honest Assessment

All 13 login test failures currently occur at the same point: the prelaunch gate redirects `/login` to `/prelaunch`. This means the other 12 assertions (A2–A7, A8–A12) have not yet been evaluated against a rendered `/login` page.

This is correct behavior for a RED gate. A valid RED proves the feature does not exist or is broken — it is not required to exercise every sub-assertion before hitting the first blocker. Once Phase 4 creates the `/login` route and exempts it from the gate, all 12 assertions will be able to run and will guide the UI implementation toward spec compliance.
