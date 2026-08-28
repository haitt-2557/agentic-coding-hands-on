# Kudos board e2e flake root cause: fullyParallel races sibling beforeEach cleanup

**Date**: 2026-08-28 16:45
**Severity**: high
**Component**: E2E tests / kudos likes feature
**Status**: resolved

## What Happened

Heart-toggle e2e test (TC 7a7ec63e) persisted in failing 1-2 times per full run across two fix attempts. Count assertion would stuck at +1: expected 512 received 513 (first attempt), then expected 678 received 679 (second attempt), not settling even with 10s poll. Flake vanished the moment the describe block toggled `mode: 'serial'`; full suite then ran 145/145 twice consecutively clean.

## The Brutal Truth

Chased this for hours down the wrong tree twice. First diagnosis looked "obvious": kudos-1 and kudos-6 were shared test fixtures between files, so ownership audit moved toggle to "exclusive" ids — flake stayed. Second diagnosis looked "solid": server-action latency under load vs fixed 1000ms settle — added expect.poll(10s) aggressive polling — flake stayed, count just sat at wrong number for the full duration. The infuriating part: both fixes *looked* right on paper and *felt* thorough. Only when tracing the server state did it become clear the count was legitimately stuck — the test's first click genuinely inserted a row it couldn't delete on the second click.

The sting: the real answer was sitting in the same file the whole time. The *other* like specs already used serial mode. We copied half the pattern without noticing.

## Technical Details

**The flake pattern:** toggle test clicks heart (optimistic flip +1), server should delete the like row, second click inserts it again (+1 again). But on flake: second click inserted instead of deleting — count stayed +1 from insert.

**Reproducer:** only in full-suite runs; project-only never flakes. Cross-file parallel never showed it. Timing delays (settle, poll) changed the count but never fixed it.

**Evidence chain:**
- `e2e/kudos-board-db-feed.spec.ts`: test (line ~120) with `beforeEach(() => cleanupTestRows(['kudos-5']))`
- Sibling test 63645b03 in same describe also had `beforeEach(() => cleanupTestRows(['kudos-5']))`
- `fullyParallel: true` in playwright.config.ts schedules tests WITHIN the same file in parallel workers
- Both beforeEach hooks ran before their respective tests started — if timing skewed, one worker's cleanup deleted the row the other worker's click had just inserted into DB
- Result: second click saw no row, inserted instead of deleting — toggle count stuck

## What We Tried

**Attempt 1 (earlier session):** Audit shared fixture ownership — rewrite test to use exclusive kudos ids (kudos-1, kudos-6 moved to kudos-80, kudos-81). Flake persisted with same count mismatch. ✗

**Attempt 2 (this session):** Server-action latency hypothesis — increase settle from 1000ms to expect.poll(10s). Flake persisted; count now visibly stuck for full 10s polling. ✗

**Attempt 3 (this session, final):** Read provider code (lib/kudos/likes/toggle-like.ts) — confirmed optimistic flips always execute. Realized: stuck count means server state != client state. Reviewed shared fixtures AND sibling tests in the same describe. Found the duplicate beforeEach cleanup. Set `test.describe.configure({ mode: 'serial' })` on the describe block. ✓

## Root Cause Analysis

`fullyParallel: true` in playwright.config.ts runs tests WITHIN the same describe block on separate worker threads to save time. A shared `beforeEach` cleanup is a data mutation like any other. When two tests share the same row id and both define beforeEach cleanup:

1. Worker A runs test A's beforeEach → deletes kudos-5 like row
2. Worker B runs test B's beforeEach (same id) → may overlap with A's cleanup
3. Worker B's main test clicks heart, inserts kudos-5 like row  
4. Worker A's main test clicks heart (expecting row to exist from insert in test-setup) → finds nothing, re-inserts
5. Count assertion expects delete, finds insert — off by 1 forever

The fix: serial mode ensures beforeEach cleanup of test N completes before test N+1 starts, eliminating the race.

## Lessons Learned

1. **Audit sibling tests, not just cross-file ownership.** "Exclusive ownership" of a test fixture id is meaningless if the SAME FILE's sibling tests share that id and run in parallel. `fullyParallel` races a file against itself.

2. **Shared beforeEach cleanup is a data mutation.** When multiple tests in the same describe block touch the same rows, parallelism becomes a liability. The cleanup order matters — it is not "just setup."

3. **The pattern was already there.** Other like specs (`kudos-likes-server-action.spec.ts` line ~8) already used `test.describe.configure({ mode: 'serial' })`. We copied half the pattern without noticing. Next time: grep the codebase for the existing solution before inventing a new diagnosis.

4. **Stuck counts are evidence of state mismatch, not timing.** When polling does not fix it, the server genuinely disagrees with the client. That is a data layer signal, not a latency signal.

## Next Steps

- **Test discipline:** Whenever a test shares row ids in a single describe block, pair it with serial mode. Document the why in a comment.
- **Code review signal:** Shared row fixtures + parallel run + stuck assertion = red flag. Catch this in review before it lands.
- **Documentation:** Add a note to the test patterns doc: "Parallel describes must not share mutable rows. If they do, switch to serial mode and document why."

Full suite: 145/145 e2e, 147/147 unit (verified twice consecutively).
