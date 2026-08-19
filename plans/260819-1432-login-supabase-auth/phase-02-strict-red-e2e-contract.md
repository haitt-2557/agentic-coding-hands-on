---
phase: 2
title: "Strict RED E2E contract for /login"
owner: tester
status: completed
priority: P1
effort: 2.5h
test_policy: e2e-red-first
depends_on: [1]
blocks: [3, 4, 5, 6]
---

# Phase 2 — Strict RED Gate (BLOCKING)

## MoMorph refs

- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- 17 test cases: [`design/test-cases-GzbNeVGJHz.csv`](design/test-cases-GzbNeVGJHz.csv)
- Decisions: [`clarifications.md`](clarifications.md) (design defects #2 and #5 change what is assertable)
- Verification codes: [`spec/login/technical-spec.md`](spec/login/technical-spec.md) SC-001..SC-005
- Session strategy: [`research/researcher-01-supabase-local-google-oauth.md`](research/researcher-01-supabase-local-google-oauth.md) §6 option 1
- House style: `e2e/prelaunch-countdown-gui.spec.ts`, `e2e/support/seed-defaults.ts`
- Accessible-name freeze: [`plan.md`](plan.md) § Integration contract

## Overview

**Priority:** P1 · **Status:** pending

One durable screen-level E2E spec for `/login`, written from the 17 test cases plus the resolved
clarifications, run with the exact project command `npm run test:e2e`. It must go RED on real screen
assertions before Track A or Track B is released.

## Key Insights

- **No config surgery is needed to route the new spec.** The existing `prelaunch-gate` project's
  `testMatch` — `/^(?!.*homepage|.*invalid-env|.*prelaunch-countdown-unlocked).*\.spec\.ts$/` — already
  matches `login-screen.spec.ts` and points at `http://localhost:3000`, whose server is future-dated.
  That is exactly the environment SC-005 wants: it proves `/login` survives the locked launch gate.
  Keep the login spec on port 3000 only; `additional_redirect_urls` is pinned to that origin.
- **The Google button cannot be exercised against real Google.** `signInWithOAuth` builds the authorize
  URL client-side and assigns `window.location`, so `page.route('**/auth/v1/authorize*')` intercepts the
  navigation before it leaves the browser. Assert the intercepted URL; never follow it.
- **Establish the authenticated session with the library's own serializer, not a hand-built cookie.**
  Run `createServerClient` from `@supabase/ssr` inside the Node test process with a capturing cookie
  adapter, call `signInWithPassword`, and feed the captured `(name, value, options)` triples straight
  into `context.addCookies`. This is research §6 option 1's credential path with option 3's speed, and
  crucially it never hard-codes the `sb-<ref>-auth-token` chunking shape — the library writes it.
- **The Playwright process does not read `.env.local`.** Node 24 is installed, so
  `process.loadEnvFile('.env.local')` in `playwright.config.ts`, wrapped in try/catch, is enough. No new
  dependency.
- **Design defect #5 inverts one test case.** TC `60bc5bbb` says "new tab or popup"; the spec's own
  transition note and `clarifications.md` settle on a same-tab redirect. Assert same-tab, and assert
  that **no** second page opens.

## Requirements

**Functional** — assertions in scope, with the test case each answers:

| # | Assertion | Covers |
|---|---|---|
| A1 | `/login` renders on the locked-gate server without redirecting to `/prelaunch` | SC-005, FR-005 |
| A2 | Header: `<img alt="Sun* Annual Awards 2025">` visible, top-left, with **no** link/button ancestor | `b9805e65` |
| A3 | Header: `LanguageSwitcher` visible top-right, shows `VN`, flag left + chevron right, opens on click | `8415b629`, `5f1cbabd`, `98e20775`, `20d87e28`, `4426635b` |
| A4 | Hero: wave key visual present; `<img alt="ROOT FURTHER">` visible | `5fbe2a18`, `42b82364` |
| A5 | Copy: `Bắt đầu hành trình của bạn cùng SAA 2025.` and `Đăng nhập để khám phá!` both visible | `42b82364` |
| A6 | Button `getByRole('button', { name: /LOGIN With Google/i })` visible with the Google mark | `6ae76d15` |
| A7 | Footer: `Bản quyền thuộc về Sun* © 2025` centred and not interactive | `33a1dacf` |
| A8 | Click → intercepted request to `${SUPABASE_URL}/auth/v1/authorize` carrying `provider=google` and a `redirect_to` ending `/auth/callback`; same tab, `context.pages()` length unchanged | `60bc5bbb`, SC-002 |
| A9 | While the intercept is held open, the button is `toBeDisabled()` and a loading indicator is visible | `37eae882`, SC-003, BR-001 |
| A10 | `goto('/login?error=access_denied')` → `getByRole('alert')` with exactly `Đăng nhập không thành công. Vui lòng thử lại.` | BR-002, US003 |
| A11 | With a seeded Supabase session cookie set, `goto('/login')` ends on `/` and the login button is absent | `f62b0c97`, `45278c06` step 3, SC-004 |
| A12 | No uncaught page errors on load (house pattern) | hydration guard |

**Explicitly out of E2E scope, and why**
- Real Google consent screen — no real Google account exists (`clarifications.md` UQ1); manual QA.
- `45278c06` step 2 (logout → redirect to login) — route protection is out of scope this run.
- `c18649fa` hover shadow, `cb42461d` hover highlight — CSS-only; Phase 5 visual validation owns them.
- Responsive behaviour below 1440px — derived, not designed (defect #6); Phase 5 capture owns it.

**Non-functional**
- The existing suite must stay green. Nothing outside `e2e/**` and `playwright.config.ts` is touched.
- `e2e/login-screen.spec.ts` under 200 lines; helper split into `e2e/support/supabase-session.ts`.

## Architecture

```
playwright.config.ts ──loadEnvFile('.env.local')──> NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY
                                                    E2E_TEST_USER_EMAIL / _PASSWORD
                          │
  e2e/support/supabase-session.ts
      createServerClient(url, key, { cookies: { getAll: from jar, setAll: capture } })
        └─ signInWithPassword() ──> captured cookie triples ──> context.addCookies()
                          │
  e2e/login-screen.spec.ts ──> page (baseURL :3000, gate LOCKED, next dev)
        └─ page.route('**/auth/v1/authorize*') ──> fulfil, assert URL, never reach Google
```

## Related Code Files

**Create:** `e2e/login-screen.spec.ts`, `e2e/support/supabase-session.ts`,
`evidence/red-gate-evidence.md`
**Modify:** `playwright.config.ts` (env loading only — no project or webServer change)
**Delete:** none

## Implementation Steps

1. Add to the top of `playwright.config.ts`:
   `try { process.loadEnvFile('.env.local'); } catch { /* optional in CI */ }`. Change nothing else.
2. Write `e2e/support/supabase-session.ts` exporting
   `seedSupabaseSession(context: BrowserContext, baseURL: string): Promise<void>` implementing the
   capturing-adapter approach above. Map each captured cookie to `{ name, value, url: baseURL, ... }`,
   translating `sameSite`/`path`/`maxAge` from the library's options. Throw a message containing the
   literal token `INFRA:` if the sign-in fails, so an infrastructure failure is never mistaken for a
   screen failure.
3. Write `e2e/login-screen.spec.ts` with `test.beforeEach(seedDefaultSession)` (house pattern) and one
   `describe` per group: Layout & copy (A2–A7, A12), OAuth initiation (A8, A9), Error surface (A10),
   Access control (A11, its own `describe` using a fresh context so the cookie does not leak), Gate
   reachability (A1).
4. Run `npm run test:e2e`. Record the true exit code — do not paraphrase it.
5. Classify every login failure. A valid RED is an assertion or navigation failure on `/login` — today
   that means a redirect to `/prelaunch` (the gate is locked and the exemption does not exist yet) or a
   404. An `INFRA:` message, a `Cannot find module '@supabase/ssr'`, a `connect ECONNREFUSED
   127.0.0.1:54321`, a missing-browser error, or a webServer timeout is **not** a valid RED — fix the
   cause (or return to Phase 1) and re-run.
6. Confirm the pre-existing suites still pass in the same run; a regression there is a defect in this
   phase, not in the app.
7. Write `evidence/red-gate-evidence.md` with `redTestFiles`, `redCommand`, `redExitCode`,
   `redFailure` (the verbatim first failing assertion), and the passing count of the untouched suites.

## Todo List

- [ ] `playwright.config.ts` loads `.env.local` (guarded)
- [ ] `e2e/support/supabase-session.ts` written; `INFRA:` sentinel in place
- [ ] `e2e/login-screen.spec.ts` covering A1–A12
- [ ] `npm run test:e2e` executed; exit code recorded verbatim
- [ ] Every login failure classified as a genuine screen assertion
- [ ] Pre-existing suites still green
- [ ] `evidence/red-gate-evidence.md` complete with the four `red*` fields

## Success Criteria

| # | Observable |
|---|---|
| SC2-1 | `npm run test:e2e` exits non-zero |
| SC2-2 | Every `login-screen.spec.ts` failure names a `/login` assertion or a `/prelaunch` redirect — zero dependency, connection, browser-install or dev-server failures |
| SC2-3 | The pre-existing spec files report the same pass count as before this phase |
| SC2-4 | `evidence/red-gate-evidence.md` carries `redTestFiles`, `redCommand`, `redExitCode`, `redFailure` |
| SC2-5 | A1–A12 each map to at least one named test in the file |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | Cookie options captured from `@supabase/ssr` do not translate cleanly into `context.addCookies` (e.g. `maxAge` vs `expires`, `sameSite` casing) | Med × High | Translate explicitly and assert the round trip inside the helper: after `addCookies`, read `context.cookies()` back and confirm the auth cookie name is present. If it still fails, fall back to research §6 option 2 (admin `generateLink`) — but that needs the secret key, so record it as a scope change, do not slip it in. |
| R2 | The seeded session's `redirect_to`/origin is `localhost:3000` while a cookie is scoped to `127.0.0.1` | Low × High | One host everywhere. `baseURL` is already `http://localhost:3000`; the helper takes `baseURL` as its only origin input. |
| R3 | The RED is dismissed as infrastructure because Supabase is down at run time | Med × High | The `INFRA:` sentinel plus step 5's classification list. A1–A7 and A10 do not touch Supabase at all, so a genuine screen RED exists even if the stack is down. |
| R4 | `page.route` misses the navigation because `signInWithOAuth` uses a top-level `location.assign` | Low × Med | Route patterns apply to navigations too. If the intercept proves unreliable, assert on `page.waitForRequest('**/auth/v1/authorize*')` plus `page.waitForURL` and abort the route instead of fulfilling it. |
| R5 | The new spec accidentally runs under a second project and double-reports | Low × Med | Name the file `login-screen.spec.ts` — it contains neither `homepage`, `invalid-env`, nor `prelaunch-countdown-unlocked`, so exactly one project claims it. Confirm in the reporter output. |
| R6 | Tests are later weakened to make Phase 5 pass | Low × High | Phase 5 may only re-run this command. Any assertion change must be re-argued here and re-evidenced. |

## Security Considerations

- The test process uses the **publishable** key only. No secret/service-role key enters `e2e/**`,
  `playwright.config.ts`, or CI.
- The seeded credentials come from `.env.local` (git-ignored), never inlined into the spec.
- The suite never contacts Google and never handles a real user's tokens.

## Next Steps

Releases Phases 3 and 4 concurrently. Hand both tracks read-only: `redTestFiles`, `redCommand`,
`redExitCode`, `redFailure`, and the accessible-name freeze from `plan.md`.

## Rollback

Delete `e2e/login-screen.spec.ts` and `e2e/support/supabase-session.ts`, revert the one-line
`playwright.config.ts` change. The pre-existing suite is unaffected.
