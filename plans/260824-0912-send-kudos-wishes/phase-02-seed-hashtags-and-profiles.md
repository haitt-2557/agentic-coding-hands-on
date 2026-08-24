# Phase 02 — Seed hashtags and profiles

**Track:** B · **Owner agent:** `implementer` · **Priority:** P1 · **Status:** pending · **Effort:** 0.5h
**Depends on:** 01 · **Unblocks:** 07 (the tester needs the real seeded names)

## Context Links

- [dom-contract.md](dom-contract.md) → **S1, S2, S3, S4**, D3
- [clarifications.md](clarifications.md) decision 6, design defect 7
- [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) → `## Key Entities`, FR-002, FR-007
- [spec/system/architecture.md](spec/system/architecture.md) §3

## Overview

Add the vocabulary the two pickers read: 8 hashtags and 7 profiles. `supabase/seed.sql` today
seeds only the login e2e fixture (63 lines, fully idempotent via `on conflict … do nothing`)
and is re-run on every `supabase db reset`, so additions must be idempotent too.

## Key Insights

- **`#High-perorming` is misspelled in the design and is seeded verbatim** (clarifications
  defect 7). Do not "fix" it — the frame's chip row carries the same misspelling.
- Profiles come from the names **already transcribed** in `lib/kudos/kudos-records.ts`. Do not
  invent people. `'Mai phương Thúy '` has a trailing space and the capitalization is
  inconsistent across names — both are load-bearing per that file's own comments (S2).
- `lib/kudos/filters.ts` holds only 2 hashtags (`#Dedicated`, `#Inspring`) — it is **not** the
  source for this table. D3 needs at least 6 selectable rows.
- No Sunner named "Thái Anh" exists (S3). Five spec sites type it; that is phase-07's problem
  to fix in the tests, **not** a licence to invent a profile here.

## Requirements

**Functional:** FR-002 (recipient source), FR-007 (8 fixed hashtags).
**Non-functional:** idempotent; re-runnable; the login fixture keeps working; file stays readable.

## Architecture

Append two blocks to `supabase/seed.sql`, below the existing auth fixture:

```sql
insert into public.hashtags (id) values
  ('#High-perorming'), ('#BE PROFESSIONAL'), ('#BE OPTIMISTIC'), ('#Be A Team'),
  ('#THINK OUTSIDE THE BOX'), ('#GET RISKY'), ('#GO FAST'), ('#WASSHOI')
on conflict (id) do nothing;

insert into public.profiles (id, display_name, department) values
  ('nguyen-ba-chuc',    'Nguyễn Bá Chức',   'CEVC10'),
  ('do-hoang-hiep',     'Đỗ hoàng Hiệp',    'CEVC10'),
  ('mai-phuong-thuy',   'Mai phương Thúy ', 'CECV10'),
  ('duong-thuy-an',     'Dương thúy An',    'CEVC10'),
  ('le-kieu-trang',     'Lê Kiều Trang',    'CECV10'),
  ('nguyen-van-quy',    'Nguyễn Văn Quy',   'CEVC10'),
  ('nguyen-hoang-linh', 'Nguyễn Hoàng Linh','CECV10')
on conflict (id) do nothing;
```

Departments: take each name's real value from `lib/kudos/kudos-records.ts` — both `CEVC10`
and `CECV10` spellings exist there intentionally; copy per record, do not normalise.

## Related Code Files

**Modify (owned exclusively by this phase):** `supabase/seed.sql`
**Read for context:** `lib/kudos/kudos-records.ts` (names, slugs, departments), `lib/kudos/spotlight-names.ts` (same 7 names, cross-check)
**Do not touch:** `supabase/migrations/**` (phase-01), `lib/kudos/**` (read-only here), `e2e/**`.

## Implementation Steps

1. Read `lib/kudos/kudos-records.ts` and transcribe the 7 `senderId`/`senderName`/`senderDept`
   and `receiverId`/… pairs. Deduplicate by slug; there are exactly 7 distinct people.
2. Append the two insert blocks under a comment naming their source (frame `p9zO-c4a4x` for
   hashtags, `lib/kudos/kudos-records.ts` for profiles) and stating the misspelling is deliberate.
3. Keep `on conflict … do nothing` on both.
4. `npx supabase db reset`, then re-run it a second time to prove idempotency.
5. Verify counts and exact strings in psql.

## Todo List

- [x] 7 distinct profiles transcribed verbatim (trailing space + capitalization intact)
- [x] 8 hashtags inserted, `#High-perorming` misspelling preserved
- [x] Comment records the source frame/file and the deliberate misspelling
- [x] `on conflict do nothing` on both blocks
- [x] `supabase db reset` clean twice
- [x] Login fixture user (`e2e-login@example.com`) still present after reset

## Success Criteria

- `select count(*) from hashtags` → **8**; `select id from hashtags where id like '%perorming%'` → 1 row (misspelling intact).
- `select count(*) from profiles` → **7**; `select display_name from profiles where id = 'mai-phuong-thuy'` → `'Mai phương Thúy '` **with** the trailing space.
- `select count(*) from auth.users where email = 'e2e-login@example.com'` → 1 after two consecutive resets.
- Running `seed.sql` twice produces no error and no duplicate rows.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Someone "corrects" `#High-perorming` | **High** × Med | Inline comment marks it deliberate; success criterion asserts the misspelling |
| Trailing space in `'Mai phương Thúy '` trimmed by an editor or formatter | Med × Med | Success criterion asserts the exact string from psql, not by eye |
| Non-idempotent addition breaks the login e2e fixture on the next reset | Low × **High** | Two consecutive resets are a todo item and a success criterion (S4) |
| A profile is invented to satisfy the specs' `'Thái Anh'` | Med × **High** | S3 forbids it; the fix belongs to phase-07 (C3) |

## Security Considerations

Public-ish reference data only — no PII beyond display names already committed to the repo in
`lib/kudos/`. No credentials. `profiles`/`hashtags` are select-only for `authenticated`
(phase-01); nothing here grants write access.

## Next Steps

Report the seeded `display_name` list verbatim in the completion message — phase-07 needs it to
choose the replacement query string for C3 (recommended: `'Trang'`).
</content>
