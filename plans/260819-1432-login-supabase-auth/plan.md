---
title: "Login screen (/login) + local Supabase Google OAuth"
description: "Stand up a real local Supabase stack, build /login from MoMorph, and wire the Google OAuth round trip through @supabase/ssr into Next 16's single proxy.ts."
status: completed
priority: P1
effort: 16h
branch: feat/login-supabase-auth
tags: [momorph, nextjs16, supabase, oauth, google, e2e-red-first, proxy, saa-2025]
created: 2026-08-19
test_policy: e2e-red-first
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: GzbNeVGJHz
  url: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
---

# Login + Supabase Google OAuth — Implementation Plan

Third screen after [`260818-0936-homepage-saa`](../260818-0936-homepage-saa/plan.md) and
[`260819-0913-countdown-prelaunch`](../260819-0913-countdown-prelaunch/plan.md); same stack. First **real**
auth boundary in this app. Scope is the login screen + the session only — route protection and replacing
the mock session are out (`clarifications.md` § Next Steps). Branch is `main`; Phase 1 cuts `feat/login-supabase-auth`.

## Phases

| # | Phase | Owner | Status | Effort | Depends on |
|---|-------|-------|--------|--------|-----------|
| 1 | [Infrastructure — Supabase local stack](phase-01-infrastructure-supabase-local-stack.md) | `implementer` | completed | 3.5h | — |
| 2 | [Strict RED E2E contract](phase-02-strict-red-e2e-contract.md) | `tester` | completed | 2.5h | 1 |
| 3 | [Track A — Presentational UI](phase-03-track-a-presentational-ui.md) | `momorph-ui-implementer` | completed | 4h | 2 |
| 4 | [Track B — Auth behaviour and backend](phase-04-track-b-auth-behaviour-and-backend.md) | `implementer` | completed | 4h | 2 |
| 5 | [GREEN + visual validation](phase-05-green-and-visual-validation.md) | `tester` | completed | 2.5h | 3, 4 |
| 6 | [Integration, docs and review](phase-06-integration-docs-and-review.md) | `reviewer`, `doc-writer` | completed | 1.5h | 5 |

## Integration contract (A ↔ B seam — frozen before either track starts, phases 3 and 4 run concurrently)

| Module (owner) | Export | Shape | Consumed by |
|---|---|---|---|
| `components/login/login-header.tsx` (A) | `LoginHeader` | `() => JSX` — static logo (not a link) + existing `<LanguageSwitcher/>` | `app/login/page.tsx` (B) |
| `components/login/login-main.tsx` (A) | `LoginMain` | `({ children }: { children: ReactNode }) => JSX` — `<main>` carrying the wave key visual + ROOT FURTHER logo; `children` is the intro slot | `app/login/page.tsx` (B) |
| `components/login/login-intro.tsx` (A) | `LoginIntro` | `({ children }: { children: ReactNode }) => JSX` — subtitle + tagline, `children` is the action slot | `app/login/page.tsx` (B) |
| `components/login/login-button.tsx` (A) | `LoginButton` | `'use client'`, `({ loading, onClick }: { loading: boolean; onClick: () => void }) => JSX` — `disabled={loading}`, spinner when loading | `app/login/login-client.tsx` (B) |
| `components/login/login-error-alert.tsx` (A) | `LoginErrorAlert` | `() => JSX` — `role="alert"`, renders `t('login.error')` | `app/login/login-client.tsx` (B) |
| `components/login/login-footer.tsx` (A) | `LoginFooter` | `() => JSX` — centred `t('footer.copyright')` (existing key, reused verbatim) | `app/login/page.tsx` (B) |
| `lib/i18n/dictionaries/{vi,en}.ts` (A) | `login.subtitle`, `login.tagline`, `login.button`, `login.error` | strings, copy verbatim from `clarifications.md` | Track A components |
| `lib/supabase/client.ts` (B) | `createClient()` | browser client from `@supabase/ssr` | `app/login/login-client.tsx` (B only) |

**Accessible-name freeze** (what Phase 2 asserts; neither track may rename these): button accessible name
`LOGIN With Google`; header logo `<img alt="Sun* Annual Awards 2025">` with no link/button ancestor; hero logo
`<img alt="ROOT FURTHER">`; error region `getByRole('alert')` reading exactly `Đăng nhập không thành công.
Vui lòng thử lại.`; language selector is the unmodified `LanguageSwitcher`.

**Env-name freeze:** app code reads `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
whichever key flavour `supabase start` emits — Phase 1 records the value, Phase 4 never learns the flavour.

## File ownership (disjoint — no two phases share a file)

| Phase | Owns |
|-------|------|
| 1 | `supabase/**`, `package.json`, `package-lock.json`, `.env.example`, `.gitignore` |
| 2, 5 | `e2e/**`, `playwright.config.ts` |
| 3 | `components/login/**`, `lib/i18n/dictionaries/{vi,en}.ts`, `public/saa/Login_Keyvisual.png`, `public/saa/Google_Mark.svg` |
| 4 | `app/login/**`, `app/auth/**`, `lib/supabase/**`, `lib/prelaunch/gate.ts`, `lib/prelaunch/gate.test.ts`, `proxy.ts` |
| 6 | `docs/**`, `plans/260819-1432-login-supabase-auth/**` |

**Touched by nobody:** `app/layout.tsx`, `app/{page,awards,kudos,profile,admin,prelaunch}`, `components/{home,layout,prelaunch,ui}/**`, `lib/{session,countdown.ts,i18n/locale-provider.tsx}`, `next.config.ts`.

## Key dependencies and constraints

- **Next 16 loads exactly one `proxy.ts`.** Supabase session refresh is *merged into* the existing
  prelaunch gate file. Refresh first, gate second, and copy refreshed cookies onto any redirect
  response or the session silently drops (Phase 4 risk R1).
- **Google client ID/secret are not supplied yet.** Phase 1 must bring the stack up on placeholders and
  *prove* it did — the E2E never contacts Google (`page.route` intercepts `/auth/v1/authorize`).
- **Docker/colima 29.2.0 and supabase CLI 2.115.0 are up** (verified), but `supabase start` stays a
  human prerequisite for re-running the suite — documented in Phase 6.
- `getUser()` never `getSession()` server-side; every URL standardized on `http://localhost:3000`
  (`additional_redirect_urls` matches by exact string). `clarifications.md` is authoritative on every
  visual value. Files under 200 lines. Rollback is a per-phase revert; reverting Phase 4 alone restores
  the app to its pre-auth behaviour.
