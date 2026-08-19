---
title: "Countdown Prelaunch screen + app-wide launch gate"
description: "Build /prelaunch (DAYS/HOURS/MINUTES, 1s tick) and a whole-app proxy gate that holds every other route until the countdown crosses zero, under e2e-red-first."
status: complete
priority: P1
effort: 12h
branch: feat/countdown-prelaunch
tags: [momorph, nextjs16, proxy-gate, tailwind4, e2e-red-first, prelaunch, saa-2025]
created: 2026-08-19
test_policy: e2e-red-first
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: 8PJQswPZmU
  url: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
---

# Countdown Prelaunch — Implementation Plan

Sibling of [`260818-0936-homepage-saa`](../260818-0936-homepage-saa/plan.md), same stack (next 16.3.1,
react 19, tailwind v4 CSS-first, @playwright/test 1.62.1). Two deliverables: route `/prelaunch`
(full-viewport background + title + three LED digit pairs, 1s tick, no seconds unit) and an app-wide
launch-timing gate holding every other route until the countdown crosses zero — then it reverses and
`/prelaunch` redirects to `/`. **Launch timing, not authorization**; the mock session is read nowhere.

## Phases

| # | Phase | Owner | Status | Effort | Depends on |
|---|-------|-------|--------|--------|-----------|
| 1 | [RED gate — contract reconciliation](phase-01-red-gate-contract-reconciliation.md) | `tester` | complete | 2h | — |
| 2 | [Track A — Presentational UI](phase-02-track-a-presentational-ui.md) | `momorph-ui-implementer` | complete | 4h | 1 |
| 3 | [Track B — Gate + countdown behaviour](phase-03-track-b-gate-and-countdown-behaviour.md) | `implementer` | complete | 3h | 1 |
| 4 | [GREEN + visual validation](phase-04-green-and-visual-validation.md) | `tester` | complete | 2h | 2, 3 |
| 5 | [Integration + review](phase-05-integration-and-review.md) | `reviewer`, `doc-writer` | in-progress | 1h | 4 |

All phases delivered. Phase 5 (docs) in progress with `doc-writer`. RED evidence repaired in two iterations
(Feb. round 1 rejected; orchestrator applied fixes; Phase 1 re-proven valid round 2). Phases 2 and 3 ran
concurrently, no merge barrier, as planned. Track B landed seam first, unblocking Track A composition.

## Integration contract (A ↔ B seam — frozen before either track starts)

| Module | Export | Shape | Consumed by |
|--------|--------|-------|-------------|
| `lib/prelaunch/gate.ts` | `resolveGateRedirect(pathname, targetIso, now)` | `'/prelaunch' \| '/' \| null` — pure, no `Date.now()` inside | `proxy.ts`, `lib/prelaunch/gate.test.ts` |
| `lib/prelaunch/use-prelaunch-countdown.ts` | `usePrelaunchCountdown()` | `{ days: string; hours: string; minutes: string }` — `"use client"`, 1s tick, SSR value `'00'/'00'/'00'`, fires `router.replace('/')` on the first post-mount tick where `isExpired \|\| isInvalid` | `components/prelaunch/prelaunch-countdown.tsx` |
| `lib/i18n/dictionaries/{vi,en}.ts` | `'prelaunch.title'` | `'Sự kiện sẽ bắt đầu sau'` / `'Event starts in'` | `components/prelaunch/prelaunch-countdown.tsx` |

`lib/countdown.ts` is reused **unchanged** — gate and display read one `computeCountdown()` result,
so they cannot disagree on the target instant. **Seam handshake:** Track B lands these three modules
first (real, minimal, not stubs), then signals Track A; Track A builds leaves first and never creates
a `lib/**` file to unblock itself.

## File ownership (disjoint — no two phases share a file)

| Phase | Owns |
|-------|------|
| 1, 4 | `e2e/**`, `playwright.config.ts` |
| 2 | `app/prelaunch/**`, `components/prelaunch/**`, `app/globals.css`, `public/fonts/**`, `public/saa/Prelaunch_*` |
| 3 | `proxy.ts`, `lib/prelaunch/**`, `lib/i18n/dictionaries/{vi,en}.ts`, `.env.example` |
| 5 | `docs/**`, `plans/260819-0913-countdown-prelaunch/**` |

**Touched by nobody:** `app/layout.tsx`, `app/page.tsx`, `app/{awards,kudos,profile,admin}/page.tsx`,
`components/home/**` (60s tick deliberate), `lib/{countdown.ts,session/**,i18n/locale-provider.tsx}`,
`next.config.ts`, `package.json`.

## Key dependencies and constraints

- **Next 16 renamed `middleware.ts` → `proxy.ts`** (deprecated; Node.js runtime; exported function
  named `proxy`) — verified in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
  Built as `proxy.ts`; wording corrected in Phase 5 spec promotions. Its matcher **must** exclude
  `_next/static`, `_next/image`, favicon and every `public/` asset, or `/prelaunch` breaks its own
  CSS, background image and font.
- **The gate breaks the existing homepage suite** — port 3000 is future-dated, so every homepage spec
  on it will redirect to `/prelaunch`. Phase 1 re-pointed the projects to `:3200`.
- Fail-open on a missing/unparseable `NEXT_PUBLIC_EVENT_START_AT` — a config typo must never lock the
  site permanently. Verified in `gate.test.ts` and confirmed in review.
- **"Digital Numbers" font is not supplied.** `@font-face` → `public/fonts/digital-numbers.woff2`
  behind a fallback stack; the browser degrades on its own and the swap-in is dropping the file in.
  Still open.
- Sub-1512px responsive is **derived, not designed**: one proportional `clamp()` scale to a 375px
  floor, three units on one row, legibility floors on text. Verified in capture at 1512/768/375.
  Responsive floors retuned by orchestrator to hold 45% of frame size below ~680px.
- `clarifications.md` is authoritative on every visual value. Files under 200 lines. Rollback is a
  per-phase revert; reverting `proxy.ts` alone restores full navigation.
