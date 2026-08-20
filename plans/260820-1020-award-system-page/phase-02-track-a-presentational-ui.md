---
phase: 2
title: "Track A — Presentational UI (/awards)"
owner: momorph-ui-implementer
status: completed
priority: P1
effort: 4h
feature: F012
test_policy: e2e-red-first
depends_on: [1]
concurrent_with: [3]
mode: screen
---

# Phase 2 — Track A: Presentational UI
## MoMorph refs
- Hệ thống giải (Award System): https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `zFYDgyj_pD`, node `313:8436` · Clarifications: [`clarifications.md`](clarifications.md) · testPolicy: `e2e-red-first`

**Goal:** replace the `/awards` placeholder with the real screen — small hero, title block, sticky 6-item category nav with scroll-synced active state, and 6 alternating award detail sections — delivering US001 (FR-001..FR-005), US002 (FR-006..FR-009) and BR-004/BR-005/SM-001 against the frozen names in [`plan.md`](plan.md).

**Owns:** `app/awards/page.tsx`; `components/awards/{awards-hero,award-section-title,award-category-nav,award-detail-card,award-detail-list}.tsx`; `components/layout/site-header.tsx` (FR-002 only — `usePathname()` decides which nav item gets `aria-current="page"` and the selected styling; "About SAA 2025" must stay a visible link on `/`, asserted at `e2e/homepage-structure-and-copy.spec.ts:81`); `app/globals.css` **only** if a genuinely new token is needed — `--accent`, `--accent-glow`, `--border-accent`, `--divider`, `--secondary-button-bg` already exist.

**Reuses unchanged:** `components/home/kudos-section.tsx` (drop it in as-is — it satisfies FR-010/FR-011 and ID-8/ID-12; do **not** fork or edit it, the homepage renders the same instance), `components/layout/site-footer.tsx`, `/saa/Award_BG.png` + `award.image` (the wordmark path already in `AWARDS`, exactly as `components/home/award-card.tsx` composes them — no asset is downloaded), `/saa/Keyvisual_BG.png`, `/saa/Root_Further_Logo.png`, `lib/i18n/locale-provider.tsx`.

**Contract:** exports, props and paths are frozen in [`plan.md`](plan.md) § Integration contract. Keep every `<section id="<slug>" className="scroll-mt-24">` — six live deep links depend on those ids (ID-47-52, ID-62) and Phase 1 A12 reads them out of the server-rendered HTML, so the sections must render on the server even though the components are `'use client'` (the house pattern — see `award-card.tsx`). Nav order comes from `AWARDS`, never a second list (BR-001). Image side is `index % 2 === 0` → left (BR-005). Track B owns `lib/awards.ts` and both dictionaries: a typecheck red on missing `longDescription`/`quantity`/`prizeLines` or on `awardsPage.*` during the concurrent window is the seam closing, not a blocker — re-run after Track B reports done.

**Scrollspy (the only new client behaviour):** `award-category-nav.tsx` owns `activeSlug` alone, via one `IntersectionObserver` over `document.getElementById(slug)` for each slug in `AWARDS` — no lifted state, no context, no client wrapper around the list. Active item carries `aria-current="location"`. Click handler: `preventDefault()` + `scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })`. **Never** write `location.hash` or `history.pushState`, and never set a global `scroll-behavior: smooth` — both would fight the browser's own on-load `#<slug>` scroll and pollute history (BR-003). Items stay real `<a href="#slug">` so keyboard activation works; guard `typeof IntersectionObserver === 'undefined'` and disconnect on unmount.

**Out of scope:** `lib/**` (Track B owns the data and the dictionaries), `e2e/**`, `playwright.config.ts`, `proxy.ts`, route protection (deferred — decision 2), any API or data call, and `components/home/**`.

**Test policy:** `e2e-red-first`. RED is already proven in Phase 1 — do not write, edit or run E2E tests and do not claim GREEN. Run `npx tsc --noEmit` and `npm run lint` on owned files, plus an asset-coverage check; `tester` owns all browser evidence in Phase 4.

**Design values are authoritative — never guess.** Frame 1440×6410. Hero band `313:8451` 1152×150; title `313:8453`/`313:8454`/`313:8457`; nav `313:8459` with items `313:8460`–`313:8465`, each a 24×24 Target icon + label, active = gold + underline; cards `313:8467`/`8468`/`8469`/`8470`/`8471`/`8510`, image 336×336, description 480px wide at 16/24 Montserrat 700 justified; quantity row Diamond icon, prize row License icon. Copy is verbatim from [`design/award-copy.md`](design/award-copy.md) — Signature and MVP render as two paragraphs; Best Manager and MVP have no prize note (defect #6, reproduce as drawn). Below 1440px the two-column card stacks and the sticky nav becomes a horizontal scrollable strip under the title, down to a 375px floor with no horizontal overflow (derived — defect #4). Files under 200 lines. Use Figma design content as mock data source. Do NOT invent data.
