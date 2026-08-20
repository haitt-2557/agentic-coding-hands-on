---
title: "Award System page (/awards) — SAA 2025"
description: "Fill the /awards placeholder from MoMorph zFYDgyj_pD: small hero, title block, sticky 6-item category nav with scroll-synced active state, 6 alternating award detail sections, reused Kudos block."
status: completed
priority: P1
effort: 12.5h
branch: feat/awards-system-page
tags: [momorph, nextjs16, awards, scrollspy, i18n, e2e-red-first, saa-2025]
created: 2026-08-20
work_type: feature
test_policy: e2e-red-first
spec: docs/vi/features/award-system-page/
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: zFYDgyj_pD
  url: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
---

# Award System page — Implementation Plan

Fourth screen after [`260818-0936-homepage-saa`](../260818-0936-homepage-saa/plan.md),
[`260819-0913-countdown-prelaunch`](../260819-0913-countdown-prelaunch/plan.md) and
[`260819-1432-login-supabase-auth`](../260819-1432-login-supabase-auth/plan.md); same stack, no backend. Route
stays `/awards`, route protection stays deferred ([`clarifications.md`](clarifications.md) decisions 1–2).
Provisional feature code **F012_AwardSystemPage**. Branch `main`; Phase 1 cuts `feat/awards-system-page`.

## Phases

| # | Phase | Owner | Status | Effort | Depends on |
|---|-------|-------|--------|--------|-----------|
| 1 | [Strict RED E2E contract](phase-01-strict-red-e2e-contract.md) | `tester` | completed | 2.5h | — |
| 2 | [Track A — Presentational UI](phase-02-track-a-presentational-ui.md) | `momorph-ui-implementer` | completed | 4h | 1 |
| 3 | [Track B — Award data and i18n](phase-03-track-b-award-data-and-i18n.md) | `implementer` | completed | 2.5h | 1 |
| 4 | [Tester GREEN + visual validation](phase-04-tester-green-and-visual-validation.md) | `tester` | completed | 2h | 2, 3 |
| 5 | [Integration, docs and review](phase-05-integration-docs-and-review.md) | `reviewer`, `doc-writer` | completed | 1.5h | 4 |

Phases 2 and 3 run **concurrently** behind the single Phase 1 gate. Delivers US001–US003, FR-001–FR-011,
BR-001–BR-005, SM-001 ([`spec/award-system-page/technical-spec.md`](spec/award-system-page/technical-spec.md)).

## Integration contract (A ↔ B seam — frozen before either track starts)

| Module (owner) | Export | Shape | Consumed by |
|---|---|---|---|
| `lib/awards.ts` (B) | `Award` **extended additively** | adds `longDescription: string[]` (1–2 paragraphs), `quantity: { value: string; unit: string }`, `prizeLines: { amount: string; note?: string }[]` (1–2). `slug`/`title`/`description`/`image`, `EXPECTED_AWARD_SLUGS`, `awardHref()` byte-unchanged | A's `award-detail-card.tsx`, `award-category-nav.tsx` |
| `lib/i18n/dictionaries/{vi,en}.ts` (B) | `awardsPage.subtitle`, `awardsPage.heading`, `awardsPage.quantityLabel`, `awardsPage.prizeLabel`, `awardsPage.prizeOr` | vi verbatim: `Sun* Annual Awards 2025` · `Hệ thống giải thưởng SAA 2025` · `Số lượng giải thưởng:` · `Giá trị giải thưởng:` · `Hoặc`. Both dictionaries or the build breaks | A's components |
| `components/awards/{awards-hero,award-section-title}.tsx` (A) | `AwardsHero`, `AwardSectionTitle` | `() => JSX` each — wave ground + ROOT FURTHER logo, no countdown/CTA; muted subtitle over gold `<h1>` | `app/awards/page.tsx` (A) |
| `components/awards/award-category-nav.tsx` (A) | `AwardCategoryNav` | `'use client'`, `() => JSX` — renders `AWARDS` in order, **owns `activeSlug`** via `IntersectionObserver` over `document.getElementById(slug)` | `app/awards/page.tsx` (A) |
| `components/awards/award-detail-card.tsx` (A) | `AwardDetailCard` | `({ award, index }: { award: Award; index: number }) => JSX` — `<section id={award.slug} className="scroll-mt-24">`, image left when `index % 2 === 0` (BR-005) | `award-detail-list.tsx` (A) |
| `components/awards/award-detail-list.tsx` (A) | `AwardDetailList` | `() => JSX` — maps `AWARDS` to `AwardDetailCard` | `app/awards/page.tsx` (A) |

**Accessible-name freeze** (Phase 1 asserts these; neither track may rename them): nav items are links named
by the award title verbatim (`Top Talent` … `MVP (Most Valuable Person)`); each section's heading is an `<h2>`
with the same title; the award graphic's `alt` is the award title; the active nav item carries
`aria-current="location"` (the header keeps `aria-current="page"` — a different marker for a different
concept); labels read exactly `Số lượng giải thưởng:` and `Giá trị giải thưởng:`.

**Scroll freeze:** nav click = `preventDefault()` + `scrollIntoView({ behavior })`, `behavior` from
`prefers-reduced-motion`. Nothing writes `location.hash` or `history.pushState` — not on click, not on scroll
(BR-003). No global `scroll-behavior: smooth`, which would also make the header logo's scroll-to-top smooth
on every page.

## File ownership (disjoint — no two phases share a file)

| Phase | Owns |
|-------|------|
| 1, 4 | `e2e/awards-page.spec.ts`, `playwright.config.ts`, `design/test-cases-zFYDgyj_pD.csv`, `evidence/**` |
| 2 | `app/awards/page.tsx`, `components/awards/**`, `components/layout/site-header.tsx`, `app/globals.css` (only if a genuinely new token is needed) |
| 3 | `lib/awards.ts`, `lib/awards.test.ts`, `lib/i18n/dictionaries/vi.ts`, `lib/i18n/dictionaries/en.ts` |
| 5 | `docs/**`, `plan.md` + `phase-0*.md` statuses, `spec/**` |

**Reused unchanged, touched by nobody:** `components/home/{kudos-section,award-card}.tsx`,
`components/layout/site-footer.tsx`, `e2e/support/seed-defaults.ts`, `public/saa/**`,
`public/images/awards/*.png`, `lib/prelaunch/**`, `proxy.ts`, `app/layout.tsx`.

## Key dependencies and constraints

- **`lib/awards.ts` is extended, never reshaped.** The homepage grid and `e2e/homepage-awards-grid.spec.ts`
  (TC ID-47-52, ID-62) read `description`, `image`, the six slugs and `awardHref()`. Highest regression risk
  in the run — countermeasure in Phase 3 R1.
- **The E2E cannot run on port 3000.** `/awards` is not in the gate's `ALWAYS_ALLOWED`, so the future-dated
  server redirects it to `/prelaunch`. Phase 1 adds an `awards-page` project on port 3200 (past-dated) and
  excludes the file from `prelaunch-gate`'s lookahead — else the RED is a redirect nothing can turn green.
- **Both dictionaries or nothing** — `DictionaryKey` is derived from `vi`; `en` is `Record<DictionaryKey, string>`.
  Files stay under 200 lines. Rollback is a per-phase revert: Phase 2 back to the placeholder page, Phase 3
  an additive data revert.
