-- E2E fixture user for the login screen's e2e-red-first suite.
-- Local-only credential, valid solely against this throwaway Docker Postgres instance.
-- Idempotent: safe to re-run on every `supabase db reset` / `supabase start`.

set search_path = extensions, public;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'e2e-login@example.com',
  crypt('e2e-local-only-password', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub": "11111111-1111-1111-1111-111111111111", "email": "e2e-login@example.com"}',
  'email',
  now(),
  now(),
  now()
)
on conflict (provider, provider_id) do nothing;

-- F014_SendKudosWishes (phase-02) — hashtag vocabulary seeded verbatim from MoMorph frame
-- `p9zO-c4a4x`. `#High-perorming` is a misspelling already present in the design's own chip
-- row (clarifications.md defect 7) and is kept as-is, not "corrected".
insert into public.hashtags (id) values
  ('#High-perorming'),
  ('#BE PROFESSIONAL'),
  ('#BE OPTIMISTIC'),
  ('#Be A Team'),
  ('#THINK OUTSIDE THE BOX'),
  ('#GET RISKY'),
  ('#GO FAST'),
  ('#WASSHOI')
on conflict (id) do nothing;

-- F014_SendKudosWishes (phase-02) — the 7 real Sunner names already transcribed in
-- lib/kudos/kudos-records.ts (cross-checked against lib/kudos/spotlight-names.ts). Do NOT
-- invent people: no "Thái Anh" profile exists here on purpose (S3) — the e2e specs' query
-- string is corrected to a real name ('Trang') in phase-07, not by adding a profile here.
-- Trailing space in 'Mai phương Thúy ' and the mixed CEVC10/CECV10 department spellings are
-- copied verbatim from the source file; do not "clean up" either.
insert into public.profiles (id, display_name, department) values
  ('nguyen-ba-chuc',    'Nguyễn Bá Chức',    'CEVC10'),
  ('do-hoang-hiep',     'Đỗ hoàng Hiệp',     'CEVC10'),
  ('mai-phuong-thuy',   'Mai phương Thúy ',  'CECV10'),
  ('duong-thuy-an',     'Dương thúy An',     'CEVC10'),
  ('le-kieu-trang',     'Lê Kiều Trang',     'CECV10'),
  ('nguyen-van-quy',    'Nguyễn Văn Quy',    'CEVC10'),
  ('nguyen-hoang-linh', 'Nguyễn Hoàng Linh', 'CECV10')
on conflict (id) do nothing;

-- F015_LikeKudos (phase-02) — DEC-002 identity bridge: points the e2e fixture user's auth.uid()
-- at the static profile slug it must act as for BR-002 ("sender cannot like their own kudos").
-- `nguyen-hoang-linh` is the sender of `kudos-2` (lib/kudos/kudos-records.ts) and is also
-- MOCK_VIEWER_ID — that overlap is convenient for today's mock session, not load-bearing: this
-- bridge is what phase 05's disable rule actually reads. An `update`, not an `insert`, because
-- the profile row already exists above; `auth_user_id` is `unique`, so re-running with the same
-- value is a no-op every time.
update public.profiles
  set auth_user_id = '11111111-1111-1111-1111-111111111111'
  where id = 'nguyen-hoang-linh';

-- F015_LikeKudos (phase-02) — BR-002's author map, transcribed verbatim from each record's
-- `senderId` in lib/kudos/kudos-records.ts. This table is a projection of that TypeScript file,
-- not an independent source of truth: `on conflict … do update` re-synchronises it on every
-- reset, so a future change to a record's sender can't silently leave a stale row behind here.
-- Scope is deliberately narrow (id + sender slug only) — see the migration's own comment for why
-- this is not the deferred board-rewire feature.
insert into public.kudos_static_authors (kudos_id, sender_slug) values
  ('kudos-1', 'nguyen-ba-chuc'),
  ('kudos-2', 'nguyen-hoang-linh'),
  ('kudos-3', 'duong-thuy-an'),
  ('kudos-4', 'nguyen-van-quy'),
  ('kudos-5', 'le-kieu-trang'),
  ('kudos-6', 'mai-phuong-thuy'),
  ('kudos-7', 'do-hoang-hiep'),
  ('kudos-8', 'nguyen-ba-chuc'),
  ('kudos-9', 'duong-thuy-an')
on conflict (kudos_id) do update set sender_slug = excluded.sender_slug;

-- F015_LikeKudos (phase-02) — `special_days` stays seeded empty on purpose (clarifications.md
-- decision 4). Every like grants +1 until an admin-configured row exists; the +2 path is
-- exercised by inserting a row inside its own test (phase 07), never here — a seeded special day
-- would make every other heart-count assertion in the suite off-by-one.
