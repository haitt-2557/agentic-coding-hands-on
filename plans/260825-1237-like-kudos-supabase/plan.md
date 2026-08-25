---
title: "Thả tim Kudos — lượt like thật lưu trên Supabase"
description: "Biến nút tim trên live board từ useState thành lượt thả tim có thật: bảng kudos_likes + RLS, sổ cái tim theo người gửi, cầu nối auth.uid() ↔ profile slug."
status: done
priority: P1
effort: 9h
branch: main
work_type: feature
spec: docs/vi/features/F015_LikeKudos/
system_docs_draft:
  - plans/260825-1237-like-kudos-supabase/spec/system/architecture.md
  - plans/260825-1237-like-kudos-supabase/spec/system/permissions.md
tags: [kudos, supabase, rls, e2e-red-first, momorph]
created: 2026-08-25
completed: 2026-08-25
---

# Thả tim Kudos (like) — Supabase persistence trên Live board

**Screen:** Sun* Kudos - Live board · `MaZUn5xHXZ` · **testPolicy:** `e2e-red-first`
**Authoritative:** [technical-spec](spec/like-kudos/technical-spec.md) · [edge-cases](spec/like-kudos/edge-cases.md) · [clarifications](clarifications.md) · [architecture](spec/system/architecture.md) · [permissions](spec/system/permissions.md)

RED already achieved (`evidence/red-evidence.json`): `npx playwright test --project=kudos-board e2e/kudos-board-like-persistence.spec.ts` → exit 1, three behavioural failures (SC-001, SC-003, SC-004). These phases turn that GREEN.

## Phases

| # | Phase | Status | Depends on | Parallel with | Owns |
|---|-------|--------|-----------|---------------|------|
| 01 | [Migration: tables, RLS, grants](phase-01-kudos-likes-migration.md) | done | — | — | `supabase/migrations/*_kudos_likes*.sql` |
| 02 | [Seed: identity bridge + author map](phase-02-seed-identity-bridge-and-author-map.md) | done | 01 | 03 | `supabase/seed.sql` |
| 03 | [Server data layer: queries, ledger, toggle](phase-03-server-data-layer-likes-and-ledger.md) | done | 01 | 02 | `lib/kudos/likes/*`, `lib/kudos/viewer-identity.ts`, `lib/supabase/current-user.ts` |
| 04 | [Wire server page + likes provider](phase-04-server-page-wiring-and-likes-provider.md) | done | 02, 03 | — | `app/kudos/page.tsx`, `components/kudos/likes-provider.tsx`, `components/kudos/kudos-board.tsx` |
| 05 | [Heart button on persisted state](phase-05-heart-button-persisted-state.md) | done | 04 | 06, 07 | `components/kudos/kudos-card-actions.tsx` |
| 06 | [Sidebar hearts row](phase-06-sidebar-hearts-row.md) | done | 04 | 05, 07 | `lib/kudos/viewer-stats.ts`, `components/kudos/kudos-sidebar-stats.tsx` |
| 07 | [E2E for the deferred SCs](phase-07-extended-e2e-for-deferred-scs.md) | done | 02 | 05, 06 | `e2e/kudos-board-like-rules.spec.ts`, `e2e/kudos-board-like-sidebar.spec.ts`, `e2e/kudos-board-feed-interactions.spec.ts` |
| 08 | [Green verification + evidence](phase-08-green-verification-and-evidence.md) | done | 05, 06, 07 | — | `evidence/green-evidence.json` |

**Genuinely parallel:** 02 ∥ 03 (after 01) · 05 ∥ 06 ∥ 07 (after 04; 07 needs only 02).
**Strictly sequential:** 01 → 02/03 → 04 → {05,06} → 08. 07 authors tests early, they only pass after 05/06.

## Requirement → phase map

| Ids | Phase |
|-----|-------|
| BR-001, BR-002 (DB), BR-006, INT-002, SC-002, SC-007 | 01 |
| DEC-002, BR-003/004 config surface | 01, 02 |
| FR-003, FR-006, FR-007, ALG-001, INT-001, SM-001 | 03 |
| FR-001, FR-002, SC-001 | 03, 04, 05 |
| FR-004, FR-005, DEC-001, SC-003, SC-004 | 05 |
| FR-008, SC-008 | 06 |
| SC-005, SC-006 | 07 |

## Hard constraints (binding on every phase)

1. `components/kudos/kudos-card.tsx` stays hookless and gains **zero** new props — like state reaches the heart through a client context, not prop drilling (phase 04).
2. Heart button contract (dom-contract F26/F27/F29/F30): text content = count digits only; `aria-pressed` always present; `aria-label` always contains `like`; clipboard denial silent.
3. `config.toml` has no `auto_expose_new_tables` — every new table needs an explicit `grant` or it fails as "permission denied" while looking like working RLS.
4. `supabase/seed.sql` additions stay idempotent across `supabase db reset`.
5. Do **not** edit `playwright.config.ts`. New specs are named `e2e/kudos-board-like-*.spec.ts` so they land on the existing `kudos-board` project (port 3200, gate open).
6. Every code file under 200 lines — split modules instead of growing one.
7. `is_special` is computed once at insert (DB trigger) and frozen; never recomputed at delete.
8. The heart ledger is an aggregate. No counter column.
9. `kudos_likes.kudos_id` is `text`, not an FK to `kudos.id` (architecture §2).

## Known risks carried at plan level

- **R1 (High):** `e2e/kudos-board-feed-interactions.spec.ts` currently exercises the heart with **no Supabase session**. FR-005 disables hearts for unauthenticated viewers, so both of its heart tests break by design. Phase 07 gives them the session precondition without weakening a single assertion.
- **R2 (High):** BR-002 cannot be enforced by RLS against static record ids alone. Phase 01 adds a small seeded `kudos_static_authors` map (id → sender slug) purely so the insert policy can answer "is the caller this kudos' author". It dies when the board-rewire seam closes.
- **R3 (Medium):** `/kudos` becomes a dynamic route once it reads cookies. The port-3200 web server runs `next build && next start` — verify the build still succeeds in phase 08.

## Unplanned work completed (beyond 8 phases)

Three items emerged during implementation and were resolved with no scope cost to the feature:

1. **Double-click coalescing fix** (phase 04): a fast second click on the same heart was being silently dropped by the in-flight guard. Fixed to coalesce the latest intent instead of discarding it. Covered by a new durable regression test `e2e/kudos-board-like-coalesce.spec.ts`, proven by fail-then-pass verification.

2. **Stage 5 REWORK remediation** (5 findings, 1 HIGH): after phase 08's initial pass, 5 reviewer findings were addressed. The HIGH one: `profiles.auth_user_id` was readable by every authenticated user (RLS filters rows, not columns). Fixed by replacing the table-wide grant with column-scoped grants plus a `resolve_viewer_slug` security-definer RPC. Also: `revoke execute from public` on all definer functions; added a new BR-002 DB-rejection test; two low-severity cleanups for consistency.

3. **Pre-existing unrelated red test fixed** (phase 07): `e2e/send-kudos-interactions.spec.ts` had an over-broad `[role="alert"]` locator colliding with Next.js's injected `__next-route-announcer__`. Corrected without changing the test's assertions or scope.
