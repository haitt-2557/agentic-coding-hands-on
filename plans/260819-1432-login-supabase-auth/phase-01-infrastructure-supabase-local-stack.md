---
phase: 1
title: "Infrastructure — Supabase local stack, deps, seed"
owner: implementer
status: completed
priority: P1
effort: 3.5h
test_policy: e2e-red-first
depends_on: []
blocks: [2, 3, 4, 5, 6]
---

# Phase 1 — Infrastructure: Supabase local stack (prerequisite to the RED gate)

## MoMorph refs

- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- Research (authoritative, follow literally): [`research/researcher-01-supabase-local-google-oauth.md`](research/researcher-01-supabase-local-google-oauth.md) §1, §2, §6
- Decisions: [`clarifications.md`](clarifications.md) — Session decision 1, Unresolved Questions 1 & 2
- Spec: [`spec/login/technical-spec.md`](spec/login/technical-spec.md) § Assumptions
- Existing env doc: `.env.example`; existing ignore rules: `.gitignore`

## Overview

**Priority:** P1 · **Status:** pending

This is infrastructure, **not the screen**. It makes `@supabase/ssr` importable and a real local
Supabase project reachable, so Phase 2's RED can fail on a screen assertion rather than on a missing
module or a refused connection. No `app/`, `components/` or `lib/` file is touched here.

## Key Insights

- **Docker/colima 29.2.0 is already running and supabase CLI 2.115.0 is already installed** — verified
  in this environment. Do not re-install either; `brew install supabase/tap/supabase` is a no-op here.
- **The mail catcher config block is `[local_smtp]`, not `[inbucket]`** in CLI 2.115.0. Grepping for
  `inbucket` and concluding the config is broken is a wasted cycle.
- **Standardize on `http://localhost:3000`, not the CLI default `127.0.0.1:3000`.**
  `additional_redirect_urls` matches by exact string; mixing the two hosts is the number-one cause of
  "redirect URL not allowed" locally.
- **The real Google credentials do not exist yet** (`clarifications.md` UQ1). The stack must still come
  up. `signInWithOAuth` builds the authorize URL client-side and assigns `window.location` — it makes
  no network call to Supabase — so placeholder credentials block nothing the E2E asserts. They block
  only a manual real-account round trip.
- The CLI reads `env(...)` from a `.env` at repo root. `.gitignore` already ignores `.env*` except
  `.env.example`, so that file is safe by default — confirm, do not re-add.

## Requirements

**Functional**
- `npm ls @supabase/supabase-js @supabase/ssr` resolves `2.112.3` and `0.12.4` exactly.
- `supabase/config.toml` enables the Google provider from env, with `skip_nonce_check = true`.
- `supabase start` exits 0; the emitted API URL and client key are recorded verbatim.
- `supabase/seed.sql` creates one confirmed email/password user that `signInWithPassword` accepts.
- `.env.example` documents every new variable; no real secret is committed.

**Non-functional**
- Placeholder-credential handling is **proven by command output pasted into evidence**, not asserted.
- Every file stays under 200 lines.

## Architecture

```
supabase/config.toml ──env(...)──> .env (git-ignored, root)
        │                             SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID / _SECRET
        ▼
  supabase start  ──> docker containers (Postgres :54322, GoTrue/API :54321, Studio :54323)
        │                    │
        │                    └── seed.sql ──> auth.users + auth.identities (E2E fixture user)
        ▼
  emitted API URL + client key ──> .env.local ──> NEXT_PUBLIC_SUPABASE_URL
                                                  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

**Data flow out of this phase:** two env names (frozen in `plan.md`), one reachable API origin, one
seeded credential pair. Phases 2 and 4 consume only those names — never the key flavour behind them.

## Related Code Files

**Create:** `supabase/config.toml`, `supabase/seed.sql`, `supabase/.gitignore` (CLI-generated), `.env`
(local only, never committed), `.env.local` (local only), `evidence/phase-01-infrastructure.md`
**Modify:** `package.json`, `package-lock.json`, `.env.example`, `.gitignore` (only if `supabase/`
artefacts are not already covered)
**Delete:** none

## Implementation Steps

1. `git checkout -b feat/login-supabase-auth` from `main`.
2. `npm install @supabase/supabase-js@2.112.3 @supabase/ssr@0.12.4` (runtime deps, not dev).
3. `npx supabase init` at repo root. Keep the generated file; edit, do not rewrite from a tutorial.
4. Edit `supabase/config.toml`:
   - `[auth] site_url = "http://localhost:3000"`,
     `additional_redirect_urls = ["http://localhost:3000/**"]`
   - append:
     ```toml
     [auth.external.google]
     enabled = true
     client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
     secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
     redirect_uri = ""
     skip_nonce_check = true
     ```
   - confirm `[db.seed]` is enabled with `sql_paths = ["./seed.sql"]` (CLI default).
5. Create root `.env` with **placeholders shaped like the real thing** (Google's format, not the word
   "placeholder" alone — some validators reject an empty-looking value):
   ```
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=000000000000-localdevplaceholder.apps.googleusercontent.com
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=GOCSPX-local-dev-placeholder
   ```
6. Write `supabase/seed.sql` — idempotent, one confirmed user plus its identity row:
   - `insert into auth.users (...) values (..., crypt('e2e-local-only-password', gen_salt('bf')), now(), ...) on conflict (id) do nothing;`
   - a matching `auth.identities` row with `provider = 'email'` and `provider_id = <user id>` —
     recent GoTrue versions will not sign a user in without it.
   - `crypt`/`gen_salt` live in the `extensions` schema. If the seed errors with
     `function gen_salt(...) does not exist`, qualify them (`extensions.gen_salt`) or prepend
     `set search_path = extensions, public;`. Verify by running it, do not guess which is needed.
7. `npx supabase start`. **Record the emitted API URL and the client key verbatim** into
   `evidence/phase-01-infrastructure.md`. If the CLI emits `sb_publishable_...`, use it; if it emits
   only the legacy `anon` JWT, use that. Either way the env name is
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
8. Write `.env.local` (git-ignored) with `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `E2E_TEST_USER_EMAIL`, `E2E_TEST_USER_PASSWORD`, plus the
   two Google placeholders (Next does not read the root `.env` the CLI uses; both files are needed).
9. **Verify the placeholder-credential question, do not assume it.** Run and paste the real output:
   - `npx supabase status` → services healthy
   - `curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' "http://127.0.0.1:54321/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback"`
     → expected `302` with a `Location` on `accounts.google.com` carrying the placeholder client id.
     A `400 provider is not enabled` or a `500` is the failure signal.
   - a throwaway Node script calling `signInWithPassword` with the seeded credentials → session
     returned, not `Invalid login credentials`.
10. Extend `.env.example` with the four new variables and a comment block in the file's existing voice:
    what each is, that the Google pair is user-supplied and currently placeholder, and that
    `supabase start` must be running.
11. Confirm `.gitignore` covers the root `.env` (it does, via `.env*`) and that `supabase init`
    generated `supabase/.gitignore` for `.branches`/`.temp`. Add only what is genuinely missing.

## Todo List

- [ ] Branch `feat/login-supabase-auth` cut from `main`
- [ ] `@supabase/supabase-js@2.112.3` + `@supabase/ssr@0.12.4` installed and pinned
- [ ] `supabase init` run; `config.toml` edited (google provider, `skip_nonce_check`, `localhost:3000`)
- [ ] Root `.env` with shaped Google placeholders
- [ ] `supabase/seed.sql` with the E2E user + identity row, idempotent
- [ ] `supabase start` exits 0; URL + key recorded in evidence
- [ ] `.env.local` written with the frozen env names
- [ ] Placeholder tolerance **proven** (status + authorize curl + signInWithPassword output pasted)
- [ ] `.env.example` extended; ignore rules confirmed

## Success Criteria

| # | Observable |
|---|---|
| SC1-1 | `npm ls @supabase/ssr` prints `0.12.4` and exits 0 |
| SC1-2 | `npx supabase status` reports every service running |
| SC1-3 | The authorize `curl` returns `302` to `accounts.google.com` (or the deviation in R2 is recorded) |
| SC1-4 | A `signInWithPassword` call with the seeded credentials returns a session object |
| SC1-5 | `evidence/phase-01-infrastructure.md` contains the pasted real output of SC1-2..SC1-4 |
| SC1-6 | `git status` shows no `.env` or `.env.local` staged |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | The CLI refuses to start with placeholder Google credentials (validates non-empty, or rejects the format) | Med × High | Ladder, in order: (a) the shaped placeholders in step 5; (b) any syntactically valid dummy the CLI accepts; (c) last resort `enabled = false` with a one-line documented flip, recorded as a known deviation in evidence and in `docs/`. The stack is never left down, and the E2E is unaffected either way because `signInWithOAuth` builds the URL client-side. |
| R2 | Seed fails on `gen_salt`/`crypt` schema resolution | Med × Med | Run `npx supabase db reset` and read the real error; qualify with `extensions.` or set `search_path`. Verified by SC1-4, not by inspection. |
| R3 | `signInWithPassword` rejects the seeded user because the identity row is missing or `email_confirmed_at` is null | Med × High | Both are explicit in step 6; SC1-4 is the proof. This is the single most common local-seed failure. |
| R4 | `supabase start` pulls several GB of images on first run | High × Low | Expected, one-off. Budget it inside the 3h; it is not a defect. |
| R5 | Committing a real secret once the user supplies the Google credentials | Low × High | `.env*` is already ignored except `.env.example`; SC1-6 checks the staged set. `.env.example` carries placeholders only. |
| R6 | Port collision on 54321/54322 with another local Supabase project | Low × Med | `supabase stop --project-id <other>` or change the `[api]/[db]` ports in `config.toml` and re-record the URL in evidence. |

## Security Considerations

- No secret is committed. The seeded password is a **local-only fixture** named
  `e2e-local-only-password`, valid solely against a throwaway Docker Postgres; it grants nothing
  outside this machine.
- The service/secret key is **not** used anywhere in this plan — the E2E path needs only the
  publishable key (research §6 option 1). Do not put a secret key in `.env.example` or in any test.
- `skip_nonce_check = true` is a **local-development-only** setting, required by the CLI's own comment
  for local Google sign-in. It must be called out in `docs/` so it never migrates to a hosted project.

## Next Steps

Unblocks Phase 2 (the RED gate needs `@supabase/ssr` importable and a reachable stack). Hand forward:
the recorded API URL, the client key, the seeded credentials, and the answer to R1.

## Rollback

`git checkout -- package.json package-lock.json .env.example && rm -rf supabase node_modules/@supabase && npm ci`,
then `npx supabase stop`. Nothing in `app/`, `components/` or `lib/` has changed, so the running app is
untouched by a rollback of this phase.
