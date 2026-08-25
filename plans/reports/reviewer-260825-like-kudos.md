# Reviewer report — F015 Kudos Like/Heart (Stage 5 Inspection)

**Commit reviewed:** f3c77bf + uncommitted working tree
**Scope:** migration `20260825140000_kudos_likes_tables.sql`, `lib/kudos/likes/*`, `lib/kudos/viewer-identity.ts`,
`lib/supabase/current-user.ts`, `lib/kudos/viewer-stats.ts`, `components/kudos/{likes-provider,kudos-card-actions,
kudos-board,kudos-sidebar-stats}.tsx`, `app/kudos/page.tsx`, `e2e/kudos-board-like-*.spec.ts` + support files,
`playwright.config.ts`, `supabase/seed.sql`, docs deltas.

## Scope
- Files reviewed: all files listed in the task's "Changed/added surface", plus the F014 migration
  (`20260824031123_kudos_send_tables.sql`) and `docs/vi/system/permissions.md` for cross-referencing.
- Lines: ~885 across the new `lib/kudos/likes/*` + provider/actions/board/page files, plus ~668 lines of new e2e specs.
- Depth: full read of every changed production file; targeted read of e2e specs and support helpers; independent
  re-run of `tsc --noEmit` (exit 0) and `eslint` on the changed surface (exit 0, no output).

## Assessment
The core feature logic is well-built: the migration correctly seals `special_days`/`kudos_static_authors`
(RLS on, zero policies, zero grants — genuinely unreachable via the Data API), pins `search_path` and fully
schema-qualifies every reference inside the `security definer` functions (no hijack surface), freezes
`is_special` via a `BEFORE INSERT` trigger with no `UPDATE` policy or grant (BR-005 is actually enforced, not
just intended), and forces `user_id = auth.uid()` in the insert policy's `WITH CHECK` (BR-006). The
double-click/coalescing rewrite in `likes-provider.tsx` is correct on trace-through: because the server action
is a pure toggle and the client's `optimisticGuess` is always `!settledLiked`, the `while` loop converges to
the last real click's intent in at most one extra round trip, with no permanent lockout and no double-counting
(the `23505`-as-success branch in `toggle-like.ts` cooperates correctly with this). Unit and e2e test coverage
is genuine — real Postgres queries via `execSql`, real Playwright interactions, not stubbed data — and every
acceptance criterion in `study-context.json` has a corresponding, non-trivial test.

However, one finding is a real, demonstrable break of a security invariant the delivered docs assert in
writing, and that is enough to block sealing regardless of how solid the rest of the change is.

## Critical
None.

## High
**1. `profiles.auth_user_id` is readable by every authenticated user — contradicts the docs' own claim.**
`docs/vi/system/permissions.md:314-317` (added by this change) states plainly: *"Cột `profiles.auth_user_id`
chỉ trả lời đúng một câu hỏi ... và không được dùng cho bất kỳ quyết định phân quyền nào khác ... không mở dữ
liệu của người khác."* This is false as shipped. `profiles` already carries, from F014
(`supabase/migrations/20260824031123_kudos_send_tables.sql:56`): `grant select on public.profiles ... to
authenticated;` and (`:67-69`) `create policy profiles_select_authenticated ... using (true);` — a table-wide
grant and an all-rows policy with no column list. RLS filters rows, never columns. This migration
(`supabase/migrations/20260825140000_kudos_likes_tables.sql:21-22`) adds `auth_user_id uuid unique references
auth.users(id)` to that same table with no accompanying column-level `revoke`/narrower `grant`, and no new
policy. The result: any signed-in user — including the e2e fixture user, or any real Sunner — can run
`supabase.from('profiles').select('id, auth_user_id')` and recover the complete slug↔real-auth-uuid bridge.
That is exactly the mapping `kudos_static_authors` was carefully sealed (RLS, zero policies, zero grants,
`security definer` function as the only path in) to protect from the *other* direction. Sealing one side of a
bidirectional mapping while leaving the other wide open defeats the purpose of sealing either.

Practical severity is bounded — a leaked `auth.users.id` cannot forge a session or bypass `kudos_likes`'
`auth.uid()`-enforced RLS by itself — but it is a live authorization/data-boundary defect and a written claim
in the shipped docs is objectively wrong.

*Fix:* Either (a) `revoke select (auth_user_id) on public.profiles from authenticated;` and expose the bridge
only through a `security definer` function shaped like `is_static_kudos_author` (e.g. `is_current_user_slug()`
returning just the caller's own slug), or (b) move `auth_user_id` to a separate sealed table joined only inside
`security definer` functions, mirroring the `kudos_static_authors` pattern already in this same file. Then
correct or re-verify permissions.md §5's claim.

## Medium
**2. Security-definer functions lack an explicit `revoke execute from public`.**
`is_special_day(date)` and `is_static_kudos_author(text, uuid)`
(`supabase/migrations/20260825140000_kudos_likes_tables.sql:63-94`) are created without a preceding `revoke
execute on function ... from public`. PostgreSQL auto-grants `EXECUTE` to `PUBLIC` when a function is created;
no migration in this repo alters that default (`grep -rn "revoke" supabase/migrations/*.sql` finds none). The
explicit `grant execute on function public.is_static_kudos_author(text, uuid) to authenticated;` at line 128
is therefore likely redundant, not restrictive: both functions are probably already callable by `anon` and
`authenticated` directly via PostgREST RPC (`/rest/v1/rpc/is_static_kudos_author`), not only as a side-effect
of RLS policy evaluation. `is_special_day` leaking is low-impact (a non-sensitive boolean), but
`is_static_kudos_author` becomes a free-standing (kudos_id, uuid)-authorship oracle, compounding finding 1.
*Fix:* `revoke execute on function public.is_special_day(date) from public;` and the same for
`is_static_kudos_author`, before the intended `grant ... to authenticated`.

**3. BR-002's database-level self-like rejection is implemented but untested.**
`edge-cases.md` row 3 (severity **high** in that table) is: *"Người gửi kudos gọi thẳng action để tự thả tim,
bỏ qua UI disabled → Database từ chối theo BR-002."* Reading `toggle-like.ts:48-51` (an application-level
`viewerSlug === record.senderId` check) and the insert policy's `is_static_kudos_author` clause, the logic is
correct. But `e2e/kudos-board-like-persistence.spec.ts:98-129` (`SC-003`) only asserts the button renders
`disabled` — it never attempts a direct write to prove the database independently rejects it, the way
`SC-007` does for a forged `user_id`. Given this file's own convention of directly exercising RLS with a raw
`createServerClient` call, the missing counterpart for self-like is a straightforward, valuable addition.

## Low
**4. Stale comment describing removed behavior.** `e2e/support/heart-toggle.ts:8-12` says the in-flight guard
"silently no-ops a second click ... by design" — that described the *old*, already-fixed bug. Current
`components/kudos/likes-provider.tsx:147-166` coalesces the second click via `pendingDesired` instead of
dropping it. Update the comment so a future reader doesn't reintroduce the drop bug while "restoring" what the
comment describes.

**5. Unfiltered full-table read on every board render.** `lib/kudos/likes/queries.ts:25-27`
(`loadBoardLikeState`) selects every `kudos_likes` row with no `WHERE` clause to compute per-card counts. Fine
at the current scale (9 static kudos ids), no index-assisted filter exists for when this grows. Not blocking;
flagged for a future pass.

## Edge Cases Turned Up (scouting pass, before reading the diff)
- Concurrent toggle requests for the same `(kudos_id, user_id)`: handled via the DB `unique` constraint +
  `23505`-as-success in `toggle-like.ts`, not a racy pre-check.
- Rapid like→unlike→like clicks while a request is in flight: traced the `sendToggle` `while` loop by hand —
  converges correctly to the last click's intent in at most one follow-up request; no lockout, no double-count.
- Session expiring between page load and click: `getSupabaseUserOrNull` returns the auth-required error;
  client reverts silently to the pre-click state (matches edge-cases.md row 8, documented as acceptable).
- Orphaned like row (`kudos_id` for a since-removed static record): `queries.ts`/`ledger.ts` never crash on
  this — `tallyLikeCounts`/`ledgerTotal` just sum whatever they're handed, and the board only ever looks up
  counts by known static ids, so an orphan row is silently inert rather than thrown.
- `STAT_ROWS` (const) → `buildStatRows()` (function) signature change: grep-verified zero other call sites,
  `tsc --noEmit` clean — not a real backward-compat break despite being an exported-shape change.

## Done Well
- `special_days` / `kudos_static_authors` sealing is textbook: RLS on, **zero** policies for any role, zero
  grants — genuinely unreachable except through the two `security definer` functions, both of which fully
  schema-qualify every reference (no `search_path` hijack surface despite the pinned `set search_path =
  public`).
- BR-005 ("frozen `is_special`") is enforced structurally, not just documented: a `BEFORE INSERT` trigger
  stamps the value once, and the absence of any `UPDATE` policy *and* the absence of an `UPDATE` grant means
  there is no Data API path that could ever change it after insert.
- The `likes-provider.tsx` coalescing rewrite is a genuine, verified fix — traced by hand across several
  interleaving scenarios (rapid click storms, external-actor divergence) and it converges correctly every time
  without dropping intent or double-writing.
- Test discipline in the e2e suite is real: disjoint kudos-id ownership per spec file to survive
  `fullyParallel`, identity-based locators instead of brittle count/position matching, and several
  well-documented "defect found while fixing isolation" comments that show actual debugging happened, not
  hand-waving.
- INT-002's grant-vs-RLS diagnostic trap is called out consistently across the migration, permissions.md, and
  edge-cases.md — good institutional memory-keeping.

## Actions In Order
1. Fix finding 1: lock down `profiles.auth_user_id` (column-level revoke + narrower access path), and correct
   the permissions.md claim to match reality — this blocks sealing.
2. Fix finding 2: `revoke execute ... from public` on both new `security definer` functions before their
   targeted grants.
3. Add the missing DB-level self-like test (finding 3) alongside the existing `SC-007` pattern.
4. Low-priority cleanup: fix the stale comment (finding 4); consider the query filter (finding 5) later.

## Numbers
- Type coverage: `tsc --noEmit` exit 0 (independently re-run).
- Lint: `eslint` on the full changed surface, exit 0, zero findings (independently re-run).
- Test coverage: 12/12 `study-context.json` acceptance criteria have a corresponding test; 1 documented
  high-severity edge case (BR-002 DB-level bypass) has correct code but no test.
- Unit tests read: `heart-math.test.ts` (10 cases), `viewer-stats.test.ts` (3 cases) — both genuine, no fakes.
- e2e like specs read in full: 668 lines across 4 new files, all exercising real Postgres state via `execSql`.

## Still Unresolved
- Finding 1 (identity leak) and its doc claim need a decision from the team: patch the RLS/grant, or descope
  and rewrite the permissions.md claim to be accurate about the actual exposure — either is acceptable, but
  shipping the current mismatch between claim and code is not.
- Finding 3's missing test is a coverage gap, not a functional bug — the underlying enforcement reads correct
  on manual trace, but "reads correct" is not the same as "proven" for a `high`-severity edge case the project
  itself flagged.
