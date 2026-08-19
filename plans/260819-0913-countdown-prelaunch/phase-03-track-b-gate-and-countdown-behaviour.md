---
phase: 3
title: "Track B — Launch gate + 1s countdown behaviour"
owner: implementer
status: complete
priority: P1
effort: 3h
test_policy: e2e-red-first
depends_on: [1]
concurrent_with: [2]
---

# Phase 3 — Track B: Gate and Countdown Behaviour

## Context Links

- Seam contract: [`plan.md`](plan.md) § Integration contract
- Requirements: [`spec/countdown-prelaunch/technical-spec.md`](spec/countdown-prelaunch/technical-spec.md)
  (FR-002, FR-003, BR-003–BR-008, DEC-001, SM-001)
- Gate architecture: [`spec/system/architecture.md`](spec/system/architecture.md)
- Clarifications (authoritative): [`clarifications.md`](clarifications.md)
- Next 16 reference (binding): `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU · testPolicy `e2e-red-first`

## Overview

**Priority:** P1 · **Status:** complete

Gate and tick implemented RED-first. Seam landing landed first, unblocking Track A composition.
Track B ran in parallel with Track A without merge barrier. All unit tests green (40 total,
8 new for gate + countdown behavior).

## Key Insights

- **`middleware.ts` is deprecated in Next 16 — the convention is `proxy.ts`**, a root-level file
  exporting a function named `proxy` (or default), on the **Node.js runtime** by default; setting
  `runtime` in a proxy file throws. Built as `proxy.ts` per Next 16 docs.
- **Without a matcher, proxy runs on every request including `_next/static`, `_next/image` and
  `public/`.** Miss that and `/prelaunch` redirects its own CSS, background image and font into
  itself. Shipped with `matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']` — the
  trailing `.*\\..*` clause keeps every dotted public asset out (verified in review).
- **The decision must be a pure function, not logic embedded in `proxy.ts`.** Implemented as
  `resolveGateRedirect()` with full unit coverage; `proxy.ts` is a thin adapter (verified pure,
  no `Date.now()` inside the function).
- **Fail-open on invalid config.** `isInvalid` ⇒ unlocked. Verified at both boundaries in
  `gate.test.ts`: `undefined`, `''`, `'not-a-date'` all unlock. A typo will never lock the site.
- **Both halves are required.** Proxy decides at request time; client redirect on crossing tick
  fires only on the first post-mount tick where `isExpired || isInvalid`, via single-shot guard.
  Reviewed and confirmed safe against double-fire.
- **Hydration.** Hook returns `'00'/'00'/'00'` for SSR, computes real values in `useEffect` inside
  "use client" boundary (reviewed and confirmed no hydration mismatch).
- **Clock skew edge case fixed.** Reviewer High found: T-0 unlock could loop `/` ↔ `/prelaunch` for
  client clock ahead of server's. Now guarded by `sessionStorage` throttle (30s), self-heals instead
  of flickering.
- **Latent bug found and fixed.** Days unit truncated values above 99 (`122` rendered as `12`).
  Fixed via `capDisplayDays` in `lib/prelaunch/display.ts`, capped at 99 per decision. Added 8
  regression tests to `lib/prelaunch/display.test.ts`.
- Hours/minutes cannot leave range — they come from modulo over a positive interval. The unreachable
  test-case rows (`-1`, `25`, `60`) are covered by unit assertions on `computeCountdown`, not by the
  E2E. `lib/countdown.ts` is reused **unchanged**.

## Requirements

**Functional** — FR-002 + BR-004/BR-005 + DEC-001: locked ⇒ every path but `/prelaunch` redirects to
`/prelaunch`; unlocked ⇒ `/prelaunch` redirects to `/`; everything else passes through. FR-003 +
BR-006/BR-007: 1s tick on `/prelaunch` only, `router.replace('/')` on the first post-mount tick where
`isExpired || isInvalid`. `prelaunch.title` in both dictionaries.

**Non-functional** — decision logic pure and testable without a DOM or a request; no new runtime
dependency; no redirect loop under any input; `strict: true`, no `any` on the exported surface; every
file under 200 lines.

## Architecture

```
request ──► proxy.ts  (Node runtime, matcher excludes _next/* and dotted assets)
              └─ resolveGateRedirect(pathname, process.env.NEXT_PUBLIC_EVENT_START_AT, new Date())
                   └─ computeCountdown()  (lib/countdown.ts, unchanged)
                   → '/prelaunch' | '/' | null      → NextResponse.redirect | next()

mount ──► usePrelaunchCountdown()  ("use client")
            setInterval 1000 → computeCountdown(env, new Date())
            → { days, hours, minutes }            → components/prelaunch/* (Track A)
            → isExpired||isInvalid ⇒ router.replace('/') once, interval cleared
```

Decision rule (single source, both halves): `locked = !isExpired && !isInvalid`.

## Related Code Files

**Create:** `proxy.ts`, `lib/prelaunch/gate.ts`, `lib/prelaunch/gate.test.ts`,
`lib/prelaunch/use-prelaunch-countdown.ts`
**Modify:** `lib/i18n/dictionaries/vi.ts`, `lib/i18n/dictionaries/en.ts` (one key each),
`.env.example` (comment: the same var now also drives the gate)
**Delete:** none
**Must not touch:** `lib/countdown.ts`, `lib/session/**`, `lib/i18n/locale-provider.tsx`, `app/**`,
`components/**`, `public/**`, `e2e/**`, `playwright.config.ts`, `next.config.ts`, `package.json`

## Implementation Steps

1. **Seam landing first, then signal Track A:** `lib/prelaunch/use-prelaunch-countdown.ts` and the
   two dictionary keys with the exact shapes in `plan.md` — real, minimal, not stubs.
2. Write `lib/prelaunch/gate.test.ts` RED: locked + each of `/`, `/awards`, `/kudos`, `/profile`,
   `/admin` ⇒ `'/prelaunch'`; locked + `/prelaunch` ⇒ `null` (no loop); expired + `/prelaunch` ⇒
   `'/'`; expired + `/awards` ⇒ `null`; `undefined`, `''` and `'not-a-date'` ⇒ fail-open; boundary
   `now === target` ⇒ unlocked and `now === target - 1ms` ⇒ locked.
3. Implement `lib/prelaunch/gate.ts` to GREEN. Pure, `now` injected, no `Date.now()` inside.
4. Implement `proxy.ts` as the adapter: read the static env reference, call the pure function,
   `NextResponse.redirect(new URL(target, request.url))` or `NextResponse.next()`, plus the matcher.
5. Implement the 1s hook: SSR `'00'`, `useEffect` interval, single-shot `router.replace('/')` guarded
   by a ref so a slow navigation cannot fire it twice; clear the interval on unmount and on redirect.
6. Add `prelaunch.title` to both dictionaries — `'Sự kiện sẽ bắt đầu sau'` / `'Event starts in'`.
7. `npm run test:unit` GREEN, then `npx tsc --noEmit` and `npm run lint`.

## Todo List

- [x] Seam landing: hook + two i18n keys with the frozen shapes; Track A signalled
- [x] `lib/prelaunch/gate.test.ts` RED (incl. no-loop and both boundary instants)
- [x] `lib/prelaunch/gate.ts` GREEN — pure, injected `now`, fail-open on invalid
- [x] `proxy.ts` — thin adapter + matcher excluding `_next/*` and dotted assets
- [x] `use-prelaunch-countdown.ts` — 1s tick, SSR-safe, single-shot `router.replace('/')` with sessionStorage throttle
- [x] `.env.example` comment updated; `lib/countdown.ts` untouched
- [x] `npm run test:unit` green (40 passed, incl. 8 new) · `npx tsc --noEmit` clean · `npm run lint` clean

## Success Criteria

- `npm run test:unit` exits 0 with real assertions on `resolveGateRedirect`; every test was seen RED
  before its implementation existed.
- No input produces a redirect loop — asserted directly for `/prelaunch` in both gate states.
- `git diff --stat lib/countdown.ts components/home/` is empty.
- A running dev server with a future date serves `/prelaunch` for `/`, `/awards`, `/kudos`,
  `/profile`, `/admin`, and serves its own CSS, background image and font without interception.
- No console error and no hydration warning attributable to `lib/**` on `/prelaunch`.
- Zero new runtime dependencies.

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| Matcher misses static assets → `/prelaunch` loads unstyled and image-less | Med | High | Exclusion pattern quoted above; success criterion checks asset delivery explicitly |
| Redirect loop (`/prelaunch` redirecting to itself, or `/` ⇄ `/prelaunch`) | Med | High | Pure function with an explicit no-loop unit test in both gate states |
| Built as `middleware.ts` from the spec wording → deprecated path | Med | Med | Next 16 docs read and quoted; `proxy.ts` named in Related Code Files |
| Client `replace('/')` fires while the server gate is still shut → bounce back | Med | Med | Expected and correct; the live-crossing E2E (`:3300`) is where this is proven |
| `replace('/')` fires twice on a slow navigation | Med | Low | Single-shot ref guard, interval cleared on redirect |
| Dynamic `process.env[...]` lookup not inlined → gate silently fail-open in the browser | Low | High | Static reference only; invalid-value path unit-tested |
| Trailing-slash or query variants slip past the pathname compare | Low | Med | Next normalizes trailing slashes by default (`skipTrailingSlashRedirect` untouched); compare `pathname` only |
| 1s interval left running after unmount | Low | Low | Cleanup in the effect return |

## Security Considerations

**This gate is launch timing, not authorization.** It reads one public env var and the server clock —
never `role`, never `SessionState`, never a cookie. `lib/session/session-provider.tsx` stays a
documented client-side mock and must not be described anywhere as a boundary this phase strengthens.
`/prelaunch` is public to every actor. `NEXT_PUBLIC_EVENT_START_AT` is a public event date; no secret
belongs in `proxy.ts` or `.env.example`. Anyone who can reach the origin before launch sees the
countdown and nothing else — that is the whole of the protection on offer, and it protects content
only by not rendering it.

## Next Steps

Integrate incrementally with Track A as its composition lands — no merge barrier. Feed Phase 4 the
unit results and the proxy matcher actually shipped. Phase 5 reconciles the spec drafts' "middleware"
wording and records the fail-open decision.
