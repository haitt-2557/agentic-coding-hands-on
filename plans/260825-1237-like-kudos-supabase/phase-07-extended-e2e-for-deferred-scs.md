# Phase 07 — E2E for the deferred success criteria (SC-002, 005, 006, 007, 008) + legacy heart specs

## Context Links

- [technical-spec.md](spec/like-kudos/technical-spec.md) — SC-002, SC-005, SC-006, SC-007, SC-008
- [edge-cases.md](spec/like-kudos/edge-cases.md) — rows 1-6, 11
- [permissions.md](spec/system/permissions.md) — §6 "tests must distinguish RLS-denied from grant-missing"
- Existing: `e2e/kudos-board-like-persistence.spec.ts` (the RED), `e2e/support/supabase-session.ts`, `e2e/kudos-board-feed-interactions.spec.ts`
- **Owner: `tester`.** This phase touches test files only and never edits implementation code.

## Overview

**Priority:** P1 · **Status:** done · **Effort:** ~2h
Five success criteria have no test yet, and two long-standing heart tests are about to break for a legitimate reason. Both are settled here.

## Key Insights

- **R1, the one that will look like a regression.** `e2e/kudos-board-feed-interactions.spec.ts` exercises the heart with only a `localStorage` mock — no Supabase session. Once FR-005 lands, its toggle test clicks a disabled button and its disabled/enabled-pair test finds zero enabled hearts. The tests are not wrong; their **precondition** is now incomplete. Add `seedSupabaseSession` and keep every assertion exactly as written. Weakening either assertion would be a downgrade, and is forbidden.
- **Distinguishing a missing grant from working RLS** is a named requirement (permissions §6, edge-case row 4). SC-007's "denied" and SC-004's "readable while logged out" only mean something as a pair: `anon` must *succeed* at reading counts and the forged insert must *fail*. One without the other proves nothing.
- **`special_days` is sealed from the API by design**, so SC-005/SC-006 cannot be driven through Supabase JS. They need direct Postgres access on `127.0.0.1:54422` (INT-001) — exactly the "configured by SQL only" path clarifications decision 4 describes. That belongs in a small `e2e/support/local-db.ts`, using the same `INFRA:` sentinel `supabase-session.ts` established so an environment problem is never mistaken for a screen failure.
- **The +2 is invisible on the liker's own screen.** A like on `kudos-1` credits `nguyen-ba-chuc`, not the viewer, so SC-005/SC-006 must assert at the database: `is_special` on the stored row, and the weighted sum. That is also where BR-005's real claim lives — the flag is frozen, not recomputed.
- **SC-008 needs a second real liker.** The fixture user authors `kudos-2` and is forbidden from liking it, so the viewer's ledger is 0 until somebody else likes it. Create a second auth user plus its like row in the test's own setup and remove both afterwards. This fabricates a state the app *can* produce, never one it forbids.
- **Parallelism is a hazard here.** `fullyParallel: true` plus shared database state means these specs must not race the persistence spec. Run them `serial` within the file and keep them off `kudos-1`, which the persistence spec claims as the first enabled heart.
- File naming is load-bearing: `e2e/kudos-board-like-*.spec.ts` lands on the existing `kudos-board` project (port 3200, gate open). `playwright.config.ts` is not to be edited.

## Requirements

- **SC-002 (BR-001)** — a second insert for the same pair is refused by the database.
- **SC-005 (BR-003/BR-004)** — a like placed while a `special_days` row covers today stores `is_special = true` and is worth 2.
- **SC-006 (BR-005)** — after the special day is removed, revoking that like revokes 2, read from the stored flag.
- **SC-007 (BR-006)** — an insert carrying another user's `user_id` is refused by RLS.
- **SC-008 (FR-008)** — the sidebar row matches the viewer's real weighted ledger.
- Edge-case row 4 — an `anon` read succeeds, proving the grant.
- Edge-case row 6 — two overlapping `special_days` rows still yield a single `is_special = true`.
- Regression: `kudos-board-feed-interactions.spec.ts` green again, assertions untouched.

## Architecture

```
e2e/support/local-db.ts        execSql(sql): psql on 127.0.0.1:54422, INFRA: sentinel on failure
                               + withSpecialDay(range, fn), insertSecondaryLike(kudosId), cleanupTestRows()

e2e/kudos-board-like-rules.spec.ts     (serial)  SC-002, SC-005, SC-006, SC-007, edge rows 4 & 6
e2e/kudos-board-like-sidebar.spec.ts   (serial)  SC-008
e2e/kudos-board-feed-interactions.spec.ts        + seedSupabaseSession precondition (assertions unchanged)
```

Target ids: the rules spec works on `kudos-3` and `kudos-4`; `kudos-1` belongs to the persistence spec. Every test cleans up its own rows in `afterEach` so the suite is re-runnable without `supabase db reset`.

## Related Code Files

**Create:** `e2e/support/local-db.ts`, `e2e/kudos-board-like-rules.spec.ts`, `e2e/kudos-board-like-sidebar.spec.ts`
**Modify:** `e2e/kudos-board-feed-interactions.spec.ts` (precondition only)
**Not touched:** `playwright.config.ts`, `e2e/kudos-board-like-persistence.spec.ts` (the RED artefact stays as captured), any implementation file.

## Implementation Steps

1. `e2e/support/local-db.ts`: `execSql()` over `psql "postgresql://postgres:postgres@127.0.0.1:54422/postgres" -A -t -c …` via `node:child_process`. Any non-zero exit throws an `INFRA:`-prefixed error. Add `withSpecialDay(startsOn, endsOn, fn)` which inserts, runs, and always deletes; `insertSecondaryLike(kudosId)` which creates a throwaway `auth.users` row plus its like row; `cleanupTestRows()`.
2. `kudos-board-like-rules.spec.ts`, `test.describe.configure({ mode: 'serial' })`:
   - **SC-002** — sign in through `@supabase/ssr` in the Node process with the fixture credentials, insert a like on `kudos-3`, insert the same pair again, assert the second call returns an error whose code is `23505`. Then assert `select count(*)` is exactly 1.
   - **SC-007** — with the same client, attempt an insert whose `user_id` is a different uuid; assert it is rejected, and assert no row was written. Pair it with an `anon`-key select that **succeeds** and returns rows, so a missing grant cannot masquerade as this test passing (permissions §6).
   - **SC-005** — `withSpecialDay(today, today, …)`: like `kudos-4` through the UI with a real session, then `select is_special` → `true`, and a weighted sum over `kudos-4` → `2`.
   - **Edge row 6** — inside a second overlapping `special_days` range, a like still stores a single `true` and is worth 2, not 4.
   - **SC-006** — with the `kudos-4` like still in place, delete the `special_days` row, confirm `is_special_day(current_date)` is now `false`, re-read the stored row (still `true`), then unlike through the UI and assert the pair is gone. The revoked amount is the stored 2 by construction; the frozen flag is the assertion that matters (BR-005).
3. `kudos-board-like-sidebar.spec.ts`: `insertSecondaryLike('kudos-2')`, load `/kudos` with the fixture session, read the value beside `Số tim bạn nhận được:` and assert it equals the weighted ledger for `nguyen-hoang-linh` (1 on a normal day). Then a second case with no session asserting `0`. Clean up in `afterEach`. Strip non-digits before `parseInt` — vi-VN separators (edge-case row 11).
4. `kudos-board-feed-interactions.spec.ts`: add `seedSupabaseSession(context, 'http://localhost:3200')` to the heart-describe's `beforeEach`, alongside the existing `seedDefaultSession`. Change nothing else — not a locator, not an expectation. Add a comment recording why the precondition changed (FR-005 made the signed-out heart disabled by design).
5. Re-run the RED command; it must still be RED until phases 05/06 land, and RED for the same three behavioural reasons.
6. Run the whole `kudos-board` project once phases 05 and 06 report done.

## Todo List

- [x] `local-db.ts` with `INFRA:` sentinel and psql availability check
- [x] SC-002 (`23505`, exactly one row)
- [x] SC-007 (forged `user_id` refused) **paired with** a successful `anon` read
- [x] SC-005 (+2, `is_special = true`)
- [x] Edge row 6 (overlapping ranges → still 2)
- [x] SC-006 (flag frozen after the special day is deleted)
- [x] SC-008 sidebar value, plus the logged-out `0` case
- [x] `feed-interactions` given the session precondition, assertions untouched
- [x] `serial` mode; no test touches `kudos-1`; `afterEach` cleanup everywhere
- [x] Spec filenames match `kudos-board-like-*`; `playwright.config.ts` untouched

## Success Criteria

- All five deferred SCs have a real, assertion-caused pass/fail, none of them tautological.
- `npx playwright test --project=kudos-board` is fully green, including the two migrated heart tests.
- The suite runs twice in a row without a `supabase db reset` between runs.
- No implementation file appears in this phase's diff.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| `psql` unavailable on the runner | Med × High | Availability probed in `local-db.ts`; failure throws `INFRA:` so it reads as environment, not as a screen failure |
| Shared DB state races the persistence spec | **High × High** | `serial` mode, disjoint kudos ids, `afterEach` cleanup |
| Leftover rows drift the counts of later runs | Med × Med | Every test removes its own rows; the sidebar test also removes its throwaway user |
| SC-007 passes because of a missing grant, not because of RLS | Med × High | Paired with an `anon` read that must succeed (permissions §6) |
| Legacy heart tests "fixed" by loosening assertions | Med × High | Precondition only; the phase forbids assertion edits and phase 08 re-reads the diff |
| Throwaway auth user left behind breaks the seed's uniqueness | Low × Med | Deleted in `afterEach`; ids are namespaced so `db reset` also clears them |

## Security Considerations

- `local-db.ts` uses the local throwaway Postgres credential only. It must never be imported by application code and never read a value from the environment that could point at a non-local database.
- SC-007 is the test that proves the client cannot forge identity. Never relax it to an application-layer assertion.
- The throwaway auth user exists only inside a test's lifetime and holds no password grant.

## Next Steps

Feeds phase 08. Authorable in parallel with phases 05 and 06; passes only once both land.
