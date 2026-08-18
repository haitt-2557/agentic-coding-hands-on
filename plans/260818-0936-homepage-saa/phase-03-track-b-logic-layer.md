---
phase: 3
title: "Track B — Logic layer (countdown, awards data, session, i18n)"
owner: implementer
status: completed
priority: P1
effort: 4h
test_policy: e2e-red-first
depends_on: [1]
concurrent_with: [2]
---

# Phase 3 — Track B: Logic Layer

## Context Links

- Seam contract: [`plan.md`](plan.md) § Integration contract
- Requirements: [`spec/homepage-saa/technical-spec.md`](spec/homepage-saa/technical-spec.md)
  (FR-001/002/003/006/007/008/013/014/015, BR-001–BR-008, ALG-001, SM-001, DISC-001)
- Clarifications (authoritative): [`clarifications.md`](clarifications.md)
- Edge cases: [`spec/homepage-saa/edge-cases.md`](spec/homepage-saa/edge-cases.md)
- Permissions + security caveat: [`spec/system/permissions.md`](spec/system/permissions.md)
- Next 16 env constraints: [`research/researcher-01-nextjs16-conventions.md`](research/researcher-01-nextjs16-conventions.md) §2, §8
- Unit runner: `playwright.unit.config.ts` (created in Phase 1) — `npm run test:unit`
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM · testPolicy `e2e-red-first`

## Overview

**Priority:** P1 · **Status:** pending

Implement the four seam modules Track A consumes, RED-first. Runs concurrently with Phase 2;
its **first** deliverable is the contract landing that unblocks Track A's wiring step.

## Key Insights

- `NEXT_PUBLIC_EVENT_START_AT` is inlined at server-process start and cannot change mid-run. Read it
  through a **static** `process.env.NEXT_PUBLIC_EVENT_START_AT` reference — a dynamic lookup is not
  inlined and silently yields `undefined` in the browser.
- `computeCountdown(targetIso, now)` is **pure** and takes `now` as an argument — that is what makes
  it unit-testable and what lets the E2E's Clock API drive it deterministically. No `Date.now()`
  inside. Compute from epoch-millisecond arithmetic; never do local-timezone date math.
- `isInvalid` and `isExpired` both render the same zero state (KISS — the UI does not distinguish
  them), but they stay separate fields so the caller can tell them apart if that ever changes.
- **Hydration is the sharp edge.** `localStorage` does not exist on the server. Both providers must
  render the SSR default (`guest`, `vi`) and reconcile inside `useEffect` after mount — reading
  `localStorage` during render produces a hydration mismatch and a console error the E2E will catch.
- Seed precedence, both providers: `localStorage` → `NEXT_PUBLIC_*` env → hard default. Keys:
  `saa.mock-role`, `saa.mock-unread`, `saa.locale`. Env: `NEXT_PUBLIC_MOCK_ROLE`,
  `NEXT_PUBLIC_MOCK_UNREAD_COUNT`. This is what lets one dev server cover guest/user/admin and
  vi/en via `page.addInitScript()`, instead of four more `webServer` entries.
- `serverRuntimeConfig`/`publicRuntimeConfig` were **removed** in Next 16 — env vars only.
- `AWARDS` carries the six slugs verbatim: `top-talent`, `top-project`, `top-project-leader`,
  `best-manager`, `signature-2025-creator`, `mvp`. Titles/descriptions/images come from the frame.
- BR-005: a card without a valid slug links to `/awards` with no hash and no auto-scroll (ID-62).
- `next.config.ts` is touched **only** if Track A reports an asset need (`images.qualities` beyond
  75, or `images.localPatterns[].search` for a query-stringed local asset). Otherwise leave it alone.

## Requirements

**Functional**
- FR-006/007/008 + BR-001/002/003 + ALG-001 — countdown: 2-digit pad, minute cadence, zero state on
  expiry, safe fallback on an unparseable env value with no throw.
- FR-002/015 + BR-006 — `vi` and `en` dictionaries covering all homepage copy; exactly two locales;
  choice persisted to `localStorage`.
- FR-003 + BR-007/008 + DISC-001 — session context resolving `guest | user | admin` plus
  `unreadCount`; no backend, no network call.
- FR-013/014 + BR-005 — `AWARDS` data and the slug→href derivation, including the missing-slug path.

**Non-functional**
- Pure logic separated from React so `computeCountdown` is testable without a DOM.
- No new runtime dependency (hand-rolled i18n was chosen over `next-intl` per clarifications).
- Every file under 200 lines. `strict: true` holds; no `any` on the exported surface.

## Architecture

```
process.env.NEXT_PUBLIC_EVENT_START_AT ──► lib/countdown.ts
                                            computeCountdown(targetIso, now)
                                            → { days, hours, minutes, isExpired, isInvalid }
                                                     ▲ pure; `now` injected
localStorage['saa.mock-role' | 'saa.mock-unread']  ──► lib/session/session-provider.tsx
  ↳ fallback NEXT_PUBLIC_MOCK_ROLE / _UNREAD_COUNT       useSession() → { role, unreadCount }
  ↳ fallback 'guest' / 0                                 (SSR default until mounted)

localStorage['saa.locale'] ──► lib/i18n/locale-provider.tsx ──► useI18n() → { t, locale, setLocale }
  ↳ fallback 'vi'                    ↑ lib/i18n/dictionaries/{vi,en}.ts  (same key set, both typed)

lib/awards.ts → AWARDS: { slug, title, description, image }[6]
```

Track A consumes all four; Track B renders nothing. Data flow is one-way: env/localStorage → lib →
hook → component.

## Related Code Files

**Create:** `lib/countdown.ts`, `lib/countdown.test.ts`, `lib/awards.ts`, `lib/awards.test.ts`,
`lib/session/session-provider.tsx`, `lib/i18n/locale-provider.tsx`,
`lib/i18n/dictionaries/vi.ts`, `lib/i18n/dictionaries/en.ts`, `.env.example`
**Modify:** `next.config.ts` — only on an asset request from Track A
**Delete:** none
**Must not touch:** `app/**`, `components/**`, `public/**`, `e2e/**`, `playwright*.config.ts`,
`package.json`, `package-lock.json`

## Implementation Steps

1. **Contract landing (do this first, then signal Track A):** create the four seam modules exporting
   the exact signatures in `plan.md` — real implementations, minimal but not stubs — so Track A's
   imports and typecheck resolve.
2. Write `lib/countdown.test.ts` RED first: pad-to-2 (ID-40), days/hours/minutes split from a fixed
   `now` (ID-12, ID-56, ID-57), `isExpired` at and after the target (ID-41/42), `isInvalid` on empty
   and on `not-a-date` (ID-60), no throw on any input. Then implement `lib/countdown.ts` to GREEN.
3. Write `lib/awards.test.ts` RED: exactly six entries, exact slug list, unique slugs, non-empty
   title/description/image, and the missing-slug href fallback (ID-62). Then implement `lib/awards.ts`.
4. Implement `lib/session/session-provider.tsx`: `"use client"`, SSR default `guest`/`0`, reconcile
   from `localStorage` then env inside `useEffect`, expose `useSession()`.
5. Implement `lib/i18n/locale-provider.tsx` + the two dictionaries: `"use client"`, SSR default `vi`,
   reconcile from `localStorage` in `useEffect`, `setLocale` writes back. Both dictionaries share one
   key union type so a missing translation is a compile error.
6. Write `.env.example` with `NEXT_PUBLIC_EVENT_START_AT=2026-12-19T18:30:00+07:00` (~90 days out, so
   dev shows "Coming soon" and non-zero digits) plus the two mock-session vars, each commented.
7. Run `npm run test:unit` GREEN, then `npx tsc --noEmit` and `npm run lint`.

## Todo List

- [x] Contract landing: four modules with the frozen signatures; Track A signalled
- [x] `lib/countdown.test.ts` RED → `lib/countdown.ts` GREEN
- [x] `lib/awards.test.ts` RED → `lib/awards.ts` GREEN (six slugs exact)
- [x] `lib/session/session-provider.tsx` — SSR-safe, `useEffect` reconcile
- [x] `lib/i18n/locale-provider.tsx` + `dictionaries/{vi,en}.ts` — shared key type
- [x] `.env.example` with all three `NEXT_PUBLIC_*` vars, commented
- [x] `npm run test:unit` green · `npx tsc --noEmit` clean · `npm run lint` clean

## Success Criteria

- `npm run test:unit` exits 0 with real assertions on `computeCountdown` and `AWARDS`; every failing
  test was seen RED before its implementation existed.
- Countdown logic: **ID-12, ID-39, ID-40, ID-41, ID-42, ID-43, ID-56, ID-57, ID-60**.
- Awards data + navigation logic: **ID-47, ID-48, ID-49, ID-50, ID-52, ID-62**.
- i18n: **ID-25, ID-26, ID-58**.
- Session / role gating source: **ID-0, ID-1, ID-5, ID-6, ID-11, ID-28, ID-29, ID-36, ID-37, ID-38**.
- Not built: **ID-14** (stale).
- No console error and no hydration warning attributable to `lib/**` when the page loads.
- Zero new runtime dependencies in `package.json` (which this phase does not own anyway).

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| `localStorage` read during render → hydration mismatch, console error, flaky E2E | High | High | SSR default + `useEffect` reconcile; assert no hydration warning before handoff |
| Signature drift from the frozen seam breaks Track A mid-flight | Med | High | Contract landing is step 1 and the signatures are quoted in `plan.md`; any change is a plan amendment, not a local edit |
| Timezone math skews the countdown across DST or a non-`+07:00` client | Med | Med | Epoch-millisecond arithmetic only; test with an explicit offset in the ISO input |
| Dynamic `process.env[...]` lookup is not inlined → `undefined` in the browser | Med | High | Static reference only; a test asserts the invalid-value path still degrades safely |
| Dictionaries drift apart and a key renders blank | Med | Med | Shared key union type — a missing key fails typecheck |
| `next.config.ts` edited speculatively and `next build` breaks | Low | Med | Touch it only on an explicit Track A asset request |
| Mock role read as real authorization | Med | High | See Security Considerations; documented at the module and in the ADR |

## Security Considerations

`SessionProvider` is a **client-side mock and not a security boundary**. Role comes from
`localStorage`/`NEXT_PUBLIC_*` — anyone can set `saa.mock-role` to `admin` from DevTools. Nothing in
this phase authenticates, authorizes or gates a request; there is no server layer to gate. The
capability matrix in `spec/system/permissions.md` governs UI visibility only, and must be
re-implemented server-side when real auth lands. Keep a comment saying exactly this at the top of
`session-provider.tsx`. Only public values carry the `NEXT_PUBLIC_` prefix; `.env.example` holds
placeholders, never real secrets, and no `.env*` file beyond `.env.example` gets committed.

## Next Steps

Integrate incrementally with Track A as its wiring lands — no merge barrier. Feed Phase 4 the unit
results and any behaviour note affecting the GREEN rerun. ADR-001 (why the session is mocked, why
i18n is hand-rolled, what should trigger replacing each) is authored by `doc-writer` in Phase 5.
