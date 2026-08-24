-- F014_SendKudosWishes — the repo's FIRST application tables + RLS (phase-01).
-- FR-013, FR-014, INT-001, INT-002 (technical-spec.md); permissions.md §2.
--
-- `sender_id` is FORCED from `auth.uid()` by the `kudos` insert policy's `with check` clause,
-- never trusted from the client payload — this is the acceptance criterion "RLS prevents a
-- client from writing a kudos row attributed to another user" (FR-014, SC-009).
--
-- `recipient_id` FKs `profiles` (a seeded reference table, phase-02); `sender_id` FKs
-- `auth.users` (Supabase-managed identity). These are two different identity spaces
-- (technical-spec.md `## Assumptions`) — do not merge them.
--
-- The min-1/max-5 hashtag rule and the max-5 image rule are enforced in the application layer
-- (lib/kudos/send/validation.ts), not as DB constraints/triggers (YAGNI, technical-spec.md
-- `## Assumptions`).

create table if not exists public.profiles (
  id text primary key,
  display_name text not null,
  department text
);

create table if not exists public.hashtags (
  id text primary key
);

create table if not exists public.kudos (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id text not null references public.profiles (id),
  title text not null,
  message text not null,
  is_anonymous boolean not null default false,
  nickname text,
  created_at timestamptz not null default now()
);

create table if not exists public.kudos_hashtags (
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  hashtag_id text not null references public.hashtags (id),
  primary key (kudos_id, hashtag_id)
);

create table if not exists public.kudos_images (
  id uuid primary key default gen_random_uuid(),
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  storage_path text not null,
  original_filename text
);

-- `config.toml`'s `auto_expose_new_tables` is unset (the deprecated legacy default is off),
-- so a new `public` table is NOT reachable by the Data API roles until explicitly granted —
-- RLS alone is not sufficient here; without this grant every insert/select from
-- `authenticated` fails with "permission denied for table …" regardless of policy, which
-- would be indistinguishable from "RLS is working" if left untested (verified by hand: see
-- phase-01's completion report). `anon` receives nothing — this route requires a real session.
grant select on public.profiles, public.hashtags to authenticated;
grant select, insert on public.kudos, public.kudos_hashtags, public.kudos_images to authenticated;

alter table public.profiles enable row level security;
alter table public.hashtags enable row level security;
alter table public.kudos enable row level security;
alter table public.kudos_hashtags enable row level security;
alter table public.kudos_images enable row level security;

-- Reference tables: the recipient/hashtag pickers only need to read them. No insert/update/
-- delete policy exists for either — writes stay confined to `supabase/seed.sql`.
create policy profiles_select_authenticated on public.profiles
  for select to authenticated
  using (true);

create policy hashtags_select_authenticated on public.hashtags
  for select to authenticated
  using (true);

-- `kudos`: a caller can only insert a row attributed to themselves (FR-014's primary control;
-- Storage's uid-prefixed path is a second, independent control) and can only read back their
-- own rows — the board (`/kudos`) reads static `lib/kudos/` data and never queries this table
-- (clarifications.md decision 1), so a public/board-wide select policy would be unused surface.
create policy kudos_insert_own on public.kudos
  for insert to authenticated
  with check (sender_id = auth.uid());

create policy kudos_select_own on public.kudos
  for select to authenticated
  using (sender_id = auth.uid());

-- Join tables: gated on the parent `kudos` row already belonging to the caller. No standalone
-- ownership column exists on either table, so every policy re-checks the parent.
create policy kudos_hashtags_insert_own on public.kudos_hashtags
  for insert to authenticated
  with check (
    exists (
      select 1 from public.kudos k
      where k.id = kudos_hashtags.kudos_id and k.sender_id = auth.uid()
    )
  );

create policy kudos_hashtags_select_own on public.kudos_hashtags
  for select to authenticated
  using (
    exists (
      select 1 from public.kudos k
      where k.id = kudos_hashtags.kudos_id and k.sender_id = auth.uid()
    )
  );

create policy kudos_images_insert_own on public.kudos_images
  for insert to authenticated
  with check (
    exists (
      select 1 from public.kudos k
      where k.id = kudos_images.kudos_id and k.sender_id = auth.uid()
    )
  );

create policy kudos_images_select_own on public.kudos_images
  for select to authenticated
  using (
    exists (
      select 1 from public.kudos k
      where k.id = kudos_images.kudos_id and k.sender_id = auth.uid()
    )
  );
