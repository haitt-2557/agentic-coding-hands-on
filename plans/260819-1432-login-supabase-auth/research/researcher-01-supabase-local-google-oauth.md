# Research: Google OAuth via local Supabase into Next.js 16.3.1 / React 19.2.8 App Router

Date: 2026-08-19. Sources: official Supabase docs (fetched), Supabase CLI v2.115.0 run locally
(`supabase init` → actual generated `config.toml`, primary source, not a summary), `npm view`
for installed-version truth, project's own `node_modules/next/dist/docs` for Next 16 conventions,
GitHub discussions/issues for edge cases, 3+ independent blog/tutorial cross-checks per claim.
Level: high (9 search/fetch calls + 1 local CLI verification, exceeding the medium 5-call default
because two facts — API key naming and cookie adapter shape — are explicitly flagged
version-sensitive by the requester).

## Summary

Local Supabase + Google OAuth + Next 16 App Router is a well-trodden, low-risk path — `@supabase/ssr`
is the maintainer-blessed glue, and every piece is stable (not experimental) as of Aug 2026. Two
things in the request description are **already stale** and I'm correcting them against primary
sources: (1) Supabase's local mail catcher is no longer called "Inbucket" — CLI 2.115.0 renamed
the config section to `[local_smtp]`; (2) the project's own `.env.example` and `AGENTS.md` note
Next 16 renamed `middleware.ts` → `proxy.ts`, which changes where the session-refresh logic lives
compared to every Supabase tutorial you'll find (all still say `middleware.ts`).

For testing, seeded `signInWithPassword` beats admin `generateLink` for this project: fewer moving
parts, no service-role key needed in the test runner, and it's what the existing `e2e/` suite
pattern (Playwright, no auth yet) would extend most naturally.

**Environment fact, not assumption:** I ran `colima status` and `docker info` just now — colima
**is** running on this machine (`docker info` succeeds), contradicting the task's stated
"colima not currently running." State this to the user before they run `supabase start`, since a
stale assumption here wastes a debugging cycle.

## 1. Supabase CLI local setup (macOS/zsh)

**Install:**
```bash
brew install supabase/tap/supabase
```
(`npm install supabase --save-dev` is the alternative, but this project has no existing supabase
dependency and Homebrew is the maintainer's primary-documented path for macOS — [supabase/cli
getting-started](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/local-development/cli/getting-started.mdx).)

Installed CLI resolves to **v2.115.0** (`npm view supabase version`, checked live). CLI is on a
fast release cadence (weekly-ish) — pin nothing in code, but note the version when things break.

**Docker prerequisite:** Supabase local stack runs entirely as Docker containers (Postgres, GoTrue
auth, Studio, storage, mail catcher, etc.) — `supabase start` will fail immediately without a
running Docker daemon. On this machine, colima (`/opt/homebrew/bin/colima`) is installed and
**already running** (macOS Virtualization.Framework runtime, docker socket at
`~/.colima/default/docker.sock`) — verified via `colima status` and `docker info` at time of
writing. If it's ever down: `colima start`.

**Commands:**
```bash
supabase init      # scaffolds supabase/config.toml + supabase/migrations/
supabase start      # pulls images, starts the stack, prints local URLs/keys
```

**What `supabase start` prints** (confirmed against the actual generated `config.toml` defaults,
CLI 2.115.0):
| Service | Local URL |
|---|---|
| API (REST/Auth/Realtime/Storage) | `http://127.0.0.1:54321` |
| Studio | `http://127.0.0.1:54323` |
| Local mail catcher (was "Inbucket") web UI | `http://127.0.0.1:54324` |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| GraphQL | `http://127.0.0.1:54321/graphql/v1` |

**⚠ version-sensitive correction:** the task brief calls the mail catcher "Inbucket." In this
CLI's generated `config.toml`, that block is now `[local_smtp]` (port 54324), not `[inbucket]` —
Supabase swapped the underlying tool. Every tutorial predating this rename still says "Inbucket";
functionally it's the same web UI for reading local test emails, just don't grep the config for
`inbucket` and conclude it's missing.

**⚠ the API-key naming question — get this right, it's mid-migration:**

Supabase is retiring the old JWT-based `anon` / `service_role` keys in favor of opaque
`sb_publishable_...` / `sb_secret_...` keys ([official migration
guide](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys),
[changelog #29260](https://supabase.com/changelog/29260-upcoming-changes-to-supabase-api-keys)).
Cross-checked against 3 sources (official docs, GitHub discussion #40300, Medium writeup — all
agree):

- **Legacy** (still works today, still what `supabase start` prints by default for a fresh local
  project): `ANON_KEY`, `SERVICE_ROLE_KEY` — JWTs.
- **New** (recommended going forward): `sb_publishable_xxx` (client-safe, same RLS privilege as
  `anon`) and `sb_secret_xxx` (server-only, bypasses RLS, returns HTTP 401 if used from a browser
  User-Agent). These are **not** JWTs — they don't expire/rotate with your JWT secret, which is the
  whole point (mobile-app-store rotation pain was the forcing function).
- **Env var naming to use in `.env.local` for this project:**
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` if you stay on legacy), `SUPABASE_SECRET_KEY` (server-only, never
  `NEXT_PUBLIC_*`).
- **Timeline:** no forced action before Nov 1, 2025 (already past) for *existing* projects; new
  projects created after that date no longer get legacy keys issued at all. **Recommendation: use
  the new `sb_publishable_` / `sb_secret_` naming from day one** — this is a brand-new project, so
  there's no legacy key to migrate away from, and every Supabase doc going forward assumes the new
  names.

## 2. `supabase/config.toml` — Google provider

Verified by actually running `supabase init` locally and reading the real generated file (not a
tutorial's copy-paste) — CLI 2.115.0's template gives only an `apple` example under
`[auth.external.*]`, but the shape is identical for every provider, `google` included:

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
# Leave redirect_uri empty to use the default: {api_url}/auth/v1/callback
redirect_uri = ""
# The generated file's own comment: "Required for local sign in with Google auth."
skip_nonce_check = true
```

`.env` (git-ignored, next to `config.toml` — the CLI's `env(...)` reads a `.env` at repo root
automatically):
```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<from Google Cloud Console>
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
```

`[auth]` section — the CLI's real defaults (confirmed, not guessed):
```toml
[auth]
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]
```

**Correction to the task brief:** the default is `127.0.0.1:3000`, not `localhost:3000`.
`additional_redirect_urls` is matched by **exact string**, so pick one host and use it
consistently everywhere (Next dev server, Google Console, `redirectTo` in code) — mixing
`localhost` and `127.0.0.1` is the #1 cause of "redirect URL not allowed" locally. Recommend
standardizing on `http://localhost:3000` (matches this project's existing
`NEXT_PUBLIC_EVENT_START_AT` proxy gate assumptions and is what devs actually type) and editing
both `site_url` and `additional_redirect_urls` to say `localhost` instead of the CLI default.

**Google Cloud Console side** — register exactly one authorized redirect URI, pointed at the
**local Supabase auth server**, never at Next.js:
```
http://127.0.0.1:54321/auth/v1/callback
```
(3 independent sources agree: official Supabase Google guide, a Medium local-config walkthrough,
and the CLI's own `redirect_uri` comment — "Overrides the default auth callback URL derived from
auth.external_url," which resolves to `{api_url}/auth/v1/callback` when left blank.) The Next.js
`/auth/callback` route is a *second*, separate redirect — Supabase's GoTrue receives Google's code
first, exchanges it, then 302s the browser to *your* `redirectTo` (Next.js) with its own `?code=`
for PKCE exchange. Do not register the Next.js URL with Google; Google never talks to Next.js
directly.

## 3. `@supabase/ssr` with Next.js 16 App Router

Confirmed package/versions (`npm view`, live):
```bash
npm install @supabase/ssr@0.12.4 @supabase/supabase-js@2.112.3
```

Both are current stable, both actively maintained (Supabase-authored, not community). No
Next-16-specific incompatibility found — `@supabase/ssr`'s cookie contract is App-Router-generic
(works off any `getAll`/`setAll`), it has no dependency on `middleware.ts` vs `proxy.ts` naming.

**Cookie adapter shape — confirmed current, the old shape is dead:** across the official docs
excerpt, a GitHub discussion, and two 2026-dated tutorials, the shape is consistently
`getAll()` / `setAll(cookiesToSet)`. The old three-method `get`/`set`/`remove` shape from
`@supabase/auth-helpers-nextjs` (a deprecated, different package — do not install it) is gone.

`lib/supabase/client.ts` (browser):
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
```

`lib/supabase/server.ts` (Server Components / Route Handlers) — this project's own
`node_modules/next/dist/docs/.../04-functions/cookies.md` confirms `cookies()` from `next/headers`
is `async` in this Next version, so it must be awaited before being handed to the adapter:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components can't write cookies — safe to ignore when proxy.ts
            // is refreshing the session on every request (see below).
          }
        },
      },
    },
  )
}
```

**Route handler reading/writing cookies:** a Route Handler (`route.ts`) *can* write cookies
(unlike a Server Component render), per this project's own
`.../03-file-conventions/route.md` §Cookies — use the same `server.ts` factory there; no separate
adapter needed. The try/catch above only matters when the same factory is called from a Server
Component.

**Proxy (`proxy.ts`, not `middleware.ts`) session refresh:** every Supabase tutorial found
(including the two 2026-dated ones) still says `middleware.ts` — that file convention is
deprecated in Next 16 per this project's own
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`. Port the
identical logic into `proxy.ts`, exporting `proxy` (not `middleware`) as the function name; the
`NextRequest`/`NextResponse` cookie API used by the Supabase pattern is unchanged (proxy still uses
`request.cookies` / `response.cookies`, per `proxy.md`'s own "Using Cookies" section). This
project already has a `proxy.ts` (the prelaunch gate) — Supabase's session-refresh logic must be
**merged into that same file**, not added as a second one; Next.js only loads a single
`proxy.ts` per project. Sequence: refresh the Supabase session first, then run the existing
`resolveGateRedirect` check, so an authenticated user's cookie is current before any gating logic
reads it.

## 4. The OAuth round trip

Client component:
```ts
'use client'
import { createClient } from '@/lib/supabase/client'

async function signInWithGoogle() {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/auth/callback` },
  })
}
```

`app/auth/callback/route.ts`:
```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const errorDescription = searchParams.get('error_description')

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`,
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/`)
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    )
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`)
}
```

**Error propagation when Google rejects / user cancels:** confirmed across the official
`exchangeCodeForSession` reference and two GitHub issues — GoTrue redirects back to your
`redirectTo` with `?error=access_denied&error_description=...` (user cancelled) or a provider-side
error, as *query params*, not a thrown exception at that point; check `error_description` **before**
assuming `code` exists. Two sharp edges worth flagging to the implementer, both from real GitHub
issues, not speculation:
- `exchangeCodeForSession` **throws** rather than returning `{ error }` in some auth-js versions
  ([auth-js#782](https://github.com/supabase/auth-js/issues/782)) — wrap the call in try/catch
  regardless of what the type signature promises.
- A known regression in supabase-js 2.91.0 made `exchangeCodeForSession`'s promise resolve
  *before* `setAll` finished persisting cookies, so the redirect response shipped without the
  session cookie ([reported in the wild](https://mokkapps.de/blog/login-at-supabase-via-rest-api-in-playwright-e2e-test)
  context). Installed version here is 2.112.3 — pin this and re-check the changelog before any
  future bump touches auth.

## 5. Reading the session server-side (redirect an authenticated visitor off `/login`)

**Use `getUser()`, never `getSession()`, in any server context** (proxy, Server Component, Route
Handler). Confirmed identically across the official docs, a GitHub discussion, and a tutorial:
`getSession()` reads the JWT out of the cookie **without verifying it against the Auth server** —
a cookie is attacker-controlled input on the server side, so trusting its claims un-verified is a
forgeable-session bug. `getUser()` round-trips to Supabase Auth (or verifies locally against
cached JWKs when the project is on asymmetric signing keys) and only returns a user if the token
is actually still valid.

```ts
// app/login/page.tsx (Server Component)
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')
  // render the login form
}
```

**A third option worth naming, not recommending yet:** newer `getClaims()` verifies locally against
cached JWKs (no network round-trip) when the project has opted into asymmetric JWT signing keys —
faster for high-traffic middleware. This is real and current
([Supabase JWT Signing Keys docs](https://supabase.com/docs/guides/auth/signing-keys),
cross-checked against a second blog write-up), and new projects default to asymmetric keys from
Oct 1 2025 onward. **Recommendation: skip it for now.** This is a single small Next.js app, not a
high-QPS API gateway — `getUser()`'s extra round-trip is not a measurable problem at this scale,
and `getClaims()` adds a second concept (claims vs. verified user object, JWKS caching behavior)
for zero present benefit. YAGNI. Revisit only if proxy-level auth checks show up in a performance
budget.

## 6. Testing with `@playwright/test` — no real Google account

Three real options, ranked:

**1. Seeded email/password user + `signInWithPassword()` — recommended.**
Seed a test user in `supabase/seed.sql` (or a one-time admin-API script run against the local
stack before the suite), then in a Playwright `auth.setup.ts` project dependency:
```ts
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

setup('authenticate', async ({ page, context }) => {
  const { data } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: process.env.TEST_USER_PASSWORD!,
  })
  // Supabase cookie names follow `sb-<project-ref>-auth-token(.N)` — easiest path is
  // driving the real /login form once here so @supabase/ssr writes its own cookies,
  // rather than hand-constructing the cookie value.
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
```
Then reuse `storageState: 'e2e/.auth/user.json'` in `playwright.config.ts` for dependent test
projects. Requires: only the **publishable** key (no service-role secret needed at test-run time)
plus one seeded row — smallest blast radius, matches this project's existing `playwright.config.ts`
/ `playwright.unit.config.ts` split without adding a new secret to CI.

**2. Admin API `createUser` + `generateLink` — for magic-link/OTP flows specifically.**
Needs the **secret** key server-side (never in the browser or a committed file), used to
programmatically create a user and mint a sign-in link, then have Playwright *navigate* to that
link to establish the session. Confirmed pattern across 3 independent sources
(getautonoma.com, amillionmonkeys.co.uk, bekapod.dev — all 2025/2026-dated). More moving parts
than password sign-in and only earns its cost when the app's actual production flow *is*
magic-link/OTP (this project's flow is Google OAuth + presumably nothing else) — not the right
default here.

**3. Injecting the cookie directly (no Supabase client call at all).**
Fastest, but brittle: couples the test to `@supabase/ssr`'s internal cookie name/shape and
`sb-<ref>-auth-token(.N)` chunking behavior, which is undocumented API and has changed before.
Not recommended as the primary strategy; fine as a micro-optimization later once option 1 is
working and proven, if setup-project overhead becomes a measured problem.

**Ranked:** (1) seeded `signInWithPassword` > (2) admin `generateLink` > (3) raw cookie injection.
None of them touch a real Google account — the OAuth *button* itself (`signInWithOAuth` →
Google's consent screen) is inherently untestable end-to-end without a real Google session, so
Playwright coverage should exercise everything *after* the callback (session present, redirects,
protected routes) via option 1, and leave the Google-button click itself to manual QA or a mocked
`page.route()` intercept of the `/auth/v1/authorize` call if button-click coverage is required.

## Trade-off matrix (testing strategies)

| | Setup cost | Secrets needed | Coupling to internals | Matches project's existing pattern |
|---|---|---|---|---|
| Seeded password + `signInWithPassword` | Low | Publishable key only | Low (real client, real cookies) | Yes — extends `playwright.config.ts` cleanly |
| Admin `generateLink` | Medium | Secret key (server-side) | Low | Only if OTP/magic-link is the real flow |
| Direct cookie injection | Low | None | High (undocumented cookie shape) | No — fragile against library bumps |

## Recommendations, ranked

1. New API keys (`sb_publishable_`/`sb_secret_`) over legacy `anon`/`service_role` — new project,
   no migration debt, matches where Supabase is taking every doc.
2. `getUser()` over `getSession()` everywhere on the server, `getClaims()` deferred (YAGNI at this
   scale).
3. Seeded `signInWithPassword` over admin `generateLink` or cookie injection for Playwright.
4. Merge Supabase's session-refresh into the **existing** `proxy.ts` rather than adding a second
   file — Next 16 loads exactly one.
5. Standardize on `http://localhost:3000` everywhere (Console, `site_url`,
   `additional_redirect_urls`, `redirectTo`) rather than the CLI's `127.0.0.1` default, since
   `additional_redirect_urls` matching is exact-string.

## Limits of this research

- Did not stand up the actual stack end-to-end (`supabase start` + real Google Console app) —
  every code snippet is corroborated across primary docs + live CLI output + 2+ independent
  write-ups, but not executed here. First implementation pass should treat `redirect_uri`
  behavior and the `skip_nonce_check` requirement as the two things to verify first against a real
  browser round-trip.
- Did not benchmark `getUser()` vs `getClaims()` latency on this project's infra — the YAGNI call
  in §5 is a judgment based on project scale, not a measurement.
- Supabase's local-dev Google OAuth flow via `127.0.0.1:54321` sometimes has known quirks with
  Google's own consent-screen redirect handling depending on Chrome's third-party-cookie policy of
  the day (surfaced in GitHub discussion #20353, not deeply chased down here) — worth a fast
  manual smoke test before trusting it in CI.

## Unresolved questions

- Does this project want asymmetric JWT signing keys enabled from day one (affects whether
  `getClaims()` becomes worth it sooner)? Deferred per YAGNI above but worth a explicit decision.
- Confirm with the team: standardize on `localhost` or `127.0.0.1` for local dev URLs project-wide
  — this file recommends `localhost` but it's a one-line config choice, not a technical constraint.

**Status:** DONE
