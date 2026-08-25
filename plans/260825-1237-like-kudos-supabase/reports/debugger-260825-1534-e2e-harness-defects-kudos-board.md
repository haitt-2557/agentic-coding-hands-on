---
title: kudos-board E2E test-harness defects (F015 Kudos like) — root cause + fix
date: 2026-08-25
status: resolved
---

# Summary

All defects were in the **test harness** (`e2e/**`), confirmed by evidence, not in the
implementation. No file under `lib/`, `components/`, `app/`, or `supabase/migrations/` was
touched. `npx playwright test --project=kudos-board` now exits **0** with all 30 tests running,
verified across **7 consecutive full-suite runs** (5 from a clean state, 2 from a deliberately
re-dirtied state simulating a crashed prior run) — every run: `30 passed`, exit 0.

## Files changed (all under `e2e/`)

- `e2e/support/local-db.ts` — `execSql` error classification; `cleanupTestRows` generalized
- `e2e/support/kudos-card-locator.ts` (new) — identity-based card locator
- `e2e/support/heart-toggle.ts` (new) — click-and-settle helper for like/unlike
- `e2e/support/docker-clock-skew-guard.ts` (new) + `e2e/support/global-setup.ts` (new)
- `playwright.config.ts` — added `globalSetup` (one line; testMatch/ports untouched)
- `e2e/kudos-board-like-persistence.spec.ts` — serial mode, kudos-1 isolation, Defect C locator
- `e2e/kudos-board-like-rules.spec.ts` — beforeEach isolation, Defect E locators, unlike-click scoping
- `e2e/kudos-board-like-sidebar.spec.ts` — isolation scoped to kudos-2, value-parsing fix
- `e2e/kudos-board-feed-interactions.spec.ts` — moved off shared kudos-1, timing fix

## Ownership model established

Each like-mutating spec file now owns a disjoint kudos id, reset before **and** after every test:

| File | Owns | Never touches |
|---|---|---|
| `kudos-board-like-persistence.spec.ts` | kudos-1 | 2, 3, 4, 6 |
| `kudos-board-like-sidebar.spec.ts` | kudos-2 | 1, 3, 4, 6 |
| `kudos-board-like-rules.spec.ts` | kudos-3, kudos-4 | 1, 2, 6 |
| `kudos-board-feed-interactions.spec.ts` (Heart Toggle) | kudos-6 | 1, 2, 3, 4 |

This is what makes `fullyParallel: true` (4 workers) safe: no two concurrently-running files ever
mutate the same row, so no file's cleanup or click can race another file's in-flight test.

---

# Defects, evidence, root cause, fix

## Defect A — no database isolation between tests

**Evidence before fix:** dirty DB found at session start: `kudos-1 |
11111111-1111-1111-1111-111111111111 | f` — a stray like surviving from an earlier run. Original
failing run: `SC-001 failed Expected 1502, Received 1500`.

**Root cause:** `kudos-board-like-persistence.spec.ts` had no `test.describe.configure({ mode:
'serial' })` and no cleanup at all, so `fullyParallel: true` let its own SC-001/FR-003 tests (both
target kudos-1 — see Defect E) race each other and leak state across runs.
`kudos-board-like-sidebar.spec.ts`'s `afterEach(() => cleanupTestRows())` called the function with
**no arguments**, which defaulted to deleting kudos-3/4 — ids that file never touches — so the
secondary-like row it inserts on kudos-2 (`insertSecondaryLike`) was never cleaned up. Separately,
`kudos-board-feed-interactions.spec.ts`'s "Heart Toggle" test also clicked "the first enabled
heart," which resolves to kudos-1 too, making it a **fourth** file mutating the same row — found
empirically (not in the original defect list) after fixing the other three: full-suite run showed
`Expected: 1502, Received: 1500` on that test specifically once persistence's own race was closed.

**Fix:**
- `cleanupTestRows(kudosIds = ['kudos-3','kudos-4'])` in `local-db.ts` now takes explicit ids
  (backward compatible default for `like-rules.spec.ts`).
- `like-persistence.spec.ts`: `mode: 'serial'` + `beforeEach`/`afterEach` → `cleanupTestRows(['kudos-1'])`.
- `like-sidebar.spec.ts`: `beforeEach`/`afterEach` → `cleanupTestRows(['kudos-2'])` (fixes the
  actual leftover-row leak).
- `like-rules.spec.ts`: added the missing `beforeEach` (only had `afterEach` before).
- `feed-interactions.spec.ts`'s Heart Toggle describe: moved off kudos-1 onto **kudos-6** (an id
  no other spec touches), with its own `beforeEach`/`afterEach` isolation. kudos-6 sits past the
  board's `REVEAL_BATCH = 4` initial reveal, so the test now scrolls the lazy-load sentinel into
  view before locating it.

## Defect B — `execSql` misclassifies every SQL error as an infra failure

**Root cause:** the shell command string itself always contains the literal word `"docker"`
(`docker exec -i ...`), and Node's `execSync` embeds that command into every thrown error's
`.message` ("Command failed: docker exec..."). `msg.includes('docker')` was therefore true for
**every** failure, including a plain Postgres error, always reporting `INFRA: docker/Supabase
unavailable` regardless of the real cause.

**Fix:** inspect `err.stderr` (what docker/psql actually printed) against real infra-diagnostic
patterns (`cannot connect to the docker daemon`, `no such container`, `error response from
daemon`) or `err.code === 'ENOENT'`. Anything else is now thrown as `SQL_ERROR: ...` carrying the
real Postgres message, never masked as an infra failure.

## Defect C — SC-003 locates its card by matching mutable state

**Evidence:** `cardText.includes('Nguyễn Hoàng Linh') && cardText.includes('45')` — `45` is
kudos-2's static `heartCount`; the instant `kudos-board-like-sidebar.spec.ts`'s SC-008 places a
secondary like on kudos-2, the rendered count becomes `46` and the substring match permanently
fails with "Should find kudos-2...".

**Fix:** new `e2e/support/kudos-card-locator.ts` → `kudosCardByIdentity(page, sender, receiver)`
locates a card by its (sender, receiver) name pair — every record in `kudos-records.ts` has a
unique pair — independent of any mutable count. Used for SC-003 (Linh → Mai phương Thúy).

## Defect D — Docker VM clock skew (`PGRST303 "JWT issued at future"`) — REAL, confirmed via source

Verified via source/web, not assumed: `node_modules/next/dist/esm/client/components/app-router-headers.js`
confirms the mechanism class exists; PostgREST's PGRST303 gives a 30s `iat`/`exp`/`nbf` tolerance
before rejecting a token whose issuer (GoTrue, in the Docker Desktop VM) is ahead of the verifier's
own clock (PostgREST, same VM) — a documented Docker Desktop behavior after host sleep/wake.
Measured **0s skew** across host/db/auth/kong in this session — not currently reproducing, but the
mechanism is real and `lib/kudos/likes/queries.ts` silently degrades to an empty board on exactly
this failure (FR-005), so a recurrence would surface as wrong-but-unexplained counts, not an error.

**Fix (preventive, not exercised in this session since skew is 0):** `e2e/support/docker-clock-skew-guard.ts`,
wired via `playwright.config.ts`'s new `globalSetup`. Measures host-vs-container clock skew once
before the suite; if it exceeds 15s (half PostgREST's own 30s tolerance), attempts a real resync
(the documented `nsenter`-into-VM `date -s` remedy) and fails fast with an `INFRA:` message if that
doesn't work — never a sleep/retry that just waits out unknown drift. **Limitation to disclose:**
the resync code path itself could not be exercised or proven in this session, since no drift was
present to trigger it; only the skew-measurement path is empirically verified. If clock skew
recurs, that resync path is worth checking against then.

## Defect E — SC-005 (and SC-006, same pattern) target the wrong card entirely

**Evidence:** `enabledHearts.first()` clicked, then `SELECT is_special FROM kudos_likes WHERE
kudos_id = 'kudos-4'` found zero rows. Traced to `components/kudos/all-kudos-feed.tsx`:
`REVEAL_BATCH = 4` renders exactly kudos-1..4 by default, kudos-2 is the only disabled one (it's
the viewer's own kudos) — so "the first enabled heart" is **always kudos-1**, never kudos-4. This
is a deterministic test-target mismatch, not flakiness: the SQL assertion could never have found a
row regardless of isolation or timing. It explains the reported "3 did not run" too — `mode:
'serial'` in that file stops the remaining tests once SC-005 fails.

**Fix:** SC-005 and SC-006 now locate kudos-4 explicitly via `kudosCardByIdentity(page, 'Nguyễn
Văn Quy', 'Nguyễn Bá Chức')` instead of "first enabled."

## Additional defects found while verifying the above (not in the original list)

**F1 — `likes-provider.tsx`'s in-flight guard silently drops a same-card double-click under load.**
Confirmed by direct evidence, not guessed: polled `kudos_likes` for kudos-6 during a failing run —
exactly one row, from the first click, unchanged for 7+ seconds while the "unlike" click's
assertion failed (`Expected: 512, Received: 513`). `components/kudos/likes-provider.tsx`'s
`toggle()` applies its state flip optimistically and synchronously (so a short wait after the
first click always looks correct), but holds a per-kudos-id in-flight guard that no-ops a second
click while the first one's server round trip is still pending — by design, to stop a literal
double-click from queuing two writes. Under 4 concurrent Playwright workers sharing one dev server
and Postgres container, that round trip can outlast a short fixed wait, so a legitimate second
click gets silently dropped. **This looked like it could be a genuine app defect** (a real user's
deliberate rapid like→unlike could also be swallowed); flagging it rather than silently working
around it — see "Possible application-side follow-up" below. Two more precise test-side fixes were
tried and rejected before landing on a plain settle:
- `page.waitForResponse` matching the `Next-Action` request header hung for the full 30s test
  timeout even under **zero** concurrent load — confirmed via `node_modules/next/dist/esm/client/components/app-router-headers.js`
  that `next-action` is the correct header name, so the failure is Playwright's
  `request.headers()` not reliably surfacing it at predicate-evaluation time, not a wrong header.
- Polling `kudos_likes` directly via `execSql` (a `docker exec` per 50ms tick) was correct in
  principle but the subprocess-spawn overhead across 4 workers roughly **doubled total suite
  time** (20s → 47s) and introduced new, unrelated flakiness elsewhere on the page — an
  over-engineered fix causing its own regressions.
- Landed on: `e2e/support/heart-toggle.ts` → `clickHeartAndSettle`, a plain click + 1000ms wait
  (up from 300ms), applied at every heart-toggle click site across the three affected specs.
  Verified stable across 7 consecutive full-suite runs.

**F2 — sidebar test's number-parsing regex silently corrupted by adjacent markup.**
`components/kudos/kudos-sidebar-stats.tsx` renders the "x2" heart-multiplier badge as a sibling
text node immediately before the value span, no separator between them. The test read the whole
row's `textContent()` and regex-matched a trailing digit run — for a real value of `1`, that
concatenates to `...x2` + `1` = `...x21`, and the regex greedily consumed the badge's own trailing
`2` as part of the number (`Expected: 1, Received: 21` — exactly `2` prepended to `1`, for any
value, unconditionally). Fixed by reading the value span directly via its distinguishing
`.text-accent` class instead of the concatenated row text.

**F3 — `SELECT * WHERE aria-pressed="true"` matches whichever card any concurrently-running test
happens to have liked, not necessarily the intended one.** SC-006's final "unlike" step searched
the whole `ALL KUDOS` section for `button[aria-pressed="true"]` with no id scoping. Confirmed via
targeted debug instrumentation (temporary `console.log` polling, since removed): after the click,
`aria-pressed` read `true` continuously for 3+ seconds while `kudos_likes` for kudos-4 stayed at
`1` — the click and every subsequent read were re-resolving `.first()` against whichever card
**any other concurrent test** (kudos-1 or kudos-6, owned by other files) happened to have pressed
at that instant, silently toggling an unrelated test's like instead of kudos-4's own. Fixed by
scoping to kudos-4 via the same `kudosCardByIdentity` helper used for the like click.

# Possible application-side follow-up (not fixed here — reporting per instructions)

F1 above (`likes-provider.tsx`'s in-flight guard) is a real behavior, not a test artifact: any
user whose double-click straddles a slow network round trip has their second click silently
dropped with no error, toast, or visual feedback — they would see the "liked" state persist and
have no indication their un-like didn't register until they look again or reload. This is squarely
inside the guard rail set for this task ("if you become convinced there is a genuine application
defect, STOP and report it... rather than editing around it") — **not fixed, not touched**. It is
a UX/correctness question for the implementer to weigh (e.g., disable the button while a request
is in flight so the drop is visible, or queue the second call once the first resolves) rather than
a test-harness matter.

# Verification

```
npx playwright test --project=kudos-board
```
- Ran **7 times total**: 5 from the state left by the previous run, 2 more after manually
  re-injecting a dirty state (`kudos-1`/`kudos-2` like rows + a stray `special_days` row, simulating
  a crash that skipped cleanup).
- **Every run: exit 0, `30 passed`, 0 failed, 0 skipped/"did not run".**
- `npx tsc --noEmit` clean; `eslint e2e/ playwright.config.ts` — 0 errors (pre-existing unused-var
  warnings only, none newly introduced).
- Final DB state confirmed clean: `kudos_likes` count 0, `special_days` count 0.

**Status:** DONE
**Root causes:** Defect A (missing/misscoped isolation across 4 files, not 3), Defect B (error
misclassification via string-matching the command instead of stderr), Defect C & E (locators keyed
to mutable state or "first" DOM position instead of stable record identity), Defect D (real but
currently non-reproducing Docker clock skew — guarded, not fixed blind), plus two flakiness causes
found only after fixing the above (F1 timing vs. app's in-flight guard, F3 unscoped
`aria-pressed="true"` locator) and one silent parsing bug (F2).
**Concerns:** `kudos-board-like-rules.spec.ts` (262 lines) and `kudos-board-feed-interactions.spec.ts`
(244 lines) now exceed the project's 200-line file-size guideline (`development-rules.md`) due to
the added isolation/comment overhead; not a hard gate here and out of scope to split during a
defect fix, but worth a follow-up pass. F1 (in-flight guard swallowing a legitimate second click)
is a real application behavior worth a product/implementer decision, not a blocker for this task.
