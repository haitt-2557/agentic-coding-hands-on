---
phase: 4
title: "Track B — Auth behaviour and backend"
owner: implementer
status: completed
priority: P1
effort: 4h
test_policy: e2e-red-first
depends_on: [2]
concurrent_with: [3]
---

# Phase 4 — Track B: Auth behaviour and backend

## MoMorph refs

- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- Research, follow literally: [`research/researcher-01-supabase-local-google-oauth.md`](research/researcher-01-supabase-local-google-oauth.md) §3, §4, §5
- Requirements: [`spec/login/technical-spec.md`](spec/login/technical-spec.md) FR-002..FR-005, BR-001..BR-005, DEC-001, DEC-002, SM-001
- Decisions: [`clarifications.md`](clarifications.md) — `/todo` → `/`; gate exemption; scope stops at the session
- Seam: [`plan.md`](plan.md) § Integration contract · RED evidence: `evidence/red-gate-evidence.md`
- Existing code to extend, not replace: `proxy.ts`, `lib/prelaunch/gate.ts`, `lib/prelaunch/gate.test.ts`

## Overview

**Priority:** P1 · **Status:** pending

The whole auth round trip plus the two proxy changes. Runs concurrently with Track A behind the same
Phase 2 gate. RED-first: the unit surface (`gate.ts`) gets its failing test first; the browser surface
is already RED from Phase 2.

## Key Insights

- **Next 16 loads exactly one `proxy.ts`.** Supabase's session refresh is merged into the existing gate
  file, not added beside it. Sequence matters: refresh first, then `resolveGateRedirect`, so the gate
  reads a current cookie.
- **The cookie-drop trap.** `@supabase/ssr` writes refreshed cookies onto the response object it was
  given. If the gate then returns a *different* `NextResponse.redirect`, those cookies vanish and the
  user is silently signed out on every gated request. Copy the refreshed cookies onto whatever response
  actually ships.
- **`getUser()`, never `getSession()`, on the server.** A cookie is attacker-controlled input;
  `getSession()` trusts its claims without verifying them. `getClaims()` is deferred (YAGNI at this
  scale) per research §5.
- **`exchangeCodeForSession` can throw instead of returning `{ error }`** (auth-js#782) — wrap it in
  try/catch regardless of the type signature, and check `error_description` *before* assuming `code`
  exists, because a cancelled consent returns query params, not an exception.
- **Two allowlist semantics, not one.** `/prelaunch` flips direction when the countdown expires;
  `/login` and `/auth/callback` must pass through in **both** directions. They need their own early
  return, not an entry in the existing branch.
- **The mock session is untouched.** `lib/session/session-provider.tsx` keeps driving role-based UI.
  The Supabase session lives beside it; neither reads the other this run.

## Requirements

**Functional**
- FR-002 — click → `signInWithOAuth({ provider: 'google', options: { redirectTo: \`${location.origin}/auth/callback\` } })`, same tab.
- FR-003 — `app/auth/callback/route.ts` exchanges the code, redirects `/` on success and `/login?error=<msg>` on failure or cancellation.
- FR-004 — `/login` Server Component calls `getUser()`; a real user redirects to `/` before any render.
- FR-005 / BR-004 — `/login` and `/auth/callback` pass the launch gate in every countdown state.
- BR-001 / SM-001 — button disabled + loader from click until navigation or a thrown error.
- BR-002 — the fixed error string is shown whenever `?error` is present, whatever its value.
- BR-005 — the session survives a reload (proxy refresh).

**Non-functional**
- `proxy.ts` stays a thin adapter; the refresh logic lives in `lib/supabase/proxy-session.ts`.
- Existing `gate.test.ts` cases are **extended, never weakened or deleted**.
- Every file under 200 lines.

## Architecture

```
browser  /login (RSC)  ──getUser()──> Supabase Auth ──user?──> redirect '/'
   │                                                └─none──> render Track A shell
   │  LoginClient (client): loading state, signInWithOAuth
   ▼
Supabase /auth/v1/authorize ──> Google consent ──> Supabase /auth/v1/callback
                                                          │
                                        302 ──> /auth/callback?code=... (Route Handler)
                                                exchangeCodeForSession ──> cookies written
                                                   success ──> '/'   failure ──> '/login?error=…'

every request ──> proxy.ts
                    1. updateSupabaseSession(request)  -> { response, supabaseCookies }
                    2. resolveGateRedirect(pathname, …) -> '/prelaunch' | '/' | null
                    3. ship (2)'s redirect if any, with (1)'s cookies copied onto it
```

## Related Code Files

**Create:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy-session.ts`,
`app/login/page.tsx`, `app/login/login-client.tsx`, `app/auth/callback/route.ts`
**Modify:** `lib/prelaunch/gate.ts`, `lib/prelaunch/gate.test.ts`, `proxy.ts`
**Delete:** none

## Implementation Steps

1. **RED first on the unit surface.** Add to `lib/prelaunch/gate.test.ts`, before touching `gate.ts`:
   `/login` and `/auth/callback` return `null` when locked, when unlocked, and when `targetIso` is
   invalid; plus `/auth/callback/anything` nested paths. Run `npm run test:unit`, confirm it fails.
2. Extend `lib/prelaunch/gate.ts`: a `const ALWAYS_ALLOWED = ['/login', '/auth/callback']` early return
   (exact match or `path + '/'` prefix) placed ahead of the countdown logic. Do not alter any existing
   branch. Re-run `npm run test:unit` — the new cases and every pre-existing case pass.
3. `lib/supabase/client.ts` — `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)`.
4. `lib/supabase/server.ts` — `async createClient()` awaiting `cookies()` from `next/headers` (async in
   Next 16), with the `getAll`/`setAll` adapter and the documented try/catch around `setAll` for the
   Server Component case. The three-method `get`/`set`/`remove` shape is dead — do not use it.
5. `lib/supabase/proxy-session.ts` — export `updateSupabaseSession(request: NextRequest)` returning the
   response plus the cookies to carry, using `createServerClient` over `request.cookies` /
   `response.cookies` and calling `getUser()` to force the refresh.
6. `proxy.ts` — call `updateSupabaseSession` first, then `resolveGateRedirect`. On a redirect, build it
   and copy every refreshed cookie onto it before returning. Keep the existing `config.matcher`
   verbatim; `/auth/callback` has no dot, so it is already in scope.
7. `app/login/page.tsx` — Server Component: `await createClient()`, `getUser()`, `redirect('/')` when a
   user exists; otherwise compose `LoginHeader / LoginMain > LoginIntro > LoginClient / LoginFooter`
   from Track A, passing `errored={Boolean((await searchParams).error)}`.
8. `app/login/login-client.tsx` — `'use client'`: owns `loading`, calls `signInWithOAuth` inside
   try/catch, renders Track A's `LoginButton` and, when `errored` or a local throw occurred, Track A's
   `LoginErrorAlert`.
9. `app/auth/callback/route.ts` — the research §4 handler verbatim in shape: `error_description` first,
   then `code` inside try/catch, then the `missing_code` fallback. Never render an error page.
10. `npm run lint` and `npx tsc --noEmit`. Report GREEN/RED status honestly; the E2E is Phase 5's call.

## Todo List

- [ ] `gate.test.ts` extended and failing before `gate.ts` changes (RED recorded)
- [ ] `gate.ts` early-return allowlist; all old cases still pass
- [ ] `lib/supabase/{client,server,proxy-session}.ts`
- [ ] `proxy.ts` merged: refresh → gate → cookies copied onto any redirect
- [ ] `app/login/page.tsx` with the `getUser()` guard and the Track A composition
- [ ] `app/login/login-client.tsx` with the loading state and try/catch
- [ ] `app/auth/callback/route.ts` covering error / code / missing-code
- [ ] `npm run test:unit` green; lint and typecheck clean

## Success Criteria

| # | Observable |
|---|---|
| SC4-1 | `npm run test:unit` passes, with strictly more cases than before this phase and none removed |
| SC4-2 | `npx tsc --noEmit` and `npm run lint` exit 0 |
| SC4-3 | `curl -sI http://localhost:3000/login` returns 200, not a 307 to `/prelaunch`, while the countdown is live |
| SC4-4 | `curl -sI 'http://localhost:3000/auth/callback'` redirects to `/login?error=missing_code` |
| SC4-5 | With a valid session cookie, `/login` responds with a redirect to `/` |
| SC4-6 | Reloading a page while signed in keeps the session (BR-005) |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | Refreshed Supabase cookies dropped when the gate returns a redirect — silent sign-out on every gated request | High × High | Step 6 copies cookies onto the shipped response; SC4-6 is the proof. This is the single most likely defect in the phase. |
| R2 | Track A's components do not exist yet while Track B composes the page — transient typecheck failure | High × Low | Expected during the concurrent window. Track B codes to the frozen contract and re-runs typecheck after Track A reports done; a red typecheck caused only by missing `components/login/*` is not a blocker, it is the seam closing. |
| R3 | `exchangeCodeForSession` throws instead of returning `{ error }` (auth-js#782) | Med × High | try/catch regardless of the signature; the catch redirects to `/login?error=…` like any other failure. |
| R4 | Cancelled consent produces `?error=access_denied` with no `code`, and the handler crashes reading it | Med × Med | Check `error_description` before `code`; the `missing_code` fallback catches everything else. SC4-4. |
| R5 | The allowlist is written into the existing `locked`/`unlocked` branch and only exempts one direction | Med × High | A separate early return ahead of the countdown logic, with unit cases for locked, unlocked *and* invalid config. |
| R6 | `getSession()` used somewhere on the server out of habit | Low × High | Grep for `getSession(` before reporting done; it must appear nowhere under `app/**` or `lib/**`. |
| R7 | Supabase env vars missing at build time make `createClient()` throw during `next build` | Med × Med | Non-null assertions read at call time, not module load; `.env.example` documents them and Phase 1 wrote `.env.local`. |

## Security Considerations

- `getUser()` everywhere on the server — a verified round trip, never an unverified cookie claim.
- No secret/service-role key anywhere in `app/**` or `lib/**`; only the publishable key, which is
  client-safe by design and RLS-bound.
- The gate exemption is **launch timing, not authorization**. It does not weaken protection for any
  other route, because no route is protected yet — route protection is the next run.
- Token storage and refresh are entirely `@supabase/ssr`'s; no hand-rolled token handling, and nothing
  is written to `localStorage`.
- `?error` is rendered as a fixed dictionary string, never echoed from the query param — no reflected
  content reaches the DOM.

## Next Steps

Feeds Phase 5. Report to the orchestrator: unit RED→GREEN evidence, the files created, and whether
typecheck was still red on missing `components/login/*` at hand-off.

## Rollback

Revert `proxy.ts` and `lib/prelaunch/gate.ts` to restore the pre-auth gate exactly; delete
`app/login/**`, `app/auth/**`, `lib/supabase/**`. The app returns to its current behaviour with no data
migration, because this phase owns no schema — Supabase manages `auth.users` itself.
