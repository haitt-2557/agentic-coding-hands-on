# Phase 04 — Auth gate and data access

**Track:** B · **Owner agent:** `implementer` · **Priority:** P1 · **Status:** pending · **Effort:** 1h
**Depends on:** 01 (tables), 03 (types) · **Unblocks:** 05, 08

## Context Links

- [dom-contract.md](dom-contract.md) → D16, S5, and the environment notes on the gate and port 3200
- [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) → FR-001, FR-002, BR-001, SC-001, SC-002, US001, US002
- [spec/system/permissions.md](spec/system/permissions.md) §1, §3 · [clarifications.md](clarifications.md) decision 3

## Overview

The route guard and the two reads the form needs, shipped as **library functions, not a page**.
`app/kudos/send/page.tsx` is deliberately deferred to phase-08: port 3200 runs a production
build, so a page importing a component that does not exist yet would break all 23 tests rather
than one. Here we build the pieces the page will assemble.

## Key Insights

- **`getUser()`, never `getSession()`.** The repo has zero `getSession()` calls and documents
  the reason in three places (`lib/supabase/proxy-session.ts`): a cookie is attacker-controlled
  input on the server; `getUser()` round-trips to Supabase Auth. `app/login/page.tsx` is the
  precedent — this route is the same discipline with the condition **inverted**.
- `lib/supabase/server.ts` exports an **async** `createClient()` (it awaits `cookies()`); it
  must be awaited. The old `get`/`set`/`remove` cookie shape is dead — do not reintroduce it.
- This is the app's **second** real route guard and the **first** that ejects the
  unauthenticated (permissions.md §1). It grants nothing to the mock `session-provider`.
- **Do not add `/kudos/send` to `ALWAYS_ALLOWED` in `lib/prelaunch/gate.ts`.** That changes
  production gate behaviour and forces an edit to `gate.test.ts`. The suite runs on port 3200
  where the gate is already open. `proxy.ts` needs no change either.
- Reads happen server-side with the user's own session, so RLS applies: `profiles`/`hashtags`
  are select-only for `authenticated` (phase-01).

## Requirements

**Functional:** FR-001 (redirect to `/login` when no session), FR-002 (recipient source), FR-007 (hashtag source).
**Non-functional:** files <200 lines; no client bundle leakage of server-only code; failures throw rather than silently returning empty lists.

## Architecture

```text
lib/kudos/send/auth-gate.ts
  requireSupabaseUser(): Promise<User>
    -> createClient() from '@/lib/supabase/server'  (await it)
    -> supabase.auth.getUser()
    -> if (!user) redirect('/login')     // next/navigation; throws, so callers need no else
    -> return user

lib/kudos/send/queries.ts
  listProfiles(): Promise<ProfileOption[]>    // order by display_name
  listHashtags(): Promise<HashtagOption[]>    // fixed 8, stable order
```

Data flow into the page (assembled in phase-08):

```text
GET /kudos/send
  -> proxy.ts (refresh Supabase cookies; prelaunch gate: open on :3200, redirects on :3000)
  -> requireSupabaseUser()            -- no session? 307 /login, nothing rendered  [FR-001]
  -> listProfiles() + listHashtags()  -- parallel, RLS-scoped to `authenticated`
  -> <KudosSendForm profiles hashtags onSubmit={submitKudos} />
```

`redirect()` inside `requireSupabaseUser()` throws a Next control-flow error — callers must not
wrap it in a `try/catch` that swallows it. Say so in the file header.

## Related Code Files

**Create (owned exclusively):** `lib/kudos/send/auth-gate.ts`, `lib/kudos/send/queries.ts`
**Read for context:** `app/login/page.tsx` (the guard precedent), `lib/supabase/server.ts`, `lib/supabase/proxy-session.ts`, `proxy.ts`, `lib/kudos/send/types.ts`
**Do not touch:** `app/**` (phase-08), `proxy.ts`, `lib/prelaunch/**`, `lib/supabase/**`, `components/**`, `e2e/**`.

## Implementation Steps

1. **Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` and
   `proxy.md` first.** This is not the Next.js in your training data (AGENTS.md): 16.3.1 renamed
   `middleware.ts` → `proxy.ts`, and `cookies()`/`searchParams` are Promises.
2. Write `auth-gate.ts` mirroring `app/login/page.tsx` with the condition inverted
   (`if (!user) redirect('/login')`). Header comment: why `getUser()` and not `getSession()`,
   and that `redirect()` throws.
3. Write `queries.ts` using the awaited server client; select only the columns in
   `ProfileOption`/`HashtagOption`. Map DB snake_case to the contract's camelCase here so no
   component ever sees a raw row.
4. On a Supabase error, throw with a message naming the table — do not return `[]`, which would
   render an empty picker and look like a UI bug.
5. `npx tsc --noEmit`, then `npm run lint`, then `npx next build` (proves it survives the
   production build port 3200 uses).

## Todo List

- [x] Next 16 `page.md` + `proxy.md` read before writing code
- [x] `requireSupabaseUser()` uses `getUser()`; grep confirms no `getSession()` added
- [x] `redirect('/login')` on absent user, before any data is read
- [x] `listProfiles()` / `listHashtags()` map to the phase-03 contract types
- [x] Query errors throw with the table name; no silent `[]`
- [x] No `ALWAYS_ALLOWED` / `proxy.ts` / `gate.ts` edit
- [x] typecheck + lint + `next build` clean

## Success Criteria

- `grep -rn "getSession()" lib app` → still zero hits.
- `requireSupabaseUser()` returns a `User` for the seeded fixture session and redirects
  otherwise — proven by phase-09's `send-kudos-access.spec.ts` (ID-0, ID-1, SC-001).
- `listProfiles()` returns 7 rows, `listHashtags()` returns 8 (SC-002 source data).
- `npx next build` succeeds — the port-3200 server is a real build.
- `git diff --stat` touches exactly the two new files.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| `getSession()` used because it is synchronous and simpler | Med × **High** | Documented ban in three files; grep is a success criterion |
| Guard placed after data loading → an unauthenticated request touches the DB | Low × High | Data flow diagram fixes the order; the gate runs first |
| `redirect()` swallowed by a `try/catch` around the Supabase call | Med × High | File header states it throws; keep the redirect outside any try block |
| Someone "fixes" the prelaunch redirect by editing `ALWAYS_ALLOWED` | Med × **High** | Explicitly forbidden here and in dom-contract; port 3200 is the mechanism |
| `createClient()` used without `await` → confusing runtime type errors | Med × Med | Noted in Key Insights; typecheck catches it |

## Security Considerations

- This is a real authorization boundary — the first one that keeps anyone out (permissions.md §1).
- Identity comes only from `auth.uid()`; `lib/session/session-provider.tsx` (`role`, `userId`)
  stays a client-side mock and is **not** consulted here (permissions.md §3).
- The guard must precede rendering *and* reading, so an unauthenticated visitor sees no part of
  the form (US001 scenario 2).
- Other routes' protection is unchanged — this is a local guard for one route, not the first
  step of a site-wide scheme.

## Next Steps

Phase-05 consumes `requireSupabaseUser()` for the sender id. Phase-08 assembles both functions
into the page. Report the exported signatures verbatim in the completion message.
</content>
