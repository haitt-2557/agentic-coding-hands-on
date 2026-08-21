---
title: "Sun* Kudos - Live board (/kudos) — SAA 2025"
description: "Fill the /kudos placeholder from MoMorph MaZUn5xHXZ: banner + submit pill, HIGHLIGHT KUDOS carousel with shared filters, static 106-node SPOTLIGHT BOARD, progressive-reveal ALL KUDOS feed, stats + leaderboard sidebar."
status: complete
priority: P1
effort: 23h
branch: feat/kudos-live-board
tags: [momorph, nextjs16, kudos, carousel, word-cloud, i18n, e2e-red-first, saa-2025]
created: 2026-08-21
work_type: feature
testPolicy: e2e-red-first
test_policy: e2e-red-first
spec: docs/vi/features/kudos-live-board/
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: MaZUn5xHXZ
  url: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
  node: "2940:13431"
---

# Sun* Kudos - Live board — Implementation Plan

Fifth screen, sibling of [`260820-1020-award-system-page`](../260820-1020-award-system-page/plan.md);
same stack, no backend. Static modules under `lib/kudos/`, React state for filters, carousel, hearts.
`/kudos` fills the homepage run's placeholder. Provisional **F013_KudosLiveBoard**. Branch `main`;
Phase 1 cuts `feat/kudos-live-board`. **Read before any phase:** [`clarifications.md`](clarifications.md)
· [`dom-contract.md`](dom-contract.md) (43 frozen DOM rules, 8 seed constraints, the A↔B seam) ·
[`design/kudos-content.md`](design/kudos-content.md) (only source for visual values) ·
[`spec/kudos-live-board/technical-spec.md`](spec/kudos-live-board/technical-spec.md). `AGENTS.md`
binds every phase: Next.js **16.3.1** — read `node_modules/next/dist/docs/` before coding.

## Phases

| # | Phase | Owner | Status | Effort | Depends on |
|---|-------|-------|--------|--------|-----------|
| 1 | [Test harness correction + valid RED](phase-01-test-harness-and-valid-red.md) | `tester` | complete | 1.5h | — |
| 2 | [Design tokens and frame assets](phase-02-design-tokens-and-assets.md) | `momorph-ui-implementer` | complete | 2h | 1 |
| 3 | [Kudos data modules, mock viewer, i18n](phase-03-data-modules-viewer-and-i18n.md) | `implementer` | complete | 3h | 1 |
| 4 | [Shared kudos card kit](phase-04-shared-kudos-card-kit.md) | `momorph-ui-implementer` | complete | 3h | 2, 3 |
| 5 | [Page shell, banner, filters, carousel, chrome](phase-05-shell-banner-filters-carousel.md) | `momorph-ui-implementer` | complete | 4h | 4 |
| 6 | [SPOTLIGHT BOARD region](phase-06-spotlight-board-region.md) | `momorph-ui-implementer` | complete | 3h | 2, 3 |
| 7 | [ALL KUDOS feed and sidebar](phase-07-all-kudos-feed-and-sidebar.md) | `momorph-ui-implementer` | complete | 3h | 4 |
| 8 | [Tester GREEN + visual validation](phase-08-tester-green-and-visual-validation.md) | `tester` | complete | 2h | 5, 6, 7 |
| 9 | [Integration, docs and review](phase-09-integration-docs-and-review.md) | `reviewer`, `doc-writer` | complete | 1.5h | 8 |

**Parallel windows.** 2 ∥ 3 behind the Phase 1 gate; then 4 ∥ 6 (6 needs tokens and spotlight data,
not the card kit); then 5 ∥ 6 ∥ 7. Delivers US001–US009, FR-001–FR-018, BR-001–BR-007, SM-001/002, DEC-001, SC-001–SC-009.

**A ↔ B seam.** Exports, props and paths frozen in [`dom-contract.md`](dom-contract.md) §12. Phase 5
imports files 6 and 7 own — a concurrent-window typecheck red is the seam closing, not a blocker.

## File ownership (disjoint — no two phases share a file)

| Phase | Owns |
|-------|------|
| 1, 8 | `e2e/kudos-board-*.spec.ts`, `playwright.config.ts`, `evidence/**` |
| 2 | `app/globals.css`, `public/images/kudos/**`, new files in `public/saa/**` |
| 3 | `lib/kudos/**`, `lib/session/session-provider.tsx`, `lib/i18n/dictionaries/{vi,en}.ts` |
| 4 | `components/kudos/{kudos-card,kudos-card-people,kudos-card-actions,kudos-hashtag-row,star-tier-tooltip,kudos-toast}.tsx` |
| 5 | `app/kudos/page.tsx`, `components/kudos/{kudos-board,kudos-banner,kudos-action-bar,kudos-filter-bar,highlight-carousel}.tsx`, `components/layout/{site-header,site-footer}.tsx` |
| 6 | `components/kudos/{spotlight-board,spotlight-name-cloud,spotlight-search,spotlight-ticker}.tsx` |
| 7 | `components/kudos/{all-kudos-feed,kudos-sidebar,kudos-sidebar-stats,kudos-leaderboard}.tsx` |
| 9 | `docs/**`, `plan.md` + `phase-*.md` statuses, `spec/**` |

**Untouched by anybody:** `components/ui/{dropdown-menu,language-switcher}.tsx`, `lib/prelaunch/**`,
`lib/i18n/locale-provider.tsx`, `proxy.ts`, `app/layout.tsx`, `e2e/support/**`, `public/saa/*` (existing).

## Key dependencies, risks and rollback

- **Phase 1 is a hard gate.** The recorded RED came from a prelaunch-gate redirect, not missing UI
  ([`dom-contract.md`](dom-contract.md) C2): the kudos specs match no project, fall onto port 3000,
  and `/kudos` 307s to `/prelaunch`. Until a `kudos-board` project on 3200 exists, nothing can turn
  them green. Phase 1 also deletes the Pan/Zoom assertion that contradicts FR-012 (C1).
- **Every code file under 200 lines**; data modules split by concern. `site-header.tsx` (71),
  `site-footer.tsx` (61) and `globals.css` (57) each have exactly one owner.
- **Rollback is per phase:** 5 reverts the page to its placeholder and the chrome files to their
  current form; 2 and 3 are additive. No migration, no persisted data, no API contract.
- **Unresolved (carried):** route protection, a Pan/Zoom interaction spec, a frame for the "thăng
  hạng" leaderboard, an admin surface for the heart multiplier, a mobile/tablet frame (defect #8).
