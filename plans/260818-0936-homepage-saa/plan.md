---
title: "Homepage SAA 2025 — phased implementation"
description: "Build the SAA 2025 homepage on Next 16 App Router under e2e-red-first: strict RED gate, then concurrent presentational and logic tracks, then GREEN + visual validation."
status: complete
priority: P1
effort: 15h
branch: feat/homepage-saa
tags: [momorph, nextjs16, tailwind4, e2e-red-first, homepage, saa-2025]
created: 2026-08-18
test_policy: e2e-red-first
spec_promoted: docs/vi/features/homepage-saa/
system_drafts_promoted: docs/vi/system/
system_drafts: [architecture.md, permissions.md]
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: i87tDx10uM
  url: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
---

# Homepage SAA 2025 — Implementation Plan

Route `/` on a bare `create-next-app` scaffold (next 16.3.1, react 19.2.8, tailwind v4 CSS-first,
eslint 9 flat, npm). Hero "ROOT FURTHER" + countdown, Root Further copy, 6-card awards grid, Kudos
promo, floating widget, header/footer. No backend — mock client session, hand-rolled `vi`/`en`
dictionaries, countdown from `NEXT_PUBLIC_EVENT_START_AT`.

## Phases

| # | Phase | Owner | Status | Effort | Depends on |
|---|-------|-------|--------|--------|-----------|
| 1 | [Strict RED E2E contract](phase-01-strict-red-e2e-contract.md) | `tester` | completed | 2h | — |
| 2 | [Track A — Presentational UI](phase-02-track-a-presentational-ui.md) | `momorph-ui-implementer` | completed | 6h | 1 |
| 3 | [Track B — Logic layer](phase-03-track-b-logic-layer.md) | `implementer` | completed | 4h | 1 |
| 4 | [GREEN + visual validation](phase-04-tester-green-and-visual-validation.md) | `tester` | completed | 2h | 2, 3 |
| 5 | [Integration + review](phase-05-integration-and-review.md) | `reviewer`, `doc-writer` | completed | 1h | 4 |

Phase 1 is a **hard gate**: no implementation starts until it yields a valid RED — a real non-zero exit
from a screen assertion, never a dependency, config, browser-install, dev-server, port or TS-compile
failure. Phases 2 and 3 then run **concurrently**, no merge barrier between them.

## Integration contract (A ↔ B seam — frozen before either track starts)

| Module | Export | Shape | Consumed by |
|--------|--------|-------|-------------|
| `lib/session/session-provider.tsx` | `useSession()` | `{ role: 'guest'\|'user'\|'admin', unreadCount: number }` | `components/layout/site-header.tsx`, `components/ui/{notification-bell,account-menu}.tsx` |
| `lib/i18n/locale-provider.tsx` | `useI18n()` | `{ t(key: string): string, locale: 'vi'\|'en', setLocale(l): void }` | every copy-bearing component |
| `lib/awards.ts` | `AWARDS` | 6 × `{ slug, title, description, image }`; slugs `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp` | `components/home/{awards-section,award-card}.tsx`, `app/awards/page.tsx` |
| `lib/countdown.ts` | `computeCountdown(targetIso, now)` | `{ days, hours, minutes, isExpired, isInvalid }` — pure | `components/home/countdown-timer.tsx` |

**Seam handshake** — the only ordering constraint inside the concurrent window: Track B lands these four modules with the exact signatures above *first*; Track A builds leaf-first, wires `app/{layout,page}.tsx` last, and never creates `lib/` files to unblock itself.

## File ownership (disjoint — no two phases share a file)

| Phase | Owns |
|-------|------|
| 1, 4 | `e2e/**`, `playwright.config.ts`, `playwright.unit.config.ts`, `package.json`, `package-lock.json`, `.gitignore` |
| 2 | `app/**` (incl. `globals.css`), `components/**` (incl. `ui/dropdown-menu.tsx`), `public/**` |
| 3 | `lib/**` (incl. `lib/*.test.ts`), `.env.example`, `next.config.ts` |

## Key dependencies and constraints

- `clarifications.md` is authoritative — 16 decisions, copy precedence, 4 design defects. **TC ID-14 is STALE.** Frame wins on copy/layout; CSV + the 62 test cases win on behavior, states and logic.
- Next 16: `priority` → `preload`; `viewport`/`themeColor` in their own `export const viewport`;
  `data-scroll-behavior="smooth"` on `<html>` or hash-anchor smooth scroll silently dies.
- Tailwind v4 CSS-first — extend `@theme inline`, no `tailwind.config.ts`; scaffold tokens replaced.
- Assets: 35 MoMorph media nodes only, no stock or placeholders. Files stay under 200 lines.
- Branch `feat/homepage-saa` off `main` before Phase 1; rollback is a per-phase revert.

## Delivery notes

**Resolved during delivery:** the frame's footer link "Tiêu chuẩn chung" ships as a non-anchor `<span>` (no target exists yet — design owes one); the award-card 2-line clamp is CSS `line-clamp-2`.

**Changed from the original plan:**

1. **Placeholder routes** — `/profile` and `/admin` added to resolve 404s from the account menu.
2. **E2E spec refactor** — `e2e/homepage.spec.ts` split into 7 per-concern files plus `e2e/support/seed-defaults.ts`, to satisfy the under-200-lines constraint.
3. **`eslint.config.mjs`** — `.claude/**`, `plans/**`, `test-results/**`, `playwright-report/**` added to `globalIgnores`; `npm run lint` is a bare `eslint` and without them the gate is ~983 kit findings deep and can never be green.
4. **Two E2E assertions made falsifiable at review** — ID-59 now resolves every internal href (was: counted them); ID-60 now asserts the collected `pageerror` list is empty, listener attached before `goto` (was: collected, never read). Both proven to fail against a deliberately broken build before being accepted.
5. **Docs land under `docs/vi/`**, not `docs/` — `primary_lang: vi` resolves the spec root per language. `docs/decisions/` stays at the root by design.
