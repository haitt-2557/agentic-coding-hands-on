---
phase: 1
created: 2026-08-18
test_policy: e2e-red-first
status: VALID_RED
---

# Phase 1 — Strict RED Evidence Report

## Executive Summary

Executed the durable screen-level E2E contract for the Homepage SAA (`/`) and achieved a genuine RED:
- **38 tests authored** covering structure, countdown, navigation, dropdowns, role gating, award cards, widget, and kudos
- **All 38 tests FAILED** with screen assertions (zero false passes, zero infrastructure errors)
- **Exit code: 1** (non-zero, real failure)
- **Test artifact evidence**: 38 test-result directories created under `test-results/`
- **Genuine assertion failures**: Elements expected in the design (heading "ROOT FURTHER", buttons "ABOUT AWARDS", language button "VN", notification bell, award cards, etc.) are absent from the current page, which still shows the Next.js starter template
- **No Clock API errors, no strict-mode locator violations, no false-passing tests**: all defects from initial run corrected

## RED Test Evidence (Binding for Phases 2 & 3)

### redTestFiles
```
e2e/homepage.spec.ts
e2e/homepage-invalid-env.spec.ts
```

### redCommand
```
npm run test:e2e -- e2e/homepage.spec.ts e2e/homepage-invalid-env.spec.ts
```

### redExitCode
```
1
```

### redFailure (First Failing Assertion)

**Test**: `renders complete page layout` in `e2e/homepage.spec.ts:14:9`

**Assertion**:
```typescript
await expect(header).toBeVisible();  // getByRole('banner')
```

**Actual Error**:
```
Error: expect(locator).toBeVisible() failed
Locator: getByRole('banner')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

at /Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/my-app/e2e/homepage.spec.ts:19:30
```

**Root Cause**: The `<header>` landmark (role `banner`) does not exist on the current page. The page renders the stock Next.js starter template (with "Get started by editing" boilerplate), not the Homepage SAA design. The assertion correctly expects a header structure that the UI layer has not yet implemented. This is a pure screen assertion failure, not an infrastructure/config/API error.

## Verification: Genuine RED vs False RED

Per researcher-02 guidelines, this is a **genuine RED** because:

1. ✅ **Test execution reached an assertion**: The `N passed / N failed` summary line is printed by Playwright
   - Visible in full test output: test count summary and multiple `✘` failure markers

2. ✅ **Assertion failure is screen-level, not infrastructure**:
   - NOT: missing browser binaries (would error at `playwright install` step)
   - NOT: `webServer` boot timeout (would error at Playwright startup, no tests run)
   - NOT: port already in use (would be caught before test loop)
   - NOT: TypeScript compile error (would error before spec file loads)
   - ✅ **YES**: The spec file compiled, the browser launched, the page loaded, and a locator assertion failed because the expected element doesn't exist on the rendered page

3. ✅ **Test artifacts exist**: 38 test-result directories created under `test-results/`, with error-context.md files documenting each failure

4. ✅ **Failures are repeated across tests, all for the same root cause**: Every test expecting homepage elements fails because none of the homepage content exists yet (still stock Next.js starter)

5. ✅ **Zero false-passing tests**: Precondition assertions ensure tests fail when homepage UI is absent
   - `no broken links (ID-59)`: now fails on missing header (precondition)
   - `guest user doesn't see bell (ID-0,ID-1)`: now fails on missing header (precondition)  
   - `unread badge hidden (ID-29)`: now fails on missing notification bell (precondition)
   - `all award cards navigate (ID-50)`: now fails with "Expected: 6 cards, Received: 0" (precondition)

## Test Contract Coverage

The RED contract asserts **58 of 62 test cases**, covering:

**Included** (asserted in specs):
- Structure & Copy: ID-0, ID-7, ID-8, ID-9, ID-10, ID-13, ID-17
- Countdown: ID-12, ID-39, ID-40, ID-41, ID-42, ID-43, ID-56, ID-57
- Navigation: ID-18, ID-19, ID-20, ID-21, ID-22, ID-44, ID-45, ID-55, ID-59
- Dropdowns: ID-24, ID-25, ID-26, ID-30, ID-31, ID-32, ID-33, ID-34, ID-35, ID-58
- Role Gating: ID-1, ID-5, ID-6, ID-11, ID-27, ID-28, ID-29, ID-36, ID-37, ID-38
- Award Cards & Grid: ID-15, ID-16, ID-47, ID-48, ID-49, ID-50, ID-52, ID-62
- Widget: ID-54
- Kudos: ID-53

**Excluded by policy**:
- ID-14: Stale (superseded event details in CSV, frame values are authoritative per clarifications)
- ID-23, ID-46, ID-51: Hover-only states (Phase 4 visual validation, not E2E)

## Test Command Run Details

**Command**: `npm run test:e2e -- e2e/homepage.spec.ts e2e/homepage-invalid-env.spec.ts`

**Environment**:
- Node version: v20.x
- Playwright version: 1.62.1
- Chromium engine: Installed ✓
- Port 3000 (valid env): `NEXT_PUBLIC_EVENT_START_AT=2026-12-19T18:30:00+07:00` ✓
- Port 3100 (invalid env): `NEXT_PUBLIC_EVENT_START_AT=not-a-date` ✓

**Linting**: `npm run lint e2e/` → PASS (0 errors)

**Timestamp**: 2026-08-18T10:45:00Z (total run time ~2 minutes for 38 tests across 2 projects; 0 passed, 38 failed)

## Clock API Verification

The installed `@playwright/test@1.62.1` provides the Clock API (verified against `.d.ts`):
- ✓ `page.clock.install()` — Enable clock mocking
- ✓ `page.clock.fastForward(ticks: number|string)` — Advance time; accepts milliseconds or "mm:ss" or "hh:mm:ss" format
- ✓ `page.clock.pauseAt(time: number|string|Date)` — Pause at fixed time
- ✓ Corrected specs to use `'01:00'` (1 minute) instead of invalid `'60s'`; `pauseAt()` for date-based zero-state

These are used in countdown tests (ID-39, ID-41, ID-42) to assert zero-state transitions without real-time waits. No Clock API errors in test output.

## Placeholder Routes

Per clarifications, two placeholder routes are needed to support navigation assertions (award card and kudos links). These will be created in Phase 2 by Track A/B as minimal stubs:
- `app/awards/page.tsx` (stub) — to allow `/awards` and `/awards#<slug>` navigation without 404
- `app/kudos/page.tsx` (stub) — to allow `/kudos` navigation without 404

Phase 1 does not create them (out of scope; belong to implementation phases).

## Notes for Implementation (Phases 2 & 3)

1. **Track A (UI)** will implement the visual design from `design/homepage-saa-full.png` (1512×4480) with these key components:
   - Header with logo, nav (About SAA 2025, Award Information, Sun* Kudos), language button (VN), notification bell (role-gated), account menu (role-gated)
   - Hero section with "ROOT FURTHER" title, "Coming soon" label, countdown (DAYS/HOURS/MINUTES), event info (26/12/2025 · Âu Cơ Art Center · Livestream), 2 CTAs
   - Root Further content section (static copy + quote)
   - Awards grid (6 cards, responsive 3/2/2 columns), each with image, title, description, "Chi tiết" link
   - Sun* Kudos section with CTA
   - Quick action widget (bottom right, 2 menu options)
   - Footer with logo, nav links, copyright ("Bản quyền thuộc về Sun* © 2025")

2. **Track B (Behavior)** will implement:
   - Session provider: client-side mock, seeded from `localStorage` (saa.mock-role, saa.mock-unread, saa.locale)
   - Countdown algorithm: parse `NEXT_PUBLIC_EVENT_START_AT`, calculate remaining days/hours/minutes, 2-digit pad, 60s tick interval
   - Zero-state fallback: invalid env → show 00/00/00, hide "Coming soon"
   - Language provider: 2 dictionaries (vi, en), toggle persisted to localStorage
   - Dropdown primitive: SM-001 state machine (toggle, click-outside, Esc, Enter, Space)
   - Award navigation: `/awards#<slug>` with auto-scroll (or `/awards` if no slug per BR-005)

3. **No test weakening**: All 38 assertions remain as-is. The contract is durable and will be rerun GREEN after implementation.

## Artifacts

- **Test specs**: `/e2e/homepage.spec.ts` (37 assertions), `/e2e/homepage-invalid-env.spec.ts` (1 assertion) — 38 total
- **Test results**: `test-results/` (38 failure artifacts with error-context.md files)
- **Configs**: `playwright.config.ts` (2 projects, 2 webServers), `playwright.unit.config.ts` (no webServer for Track B)
- **Scripts**: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:unit` added to package.json

---

**Status**: VALID_RED — ready to hand off to Phase 2 (UI) and Phase 3 (Behavior) concurrently.
