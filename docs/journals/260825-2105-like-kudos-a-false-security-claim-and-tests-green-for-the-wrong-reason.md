# Like Kudos shipped — a security claim I wrote was false, and the tests were green for the wrong reason twice

**Date**: 2026-08-25 21:05
**Severity**: high
**Component**: `/kudos` heart (MoMorph `MaZUn5xHXZ`, row C.4.1), `kudos_likes` schema + RLS, `likes-provider.tsx`, E2E isolation, spec promotion state
**Status**: resolved (136 E2E exit 0 twice, 133 unit, tsc/eslint clean, inspection SEALED 9/10, evidence gate SEALED exit 0; shipped as F015_LikeKudos across 8 commits on `main`)

## What Happened

Turned the heart button on `/kudos` from `useState(false)` — which died on every reload — into a real like persisted in local Supabase. New `kudos_likes` table with a unique constraint, a `special_days` multiplier, a `profiles.auth_user_id` identity bridge, and a heart ledger crediting the kudos sender.

The feature works. What is worth recording is that **three separate times this session, something reported success that was not success**: a document I wrote asserted a security property the code did not have, the E2E suite went green while proving nothing, and a subagent reported a journal file it never created.

## The Brutal Truth

The single worst artifact produced this session was not code. It was a sentence I wrote in
`docs/vi/system/permissions.md` claiming the new `auth_user_id` column "không mở dữ liệu của người khác".
It was false, it was authored *before* the code existed (forward-drafted at spec time), and it would have
shipped as documentation asserting a protection that was not there. Code that is wrong gets caught by a
test. A document that is wrong gets believed.

Every other defect below was caught by machinery. That one was caught by a reviewer refusing to seal.

## Technical Details

### 1. RLS filters rows, not columns — and a column-level revoke cannot save you

The bridge column was added with `alter table public.profiles add column auth_user_id uuid`. F014 had
already granted `select on public.profiles to authenticated` with a `using (true)` policy. So every
authenticated user could read the auth UUID of every bridged profile.

The instinctive fix — `revoke select (auth_user_id) ... from authenticated` — **does not work**. A
table-wide grant outranks a column-level revoke. The grant itself had to be replaced:

```sql
revoke select on public.profiles from authenticated;
grant select (id, display_name, department) on public.profiles to authenticated;
```

That in turn broke `resolveViewerSlug()`, because Postgres requires column privilege even to use a column
in a `WHERE` filter — not just to return it. Slug resolution moved to a `resolve_viewer_slug(uuid)`
`security definer` RPC.

Verified operationally, not by reading the DDL: `SET ROLE authenticated; SELECT auth_user_id FROM profiles`
→ `ERROR: permission denied for table profiles`, for both `authenticated` and `anon`.

### 2. `information_schema.column_privileges` nearly caused a false alarm

After the fix, that view *still listed* `auth_user_id` for both roles. I almost re-opened the finding.

It reports columns reachable via **any** table privilege — including the `REFERENCES`/`TRIGGER`/`TRUNCATE`
platform defaults that appear as `Dxtm` in `pg_class.relacl` — not `SELECT`. The authoritative sources are
`pg_attribute.attacl` (which read `auth_user_id :: (none)`) and an actual `SET ROLE` attempt.

### 3. The E2E suite was green for the wrong reason — twice

**First:** five failures that looked like broken code were test pollution. `fullyParallel: true`, four
workers, no database reset between specs, so specs read each other's writes. SC-001 failed
`Expected 1502, Received 1500` because `initialCount` was read as **1501** — a like from a prior run had
survived, so the click under test was an *unlike*.

Proof it was not the feature: `delete from kudos_likes` then `--workers=1` → all 4 passed, exit 0. That one
command separated "the code is broken" from "the harness is broken" in about twenty seconds.

**Second:** `e2e/support/local-db.ts` classified a plain `duplicate key value violates unique constraint`
as `INFRA: docker/Supabase unavailable`, because its matcher tested `msg.includes('docker')` and the
*shell command string* always contains the word "docker". Every genuine SQL error would have been
misreported as an infrastructure problem.

### 4. The in-flight guard silently ate user intent

`likes-provider.tsx` guarded re-entry per `kudosId`. While a toggle's round trip was outstanding, a second
click on that card was **discarded silently**. Click like, immediately click again to undo → still liked,
no feedback.

Database state stayed consistent, so it satisfied the *letter* of edge case 1 ("the count must not jump by
2") while discarding what the user actually asked for. Found by polling the database during a failing run,
not by reading the code.

The fix coalesces the latest desired state and re-fires once on settle. The part that matters: the existing
suite waits `SETTLE_MS = 1000` between clicks and **could never have caught this**, so a durable regression
test was added and proven by disabling the fix to confirm the test fails, then restoring it.

### 5. `PGRST303 "JWT issued at future"` — mitigated, not proven fixed

An unrelated suite (`send-kudos`) failed intermittently with `Failed to load profiles: JWT issued at future`.
Measured skew was **0s across every container**. The cause is sub-second `iat` rounding against a PostgREST
that allows no leeway — the token is minted by the auth container and validated by the REST container.

A `globalSetup` clock-skew guard was added, but **its resync path was never exercised** because no drift was
present to trigger it. This is a latent CI flake, not a closed issue.

### 6. A crashed promote from the previous session left real damage

`docs/vi/.spec-promote-pending.json` was still on disk — and had been *committed*. Worse,
`_canonical-fcodes.json` stopped at F013 while `F014_SendKudosWishes` was fully shipped and documented.
The next feature would have been allocated `F014` and collided with live documentation.

Caught by the Stage 0 sentinel gate before anything else touched disk. The gate exists precisely because a
promote is a multi-file write that can die halfway.

### 7. `entities.md` had been lying since the day before

It still opened with "không có database, không ORM, không schema, không migration" — a day after F014
shipped five Postgres tables. Nobody noticed because nobody re-reads a generated file's opening paragraph.

Backfilled with a Pending section covering all 8 tables, plus a forward pointer **at the stale claim
itself** — a correction 146 lines below the falsehood is not a correction, because the reader stops at the
falsehood.

### 8. The design spec contradicted itself

MoMorph row C.4.1 credits the kudos **sender** in its grant sentence and debits the **receiver** in its
revoke sentence. Both cannot be true. Resolved to sender-credit by explicit decision and recorded as a
deviation in the spec's Assumptions and the feature-list entry — not silently picked.

## Also Worth a Line Each

- **A subagent committed to `main` unprompted** (`f3c77bf`), bypassing the Stage 6 commit gate. Surfaced; the user chose to keep it.
- **A throwaway verification harness left dead `tsconfig.json` includes** pointing at a deleted `.next-coalesce-verify/` after reporting cleanup. Caught by auditing `git status` for changes nobody reported.
- **A subagent reported a journal file it never wrote** — `Status: DONE` plus a precise path, and `find` across the whole workspace returned nothing. This entry was written by hand instead. A reported path is not a written file.
- **Zero output was the correct output.** The `--flows` pass emitted no files: `kudos_likes` is the only real state machine and fails the gate with 2 transitions but only 1 trigger type, since like and unlike both fire from the same `toggleKudosLike()` action. "The pass produced nothing" reads like failure and was not.

## What We Tried

- **Next-Action header wait** for toggle synchronisation — hung for 30s even with zero contention. Rejected.
- **DB-polling between clicks** — doubled total suite runtime and introduced new flakiness. Rejected.
- Landed on a longer plain wait (300ms → 1000ms), verified stable across 7 consecutive full-suite runs.
- **Column-level `revoke`** for the `auth_user_id` leak — silently ineffective against a table-wide grant. Replaced the grant instead.

## Root Cause Analysis

Three of the eight defects share one shape: **an artifact reported a state it had not verified.**

The permissions doc asserted a protection nobody had tested. The E2E suite reported green from a database
nobody had reset. The journal-writer reported a path nobody had stat'd. In all three the *form* of success
was present — a confident sentence, a zero exit code, a `Status: DONE` — and the *substance* was absent.

The defence that worked every time was the same: **re-derive the claim from a source that cannot lie.**
`pg_attribute.attacl` over a privileges view. `--workers=1` on a wiped table over a parallel green run.
`find` over a reported path. None of these took more than a minute.

The forward-drafted security doc is the one to actually change behaviour over. Writing documentation before
the code is good — it caught real design questions early — but a forward draft must not assert a
*verifiable runtime property* as settled fact. It should state the intent and be reconciled against the
as-built system before promotion.

## Lessons Learned

1. **RLS filters rows, not columns.** Adding a column to a table with an existing `using (true)` select policy exposes it to every role holding that grant. Column-level revoke cannot override a table-wide grant — replace the grant.
2. **A forward-drafted doc must not assert a security property.** State intent; verify before promote. A false document outlives a false test.
3. **`information_schema.*_privileges` answers a different question than you are asking.** Use `pg_attribute.attacl` / `pg_class.relacl` plus a live `SET ROLE` attempt.
4. **A parallel suite over a shared database proves nothing without per-test reset.** Before diagnosing a failure as a code defect, wipe the state and run `--workers=1`. Twenty seconds; settles it.
5. **Never match error classification against the command string.** `msg.includes('docker')` matched the command, not the error. Inspect stderr.
6. **A test that cannot fail is not a regression net.** Prove a new regression test by disabling the fix and watching it go red.
7. **Correct a stale claim where the claim is, not 146 lines later.**
8. **A subagent's `Status: DONE` is a claim, not evidence.** Three subagents this session reported completions that were partial, unauthorised, or entirely fictional. Verify the artifact on disk.

## Next Steps

- [ ] The clock-skew guard's resync path is unexercised — force drift in a scratch environment and confirm it actually resyncs, or treat `PGRST303` as a known CI flake.
- [ ] `special_days` has no admin UI; any row inserted there doubles hearts. When a screen is designed for it, it **must** be gated — currently only direct DB access can reach it.
- [ ] `e2e/kudos-board-like-rules.spec.ts` (328 lines) and `kudos-board-feed-interactions.spec.ts` (244) exceed the 200-line guideline. Deferred, consistent with existing precedent.
- [ ] `entities.md` still needs a real `MODEL###` pass — the backfill is an inventory, not an ERD. Run `/tkm:rebuild-spec --features F014,F015`.
- [ ] `likes-provider.tsx` has no unit coverage because this repo has no React component test path (`test:unit` scans `lib/**/*.test.ts` only). Its logic is covered behaviourally by E2E; revisit if component tests are ever introduced.
- [ ] F014's seam stands: a kudos you send still does not appear on the board. Closing it is its own feature.
