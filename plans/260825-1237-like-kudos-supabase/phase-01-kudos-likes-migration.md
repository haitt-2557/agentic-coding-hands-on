# Phase 01 — Migration: kudos_likes, special_days, author map, RLS, grants

## Context Links

- [technical-spec.md](spec/like-kudos/technical-spec.md) — BR-001, BR-002, BR-006, INT-002, SC-002, SC-007, Key Entities
- [permissions.md](spec/system/permissions.md) — §1 two-layer enforcement, §2 forced `user_id`, §3 constraint-not-check, §6 grants are mandatory
- [architecture.md](spec/system/architecture.md) — §2 `text` key, §3 aggregate ledger, §4 frozen `is_special`
- [edge-cases.md](spec/like-kudos/edge-cases.md) — rows 1, 2, 3, 4, 6
- Pattern to follow: `supabase/migrations/20260824031123_kudos_send_tables.sql`

## Overview

**Priority:** P1 · **Status:** done · **Effort:** ~1.5h
The whole feature's real boundary. Creates the like table with its uniqueness constraint, the special-day config table, the small authorship map BR-002 needs, the RLS policies, and — the thing that silently breaks everything if forgotten — the explicit grants.

## Key Insights

- **INT-002 is the trap.** `config.toml` never sets `auto_expose_new_tables`, so a new table is unreachable by the Data API roles until granted. A missing grant produces `permission denied for table kudos_likes`, which reads exactly like RLS working correctly. F014's migration header already documents this; repeat it here.
- **BR-002 has no natural DB expression.** The database has never heard of `kudos-1`; the sender slug lives in `lib/kudos/kudos-records.ts`. Without a mapping the DB layer of BR-002 cannot exist and edge-case row 3 (high) stays unguarded. Hence `kudos_static_authors` — 9 rows, `(kudos_id → sender_slug)`, seeded from the same file `profiles` was seeded from (phase 02). It is *not* the deferred board rewire: no message, no title, no content, and it is deleted the day the seam closes.
- **`is_special` belongs to a trigger, not to the client and not to the app.** A `BEFORE INSERT` trigger overwrites whatever arrives, so forgery is impossible and the value is frozen with one round trip. Postgres evaluates RLS `WITH CHECK` on the post-trigger row, so the two cooperate.
- **No `UPDATE` policy and no `UPDATE` grant** on `kudos_likes` — that is what makes "frozen" true rather than merely intended (BR-005).
- Two `security definer` helper functions keep `special_days` and `kudos_static_authors` completely ungranted: nothing but the policies and the trigger can read them.

## Requirements

- **BR-001** — `unique (kudos_id, user_id)`, held by the database, not by an application "does it exist" check (permissions §3: two concurrent requests both see "no" and both write).
- **BR-002** — insert policy rejects a caller whose bridged slug authored the kudos.
- **BR-006** — `with check (user_id = auth.uid())`; the payload is never trusted.
- **BR-003 / BR-004** — `special_days` date-range table, seeded empty in phase 02.
- **DEC-002** — `profiles.auth_user_id uuid` nullable, unique.
- **INT-002** — explicit grants; `anon` gets `select` on `kudos_likes` only (FR-005 wants real counts for logged-out visitors).
- Non-functional: migration re-runnable on `supabase db reset`; `if not exists` throughout; no data loss for F014's tables.

## Architecture

```
kudos_likes (id, kudos_id text, user_id uuid, is_special bool, created_at)
   unique (kudos_id, user_id)                       -- BR-001
   BEFORE INSERT trigger -> is_special := is_special_day(current_date)   -- ALG-001, BR-005
   RLS select : anon + authenticated, using (true)  -- FR-005 real counts when logged out
   RLS insert : authenticated, user_id = auth.uid() AND NOT is_static_kudos_author(...)
   RLS delete : authenticated, user_id = auth.uid()
   (no update policy, no update grant -> is_special can never change)

special_days (starts_on, ends_on)      -- RLS on, ZERO policies, ZERO grants = sealed
kudos_static_authors (kudos_id pk, sender_slug -> profiles.id)  -- same, sealed
profiles.auth_user_id uuid unique null -- the DEC-002 bridge

is_special_day(date) / is_static_kudos_author(text, uuid)  -- stable, security definer
```

Data flow at insert: client → server action → `insert {kudos_id, user_id: auth.uid()}` → BEFORE trigger stamps `is_special` → RLS `WITH CHECK` sees the finished row → row lands or is rejected.

## Related Code Files

**Create:** `supabase/migrations/20260825140000_kudos_likes_tables.sql`
**Modify:** none — `profiles` is altered from inside the new migration, never by editing F014's file.
**Delete:** none

## Implementation Steps

1. New migration file, named after the F014 precedent. Open with a header comment stating the INT-002 grant trap and why `kudos_id` is `text` (architecture §2), citing BR-001/BR-002/BR-006.
2. `alter table public.profiles add column if not exists auth_user_id uuid unique references auth.users (id) on delete set null;`
3. `create table if not exists public.special_days (id uuid pk default gen_random_uuid(), starts_on date not null, ends_on date not null, label text, check (ends_on >= starts_on));`
4. `create table if not exists public.kudos_static_authors (kudos_id text primary key, sender_slug text not null references public.profiles (id));`
5. `create table if not exists public.kudos_likes (id uuid pk default gen_random_uuid(), kudos_id text not null, user_id uuid not null references auth.users (id) on delete cascade, is_special boolean not null default false, created_at timestamptz not null default now(), unique (kudos_id, user_id));`
6. `create or replace function public.is_special_day(p_on date) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.special_days d where p_on between d.starts_on and d.ends_on); $$;` — `exists`, not `count`, so two overlapping rows still mean "special once" (edge-case row 6).
7. `create or replace function public.is_static_kudos_author(p_kudos_id text, p_user uuid) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.kudos_static_authors a join public.profiles p on p.id = a.sender_slug where a.kudos_id = p_kudos_id and p.auth_user_id = p_user); $$;`
8. Trigger function `public.kudos_likes_set_is_special()` (plpgsql, security definer, `set search_path = public`) assigning `new.is_special := public.is_special_day(current_date); return new;`, plus `create trigger kudos_likes_freeze_is_special before insert on public.kudos_likes for each row execute function public.kudos_likes_set_is_special();` (guard with a `drop trigger if exists` first so the migration stays re-runnable).
9. Grants — with the F014-style comment explaining why they are not optional:
   `grant select on public.kudos_likes to anon, authenticated;`
   `grant insert, delete on public.kudos_likes to authenticated;`
   `grant execute on function public.is_static_kudos_author(text, uuid) to authenticated;`
   Deliberately absent: any grant on `special_days`, on `kudos_static_authors`, and any `update` on `kudos_likes`.
10. `alter table ... enable row level security` on all three new tables.
11. The three `kudos_likes` policies exactly as in Architecture above. `special_days` and `kudos_static_authors` get RLS enabled and **no** policies — deny-all for every Data API role, reachable only through the definer functions.
12. Verify by hand: `supabase db reset`, then from `psql` confirm the table exists, the unique constraint bites on a duplicate pair, and `select` as `anon` returns rows.

## Todo List

- [x] Migration file created with the INT-002 header comment
- [x] `profiles.auth_user_id` added (nullable, unique)
- [x] `special_days` + range check
- [x] `kudos_static_authors`
- [x] `kudos_likes` + `unique (kudos_id, user_id)`
- [x] `is_special_day` and `is_static_kudos_author` definer functions
- [x] `BEFORE INSERT` trigger freezing `is_special`
- [x] Grants (incl. `anon` select) + explicit non-grants documented
- [x] RLS enabled on all three; three policies on `kudos_likes`; none on the two sealed tables
- [x] `supabase db reset` runs clean

## Success Criteria

- **SC-002** — a second insert for the same `(kudos_id, user_id)` is rejected by the database (verified in phase 07).
- **SC-007** — an insert carrying another user's `user_id` is rejected by RLS (phase 07).
- Edge-case row 3 — an insert by the kudos' own author is rejected by the database, not only by the UI.
- Edge-case row 4 — a `select` from `anon` succeeds, proving the grant exists rather than merely the policy.
- `supabase db reset` completes with no error and F014's tables and data survive.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Grant forgotten → everything fails looking like correct RLS | Med × High | Grants are their own numbered step with a comment; phase 07 asserts the `anon` read path explicitly |
| `kudos_static_authors` read as "the deferred board rewire" | Med × Med | Header comment states the scope: authorship only, no content, deleted when the seam closes |
| Policy references a table the caller cannot read → false denial | Med × High | The author check goes through a `security definer` function; the table itself is never granted |
| Definer function without `set search_path` → search-path hijack | Low × High | Every definer function pins `set search_path = public` |
| `unique` violation surfaces as a raw 500 to the user | Med × Low | Phase 03 catches `23505` and treats it as "already liked" |

## Security Considerations

- `user_id = auth.uid()` in `with check` is BR-006's only real control; the server action is convenience on top of it.
- `special_days` is deny-all through the API. Whoever can insert there can double every heart; that is a direct-DB privilege today and **must** be gated the day an admin screen exists (permissions §7).
- `profiles.auth_user_id` becomes readable by any authenticated user through the existing `using (true)` select policy — the uuid↔slug mapping is exposed. Accepted: it is not a credential and the app has no per-profile secrets. Recorded here rather than silently allowed.
- The bridge column answers exactly one question (BR-002). It grants no admin, gates no route, opens nobody's data (permissions §5).

## Next Steps

Unblocks phase 02 (seed) and phase 03 (data layer), which may then run in parallel.
