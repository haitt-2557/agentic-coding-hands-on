# Phase 1 evidence — Supabase local stack

Date: 2026-08-19. Environment: macOS darwin 23.2.0, colima/Docker 29.2.0, supabase CLI 2.115.0,
Node 24, repo root `agentic-coding-hands-on/`. Branch: `feat/login-supabase-auth` (cut from `main`).

## Deviation recorded: local ports shifted +100 (R6)

`supabase start` failed on the first attempt: another local Supabase project on this machine
(`supabase_*_meeting-translation`, unrelated repo) already holds 54321-54324. Per R6's
countermeasure, the ports in `supabase/config.toml` were shifted +100 instead of stopping someone
else's running project:

| Service | CLI default | Used here |
|---|---|---|
| API (`[api].port`) | 54321 | **54421** |
| DB (`[db].port`) | 54322 | **54422** |
| DB shadow (`[db].shadow_port`) | 54320 | **54420** |
| Pooler (`[db.pooler].port`, disabled) | 54329 | **54429** |
| Studio (`[studio].port`) | 54323 | **54423** |
| Mail catcher (`[local_smtp].port`) | 54324 | **54424** |
| Analytics (`[analytics].port`) | 54327 | **54427** |

`site_url` / `additional_redirect_urls` are unaffected — they describe the Next.js app's own
origin (`http://localhost:3000`), not the Supabase API port.

## SC1-1 — `@supabase/ssr` / `@supabase/supabase-js` resolve exactly

```
$ npm ls @supabase/supabase-js @supabase/ssr
my-app@0.1.0 /Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/agentic-coding-hands-on
+-- @supabase/ssr@0.12.4
| `-- @supabase/supabase-js@2.112.3 deduped
`-- @supabase/supabase-js@2.112.3
```

## SC1-2 — `supabase status`: every service healthy

```
$ npx supabase status
Stopped services: [supabase_imgproxy_agentic-coding-hands-on supabase_pooler_agentic-coding-hands-on]
{"linked_project":null,"DB_URL":"postgresql://postgres:postgres@127.0.0.1:54422/postgres","API_URL":"http://127.0.0.1:54421","REST_URL":"http://127.0.0.1:54421/rest/v1","GRAPHQL_URL":"http://127.0.0.1:54421/graphql/v1","FUNCTIONS_URL":"http://127.0.0.1:54421/functions/v1","MCP_URL":"http://127.0.0.1:54421/mcp","STUDIO_URL":"http://127.0.0.1:54423","PUBLISHABLE_KEY":"sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH","SECRET_KEY":"sb_secret_<REDACTED>","JWT_SECRET":"<REDACTED_JWT_SECRET>","ANON_KEY":"<REDACTED_ANON_JWT>","SERVICE_ROLE_KEY":"<REDACTED_SERVICE_ROLE_JWT>","MAILPIT_URL":"http://127.0.0.1:54424","INBUCKET_URL":"http://127.0.0.1:54424","STORAGE_S3_URL":"http://127.0.0.1:54421/storage/v1/s3","S3_PROTOCOL_ACCESS_KEY_ID":"<REDACTED_S3_KEY_ID>","S3_PROTOCOL_ACCESS_KEY_SECRET":"<REDACTED_S3_KEY_SECRET>","S3_PROTOCOL_REGION":"local","message":""}
```

`Stopped services: [imgproxy, pooler]` is expected — both are disabled in `config.toml`
(`[db.pooler].enabled = false`; imgproxy has no storage image-transform use here). The full core
set (`docker ps`) shows every enabled service `Up ... (healthy)`:

```
$ docker ps --filter "name=agentic-coding-hands-on" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
NAMES                                           STATUS                    PORTS
supabase_studio_agentic-coding-hands-on         Up 37 seconds (healthy)   0.0.0.0:54423->3000/tcp
supabase_pg_meta_agentic-coding-hands-on        Up 37 seconds (healthy)   8080/tcp
supabase_edge_runtime_agentic-coding-hands-on   Up 37 seconds
supabase_storage_agentic-coding-hands-on        Up 37 seconds (healthy)   5000/tcp
supabase_rest_agentic-coding-hands-on           Up 38 seconds             3000/tcp
supabase_realtime_agentic-coding-hands-on       Up 38 seconds (healthy)   4000/tcp
supabase_inbucket_agentic-coding-hands-on       Up 38 seconds (healthy)   0.0.0.0:54424->8025/tcp
supabase_auth_agentic-coding-hands-on           Up 38 seconds (healthy)   9999/tcp
supabase_kong_agentic-coding-hands-on           Up 38 seconds (healthy)   0.0.0.0:54421->8000/tcp
supabase_vector_agentic-coding-hands-on         Up 39 seconds (healthy)
supabase_analytics_agentic-coding-hands-on      Up 39 seconds (healthy)   0.0.0.0:54427->4000/tcp
supabase_db_agentic-coding-hands-on             Up 53 seconds (healthy)   0.0.0.0:54422->5432/tcp
```

## SC1-3 — placeholder-credential tolerance (R1), proven not assumed

Ladder step (a) — the shaped placeholders from step 5 — worked on the first try; no descent to
(b) or (c) was needed.

```
$ curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "http://127.0.0.1:54421/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback"
302 https://accounts.google.com/o/oauth2/v2/auth?client_id=000000000000-localdevplaceholder.apps.googleusercontent.com&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&redirect_uri=http%3A%2F%2F127.0.0.1%3A54421%2Fauth%2Fv1%2Fcallback&response_type=code&scope=email+profile&state=654744ee-52b9-4c89-bd00-42439b04399b
```

`302` to `accounts.google.com`, carrying the placeholder `client_id` verbatim. The stack enables
the Google provider and builds the authorize URL with placeholder credentials; nothing about this
call reaches Google's servers or fails locally. Confirms Key Insight 3 / research §4: this
endpoint's redirect is what `signInWithOAuth` triggers client-side, and it does not depend on the
credentials being real.

## SC1-4 — seeded `signInWithPassword` returns a session

Ran from the project root (so `@supabase/supabase-js` resolves from `node_modules`):

```
$ node --input-type=module -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'http://127.0.0.1:54421',
  'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
);
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'e2e-login@example.com',
  password: 'e2e-local-only-password',
});
if (error) { console.error('FAILED:', error.message); process.exit(1); }
console.log('SESSION OK. user id:', data.user.id, 'email:', data.user.email);
console.log('access_token present:', Boolean(data.session.access_token));
"
SESSION OK. user id: 11111111-1111-1111-1111-111111111111 email: e2e-login@example.com
access_token present: true
```

Real session returned, not `Invalid login credentials` — `supabase/seed.sql`'s `auth.users` +
`auth.identities` rows are sufficient for GoTrue to authenticate the fixture user. No
`gen_salt`/`crypt` schema errors surfaced (R2) — `set search_path = extensions, public;` at the top
of `seed.sql` resolved them on the first `supabase start`, no `db reset` retry needed.

## Recorded verbatim for Phase 4 (frozen env names, actual values)

| Env name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54421` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH` (new-format publishable key — CLI 2.115.0 emits this flavour by default, not a legacy `anon` JWT, though it also printed `ANON_KEY` as a JWT for backward compat; per research §1 recommendation, the publishable key is the one used) |
| `E2E_TEST_USER_EMAIL` | `e2e-login@example.com` |
| `E2E_TEST_USER_PASSWORD` | `e2e-local-only-password` |

## SC1-6 — no secret staged

```
$ git status --porcelain
 M .env.example
 M package-lock.json
 M package.json
?? plans/260819-1432-login-supabase-auth/
?? supabase/
$ git check-ignore -v .env .env.local
.gitignore:38:.env*	.env
.gitignore:38:.env*	.env.local
```

Neither `.env` nor `.env.local` appears in `git status`; both resolve as ignored via the existing
`.env*` / `!.env.example` rule. No modification to `.gitignore` was needed — confirmed, not
assumed.

## Known deviation to carry into `docs/`

- `skip_nonce_check = true` under `[auth.external.google]` is local-development-only per the CLI's
  own generated comment; must not migrate to a hosted/production project config.
- Local Supabase ports for this project are 54421-54429 (not the CLI's 54321-54329 default) because
  another unrelated local Supabase project already holds the default range on this machine. Anyone
  running this stack on a clean machine could safely revert to the CLI defaults; this is a
  machine-local accommodation, not a project requirement.
