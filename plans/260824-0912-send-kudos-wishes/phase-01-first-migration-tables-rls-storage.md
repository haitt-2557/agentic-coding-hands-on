# Phase 01 — First migration: tables, RLS, Storage bucket

**Track:** B (behaviour/backend, generic `implementer`, RED-first contract unchanged)
**Owner agent:** `implementer` · **Priority:** P1 · **Status:** pending · **Effort:** 1.5h
**Depends on:** nothing · **Unblocks:** 02, 04, 05

## Context Links

- [plan.md](plan.md) · [dom-contract.md](dom-contract.md) → S1, S4
- [clarifications.md](clarifications.md) decisions 1, 3, 4, 6
- [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) → `## Key Entities`, `## DB Impact per Event`, FR-014, INT-001, INT-002
- [spec/system/architecture.md](spec/system/architecture.md) §1, §3, §4 · [spec/system/permissions.md](spec/system/permissions.md) §2

## Overview

The repo's **first** migration. `supabase/migrations/` does not exist; `supabase/config.toml`
already has `[db.migrations] enabled = true` and `[storage] enabled = true` (no buckets
configured — the `[storage.buckets.images]` block is commented out). Create the five tables,
their RLS policies, and the image bucket, then apply them against local Supabase
(API :54421, DB :54422, Studio :54423).

## Key Insights

- Supabase exposes `public` over the data API (`schemas = ["public", "graphql_public"]`), so
  **every new table needs RLS enabled** or it is world-writable from the browser key.
- `sender_id` must be forced from `auth.uid()` in the policy's `with check`, never trusted
  from the payload (FR-014, SC-009, permissions.md §2). This is the acceptance criterion
  "RLS prevents a client from writing a kudos row attributed to another user".
- Recipients (`profiles`) and senders (`auth.users`) are **different identity spaces**
  (technical-spec `## Assumptions`) — `recipient_id` FKs `profiles`, `sender_id` FKs
  `auth.users`. Do not merge them.
- The min-1/max-5 hashtag rule and the max-5 image rule stay in the **application** layer,
  not DB constraints/triggers (technical-spec `## Assumptions`, YAGNI).
- Nothing in the app renders these images this run, so the bucket is **private**.

## Requirements

**Functional:** FR-013, FR-014 · INT-001, INT-002 · supports BR-004, BR-005 without enforcing them.
**Non-functional:** migration is idempotent-safe to re-apply from scratch via `supabase db reset`; file stays under 200 lines; no secrets committed.

## Architecture

```text
profiles (id text pk, display_name text not null, department text)
hashtags (id text pk)                          -- id IS the hashtag string
kudos    (id uuid pk default gen_random_uuid(),
          sender_id uuid not null references auth.users(id) on delete cascade,
          recipient_id text not null references profiles(id),
          title text not null, message text not null,
          is_anonymous boolean not null default false, nickname text,
          created_at timestamptz not null default now())
kudos_hashtags (kudos_id uuid references kudos(id) on delete cascade,
                hashtag_id text references hashtags(id), primary key (kudos_id, hashtag_id))
kudos_images   (id uuid pk default gen_random_uuid(),
                kudos_id uuid not null references kudos(id) on delete cascade,
                storage_path text not null, original_filename text)
```

**RLS:**

| Table | Policy |
|-------|--------|
| `profiles`, `hashtags` | `select` to `authenticated` (the pickers need them) — no insert/update/delete policy at all |
| `kudos` | `insert` to `authenticated` `with check (sender_id = auth.uid())`; `select` to `authenticated` `using (sender_id = auth.uid())` (own rows only — the page reads back only its own write; the board does not read this table) |
| `kudos_hashtags`, `kudos_images` | `insert`/`select` to `authenticated` gated on the parent row: `exists (select 1 from kudos k where k.id = kudos_id and k.sender_id = auth.uid())` |

**Storage:** bucket `kudos-images`, `public = false`, `allowed_mime_types = ['image/jpeg','image/png']`, `file_size_limit` 5 MiB. Policies on `storage.objects`: `insert` and `select` to `authenticated` where `bucket_id = 'kudos-images'` and the first path segment equals `auth.uid()::text` (so uploads land under `{uid}/…` and no one reads another sender's folder).

## Related Code Files

**Create (owned exclusively by this phase):**
- `supabase/migrations/<timestamp>_kudos_send_tables.sql` — tables + RLS
- `supabase/migrations/<timestamp>_kudos_images_bucket.sql` — bucket + storage policies

**Read for context:** `supabase/config.toml`, `supabase/seed.sql`, `lib/kudos/kudos-records.ts`
**Do not touch:** `supabase/seed.sql` (phase-02), `supabase/config.toml`, anything under `lib/`, `app/`, `components/`, `e2e/`.

## Implementation Steps

1. Confirm local Supabase is up: `npx supabase status` (expect API 54421, DB 54422).
2. `npx supabase migration new kudos_send_tables` — let the CLI mint the timestamp; do not hand-name files.
3. Write the DDL exactly as in Architecture above. `create table if not exists`; `alter table … enable row level security` on all five.
4. Write each policy with an explicit name and role (`to authenticated`). Use `with check` for insert, `using` for select. No `for all`.
5. `npx supabase migration new kudos_images_bucket`; insert the bucket via
   `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values (…) on conflict (id) do nothing;` then the two `storage.objects` policies.
6. Apply: `npx supabase db reset` (re-runs `seed.sql` too — confirm the login fixture user still exists afterwards).
7. Verify with `psql` against :54422 — see Success Criteria for the exact checks.

## Todo List

- [x] Local Supabase confirmed running
- [x] `kudos_send_tables` migration written (5 tables, FKs, defaults)
- [x] RLS enabled on all 5 tables; every policy named and role-scoped
- [x] `kudos.insert` policy proven to force `sender_id = auth.uid()`
- [x] `kudos_images_bucket` migration written (private bucket + 2 object policies)
- [x] `supabase db reset` applies both migrations cleanly
- [x] Login e2e fixture user survives the reset
- [x] Both SQL files under 200 lines

## Success Criteria

- `\dt public.*` in psql lists exactly `profiles`, `hashtags`, `kudos`, `kudos_hashtags`, `kudos_images`.
- `select relname, relrowsecurity from pg_class where relname in (…)` → `relrowsecurity = true` for all five.
- `select id, public, allowed_mime_types from storage.buckets where id = 'kudos-images'` → one row, `public = false`, jpeg+png only.
- An `insert into kudos` naming a `sender_id` other than the caller's `auth.uid()` is **rejected** — this is SC-009's second half and FR-014. Prove it, do not assume it.
- `npx supabase db reset` runs clean twice in a row.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| RLS forgotten on a join table → world-writable via the browser key | Med × **High** | Success Criteria asserts `relrowsecurity` on all five, not just `kudos` |
| Policy lets a forged `sender_id` through (e.g. `using` instead of `with check`) | Med × **High** | Explicitly test the forged insert in psql before closing the phase |
| `db reset` wipes the login fixture and breaks every authenticated suite | Low × High | Seed is re-run by `[db.seed]`; verify the fixture user after reset (todo item) |
| Bucket path convention diverges from what phase-05 uploads | Med × Med | Path shape `{auth.uid()}/{kudos_id}/{filename}` is fixed here and cited by phase-05 |
| Hand-named migration file sorts wrongly against later migrations | Low × Med | Always `supabase migration new` |

## Security Considerations

- `sender_id` is derived server-side from `auth.uid()`; the client never supplies it (permissions.md §2, clarifications decision 3).
- `kudos` select is owner-only — no accidental public read of a table that may hold anonymous senders' real identity. Note `is_anonymous`/`nickname` hide the sender in the *UI*, never in the row: `sender_id` is always stored.
- Private bucket with a per-uid path prefix; no public URLs minted.
- No credentials in the migration files.

## Next Steps

Unblocks phase-02 (seed), phase-04 (queries), phase-05 (insert + upload). Report the exact
bucket id and path convention in the completion message — phase-05 depends on both.
</content>
