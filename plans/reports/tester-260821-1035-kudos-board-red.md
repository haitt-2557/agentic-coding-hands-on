# Kudos Board E2E RED Report

**Date:** 2026-08-21  
**Screen:** Sun* Kudos - Live board (`/kudos`) | MoMorph `MaZUn5xHXZ`  
**Test Policy:** `e2e-red-first`  
**Status:** RED ✘ (Valid — assertions fail due to missing screen structure)

---

## Test Files Created

```
- e2e/kudos-board-layout.spec.ts (154 lines)
- e2e/kudos-board-interactions.spec.ts (162 lines)
- e2e/kudos-board-feed-interactions.spec.ts (199 lines)
```

All files follow the existing awards-page test pattern: split across layout, carousel/filters, and feed/sidebar interaction concerns to stay under 200-line ceiling.

---

## Command & Execution

```
npm run test:e2e -- kudos-board-layout.spec.ts kudos-board-interactions.spec.ts kudos-board-feed-interactions.spec.ts
```

**Real Exit Code:** `1`  
**Test Results:**
- Total tests run: **18**
- Passed: **0** (ZERO passing tests)
- Failed: **18** (all legitimate — elements not found, counts insufficient)
- Workers: 4
- Duration: ~30 seconds

**FINAL AFTER COORDINATOR ASSERTION FIXES:** Every single test fails. No vacuous passes, no guarded assertions that skip validation. Each failure is on missing UI: heart buttons not found, section elements missing, inputs not rendered, carousel controls absent.

---

## RED Evidence (Valid Assertions Failing on Missing UI)

### Primary Failure: Missing Page Structure

The page currently renders only a placeholder `<h1>Sun* Kudos</h1>` (from `app/kudos/page.tsx`). All structural assertions fail at the element-not-found stage.

**Representative failure from kudos-board-feed-interactions.spec.ts:8:9** (heart toggle):

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

      17 |       expect(await heartButtons.count()).toBeGreaterThan(0);
         |                                          ^

in test: "clicking heart toggles count increment on first click, decrement on second (7a7ec63e)"
```

All other failures follow the same pattern: assertion expects elements, finds count 0, or cannot locate the element at all.

The test searches for:
- Banner title: `Hệ thống ghi nhận và cảm ơn` (not present)
- HIGHLIGHT KUDOS section heading (not present)
- Carousel and filter controls (not present)
- SPOTLIGHT BOARD section (not present)
- ALL KUDOS section (not present)
- Sidebar statistics and leaderboard (not present)

---

## Test Coverage by Assertion Type

**All 18 tests failing (no passing tests, no vacuous assertions)**

### ✘ Layout & Structure (4 tests failing)
- Full page structure with all 6 sections and footer
- Header nav `aria-current="page"` on Sun* Kudos item
- Banner visibility and display-only wordmark
- Placeholder text rendering on load

**Failure reason:** Sections not rendered — placeholder page has only `<h1>`.

### ✘ Carousel Navigation (4 tests failing)
- Next button advances slide + indicator updates
- Prev button goes back
- Prev disabled on slide 1
- Next disabled on slide 5

**Failure reason:** Carousel component not rendered.

### ✘ Filter Dropdowns (3 tests failing)
- Hashtag filter: open dropdown, select option, filter applies
- Department filter: open dropdown, select option, filter applies
- Hashtag click inside kudos card re-filters both sections and resets carousel

**Failure reason:** Filter buttons and dropdown controls not rendered.

### ✘ Heart Toggle (2 tests failing)
- Clicking heart toggles count increment on first click, decrement on second
- Heart button is disabled on kudos sent by the current viewer

**Failure reason:** No kudos cards rendered to test against.

### ✘ Copy Link Button (1 test failing)
- Click shows toast "Link copied — ready to share!"

**Failure reason:** No kudos cards rendered; Copy Link buttons not present.

### ✘ Spotlight Search Input (1 test failing)
- Spotlight search input enforces 100-character ceiling

**Failure reason:** Spotlight section not rendered.

### ✘ Spotlight Hover Tooltip (1 test failing)
- Hovering spotlight name node shows tooltip with that name

**Failure reason:** Spotlight word cloud nodes not rendered.

### ✘ Empty States (1 test failing)
- Filtering to no matching kudos shows "Hiện tại chưa có Kudos nào."

**Failure reason:** Filter controls and kudos feed not rendered.

### ✘ Submit Pill Accessibility (1 test failing)
- Submit pill input is visible, enabled and focusable

**Fails** on missing submit input: `Error: expect(locator).toBeVisible() failed`, timeout waiting for input element.

---

## Test Structure & Durability

All tests follow the precedent from `e2e/awards-page-layout.spec.ts` and `e2e/awards-page-kudos.spec.ts`:

- **Locator strategy:** Playwright's `getByRole()` and semantic `locator()` targeting (headings, section text, aria-labels)
- **No hard-coded data coupling:** Tests assert on structure and fixed UI copy (placeholders, labels, messages) rather than seed data like names or counts
- **Deferred assertions:** Submit dialog, detail page, profile page, Secret Box, Pan/Zoom behavior, and route protection marked out-of-scope per clarifications; only presence asserted
- **Relative value assertions:** Carousel tests check indicator increments/decrements, not absolute slide numbers; heart tests check count increase, not specific values
- **Unconditional assertions:** Every test unconditionally asserts element existence and behavior — no guards that skip validation. Failures on missing UI are real.

---

## Key Observations

### Copy Link Test Failure Mode

The copy-link test (TC `0adfd7ce`) fails on **missing Copy Link buttons**, not permission errors. Clipboard permissions are granted via `context.grantPermissions(['clipboard-read', 'clipboard-write'])` and do not block the test. The failure is:
```
Error: expect(received).toBeGreaterThan(expected)
Expected: > 0
Received:   0
```
This confirms the test fails on the missing UI button, not infrastructure.

---

## Could Not Assert — Reasons

### Empty Leaderboard (TC `d662780b`)

**Status:** NOT ASSERTED  
**Reason:** With a static seeded module (`lib/kudos.ts`), the leaderboard renders with fixed test data. There is no route through the UI to empty it without modifying the data source. To assert this properly would require:
- Either a backend API to clear/delete entries (not in scope for this static run)
- Or a separate test fixture with an empty leaderboard seed

**Resolution:** This test belongs in a component-level unit test with an empty data mock, not end-to-end. The e2e suite is limited to testing the mechanism that renders the empty state given empty input, which requires data control beyond the e2e layer.

---

## Out of Scope (Per Clarifications)

NOT tested in this RED run:

- **TC 71b3ef43:** Route protection / redirect to login (deferred project-wide)
- **TC cac4b7a3:** Pan/Zoom button behavior (deferred — no interaction spec)
- **TC ca8f60b3, f183a3e4:** Kudos submit dialog validation and save (dialog deferred)
- **TC 8c0d1781, 2cd77a0c, 630f42a3, 6b1e2359, f9b68ffa, 43b54c29, 0952e2f0, 31693bb7:** Navigation to detail, profile, lightbox, Secret Box (4 destinations deferred; triggers asserted as present, destinations not)
- **TC 31936b72:** Special-day heart multiplier (needs admin configuration surface that doesn't exist)

---

## Notes on RED Validity

This RED is **VALID** because:

1. ✓ **Real exit code 1** — confirmed via explicit command run
2. ✓ **Assertion failures ONLY from missing screen** — no config, env, browser, or dev-server issues
3. ✓ **WebServer started clean** — no INFRA or timeout errors in boot phase
4. ✓ **Runner is real** — `@playwright/test` ^1.62.1, config `playwright.config.ts`, runs against project's actual Next.js app
5. ✓ **Zero vacuous passing tests** — all 18 tests fail on missing elements. No test passes against the placeholder page.
6. ✓ **Unconditional, real assertions** — coordinator made four direct fixes eliminating the remaining assertion defects:
   - Heart disabled test now checks both disabled AND enabled hearts exist (not just a boolean)
   - Spotlight tooltip now checks visible tooltip contains the hovered name (not just title attribute)
   - Empty kudos state now pins filters and searches for empty combination, asserts both regions show empty
   - Hashtag click test now advances carousel first, checks cards contain the clicked tag

**All previous fixes remain:**
- Removed vacuous heart toggle guard → now unconditional with both-direction assertions
- Removed vacuous copy link guard → now unconditional with clipboard permissions + toast check
- Fixed spotlight search → unconditional maxlength check
- Fixed empty state → applies filters to drive into empty state (not just checks if already empty)
- Fixed banner test → asserts wordmark visibility
- Fixed filter tests → test selection + clearing
- Added TC d01729d4 → hashtag click inside card re-filters and resets carousel

---

## Next Steps for UI Agent

The UI agent receives:

- **redTestFiles:** `['e2e/kudos-board-layout.spec.ts', 'e2e/kudos-board-interactions.spec.ts', 'e2e/kudos-board-feed-interactions.spec.ts']`
- **redCommand:** `npm run test:e2e -- kudos-board-layout.spec.ts kudos-board-interactions.spec.ts kudos-board-feed-interactions.spec.ts`
- **redExitCode:** `1`
- **redFailure:** Primary: `Error: element(s) not found` on banner title, sections, carousel, filters, and inputs (quoted above)
- **testPolicy:** `e2e-red-first`

Build the page to match the clarifications and specs. Re-run the command to turn GREEN and then hand to tester for visual validation.

---

## Test Command for Verification

To re-run this RED:

```bash
cd /Users/truong.thanh.hai/Desktop/Hai\ Work/Hai\ Study\ AIDD/agentic-coding-hands-on
npm run test:e2e -- kudos-board-layout.spec.ts kudos-board-interactions.spec.ts kudos-board-feed-interactions.spec.ts
```

Expected: Exit code 1 (RED), 18 failures, 0 passes (all assertions genuine) until page structure is implemented.
