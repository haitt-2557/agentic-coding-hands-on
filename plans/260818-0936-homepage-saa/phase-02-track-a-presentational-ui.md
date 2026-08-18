---
phase: 2
title: "Track A — Presentational UI"
owner: momorph-ui-implementer
status: completed
priority: P1
effort: 6h
test_policy: e2e-red-first
depends_on: [1]
concurrent_with: [3]
mode: screen
---

# Phase 2 — Track A: Presentational UI

## Context Links

- MoMorph screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
  (`fileKey` `9ypp4enmFmdK3YAFJLIu6C`, `screenId` `i87tDx10uM`, figma node `2167:9026`)
- Clarifications (authoritative): [`clarifications.md`](clarifications.md)
- Rendered frame: [`design/homepage-saa-full.png`](design/homepage-saa-full.png) (1512×4480)
- Test cases: [`design/test-cases-i87tDx10uM.csv`](design/test-cases-i87tDx10uM.csv) — **ID-14 STALE**
- Screen spec: [`spec/homepage-saa/screens/SCR-homepage/spec.md`](spec/homepage-saa/screens/SCR-homepage/spec.md)
- Next 16 constraints: [`research/researcher-01-nextjs16-conventions.md`](research/researcher-01-nextjs16-conventions.md)
- Seam contract + RED evidence: [`plan.md`](plan.md), Phase 1 report in `plans/reports/`

## Overview

**Priority:** P1 · **Status:** pending · **test_policy:** `e2e-red-first`

Build every presentational surface of `/` plus the two placeholder routes, against the frozen A↔B
seam. Runs concurrently with Phase 3. Does not own executable tests or browser evidence.

**Goal:** the homepage renders the frame faithfully and satisfies the RED contract's structural,
copy, navigation and dropdown assertions.

**Out of scope:** `lib/**`, `.env.example`, `next.config.ts`, `e2e/**`, `playwright*.config.ts`,
`package.json`; real `/awards` and `/kudos` page content; any executable test.

## Key Insights

- **Frame wins on copy and layout; CSV + test cases win on behavior.** Nav label is
  `Award Information`. Footer copyright is `Bản quyền thuộc về Sun* © 2025`. Hero label is
  `Coming soon` — the frame's "Comming soon" is a logged design defect and is not reproduced.
  Event info is `Thời gian: 26/12/2025` · `Địa điểm: Âu Cơ Art Center` ·
  `Tường thuật trực tiếp qua sóng Livestream` — **ID-14 is stale, do not build to it**.
- `next/image` `priority` is **deprecated in v16 → use `preload`**. The scaffold `app/page.tsx`
  still uses `priority`; that file is replaced wholesale.
- Hash-anchor smooth scroll (`/awards#top-talent`, ID-47–52) needs `data-scroll-behavior="smooth"`
  on `<html>`. Next 16 dropped the automatic override — omit it and the scroll silently degrades.
- `viewport`/`themeColor` go in `export const viewport`, never inside `metadata`.
  `app/layout.tsx` stays a **Server Component**; the two client providers wrap `{children}` only.
- Tailwind v4 CSS-first: add design tokens as CSS vars on `:root` and map them inside the existing
  `@theme inline` block. **No `tailwind.config.ts`.** The scaffold's light-theme +
  `prefers-color-scheme` dark block is **replaced** — the design is unconditionally dark.
- Assets: 35 MoMorph media nodes → `public/`. No stock or placeholder imagery, ever. SVGs are
  auto-`unoptimized`. If any asset URL carries a query string, that is a `next.config.ts` change and
  therefore a Track B request — do not edit that file.
- Countdown first paint: render the three boxes as `00` and keep `Coming soon` visible pre-hydration,
  so server and first client render match. Real values and BR-002 visibility apply after mount.
- One shared accessible dropdown primitive serves the language switcher, account menu, notification
  panel and widget menu (ID-30–35 read as applying to every header dropdown).
- Every file under 200 lines. Use Figma design content as the mock data source. Do NOT invent data.

## Requirements

**Functional** — FR-004, FR-005, FR-009, FR-010, FR-011, FR-012, FR-016, FR-017, FR-018, FR-019;
SM-001 (closed↔open: click, click-again, click-outside, Enter, Space, Esc, focus returns to trigger);
BR-004 responsive grid **3 desktop / 2 tablet / 2 mobile** (the CSV's English "3/2/1" row is stale);
BR-007 guest hides bell and account menu; BR-008 badge only when `unreadCount > 0`.

**Non-functional** — accessible names on every interactive element; `aria-expanded`/`aria-haspopup`
on dropdown triggers; logo carries descriptive `alt` (ID-8); dark-theme contrast holds; layout is
fluid between the frame's breakpoints; no console errors on load.

## Architecture

```
app/layout.tsx  (Server)  <html data-scroll-behavior="smooth" lang="vi">
  └── SessionProvider ─┐            metadata + separate `export const viewport`
      └── LocaleProvider │  (both from lib/**, Track B)
          └── {children}
app/page.tsx  (Server) → SiteHeader · HeroKeyvisual(CountdownTimer, EventInfo, HeroCTA)
                        · RootFurtherContent · AwardsSection(AwardCard ×6)
                        · KudosSection · QuickActionWidget · SiteFooter
app/awards/page.tsx → 6 anchor sections keyed by AWARDS[].slug   (hash-anchor targets)
app/kudos/page.tsx  → bare stub
```

Data in: `useSession()`, `useI18n()`, `AWARDS`, `computeCountdown()` — all from Track B, all
consumed through hooks/imports, never re-implemented here. Data out: rendered DOM only.

## Related Code Files

**Create:** `app/awards/page.tsx`, `app/kudos/page.tsx`,
`components/layout/{site-header,site-footer,quick-action-widget}.tsx`,
`components/home/{hero-keyvisual,countdown-timer,event-info,hero-cta,root-further-content,awards-section,award-card,kudos-section}.tsx`,
`components/ui/{dropdown-menu,language-switcher,notification-bell,account-menu}.tsx`,
`public/**` (35 MoMorph media assets)
**Modify:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
**Delete:** none (scaffold content inside the three modified files is replaced in place)
**Must not touch:** `lib/**`, `.env.example`, `next.config.ts`, `e2e/**`, `playwright*.config.ts`,
`package.json`, `package-lock.json`

## Implementation Steps

1. Fetch the frame and all 35 media nodes over MCP; write assets into `public/`. Record any node
   that fails to fetch — report BLOCKED rather than substituting an image.
2. Replace `app/globals.css` tokens: dark palette, brand yellow, typography scale as `:root` CSS
   vars mapped in the existing `@theme inline` block. Remove the `prefers-color-scheme` dark block.
3. Build `components/ui/dropdown-menu.tsx` first — the SM-001 primitive every other menu composes.
4. Build the leaf presentational components (header, footer, hero parts, award card, awards section,
   kudos section, widget) with copy read through `useI18n()`.
5. Add `app/awards/page.tsx` with the six `id={slug}` sections and `app/kudos/page.tsx` as a stub.
6. Wire last: `app/layout.tsx` (`data-scroll-behavior="smooth"`, providers around `{children}`,
   `metadata` + separate `viewport` export) and `app/page.tsx` composition. If the Track B modules
   are not on disk yet, wait — do not create them.
7. Run `npx tsc --noEmit` and `npm run lint`. Confirm asset coverage: every image in the frame has a
   real file in `public/`.
8. Report the visual handoff. Do **not** run or edit the E2E suite.

## Todo List

- [x] 35 MoMorph assets fetched into `public/`, coverage checked (validate_coverage.py: 35/35)
- [x] `app/globals.css` dark token set replaces the scaffold set
- [x] `components/ui/dropdown-menu.tsx` (SM-001) + language switcher, bell, account menu
- [x] `components/layout/*` header, footer, quick-action widget
- [x] `components/home/*` hero, countdown shell, event info, CTA, root-further, awards, kudos
- [x] `app/awards/page.tsx` six `#slug` anchors · `app/kudos/page.tsx` stub
- [x] `app/layout.tsx` — `data-scroll-behavior`, providers, `viewport` export
- [x] `app/page.tsx` composition, scaffold `priority` usage gone (uses `preload`)
- [x] Typecheck + lint clean for owned files; every file under 200 lines (max 108).
      `npx tsc --noEmit` and `npm run build`'s typecheck step still report ONE
      pre-existing error in `e2e/homepage.spec.ts` (`Page.getByContentEditable` does not
      exist on the installed `@playwright/test@1.62.1` types) — outside Track A ownership,
      not introduced by this phase. See report for detail.

## Success Criteria

- `npx tsc --noEmit` and `npm run lint` both exit 0.
- Structural / copy / layout: **ID-7, ID-8, ID-9, ID-10, ID-11, ID-13, ID-15, ID-16, ID-17, ID-43**.
- Navigation markup: **ID-2, ID-3, ID-4, ID-18, ID-19, ID-20, ID-21, ID-22, ID-44, ID-45, ID-53,
  ID-55, ID-59**.
- Dropdown / role-gated rendering: **ID-1, ID-5, ID-6, ID-24, ID-27, ID-28, ID-29, ID-30, ID-31,
  ID-32, ID-33, ID-34, ID-35, ID-36, ID-37, ID-38, ID-54**.
- Hover states for Phase 4 visual validation: **ID-23, ID-46, ID-51**.
- Not built: **ID-14** (stale).
- Every image rendered resolves to a real MoMorph-sourced file under `public/`; zero placeholders.

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| An MCP media node fails to fetch and a placeholder gets substituted | Med | High | Hard rule: no placeholders. Report BLOCKED naming the node id |
| Track B modules absent when wiring starts → typecheck red | Med | Med | Leaf-first ordering (steps 3–5); wait on the seam handshake, never create `lib/**` |
| `data-scroll-behavior` omitted → ID-47–52 pass loosely, smooth scroll silently missing | Med | Med | Explicit item in step 6 and the todo list |
| Scaffold `priority` prop survives into the new page | Med | Low | `app/page.tsx` is rewritten; grep for `priority` before handoff |
| A component crosses 200 lines (header and awards section are the likely two) | Med | Low | Split into the already-planned sub-components |
| Guessing a visual value the MCP data could have answered | Low | High | MCP design data is authoritative — re-query rather than estimate |
| Frame typo "Comming soon" reproduced | Med | Low | Corrected copy is quoted in Key Insights |

## Security Considerations

Role-conditional rendering here is **presentation, not access control**. `useSession()` is a
client-side mock seeded from `localStorage`/env; any visitor can set themselves to `admin` in
DevTools. Hiding the bell, the account menu or "Admin Dashboard" protects nothing — it must never be
described or relied on as a permission boundary. When real auth arrives, every rule in
`spec/system/permissions.md` has to be re-enforced server-side. No secrets in `public/` or in client
components; only `NEXT_PUBLIC_*` values may reach the browser.

## Next Steps

Hand the visual state to Phase 4 (`tester`) for GREEN + Playwright-MCP visual validation. Accept
bounded fixes back from Phase 4 without weakening any test. Track B (Phase 3) proceeds in parallel
and integrates incrementally — there is no merge barrier.
