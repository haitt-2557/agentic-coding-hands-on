---
title: "Gửi lời chúc Kudos — /kudos/send"
description: "New /kudos/send form page: first real application tables, first server-side auth gate, first Server Action."
status: pending
priority: P1
effort: 13h
branch: main
tags: [momorph, kudos, supabase, migration, rls, storage, auth-gate, e2e-red-first]
created: 2026-08-24
work_type: feature
spec: docs/vi/features/F014_SendKudosWishes/
---

# Gửi lời chúc Kudos (`/kudos/send`)

**MoMorph:** screen [`JsTvi8KVQA`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/JsTvi8KVQA) ·
behaviour source [`ihQ26W78P2`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2) (26 specs, 57 TCs) ·
hashtags [`p9zO-c4a4x`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/p9zO-c4a4x)
**testPolicy:** `e2e-red-first` · RED recorded: `npm run test:e2e -- --project=send-kudos`, exit 1, 23 tests
**Authoritative inputs:** [clarifications.md](clarifications.md) · [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) · [**dom-contract.md**](dom-contract.md) (frozen locator/seed rules — phases cite D#/E#/S#/C#)

## Phases

| # | Phase | Track | Status | Effort | Depends on |
|---|-------|-------|--------|--------|-----------|
| 01 | [First migration — tables, RLS, Storage bucket](phase-01-first-migration-tables-rls-storage.md) | B | pending | 1.5h | — |
| 02 | [Seed hashtags and profiles](phase-02-seed-hashtags-and-profiles.md) | B | pending | 0.5h | 01 |
| 03 | [Shared contract and validation rules](phase-03-shared-contract-and-validation-rules.md) | B | pending | 1h | — |
| 04 | [Auth gate and data access](phase-04-auth-gate-and-data-access.md) | B | pending | 1h | 01, 03 |
| 05 | [Submit server action and Storage upload](phase-05-submit-server-action-and-storage-upload.md) | B | pending | 1.5h | 01, 03, 04 |
| 06 | [Track A — presentational form UI](phase-06-track-a-presentational-form-ui.md) | **A** | pending | 4h | 03 |
| 07 | [RED suite corrections](phase-07-red-suite-corrections.md) | tester | pending | 1h | 02 |
| 08 | [Integration — page, wiring, entry points](phase-08-integration-page-wiring-entry-points.md) | int | pending | 1.5h | 05, 06 |
| 09 | [GREEN verification and regression](phase-09-green-verification-and-regression.md) | tester | pending | 1h | 07, 08 |

## Dependency shape

```text
01 ─┬─ 02 ── 07 ─┐
    ├─ 04 ── 05 ─┼─ 08 ── 09
03 ─┴───────── 06 ┘
```

Track A (06) and Track B (01–05) run **concurrently** after the clarification gate — 06
depends only on the tiny type/validation module in 03, and the integration contract is
written out in full in phase-03 and phase-06 so neither side waits on the other. Phase 08 is
the only phase that imports across the seam.

## Key dependencies and hard constraints

- **No phase edits `playwright.config.ts` or `e2e/**` except phase-07** (tester-owned). The
  `send-kudos` project and the prelaunch-gate lookahead are already in place.
- **Port 3200 is a production build** (`next build && next start`) — a type error anywhere
  blocks all 23 tests. `app/kudos/send/page.tsx` is therefore created once, fully wired, in
  phase-08; phase-04 ships the auth gate as a library function instead.
- **File ownership is disjoint** — see each phase's Related Code Files. No two phases touch
  the same file; `lib/i18n/dictionaries/{vi,en}.ts` belong to phase-06 alone (en.ts is
  key-typed off vi.ts, so they must move together).
- **Four RED tests cannot pass as written** (dom-contract C1) plus two more locator defects
  (C2, C3). Phase-07 fixes them in the test files; no implementation phase weakens a test.
- **First migration in the repo** — `supabase/migrations/` does not exist yet (phase-01).
- Assumptions made explicit rather than left implicit: Storage bucket is **private**
  (unresolved #6 — nothing renders images this run), per-file cap **5 MiB** (unresolved #4),
  `Hủy` navigates to **`/kudos`** (unresolved #7 — the RED suite fixes this at
  `send-kudos-submit.spec.ts:84`).

## Out of scope (recorded, not forgotten)

Rewiring the `/kudos` board onto the new tables — a kudos you send will **not** appear on the
board (clarifications decision 1). Mention autocomplete (`@name`, ID-12/13/33). The
"Tiêu chuẩn cộng đồng" destination. A markdown renderer. Self-kudos gating. Unifying the mock
`session-provider` with the real Supabase identity. The `Chúc mừng` frame `SOzErYSp_S`.
</content>
