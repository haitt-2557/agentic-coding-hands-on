# Phase 4 — E2E Test Analysis & Failure Classification

**Date:** 2026-08-20  
**Test Run:** `npm run test:e2e`  
**Exit Code:** 1 (non-zero, expected due to failures)

## Test Summary

| Metric | Count |
|--------|-------|
| Total tests | 79 |
| Passed | 74 |
| Failed | 5 |
| Duration | 25.2s |

## Awards-Page Test Results

| Assertion | Status | Reason |
|-----------|--------|--------|
| A1 | ✘ FAILED | Hero section not found — missing "hero" class |
| A2 | ✘ FAILED | Strict mode violation — 2 Award Information links detected |
| A3 | (subsumed in A1) | — |
| A4 | ✓ PASSED | Nav renders exactly 6 items |
| A5 | ✘ FAILED | Strict mode violation — "Cá nhân" found in 2 places |
| A6 | (subsumed in A1/A5) | — |
| A7 | ✘ FAILED | Strict mode violation — "Top Project" selector too broad |
| A8 | ✓ PASSED | Manual scroll updates nav active state |
| A9 | ✓ PASSED | Deep link #mvp works |
| A10 | ✓ PASSED | Invalid hash #khong-ton-tai handled cleanly |
| A11 | ✓ PASSED | Kudos "Chi tiết" CTA navigates to /kudos |
| A12 | ✓ PASSED | All six section ids exist in server HTML |
| A13 | (part of A1) | — |

**Awards-page summary:** 6 passed, 4 failed (66% pass rate; up from 25% in RED baseline)

## Pre-existing Spec Files (13 total)

All 13 pre-existing spec files maintain their RED baseline pass counts:

| Spec File | Count | Status | Change |
|-----------|-------|--------|--------|
| login-screen.spec.ts | 10 | ✓ all passed | ✓ stable |
| prelaunch-countdown-gui.spec.ts | 9 | ✓ all passed | ✓ stable |
| prelaunch-countdown-unlock.spec.ts | 5 | ✓ all passed | ✓ stable |
| prelaunch-countdown-unlocked.spec.ts | 2 | ✓ all passed | ✓ stable |
| homepage-awards-grid.spec.ts | 8 | ✓ all passed | ✓ stable |
| homepage-countdown.spec.ts | 5 | ✓ all passed | ✓ stable |
| homepage-dropdown-menus.spec.ts | 7 | ✓ all passed | ✓ stable |
| homepage-navigation.spec.ts | 6 | ✓ all passed | ✓ stable ID-21 (Award Info link) |
| homepage-role-gating.spec.ts | 9 | ✓ all passed | ✓ stable |
| homepage-structure-and-copy.spec.ts | 4 | ✓ all passed | ✓ stable ID-9 (About SAA link) |
| homepage-widget-and-kudos.spec.ts | 2 | ✓ all passed | ✓ stable |
| homepage-invalid-env.spec.ts | 1 | ✓ all passed | ✓ stable |
| login-auth-redirect.spec.ts | 1 | ✘ failed | ✘ pre-existing (Supabase creds) |

**Total pre-existing:** 70 passed, 1 failed (same as RED baseline) ✓

## Failure Breakdown by Ownership

### Track A (momorph-ui-implementer) — Markup & Layout Issues

**Failure A1: Hero section class missing**
- **Test location:** `e2e/awards-page.spec.ts:24-25`
- **Expected:** `<section class="...hero...">` 
- **Actual:** `<section class="relative isolate w-full overflow-hidden">` (no "hero" class)
- **File:** `components/awards/awards-hero.tsx:19`
- **Fix:** Add "hero" class to the section element
- **Reproduction:** Run `npm run test:e2e` → A1 test fails with "locator not found"

**Failure A2: Award Information link aria-current strict mode**
- **Test location:** `e2e/awards-page.spec.ts:127-131`
- **Issue:** `getByRole('link', { name: 'Award Information' })` matches 2 elements
  1. Header link (correct) with `aria-current="page"` on `/awards`
  2. Footer link (unexpected) without `aria-current`
- **Root cause:** SiteFooter may have duplicate nav links or the Award Information link is being reused
- **Reproduction:** `npm run test:e2e` → A2 test fails with strict mode violation (2 links)

**Failure A7: Top Project selector matches substring**
- **Test location:** `e2e/awards-page.spec.ts:172`
- **Issue:** `getByRole('link', { name: 'Top Project' })` matches both:
  1. "Top Project" (expected)
  2. "Top Project Leader" (unintended substring match)
- **Root cause:** nav link selector is matching substring names
- **Reproduction:** `npm run test:e2e` → A7 test fails with strict mode violation on click

### Track B (implementer) — Data & Content Issues

**Failure A5: Quantity unit selector matches description text**
- **Test location:** `e2e/awards-page.spec.ts:86-123` (specifically line 92)
- **Issue:** `locator('section:has(h2:text("Top Talent"))').locator('text=Cá nhân')` matches 2 elements
  1. Description paragraph: "Giải thưởng Top Talent vinh danh những cá nhân xu…"
  2. Quantity unit: `<span class="text-sm font-bold">Cá nhân</span>`
- **Root cause:** The award description text contains "cá nhân" which matches the quantity unit search
- **Design source:** `clarifications.md` § Per-award content — descriptions are fixed from design frame
- **Reproduction:** `npm run test:e2e` → A5 test fails with strict mode violation (2 "Cá nhân" matches)

## Comparison to RED Baseline

| Metric | RED Run | Current Run | Change |
|--------|---------|-------------|--------|
| Total passed | 70 | 74 | +4 |
| Total failed | 9 | 5 | -4 |
| Awards-page passed | 2 | 6 | +4 |
| Awards-page failed | 8 | 4 | -4 |
| Pre-existing stable | ✓ | ✓ | ✓ stable |

**Progress:** 50% reduction in awards-page failures; 6 of the original 8 test cases now passing.

## Assessment

**Status:** NOT GREEN — 4 awards-page assertions still failing  
**Root causes identified:** 3 Track A issues + 1 Track B issue  
**Actionable:** Yes — specific files and fixes identified  
**Blockers:** None — implementation artifacts are present and code compiles

## Next Steps

1. **Track A fixes (momorph-ui-implementer):**
   - Add "hero" class to `components/awards/awards-hero.tsx:19`
   - Investigate duplicate Award Information link (likely in SiteFooter)
   - Ensure nav link selectors match exactly (may need id or data-testid)

2. **Track B fixes (implementer):**
   - Review award descriptions in `lib/awards.ts` — "Cá nhân" word appears in Top Talent description
   - Option: Adjust description text to avoid substring match, or adjust quantity unit class/selector

3. **Tester re-run:** After fixes, re-run `npm run test:e2e` and validate A1, A2, A5, A7 now passing

4. **Visual validation:** Once GREEN is achieved, proceed with Playwright captures and visual comparison against design frame

---

**Status:** AWAITING_FIXES — handed off to Track A and Track B for resolution

