-- Board rewire (read side) — closes the seam F014 deferred ("clarifications.md decision 1":
-- the board used to read only static lib/kudos/ data). TC ca8f60b3 requires a saved kudos to
-- appear in the Kudos feed, so the board now needs a board-wide read over public.kudos.
--
-- Shape follows this repo's established pattern for sealed data (20260825140000): a
-- `security definer` function with a pinned search_path, instead of new table grants/policies.
-- `kudos_select_own`, the absent `anon` grants on kudos/kudos_hashtags/profiles, and the sealed
-- `profiles.auth_user_id` column all stay exactly as they are — the ONLY new Data-API surface
-- is this function's fixed projection, which never outputs `sender_id` and withholds the
-- sender's profile entirely when `is_anonymous` (the nickname is the card's whole identity).

create or replace function public.list_board_kudos()
returns table (
  id text,
  title text,
  message text,
  is_anonymous boolean,
  nickname text,
  created_at timestamptz,
  sender_slug text,
  sender_name text,
  sender_dept text,
  recipient_id text,
  recipient_name text,
  recipient_dept text,
  hashtags text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    k.id::text,
    k.title,
    k.message,
    k.is_anonymous,
    k.nickname,
    k.created_at,
    case when k.is_anonymous then null else sp.id end,
    case when k.is_anonymous then null else sp.display_name end,
    case when k.is_anonymous then null else sp.department end,
    k.recipient_id,
    rp.display_name,
    rp.department,
    coalesce(
      array_agg(kh.hashtag_id order by kh.hashtag_id) filter (where kh.hashtag_id is not null),
      '{}'
    )
  from public.kudos k
  join public.profiles rp on rp.id = k.recipient_id
  left join public.profiles sp on sp.auth_user_id = k.sender_id
  left join public.kudos_hashtags kh on kh.kudos_id = k.id
  group by k.id, sp.id, sp.display_name, sp.department, rp.display_name, rp.department
  order by k.created_at asc;
$$;

-- BR-002 defense-in-depth for DYNAMIC rows: `is_static_kudos_author` only knows the 9 static
-- ids (kudos_static_authors), so before this file a sender could like their own DB-persisted
-- kudos by calling the insert directly. Mirror shape: security definer over the sealed table,
-- text comparison on the uuid (the like ledger's kudos_id is text and also carries 'kudos-1'
-- style ids that must not choke a uuid cast).
create or replace function public.is_dynamic_kudos_author(p_kudos_id text, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.kudos k
    where k.id::text = p_kudos_id
      and k.sender_id = p_user
  );
$$;

-- `toggleKudosLike` used to gate on "is this id one of the 9 static records?" — a DB-persisted
-- kudos needs the equivalent existence check, and `kudos_select_own` (correctly) hides other
-- senders' rows from a direct select. `kudos_likes.kudos_id` has no FK (by design, see
-- 20260825140000), so skipping this check would let garbage ids accumulate like rows.
create or replace function public.dynamic_kudos_exists(p_kudos_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.kudos k
    where k.id::text = p_kudos_id
  );
$$;

-- Same execute discipline as 20260825140000: Postgres auto-grants EXECUTE to PUBLIC on
-- creation; revoke first, grant back only the intended callers. The board is public (FR-005),
-- so `anon` may list the feed; `authenticated` additionally needs the author/existence checks
-- because the kudos_likes insert policy below and the toggle server action evaluate them under
-- the caller's role.
revoke execute on function public.list_board_kudos() from public;
revoke execute on function public.is_dynamic_kudos_author(text, uuid) from public;
revoke execute on function public.dynamic_kudos_exists(text) from public;
grant execute on function public.list_board_kudos() to anon, authenticated;
grant execute on function public.is_dynamic_kudos_author(text, uuid) to authenticated;
grant execute on function public.dynamic_kudos_exists(text) to authenticated;

-- Recreate the like-insert policy with the dynamic-author check added. BR-006 (own user_id) and
-- the static-author half are unchanged from 20260825140000.
drop policy if exists kudos_likes_insert_own on public.kudos_likes;

create policy kudos_likes_insert_own on public.kudos_likes
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not public.is_static_kudos_author(kudos_id, user_id)
    and not public.is_dynamic_kudos_author(kudos_id, user_id)
  );
