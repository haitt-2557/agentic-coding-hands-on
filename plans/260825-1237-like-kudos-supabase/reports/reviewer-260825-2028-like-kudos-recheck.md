# Reviewer report — F015 Kudos Like/Heart (Stage 5 Re-inspection, cycle 2/3)

**Prior verdict:** REWORK (score 6, 1 High + 2 Medium + 2 Low findings, 1 refuted claim, 1 unproven claim)
**This cycle:** SEALED (score 9, 0 outstanding findings above Low, 0 refuted/unproven/reachable regressions)

I did not take the coordinator's resolution report on trust — every claim below was independently
re-derived from `psql`, a live Playwright re-run, or a direct file read.

## Independent verification, finding by finding

**1. HIGH — `profiles.auth_user_id` exposure. RESOLVED, verified.**
Queried the catalog directly rather than trusting the summary:
```
attname       | attacl
auth_user_id  | (empty)          -- no column-level grant at all
relacl (profiles): authenticated=Dxtm  -- no 'r' (select), no table-wide SELECT survives
```
Then proved it operationally, not just structurally:
```sql
set role authenticated; select auth_user_id from public.profiles limit 1;
-- ERROR: permission denied for table profiles
set role anon; select auth_user_id from public.profiles limit 1;
-- ERROR: permission denied for table profiles
set role authenticated; select id, display_name, department from public.profiles limit 1;
-- succeeds
```
This is a real, live denial — not RLS silently returning zero rows, an actual privilege error on the
column. Cross-checked the narrowed grant `(id, display_name, department)` against every other
`.from('profiles')` call in the codebase (`lib/kudos/send/queries.ts:29-31`, the F014 recipient
picker) — it selects exactly those three columns, so the narrowing doesn't regress it. Confirmed live:
re-ran the full `send-kudos` Playwright project, 24/24 passed.

`resolveViewerSlug()` now goes through the `resolve_viewer_slug` RPC instead of a raw select — this
is exercised end-to-end by SC-003 (own-kudos disable) and SC-008 (sidebar ledger), both re-run and
passing, so the bridge still works functionally, not just "compiles."

The coordinator's read of `information_schema.column_privileges` still listing `auth_user_id` was
correct to flag and correct to explain: that view reports any table-level privilege (the `Dxtm`
defaults), not SELECT specifically. My own `pg_attribute.attacl` + live `SET ROLE` test is the
stronger proof and confirms their reading.

**2. MEDIUM — RPC-reachable definer functions. RESOLVED, verified — including the flagged residual.**
```
is_special_day             | {postgres=X/postgres}                              -- no role can EXECUTE
is_static_kudos_author     | {postgres=X/postgres,authenticated=X/postgres}     -- anon excluded
resolve_viewer_slug        | {postgres=X/postgres,authenticated=X/postgres}     -- anon excluded
kudos_likes_set_is_special | (empty = still PUBLIC-default EXECUTE)
```
The coordinator asked me specifically to confirm or refute their unverified claim about the trigger
function. I did not assume it — I called it directly:
```sql
select public.kudos_likes_set_is_special();
-- ERROR: trigger functions can only be called as triggers
```
This fails identically for `authenticated` and for the function's own owner (`postgres`). Confirmed
via `pg_proc.prorettype::regtype = 'trigger'` and `prokind = 'f'`: Postgres refuses to execute any
function whose return type is the `trigger` pseudo-type outside of an actual trigger firing, at the
language level, independent of any GRANT. The residual PUBLIC EXECUTE bit is provably inert, not
merely probably harmless. No fix needed; the coordinator's instinct was right and I've now put a
concrete proof behind it rather than a "seems safe" note.

**3. MEDIUM — untested BR-002 DB rejection. RESOLVED, verified.**
Read the new test (`e2e/kudos-board-like-rules.spec.ts:133-182`) in full before running it. It signs
in as the fixture user (whose real `auth_user_id` bridges to `nguyen-hoang-linh`, the sender of
`kudos-2`), inserts directly against `kudos_likes` bypassing both the disabled UI button and the
server action's own app-level check, and asserts the INT-002 three-way distinction precisely:
`code === '42501'` + message matches `/row-level security policy/i`, explicitly **not**
`/permission denied/i` (the missing-grant failure mode) and **not** `23505`/`duplicate key` (the
unique-constraint path). Ran it standalone (`--project=kudos-board -g "BR-002 \(DB\)"`): passed in
390ms. Ran the full `kudos-board` project afterward (33/33 passed) to confirm no interference with
sibling specs sharing the same Postgres container.

**4. LOW — stale `heart-toggle.ts` comment. RESOLVED.** Re-read the comment: it now correctly
describes the coalescing/replay behavior instead of the old "silently no-ops" description. Matches
`likes-provider.tsx`'s actual current logic.

**5. LOW — unfiltered `queries.ts` read. RESOLVED as an accepted trade-off.** A comment now states the
9-static-id bound explicitly and names the exact trigger for revisiting it (the deferred board-rewire
seam) and what the fix would look like (`WHERE kudos_id = ANY($1)` + a supporting index). Left
unfiltered on purpose at current scale — reasonable, now explicit rather than implicit.

## New observation this cycle (not blocking)
`e2e/kudos-board-like-rules.spec.ts` grew from 262 to 328 lines adding the BR-002 test, exceeding the
200-line code-file guideline. I checked whether this is actually anomalous for this repo's e2e suite
before flagging it: `send-kudos-interactions.spec.ts` is 261 lines, `kudos-board-feed-interactions.spec.ts`
is 244, `kudos-board-layout.spec.ts` is 212 — exceeding 200 lines is already the norm, not the
exception, for e2e spec files here, which carry substantial defect-history comments by house style.
The placement was a deliberate reuse of `SC-007`'s `createServerClient`/sign-in fixture rather than
duplicating it in a new file. I recorded this as a Low/Defer finding, not a blocker.

## Independent re-verification of the whole gate (not re-quoted from the coordinator)
- `npx tsc --noEmit` → exit 0
- `npx eslint` on every file this cycle touched → 0 errors (1 pre-existing unused-var warning at
  `kudos-board-like-rules.spec.ts:92`, present before this cycle's edits, not newly introduced)
- `npx playwright test --project=kudos-board` → 33/33 passed
- `npx playwright test --project=send-kudos` → 24/24 passed (regression check on the profiles grant
  narrowing)
- `npx playwright test --config playwright.unit.config.ts` → 133/133 passed

## Verdict
`decision: SEALED`, `criticalCount: 0`, `refuted/unproven/reachableRegressions` all empty,
`contractStatus: OK`. Every finding from cycle 1 is fixed and independently confirmed at the SQL/
privilege level and by a live test re-run, not accepted on the strength of the writeup alone. The one
new observation (file length) is cosmetic and explicitly non-blocking given this repo's existing
precedent for e2e file sizes.

## Still Unresolved
None blocking. Optional, non-blocking: `docs/vi/system/permissions.md` §5 could be updated to mention
the `resolve_viewer_slug` RPC route by name — its claim is no longer false, just slightly behind the
current mechanism. Not required for sealing.
