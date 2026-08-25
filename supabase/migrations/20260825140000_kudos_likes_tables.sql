-- F015_LikeKudos — the "thả tim" ledger + special-day multiplier + author bridge (phase-01).
-- BR-001, BR-002, BR-006, INT-002 (technical-spec.md); permissions.md §1-§3, §6; architecture.md §2-§4.
--
-- INT-002 is the trap this file is built around: `config.toml` never sets
-- `auto_expose_new_tables` (see the commented-out line there), so every new `public` table is
-- unreachable by the Data API roles until explicitly granted — RLS alone is not sufficient.
-- Forgetting a grant makes every insert/select fail with "permission denied for table …",
-- which reads exactly like RLS correctly denying access. Grants below are their own numbered
-- step, each with a comment saying why it exists (or deliberately does not).
--
-- `kudos_likes.kudos_id` is `text`, NOT a foreign key to `kudos.id` (architecture.md §2). The
-- live board at `/kudos` still renders 9 static records from `lib/kudos/kudos-records.ts` with
-- ids like `kudos-1`; a FK to `public.kudos` would force seeding those 9 records into the real
-- table, i.e. doing the deferred board-rewire feature that F014's clarifications explicitly
-- left open. The trade-off (no referential integrity — an orphaned like row is possible if a
-- static id is ever removed) is accepted and recorded in edge-cases.md.

-- DEC-002 bridge: nullable, unique — one auth identity maps to at most one static profile slug,
-- and a slug is claimed by at most one identity. Nullable because most auth users will never
-- correspond to any of the 9 static senders.
alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete set null;

-- BR-003/BR-004: admin-configured date ranges that double a like's grant. Seeded empty in
-- phase 02, so every like grants +1 until a row exists — the +2 path is still fully exercisable
-- by inserting a row directly (no admin screen is in scope; no MoMorph frame covers one).
create table if not exists public.special_days (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null,
  ends_on date not null,
  label text,
  check (ends_on >= starts_on)
);

-- BR-002's only DB-reachable expression of "who sent this kudos". The database has never heard
-- of `kudos-1`; that mapping lives only in `lib/kudos/kudos-records.ts`. This table is the
-- authorship half of that mapping, seeded from the same source in phase 02. Scope is
-- deliberately narrow: id + sender slug only, no title/message/content — this is not the
-- deferred board rewire, and it is meant to be dropped the day that seam closes.
create table if not exists public.kudos_static_authors (
  kudos_id text primary key,
  sender_slug text not null references public.profiles (id)
);

-- BR-001: one like per (kudos, user), held by the database via `unique`, not by an application
-- "does it exist" check — two concurrent inserts for the same pair must not both succeed
-- (permissions.md §3). `is_special` defaults to false here but is always overwritten by the
-- BEFORE INSERT trigger below before the row is ever visible to a policy or a caller.
create table if not exists public.kudos_likes (
  id uuid primary key default gen_random_uuid(),
  kudos_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  is_special boolean not null default false,
  created_at timestamptz not null default now(),
  unique (kudos_id, user_id)
);

-- ALG-001 read side. `exists`, not `count`, so two overlapping `special_days` rows covering the
-- same date still resolve to "special once" rather than doubling the multiplier (edge-cases.md
-- row 6). `security definer` + pinned `search_path` lets this run without granting
-- `special_days` itself to any Data API role — the table stays sealed, reachable only through
-- this function and the trigger below.
create or replace function public.is_special_day(p_on date)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.special_days d
    where p_on between d.starts_on and d.ends_on
  );
$$;

-- BR-002's enforcement point. Bridges kudos_static_authors (slug) to profiles.auth_user_id
-- (uuid) so the insert policy below can reject a caller whose bridged identity authored the
-- kudos being liked. `security definer` + pinned `search_path` keeps kudos_static_authors
-- sealed — nothing but this function (and the policy that calls it) can read it.
create or replace function public.is_static_kudos_author(p_kudos_id text, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.kudos_static_authors a
    join public.profiles p on p.id = a.sender_slug
    where a.kudos_id = p_kudos_id
      and p.auth_user_id = p_user
  );
$$;

-- BR-005 ("frozen"): is_special is stamped once, from the server, at insert time — never
-- accepted from the client and never recomputed later. This trigger overwrites whatever the
-- caller sent; combined with "no UPDATE policy, no UPDATE grant" below, the value can never
-- change after the row exists, so an unlike always revokes exactly what a like granted
-- regardless of whether a special day has since ended (BR-005, edge-cases.md row 5).
create or replace function public.kudos_likes_set_is_special()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_special := public.is_special_day(current_date);
  return new;
end;
$$;

drop trigger if exists kudos_likes_freeze_is_special on public.kudos_likes;

create trigger kudos_likes_freeze_is_special
  before insert on public.kudos_likes
  for each row
  execute function public.kudos_likes_set_is_special();

-- Grants — see the file header for why these are not optional. `anon` gets `select` only, so a
-- signed-out visitor sees real like counts (FR-005); `authenticated` additionally gets insert
-- and delete for like/unlike. Deliberately absent: any grant on `special_days`, any grant on
-- `kudos_static_authors`, and any `update` grant on `kudos_likes` — the last of those is what
-- makes "is_special is frozen" true rather than merely intended (BR-005), since there is no
-- update policy either and no Data API role could reach an UPDATE even if one existed.
grant select on public.kudos_likes to anon, authenticated;
grant insert, delete on public.kudos_likes to authenticated;
grant execute on function public.is_static_kudos_author(text, uuid) to authenticated;

alter table public.special_days enable row level security;
alter table public.kudos_static_authors enable row level security;
alter table public.kudos_likes enable row level security;

-- `special_days` and `kudos_static_authors` are sealed: RLS is on and NO policy exists for any
-- role, so every Data API path is deny-all. They are reachable only through the `security
-- definer` functions above, which run with the migration owner's privileges regardless of the
-- caller's grants.

-- `kudos_likes` select: anon + authenticated both read all rows (`using (true)`) — FR-005 wants
-- real counts for logged-out visitors too, and a like row carries no sensitive content.
create policy kudos_likes_select_all on public.kudos_likes
  for select
  to anon, authenticated
  using (true);

-- `kudos_likes` insert: BR-006 forces `user_id = auth.uid()` — the payload is never trusted.
-- BR-002 is enforced in the same clause via `is_static_kudos_author`, evaluated against the
-- post-trigger row (Postgres runs `WITH CHECK` after BEFORE triggers), so a sender cannot like
-- their own kudos even by calling the insert directly and bypassing the disabled UI button.
create policy kudos_likes_insert_own on public.kudos_likes
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not public.is_static_kudos_author(kudos_id, user_id)
  );

-- `kudos_likes` delete (unlike): a caller may only remove their own like row.
create policy kudos_likes_delete_own on public.kudos_likes
  for delete
  to authenticated
  using (user_id = auth.uid());

-- No UPDATE policy exists on `kudos_likes`, and none is granted above — see BR-005 note by the
-- grants block. This is intentional, not an oversight.
