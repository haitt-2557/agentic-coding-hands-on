---
phase: 2
title: "Track A — Presentational UI (/prelaunch screen)"
owner: momorph-ui-implementer
status: complete
priority: P1
effort: 4h
test_policy: e2e-red-first
depends_on: [1]
concurrent_with: [3]
mode: screen
---

# Phase 2 — Track A: Presentational UI

## MoMorph refs

- Countdown - Prelaunch page: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
  (`fileKey` `9ypp4enmFmdK3YAFJLIu6C`, `screenId` `8PJQswPZmU`, figma node `2268:35127`, frame 1512×1077)
- Clarifications: [`clarifications.md`](clarifications.md) — § Extracted design values is authoritative
- testPolicy: `e2e-red-first`

**Goal:** `/prelaunch` renders the frame faithfully — full-viewport background + overlay, centred
title, three digit-pair units — and satisfies the RED contract's structural assertions. ✓ Complete

**Out of scope:** `proxy.ts`, `lib/**`, `.env.example`, `e2e/**`, `playwright.config.ts`,
`app/layout.tsx`, `app/page.tsx`, `components/home/**`; the 1s tick and the client redirect (both
Track B, consumed through `usePrelaunchCountdown()`); any executable test or browser evidence.

## Context Links

- Screen spec: [`spec/countdown-prelaunch/screens/SCR-Prelaunch/spec.md`](spec/countdown-prelaunch/screens/SCR-Prelaunch/spec.md)
- Seam contract: [`plan.md`](plan.md) § Integration contract · RED evidence in `plans/reports/`
- Sibling precedent (tokens, Tailwind v4 CSS-first conventions): [`../260818-0936-homepage-saa/phase-02-track-a-presentational-ui.md`](../260818-0936-homepage-saa/phase-02-track-a-presentational-ui.md)

## Key Insights

- **DOM contract — the RED suite pins the markup.** A unit container's *normalized text* must be
  exactly `01HOURS`: two digit spans then the label, no separator text node, no whitespace between
  them (JSX drops newline-only whitespace — keep it that way). The label element's own text must be
  exactly `DAYS`/`HOURS`/`MINUTES` (`getByText(/\bDAYS\b/)` matches the label but *not* `00DAYS`, so
  the boundary does the disambiguation). The title must be the single element matching
  `/Sự kiện sẽ bắt đầu sau|Event starts in/i` — strict mode fails on two.
- **`opacity: 0.5` belongs to the box, not the glyph.** Node `I2268:35141;186:2616` carries the
  gradient + `backdrop-filter` + `opacity: 0.5`; the digit `I2268:35141;186:2617` is pure white above
  it. Put the faded gradient/blur on an absolutely-positioned layer and the digit on top at full
  opacity — applying opacity to the container greys the digits and loses the LED look.
- **Font degrades on its own.** Declare `@font-face { font-family: 'Digital Numbers'; src:
  url('/fonts/digital-numbers.woff2') format('woff2'); font-display: swap; }` in `app/globals.css`
  with a fallback stack behind it. Until the file lands the browser silently uses the fallback (a 404
  on a font is a network log line, not a `pageerror`). Swap-in = drop the file into `public/fonts/`;
  **no code change**. Do not wire `next/font/local` now — it fails the build when the file is absent.
- **Responsive is derived, not designed.** One proportional rule off the 1512 frame, floor 375px,
  three units stay on one row. Text carries a legibility floor that deliberately breaks strict
  proportionality (36px → 8.9px at 375px is unreadable) — flagged to the design owner.
- Full-viewport, non-scrolling: `h-dvh overflow-hidden` on the page root. No header, footer or nav —
  this screen is the entire viewport.
- Accessibility: each unit carries `aria-label` (e.g. `05 DAYS`) so the value is read whole instead
  of digit by digit. The block is **not** an `aria-live` region — a 1s live region is hostile to
  screen readers. Derived decision, recorded here.
- Every file under 200 lines. Use Figma design content as the mock data source. Do NOT invent data.

## Requirements

**Functional** — FR-001: full-viewport background (node `2268:35129`) + gradient overlay
(`2268:35130`) + title (`prelaunch.title`, via `useI18n()`) + three units DAYS/HOURS/MINUTES, values
from `usePrelaunchCountdown()`. BR-001 two-digit rendering is already guaranteed upstream — render
the strings as given, never re-pad.

**Non-functional** — design values verbatim from the table below; no scroll at any width ≥ 375px;
no console error, no hydration warning; no placeholder imagery.

## Architecture

```
app/prelaunch/page.tsx  (Server)  h-dvh overflow-hidden
  └── background <Image fill cover>  +  overlay div (gradient)
      └── components/prelaunch/prelaunch-countdown.tsx  ("use client")
            usePrelaunchCountdown()  ← Track B          useI18n() → title
            └── countdown-unit.tsx ×3   → digit-box.tsx ×2 per unit
```

Data in: `usePrelaunchCountdown()`, `useI18n()`. Data out: rendered DOM only. No timer, no router
call, no `computeCountdown()` import in this phase.

## Design values (verbatim) and the derived scale

| Element | Value at 1512 | Responsive rule |
|---|---|---|
| Background `2268:35129` | 1512×1077, `cover`, `no-repeat` | full viewport |
| Overlay `2268:35130` | `linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)` | unchanged |
| Block `2268:35136` | flex col, center, `gap: 24px` | `clamp(5.95px, 1.587vw, 24px)` |
| Title `2268:35137` | Montserrat 700, 36px/48px, white, centred | `clamp(14px, 2.381vw, 36px)`, `line-height: 1.333` |
| Row `2268:35138` | flex row, `gap: 60px`, centred | `clamp(14.88px, 3.968vw, 60px)` |
| Unit `2268:35139` | flex col, `align-items: flex-start`, `gap: 21px` | `clamp(5.21px, 1.389vw, 21px)` |
| Digit pair `2268:35140` | flex row, `gap: 21px` | `clamp(5.21px, 1.389vw, 21px)` |
| Digit box `I2268:35141;186:2616` | 76.8×122.88 · radius 12px · border `0.75px solid #FFEA9E` · `linear-gradient(180deg,#FFF 0%,rgba(255,255,255,0.10) 100%)` · `opacity: .5` · `backdrop-filter: blur(24.96px)` | w `clamp(19.05px, 5.079vw, 76.8px)` · h `clamp(30.48px, 8.127vw, 122.88px)` · radius `clamp(2.98px, .794vw, 12px)`; border/opacity/blur fixed |
| Digit glyph `I2268:35141;186:2617` | 'Digital Numbers' 400, 73.728px, white | `clamp(18.29px, 4.876vw, 73.728px)` |
| Label `2268:35143` | Montserrat 700, 36px/48px, white, uppercase, left-aligned in its unit | `clamp(12px, 2.381vw, 36px)` |

## Related Code Files

**Create:** `app/prelaunch/page.tsx`, `components/prelaunch/prelaunch-countdown.tsx`,
`components/prelaunch/countdown-unit.tsx`, `components/prelaunch/digit-box.tsx`,
`public/saa/Prelaunch_BG.png` (from MCP node `2268:35129`)
**Modify:** `app/globals.css` (`@font-face` + `--font-digital` token in the existing `@theme inline`)
**Delete:** none
**Must not touch:** everything in § Out of scope, and any existing file under `public/saa/`

## Implementation Steps

1. Fetch node `2268:35129` over MCP into `public/saa/Prelaunch_BG.png`. A fetch failure is BLOCKED —
   never substitute stock or placeholder imagery.
2. Add the `@font-face` + fallback stack and the `--font-digital` token to `app/globals.css`.
3. Build `digit-box.tsx` (one glyph, layered box) then `countdown-unit.tsx` (pair + label) —
   check the normalized-text contract with the exact regexes from the RED spec while building.
4. Build `prelaunch-countdown.tsx`: title from `useI18n()`, three units from
   `usePrelaunchCountdown()`. If the hook is not on disk yet, wait — do not create `lib/**`.
5. Compose `app/prelaunch/page.tsx`: background image, overlay, centred block, `h-dvh overflow-hidden`.
6. `npx tsc --noEmit` and `npm run lint`. Verify at 1512 / 768 / 375: no horizontal scroll, three
   units on one row, labels legible.
7. Report the visual handoff. Do **not** run or edit the E2E suite.

## Todo List

- [x] `public/saa/Prelaunch_BG.png` fetched from MCP node `2268:35129`
- [x] `app/globals.css` — `@font-face` + `--font-digital` token, fallback stack behind it
- [x] `components/prelaunch/digit-box.tsx` — layered box, opacity on the background layer only
- [x] `components/prelaunch/countdown-unit.tsx` — normalized text is exactly `\d{2}LABEL`
- [x] `components/prelaunch/prelaunch-countdown.tsx` — title + 3 units, hook-consumed values
- [x] `app/prelaunch/page.tsx` — full-viewport background + overlay, no scroll
- [x] Responsive check at 1512 / 768 / 375; `aria-label` per unit
- [x] `npx tsc --noEmit` + `npm run lint` clean; every file under 200 lines

## Success Criteria

- `npx tsc --noEmit` and `npm run lint` exit 0.
- `getByText(/Sự kiện sẽ bắt đầu sau|Event starts in/i)` resolves to exactly one visible element.
- `getByText(/\bDAYS\b/)`, `/\bHOURS\b/`, `/\bMINUTES\b/` each resolve to exactly one label.
- `getByText(/^\d{2}DAYS$/)` / `HOURS` / `MINUTES` each resolve to exactly one unit container.
- Background resolves to a real MoMorph-sourced file; zero placeholders.
- No horizontal scroll and three units on one row from 1512px down to 375px.

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| A stray text node breaks `toHaveText('01HOURS')` | High | High | Contract quoted in Key Insights; verify while building, step 3 |
| `opacity: .5` applied to the container greys the digits | Med | High | Layered box; explicit todo item |
| `next/font/local` wired against a missing file → build fails | Med | High | `@font-face` route only; `next/font/local` is an optional post-delivery swap |
| MCP media node fails to fetch and a placeholder is substituted | Low | High | Hard rule: report BLOCKED naming the node id |
| Track B hook absent when composition starts → typecheck red | Med | Med | Leaf-first ordering; wait on the seam handshake, never create `lib/**` |
| Proportional scaling shrinks labels to illegibility on mobile | Med | Med | Legibility floors in the table; flagged as derived |
| A visual value gets estimated instead of read | Low | High | The table above is the only source; re-query MCP rather than guess |

## Security Considerations

Nothing on this screen is role-conditional and nothing reads `useSession()` — the gate is launch
timing, not authorization. No secrets in `public/` or in client components; only `NEXT_PUBLIC_*`
values reach the browser, and this phase reads none of them directly.

## Next Steps

Hand the visual state to Phase 4 for GREEN + Playwright-MCP visual validation; accept bounded fixes
back without weakening any test. Track B runs in parallel and integrates incrementally.
