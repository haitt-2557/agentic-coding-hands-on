# Phase 02 — Seed: identity bridge + static author map

## Context Links

- [clarifications.md](clarifications.md) — decision 2 (the `auth_user_id` bridge), decision 4 (`special_days` seeded empty)
- [technical-spec.md](spec/like-kudos/technical-spec.md) — DEC-002, DB Impact table row 3
- [red-evidence.json](evidence/red-evidence.json) — SC-003 fails today precisely because this bridge does not exist
- Source of truth for the rows: `lib/kudos/kudos-records.ts` (`senderId` per record); existing precedent: `supabase/seed.sql` lines 79-93

## Overview

**Priority:** P1 · **Status:** done · **Effort:** ~0.5h
Two idempotent seed blocks. One points the e2e fixture user at a profile slug; the other tells the database who wrote each of the nine static kudos. Small, but SC-003 is unreachable without it.

## Key Insights

- The fixture user is `11111111-1111-1111-1111-111111111111` (already seeded). It must bridge to **`nguyen-hoang-linh`** — the slug that authors `kudos-2` — otherwise SC-003 has nothing disabled to find, and the RED spec's own comment says so.
- `nguyen-hoang-linh` is also `MOCK_VIEWER_ID`. That overlap is convenient, not load-bearing: after phase 05 the disable rule reads the real bridge, and the mock session no longer decides anything.
- Idempotency has a sharper meaning here than "on conflict do nothing". The author map is a **projection of a TypeScript file**; if a record's sender changes, `do nothing` would leave the database quietly lying. Use `do update` so a reset re-synchronises.
- `special_days` stays empty on purpose (clarifications decision 4). Every like is +1 until someone inserts a row by hand. Write the comment saying so — an empty table with no explanation invites a future contributor to "fix" it.

## Requirements

- **DEC-002** — `profiles.auth_user_id` resolves `auth.uid()` → slug; unmatched viewers stay likeable-everywhere by design.
- **BR-002 (DB half)** — `kudos_static_authors` holds all nine `(kudos_id, sender_slug)` pairs so `is_static_kudos_author` can answer.
- Non-functional: every statement survives repeated `supabase db reset` and repeated `supabase start`.

## Architecture

```
auth.users(1111…1111)  --auth_user_id-->  profiles('nguyen-hoang-linh')
                                                 ^
kudos_static_authors('kudos-2' -> 'nguyen-hoang-linh') ---------┘
        ↑ read only by is_static_kudos_author() (security definer)
```

The nine pairs, transcribed verbatim from `KUDOS_RECORDS`: `kudos-1→nguyen-ba-chuc`, `kudos-2→nguyen-hoang-linh`, `kudos-3→duong-thuy-an`, `kudos-4→nguyen-van-quy`, `kudos-5→le-kieu-trang`, `kudos-6→mai-phuong-thuy`, `kudos-7→do-hoang-hiep`, `kudos-8→nguyen-ba-chuc`, `kudos-9→duong-thuy-an`.

## Related Code Files

**Modify:** `supabase/seed.sql` (append only — do not touch the existing auth/hashtag/profile blocks)
**Create:** none · **Delete:** none

## Implementation Steps

1. Append a commented block headed with this feature and clarifications decision 2.
2. `update public.profiles set auth_user_id = '11111111-1111-1111-1111-111111111111' where id = 'nguyen-hoang-linh';` — an `update` is inherently idempotent; the `unique` constraint on the column tolerates re-running with the same value.
3. Append the author map:
   `insert into public.kudos_static_authors (kudos_id, sender_slug) values (…nine rows…) on conflict (kudos_id) do update set sender_slug = excluded.sender_slug;`
4. Add the comment explaining that these rows mirror `lib/kudos/kudos-records.ts` and exist **only** so RLS can enforce BR-002 — they are not the deferred board rewire.
5. Add a comment for `special_days`: seeded empty on purpose; the +2 path is exercised by inserting a row inside a test (phase 07), never by seeding one here — a seeded special day would make every other heart assertion off-by-one.
6. Run `supabase db reset` twice in a row and confirm both runs are clean and the row counts are identical.

## Todo List

- [x] Bridge `update` appended, with decision-2 comment
- [x] Nine author rows appended with `on conflict … do update`
- [x] `special_days` "empty on purpose" comment present
- [x] `supabase db reset` run twice, byte-identical result
- [x] Existing login and send-kudos e2e fixtures still work off this seed

## Success Criteria

- `select auth_user_id from profiles where id = 'nguyen-hoang-linh'` returns the fixture uuid.
- `select count(*) from kudos_static_authors` returns 9, and every `sender_slug` resolves in `profiles`.
- `select public.is_static_kudos_author('kudos-2', '1111…1111')` returns `true`; the same call for `kudos-1` returns `false`.
- A second `supabase db reset` changes nothing (idempotency).

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Bridge points at the wrong slug → SC-003 unprovable | Med × High | The slug is pinned to `kudos-2`'s author and asserted directly in phase 07 |
| Author map drifts from `kudos-records.ts` | Med × Med | `do update` re-synchronises on every reset; phase 07 asserts count = 9 |
| A seeded `special_days` row leaks into unrelated tests | Low × High | Table is left empty; the +2 path is set up and torn down inside its own test |
| Seed additions break the login / send-kudos fixtures | Low × High | Append-only, no edits above; both suites re-run in phase 08 |

## Security Considerations

- The seed carries a local-only fixture credential that already exists; nothing new is introduced.
- The bridge is deliberately one-to-one and nullable. Any other authenticated user resolves to `null` and is treated as "matches no sender" (DEC-002), which is permissive by design at this scale and is flagged in permissions §7.

## Next Steps

Unblocks phase 04 (the page can now resolve a real viewer slug) and phase 07 (tests can rely on the bridge). Runs in parallel with phase 03.
