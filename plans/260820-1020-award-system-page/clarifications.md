# Clarifications — Award System page (`/awards`)

**Screen:** Hệ thống giải (Award System)
**MoMorph:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
**fileKey:** `9ypp4enmFmdK3YAFJLIu6C` · **screenId:** `zFYDgyj_pD` · **figma node:** `313:8436`
**Source data:** 23 spec items (`spec_status: done`), 15 test cases, 35 media nodes, frame 1440×6410
**testPolicy:** `e2e-red-first`
**Prior context:** builds on `plans/260818-0936-homepage-saa/` (screen `i87tDx10uM`),
`plans/260819-0913-countdown-prelaunch/` (screen `8PJQswPZmU`) and
`plans/260819-1432-login-supabase-auth/` (screen `GzbNeVGJHz`). Their `clarifications.md` files remain
authoritative for everything they settled — those decisions are inherited, not re-asked.

---

## Session 2026-08-20

- Q: Test cases ID-0/ID-1/ID-2 put this screen at URL `/he-thong-giai`, but the app already routes
  awards to `/awards` — `components/layout/site-header.tsx` links there, `awardHref()` in
  `lib/awards.ts` builds `/awards#<slug>`, the homepage award cards point there, and
  `app/awards/page.tsx` is a placeholder built by the homepage run *precisely* to hold these six
  `#<slug>` anchors. Which route ships? → A: **Keep `/awards`.** Fill in the existing placeholder.
  Nothing else in the app breaks, the six anchors and their existing e2e coverage
  (`e2e/homepage-awards-grid.spec.ts`, TC ID-47-52 / ID-62 from the homepage run) stay valid, and no
  redirect hop sits between every internal link and its destination. `/he-thong-giai` is recorded as a
  design-owner note below — the same screen-local-URL defect as `/todo` in the login run.
- Q: Test case ID-1 says an unauthenticated visitor to this page is redirected to login. But the login
  run explicitly deferred route protection (its Next Steps: *"Protect `/`, `/awards`, `/kudos`,
  `/profile`, `/admin` behind the Supabase session in `proxy.ts`"*). Does this run build that? → A:
  **Stay deferred.** Build the page presentationally and behaviourally; every route stays open exactly
  as today. ID-1 remains unasserted alongside the rest of the deferred route-protection work, and
  ID-0/ID-2 are asserted in their reachable form (the page renders, and the header's "Award
  Information" link reaches it). Gating one route while five stay open would be a worse state than
  either end of the choice; gating all six is a second feature with its own strict-E2E contract.
- Q: The left category nav's active state is specified only for clicks (ID-9/ID-11: click → scroll to
  section + gold colour and underline). Nothing specifies what happens to the active item when the user
  scrolls manually. What is the contract? → A: **Scroll-synced (scrollspy).** The active item follows
  whichever award section is in view, whether that section was reached by click, by manual scroll, or
  by landing on a `#<slug>` deep link. Click behaviour is a strict superset of ID-9/ID-11, so both stay
  assertable; on a ~6400px-tall page an indicator that goes stale while scrolling reads as broken.
  The URL hash is **not** rewritten during scroll (history pollution, and it would fight the existing
  on-load `#<slug>` auto-scroll).

## Orchestrator Assumptions (stated, not asked)

Resolvable from the design data or from the inherited homepage/prelaunch/login decisions; recorded so
the implementation agents do not re-derive them.

- **Test policy is `e2e-red-first`.** The resolved design contains behavioural interaction, not just
  static mapping: clicking a nav item scrolls to its section and moves the active state off the
  previous item (ID-9, ID-11), the active state also tracks manual scrolling (decision above), and the
  Kudos "Chi tiết" button navigates (ID-12). Per the test-policy resolution rule that selects strict
  E2E for state transitions. The runner exists and is real: `@playwright/test` ^1.62.1,
  `npm run test:e2e`, web target — no runner is installed or scaffolded for this run.
- **The six section anchors are the existing slugs.** `EXPECTED_AWARD_SLUGS` in `lib/awards.ts` already
  fixes them: `top-talent`, `top-project`, `top-project-leader`, `best-manager`,
  `signature-2025-creator`, `mvp`. The nav items and the section `id`s use these verbatim, so the
  homepage cards' `/awards#<slug>` links land on the right section with no new mapping layer.
- **`lib/awards.ts` is extended, not duplicated.** The `Award` interface gains the awards-page fields
  (long description, quantity value + unit, prize value(s) + note). The existing short `description`
  stays as the homepage card copy — the two surfaces genuinely show different text. One module remains
  the single source of truth for award data (DRY).
- **Award copy comes from the rendered frame, not the node names.** Cards D.2/D.3/D.4/D.6 are Figma
  *instances* of the D.1 component, so their node **names** all still read "Top Talent" while their
  actual `character` values differ. Copy is taken from each node's `character` field (already extracted
  below), never from `itemName`. The spec CSV's per-card `description` column has the same problem for
  Top Talent's quantity — it says "10 Đơn vị" where the frame renders "10 Cá nhân"; **the frame wins**,
  consistent with the homepage run's "Frame wins on copy and layout" rule.
- **Card images reuse the shipped assets.** The 336×336 award graphic on each card is the same
  composite the homepage cards already use — `public/saa/Award_BG.png` (the shared circular badge)
  plus the per-award wordmark addressed through the **existing `Award.image` field**, which resolves to
  `public/images/awards/<slug>.png` (all six files are present). Track A reuses that field as-is; it
  does **not** re-point at the `public/saa/*.png` copies and nothing is re-downloaded.
- **Header, footer and the Kudos block are reused unchanged.** `SiteHeader` and `SiteFooter` are the
  same chrome the frame draws. The Sun* Kudos promo at the bottom of this frame is byte-identical in
  copy and structure to the homepage's `components/home/kudos-section.tsx` (label "Phong trào ghi
  nhận", title "Sun* Kudos", the "ĐIỂM MỚI CỦA SAA 2025" body, the "Chi tiết" CTA to `/kudos`) — the
  existing component is reused, not forked (DRY, and it satisfies ID-8 and ID-12 as-is).
- **The hero keyvisual is the existing artwork.** Media node `2789:12915`
  (`MM_MEDIA_Root Further Logo`, 338×150) is the same ROOT FURTHER logo already at
  `/saa/Root_Further_Logo.png`; the wave banner behind it is `/saa/Keyvisual_BG.png`. This page's hero
  carries **no** countdown, event info or CTA row — those are homepage-only, so a smaller
  awards-page hero is built rather than adding variant props to `HeroKeyvisual` (YAGNI).
- **Header nav current-page state moves.** On `/awards` the header's "Award Information" item carries
  `aria-current="page"` and the selected styling, not "About SAA 2025" (which is the homepage's
  indicator today). This is a small change to the shared header, listed as an owned file to avoid a
  collision.
- **The section title block is a new pair of strings.** "Sun* annual awards 2025" (small, muted) and
  "Hệ thống giải thưởng SAA 2025" (large, gold) — note the trailing "SAA 2025", which the homepage's
  `awards.heading` does **not** have. New `awardsPage.*` dictionary keys in both dictionaries rather
  than reusing `awards.heading` and silently changing the homepage.
- **Responsive behaviour is derived.** Only the 1440-wide desktop frame exists. The two-column
  image/content card collapses to a single stacked column and the sticky left nav becomes a horizontal
  scrollable strip below the title on narrow viewports; 375px floor, following the precedent set for
  the prelaunch and login screens. Flagged to the design owner below.
- **Alternating card layout is read off the frame.** Cards alternate image-left/content-right
  (Top Talent, Top Project Leader, Signature 2025) and content-left/image-right (Top Project, Best
  Manager, MVP). Derived from the frame's x-positions, which the spec text does not state.
- **ID-13 (invalid section) needs no special code.** The nav is rendered from `AWARDS`, so an invalid
  section id is unreachable through the UI. The assertion is the reachable half: no console error and
  no scroll jump when a non-existent hash is supplied.

## Extracted design values (authoritative — do not re-derive or estimate)

Frame `313:8436`, 1440×6410. Full per-node styles come from MCP at implementation time; these are the
structural facts and the copy settled during clarification.

| Element | Node | Notes |
|---|---|---|
| Header | `313:8440` | existing `SiteHeader`; "Award Information" is the active item here |
| Hero keyvisual | `313:8451` | 1152×150 band; ROOT FURTHER logo `2789:12915` (338×150) on the wave ground |
| Section title | `313:8453` / `313:8454` / `313:8457` | "Sun* Annual Awards 2025" (muted) + "Hệ thống giải thưởng SAA 2025" (gold, large) |
| Category nav | `313:8459` (`C.1`–`C.6` = `313:8460`–`313:8465`) | sticky left column, 6 items, each with a 24×24 Target icon; active = gold + underline |
| Award cards | `313:8467`, `8468`, `8469`, `8470`, `8471`, `8510` | image 336×336 + content block; alternating sides |
| Card description | `…;214:2531` / `…;214:2623` | 480px wide, 16px/24px Montserrat 700, justified |
| Quantity row | `…;214:2536` + `…;214:2538` + `…;214:3532` | label "Số lượng giải thưởng:" + value + unit, Diamond icon |
| Prize row | `…;214:2544` + `…;214:2546` + `…;214:2547` | label "Giá trị giải thưởng:" + amount + note, License icon |
| Sun* Kudos block | `335:12023` | existing `KudosSection`; background `…;313:8416` (1152×500), wordmark `…;329:2948`, CTA `…;313:8426` |
| Footer | `354:4323` | existing `SiteFooter`; "Bản quyền thuộc về Sun* © 2025" |

### Per-award content (from each node's `character` value — the rendered text)

| Slug | Title | Quantity | Prize |
|---|---|---|---|
| `top-talent` | Top Talent | 10 Cá nhân | 7.000.000 VNĐ — cho mỗi giải thưởng |
| `top-project` | Top Project | 02 Tập thể | 15.000.000 VNĐ — cho mỗi giải thưởng |
| `top-project-leader` | Top Project Leader | 03 Cá nhân | 7.000.000 VNĐ — cho mỗi giải thưởng |
| `best-manager` | Best Manager | 01 Cá nhân | 10.000.000 VNĐ |
| `signature-2025-creator` | Signature 2025 - Creator | 01 Cá nhân hoặc tập thể | 5.000.000 VNĐ cho giải cá nhân **hoặc** 8.000.000 VNĐ cho giải tập thể |
| `mvp` | MVP (Most Valuable Person) | 01 Cá nhân | 15.000.000 VNĐ |

Long descriptions are in `plans/260820-1020-award-system-page/design/award-copy.md` — extracted
verbatim from the frame, to be copied into `lib/awards.ts` without paraphrase.

## Design defects to report back to the design owner

1. **`/he-thong-giai` is not this app's route.** ID-0/ID-1/ID-2 name a Vietnamese URL that exists
   nowhere in the delivered app, whose award route is `/awards` and whose six deep-link anchors are
   already live. Shipped against `/awards`; the intended canonical URL still needs naming. Same class
   of defect as `/todo` in the login run.
2. **Instance overrides are invisible in the node names.** Five of the six award cards are instances of
   the Top Talent component, so every tool that reads node `name` reports their title and body as "Top
   Talent". Anyone reading the design data without dereferencing `character` will ship six identical
   cards. Worth detaching the instances or renaming the overrides.
3. **The spec CSV disagrees with the frame on Top Talent's quantity.** The CSV row for `D.1` says
   "10 Đơn vị"; the frame renders "10 Cá nhân". Frame shipped.
4. **No mobile or tablet frame exists.** Only 1440. The sticky-nav and two-column card collapse are
   implementation-derived — same gap flagged on the prelaunch and login screens, now on its third
   screen running.
5. **The nav's scroll behaviour is unspecified.** The test cases cover click only. Scroll-sync was
   decided in clarification; worth writing into the spec.
6. **Best Manager and MVP have no prize note** ("cho mỗi giải thưởng") where the other four do, and
   Signature carries two prize rows joined by "Hoặc". Reproduced as drawn, but the inconsistency looks
   unintentional.
7. **Access control is specified but not buildable yet.** ID-1's redirect-to-login depends on route
   protection that the login run deliberately deferred; the test case will stay unasserted until that
   lands.
8. **The `Hoặc` separator on the Signature card is drawn in an unreadable colour.** Node `313:8499`
   specifies its text fill as `rgba(46, 57, 64, 1)` — `#2E3940`, the same value the design uses for
   divider lines — on the `#00101a` page ground. That is roughly **1.7:1** contrast, far below the
   WCAG AA floor of 4.5:1 for body text, and in practice the word is invisible. Reproduced as drawn
   (confirmed against the node, not guessed), but it needs a design ruling: either the word is
   decorative and should be dropped in favour of the divider rule alone, or it is meaningful — it is
   the only thing distinguishing "5.000.000 VNĐ **or** 8.000.000 VNĐ" from a list of two prizes both
   awarded — in which case it must be given a readable colour. Confirmed visually in
   `evidence/awards-1440-full-images-loaded.png`.

## Unresolved Questions

1. **Route protection remains deferred** (login run's Next Steps). ID-1 stays unasserted until `/`,
   `/awards`, `/kudos`, `/profile`, `/admin` are gated behind the Supabase session in `proxy.ts`.
2. **The canonical award-page URL** — `/awards` vs `/he-thong-giai` — needs a design-owner ruling for
   the record, even though `/awards` ships now.

## Next Steps (out of scope for this run)

- Route protection for the five app routes, closing ID-1.
- A mobile/tablet frame for this screen so the responsive collapse stops being derived.
