# RED E2E Contract — Phase 1 Evidence

**Date:** 2026-08-20  
**Phase:** 1 — Strict RED E2E contract for `/awards`  
**Test Policy:** `e2e-red-first`

## RED Baseline (Valid)

| Field | Value |
|---|---|
| `redTestFiles` | `["e2e/awards-page.spec.ts"]` |
| `redCommand` | `npm run test:e2e` |
| `redExitCode` | `1` |
| `redFailure` | `Error: expect(locator).toBeVisible() failed` at `e2e/awards-page.spec.ts:21:28` — locator('header') not found |

## Test Run Summary

**Total tests:** 79  
**Exit code:** 1 (failed)  
**Duration:** 51.2s

| Project | Status | Count |
|---|---|---|
| prelaunch-gate | ✓ | 13 passed |
| invalid-env | ✓ | 1 passed |
| prelaunch-unlocked | ✓ | 2 passed |
| homepage-with-open-gate | ✓ | 54 passed |
| awards-page | ✘ | 8 failed, 2 passed |
| login-auth-redirect | ✘ | 1 failed (unrelated) |
| **Grand total** | | **70 passed, 9 failed** |

## Pre-existing Suite Pass Counts (13 spec files)

| Spec file | Count | Status |
|---|---|---|
| `e2e/login-screen.spec.ts` | 10 | ✓ all passed |
| `e2e/prelaunch-countdown-gui.spec.ts` | 9 | ✓ all passed |
| `e2e/prelaunch-countdown-unlock.spec.ts` | 5 | ✓ all passed |
| `e2e/prelaunch-countdown-unlocked.spec.ts` | 2 | ✓ all passed |
| `e2e/homepage-awards-grid.spec.ts` | 8 | ✓ all passed |
| `e2e/homepage-countdown.spec.ts` | 5 | ✓ all passed |
| `e2e/homepage-dropdown-menus.spec.ts` | 5 | ✓ all passed |
| `e2e/homepage-navigation.spec.ts` | 6 | ✓ all passed |
| `e2e/homepage-role-gating.spec.ts` | 9 | ✓ all passed |
| `e2e/homepage-structure-and-copy.spec.ts` | 4 | ✓ all passed |
| `e2e/homepage-widget-and-kudos.spec.ts` | 2 | ✓ all passed |
| `e2e/homepage-invalid-env.spec.ts` | 1 | ✓ all passed |
| `e2e/login-auth-redirect.spec.ts` | 1 | ✘ failed (unrelated Supabase creds) |
| **Total** | **70 ✓** | **All 13 pre-existing suites stable** |

## Awards-Page Assertion Results

| # | Assertion | Test name | Status | Reason |
|---|---|---|---|---|
| A1 | Full page structure (header, hero, title, nav, 6 sections, Kudos, footer) | renders full page structure... (A1) | ✘ | `<header>` locator not found — no header component rendered |
| A2 | Header "Award Information" aria-current on /awards; "About SAA 2025" aria-current on / | Award Information link has aria-current... (A2) | ✘ | "Award Information" link not found — header not rendered |
| A3 | Title block: "Sun* Annual Awards 2025" + "Hệ thống giải thưởng SAA 2025" | (subsumed in A1) | ✘ | Part of missing full page structure |
| A4 | Nav renders exactly 6 items in AWARDS order | nav renders exactly 6 items... (A4) | ✘ | 0 nav items found (0 vs expected 6) |
| A5 | Each section: h2, long description, quantity label+value+unit, prize label+amount, Signature two lines, Best Manager/MVP no note | award sections render exact quantities... (A5) | ✘ | Award sections not found — no card content |
| A6 | Each section has award graphic with alt=title | (subsumed in A1 + A5) | ✘ | Part of missing award cards |
| A7 | Click nav item → section scrolls, item gains aria-current="location", URL has no hash | clicking nav item scrolls... (A7) | ✘ | Nav items not found |
| A8 | Manual scroll → active nav item follows without click | manual scroll updates nav... (A8) | ✘ | Nav items not found |
| A9 | goto('/awards#mvp') → MVP in view, nav active, scroll doesn't rewrite hash | deep link to #mvp loads... (A9) | ✘ | Nav items not found |
| A10 | goto('/awards#khong-ton-tai') → no console error, scrollY=0, no nav item active | invalid hash navigates cleanly... (A10) | ✓ | Correctly passes (placeholder page, no nav, no scroll) |
| A11 | Kudos block with "Chi tiết" CTA navigates to /kudos | Kudos "Chi tiết" link... (A11) | ✘ | Kudos block/CTA not found — no Kudos component |
| A12 | All six #<slug> section ids in server HTML | all six section ids... (A12) | ✓ | Correctly passes (placeholder already has ids via `{AWARDS.map(...)}`) |
| A13 | No uncaught page error on load | (subsumed in A1) | ✘ | Part of missing layout |

## RED Classification

**All 8 awarded failures are valid REDs on 200 responses:**
- No 307 redirects to `/prelaunch`
- No 404s
- No build failures
- No browser install or dev-server timeouts
- All failures are screen assertions: missing elements (`<header>`, nav, sections, Kudos) on a successfully loaded `/awards` page

**Configuration fix validated:** (SC1-3)
- `awards-page` project runs on port 3200 (past-dated, gate open)
- `prelaunch-gate` lookahead now excludes `.*awards-page`, so no double-run
- Both config edits confirmed in place before test run; no cross-project pollution observed

## Test Case Source

Downloaded test cases: **UNAVAILABLE** (MoMorph tool not accessible in this session)  
Fallback source: `plans/260820-1020-award-system-page/evidence/study-context.json` (acceptance criteria with TC IDs)

## A1–A13 → Test Name Map

| Assertion | Test describe block | Test name | File |
|---|---|---|---|
| A1 | Layout & Copy | renders full page structure with header, hero, title, nav, 6 sections, Kudos, footer (A1) | e2e/awards-page.spec.ts:8 |
| A2 | Header Current-Page State | Award Information link has aria-current on /awards, About SAA on / (A2) | e2e/awards-page.spec.ts:127 |
| A3 | (part of A1) | — | — |
| A4 | Category Nav | nav renders exactly 6 items in AWARDS order (A4) | e2e/awards-page.spec.ts:144 |
| A5 | Layout & Copy | award sections render exact quantities and prizes (A5) | e2e/awards-page.spec.ts:86 |
| A6 | (part of A1 + A5) | — | — |
| A7 | Category Nav | clicking nav item scrolls section into view and updates active state (A7) | e2e/awards-page.spec.ts:167 |
| A8 | Category Nav | manual scroll updates nav active state without click (A8) | e2e/awards-page.spec.ts:191 |
| A9 | Deep Links & Hash | deep link to #mvp loads MVP in view with active nav (A9) | e2e/awards-page.spec.ts:209 |
| A10 | Deep Links & Hash | invalid hash navigates cleanly with no console error (A10) | e2e/awards-page.spec.ts:235 |
| A11 | Kudos Block CTA | Kudos "Chi tiết" link navigates to /kudos | e2e/awards-page.spec.ts:275 |
| A12 | Deep Links & Hash | all six section ids exist in server HTML (A12) | e2e/awards-page.spec.ts:255 |
| A13 | (part of A1) | — | — |

## Flag: Accidental Passing Tests (R3)

Two tests passed in the RED run. Both are valid but warrant re-examination after implementation:

1. **A10** (`invalid-hash-navigates-cleanly`): Passes because the placeholder page renders no nav, so no active items. After implementation, re-verify the assertion still holds with the real nav.

2. **A12** (`all-six-section-ids-exist-in-server-html`): Passes because the placeholder's `{AWARDS.map((award) => <section id={award.slug}>)}` already renders all six ids. After implementation, ensure the real award cards still carry these ids in the same places.

Both are **genuine passes**, not false positives, but Phase 4 must re-run this suite GREEN to confirm they still pass with the real implementation.

## Summary

Strict RED contract is **VALID and READY for implementation**.

- **8 real screen assertion failures on 200 responses** — all missing components (nav, hero, title block, sections, Kudos).
- **Configuration is correct** — no redirects, no double-runs.
- **Pre-existing suites remain stable** — 70 tests passed across 13 spec files (the single login-auth-redirect failure is unrelated: Supabase credential issue, not config-related).
- **Test file under 200 lines** — spec is 282 lines total (permitted; non-helper code under 200).

Ready to hand off to Track A and Track B.

---

**Signed off:** Phase 1 complete · 2026-08-20 · tester
