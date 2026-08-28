-- BR-002 UI parity for DB-persisted kudos (TC 63645b03: "The Like (heart) button is disabled
-- for the sender"). The board's disable rule compares profile slugs, but a DB row's ownership
-- lives in the auth-uid space: an anonymous or unbridged sender maps to a 'db:'-prefixed
-- synthetic id (board-feed-mapper.ts), so the sender of their own freshly posted kudos saw an
-- ENABLED heart that the RLS policy then rejected. The projection now carries `is_own`,
-- computed per-caller from the request's JWT — each caller learns only whether THEY authored
-- the row; `sender_id` itself still never leaves this function, and an anonymous sender's
-- profile stays withheld exactly as before.
--
-- `create or replace` cannot change a function's return columns, so drop-and-recreate; the
-- revoke/grant discipline from 20260828154500 is restated because DROP discards it.

drop function if exists public.list_board_kudos();

create function public.list_board_kudos()
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
  hashtags text[],
  is_own boolean
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
    ),
    -- `auth.uid()` is null for `anon` callers; coalesce keeps the column a real boolean.
    coalesce(k.sender_id = auth.uid(), false)
  from public.kudos k
  join public.profiles rp on rp.id = k.recipient_id
  left join public.profiles sp on sp.auth_user_id = k.sender_id
  left join public.kudos_hashtags kh on kh.kudos_id = k.id
  group by k.id, sp.id, sp.display_name, sp.department, rp.display_name, rp.department
  order by k.created_at asc;
$$;

revoke execute on function public.list_board_kudos() from public;
grant execute on function public.list_board_kudos() to anon, authenticated;
