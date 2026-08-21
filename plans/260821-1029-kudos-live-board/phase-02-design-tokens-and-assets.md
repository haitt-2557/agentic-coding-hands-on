---
phase: 2
title: "Design tokens and frame assets for /kudos"
owner: momorph-ui-implementer
status: complete
priority: P1
effort: 2h
feature: F013
test_policy: e2e-red-first
depends_on: [1]
concurrent_with: [3]
mode: section
---

# Phase 2 — Design tokens and frame assets

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `MaZUn5xHXZ`, node `2940:13431`
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`design/kudos-content.md`](design/kudos-content.md) §8 (token inventory) and §9 (the 23-item asset list) — **the only authority**
- [`plan.md`](plan.md) · [`dom-contract.md`](dom-contract.md) (F6 constrains asset `alt` text)
- `app/globals.css` (57 lines today) — the two-step token idiom
- `AGENTS.md`: Next.js 16.3.1 — read `node_modules/next/dist/docs/` before writing code

## Overview

**Priority:** P1. **Status:** pending.

Land every visual primitive the four component phases consume: eight new colour tokens, the radius
decision, and 23 exported assets. Nothing renders here — this phase exists so that no component
phase ever has to guess a colour or invent an image, and so that `app/globals.css` and `public/**`
have exactly one owner.

## Key Insights

- **Five of the 23 assets are not `MM_MEDIA_*`-named** (items 19–23: `image 25`, `Root further mo
  rong 1`, `image 35`, `image 24`, and the star mark inside `MM_MEDIA_Kudos logo`). A
  `list_media_nodes`-driven pass will silently miss them. Pull them by node id.
- **Badge pills are raster artwork, not flat gold** (defect #18): 1–4 image rectangles, some with
  `background-blend-mode: screen`, behind live text with a 0.5px `#FFEA9E` border and 48px radius.
  There is no fill token to reuse — each of the four tiers needs its own flattened export.
- Three "missing" assets may already exist: `MM_MEDIA_KV Background` vs `public/saa/Kudos_Background.png`
  (this frame crops a much taller source at `-0.163px -909.862px / 101.245% 393.038%`),
  `MM_MEDIA_Kudos logo` vs `Kudos_Wordmark.svg` (here it is a 120×94 vector **plus** a live
  550×98 SVN-Gotham TEXT node), and `Root further mo rong 1` vs `Root_Further_Logo.png`. Verify
  before re-exporting; a wrong crop is worse than a duplicate file.
- `app/globals.css` has **no radius token at all** today. Introducing eight would be the first —
  YAGNI says use Tailwind arbitrary values (`rounded-[17px]`) for one-off radii and add a token only
  where a value repeats across components. The repeating ones are `48px` (all four badge pills) and
  `68px` (submit pill + Sunner search).
- The heart needs an active and an inactive rendering, and **the design carries no heart colour at
  all**. Do not export two heart images: export one and tint it via the frozen decision — active
  `--badge-danger` `#D4271D`, inactive `#999999` (which becomes a token here).

## Requirements

**Functional**
1. Eight new colours in `app/globals.css`, using the existing two-step idiom (raw value in `:root`,
   `--color-<name>: var(--<name>)` alias in `@theme inline`).
2. Two new radius tokens (`--radius-badge: 48px`, `--radius-pill: 68px`); every other frame radius
   (17, 18, 24, 46.404, 47.14, 100) stays an inline arbitrary value.
3. All 23 assets present on disk, named in the conventions already in use.
4. An asset-coverage note listing, per item, `downloaded | already-present (verified) | superseded`.

**Non-functional**
- `app/globals.css` stays well under 200 lines and keeps its current section order.
- No token is added that no component will use; no token duplicates an existing one.
- Filenames kebab-case under `public/images/kudos/`; MoMorph-style `PascalCase_Underscore` only when
  adding to `public/saa/` alongside its siblings.

## Architecture

```
app/globals.css
  :root            +8 raw values   (card-ground, message-tint, sidebar-bg, muted-text,
                                    wordmark, spotlight-highlight, new-hero-ground, avatar-fallback)
  @theme inline    +8 --color-*    → enables bg-*/text-*/border-* utilities
                   +2 --radius-*   → rounded-badge, rounded-pill

public/saa/          icons shared with existing chrome: Search.svg, Left.svg, Right.svg,
                     Send.svg, Heart.svg, Link.svg, Detail.svg, Open_Gift.svg
public/images/kudos/ feature artwork: badge-new-hero.png, badge-rising-hero.png,
                     badge-super-hero.png, badge-legend-hero.png, avatar-placeholder.png,
                     sample-attachment.png, spotlight-board-artwork.png,
                     spotlight-board-base.png, sidebar-heart-x2.png, kudos-star-mark.svg
```

Consumers: Phase 4 (heart, link, detail, send, badges, avatar, star tiers), Phase 5 (KV background,
wordmark + star mark, pen, down, left/right arrows, pill radius), Phase 6 (both spotlight artwork
layers, search icon, spotlight-highlight colour), Phase 7 (attachment thumbnails, avatar,
open-gift, sidebar heart, sidebar-bg).

### Token table (verbatim from `design/kudos-content.md` §8)

| Token | Value | Used by |
|---|---|---|
| `--kudos-card-ground` | `#FFF8E1` | highlight + post card backgrounds (4, 5, 7) |
| `--kudos-message-tint` | `rgba(255, 234, 158, 0.40)` | message box in both card types (4) |
| `--kudos-sidebar-bg` | `#00070C` | both sidebar blocks (7) |
| `--muted-text` | `#999999` | dept codes, timestamps, page indicator, scrollbar, star dot, inactive heart (4, 5, 7) |
| `--kudos-wordmark` | `#DBD1C1` | the `KUDOS` glyph text only (5) |
| `--spotlight-highlight` | `#F17676` | the one highlighted cloud name `2940:14198` (6) |
| `--new-hero-ground` | `#FFF3C6` | New Hero pill backing rect `3007:17507` (4) |
| `--avatar-fallback` | `#EEEEEE` | avatar placeholder fill under the image (4, 7) |

## Related Code Files

**Modify** — `app/globals.css` (only owner).
**Create** — the 8 icon files in `public/saa/`, the 10 artwork files in `public/images/kudos/`, and
`plans/260821-1029-kudos-live-board/design/asset-coverage.md` (the audit note).
**Delete** — none. **Read for context** — `design/kudos-content.md` §8–§9; `public/saa/` listing.

## Implementation Steps

1. Read `design/kudos-content.md` §8 and §9 end to end. Do not consult any other colour source.
2. Add the eight `:root` values in the file's existing order and style, then the eight
   `--color-*` aliases and the two `--radius-*` entries in `@theme inline`.
3. Verify the three suspected-existing assets by comparing the frame's background-position /
   dimensions against the files on disk. Record the verdict per item; re-export only on mismatch.
4. Download the 15 `MM_MEDIA_*` items via the MoMorph MCP.
5. Download items 19–23 **by node id** (`2940:14181`, `2940:14173`, `3241:14932`, `2940:14178`,
   `2940:13442`) — they are invisible to `list_media_nodes`.
6. For item 22 (`image 24`, no `background` URL in the data): inspect first. If it carries no image,
   record it as "empty placeholder — nothing to export" rather than fabricating a file.
7. Export the four badge pills as flattened PNGs (blend modes cannot be reproduced from a token).
8. Write `design/asset-coverage.md` with one row per item 1–23 and its disposition.
9. `npx tsc --noEmit` and `npm run lint` (both must be clean; CSS-only changes should not move them).

## Todo List

- [x] 8 `:root` values + 8 `@theme inline` aliases added, existing style preserved
- [x] `--radius-badge: 48px` and `--radius-pill: 68px` added; no other radius tokenised
- [x] 3 suspected-existing assets verified against frame geometry; verdict recorded
- [x] 15 `MM_MEDIA_*` assets downloaded
- [x] Items 19–23 pulled by node id
- [x] Item 22 inspected; recorded rather than fabricated if empty
- [x] 4 badge pills exported as flattened PNGs
- [x] `design/asset-coverage.md` written, 23 rows
- [x] `npx tsc --noEmit` + `npm run lint` clean

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| Every colour a component needs exists as a token | grep each of the 8 names in `globals.css`; values byte-match §8 | SC-001 |
| No invented visual value | every token traceable to a §8 row; no heart red beyond `--badge-danger` | clarifications, defect #9 |
| Asset coverage is complete and auditable | `design/asset-coverage.md` has 23 rows, each `downloaded`/`verified`/`empty` | SC-001, SC-007, SC-008 |
| The five non-`MM_MEDIA_` items are present | files exist for 19–21, 23; 20 possibly `verified`; 22 justified | defect #18 |
| Nothing regressed | `tsc --noEmit` + `lint` clean; existing pages unchanged visually | — |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| `Kudos_Background.png` is a different crop and the banner looks wrong at Phase 5 | **High** × Med | Step 3 compares the frame's background-position/size against the file before reuse; re-export on any mismatch and note it |
| Badge PNGs exported without the `screen` blend layers look flat/grey | Med × High | Export the composed pill node, not its children; visually compare against `get_frame_image` before accepting |
| Token sprawl — eight tokens where three would do | Med × Low | Each token in the table names its consuming phase; any token with no consumer is dropped before merge |
| Adding the first radius tokens sets a precedent that invites more | Med × Low | Only the two repeated values are tokenised; the rest stay arbitrary values, stated in this file |
| Item 22 is fabricated to "complete" the list | Low × High | Step 6 makes "nothing to export" an acceptable, recorded outcome |
| A new `alt` text containing `KUDOS`/`kudos` breaks F6 | Med × High | Only the wordmark image may carry `KUDOS` in `alt`; every other asset consumed later uses `alt=""` or non-matching text — stated here for phases 4–7 |

## Security Considerations

None. CSS custom properties and static image files only; no user input, no network call at runtime,
no secret. Downloaded assets are committed to `public/` and served as static files.

## Next Steps

Unblocks Phase 4 (card kit) and Phase 6 (spotlight). Phase 5 and 7 consume the same tokens and
assets and must not add their own. Report the asset-coverage note path in the completion message.

## Out of scope

Every `components/**` and `lib/**` file, `e2e/**`, `playwright.config.ts`, any rendering, any
heart-colour choice beyond the frozen `--badge-danger`/`#999999` pair, a Pan/Zoom icon (the control
is omitted — FR-012), the `digital-numbers.woff2` gap in `public/fonts/` (unrelated), and the four
deferred destinations. `test_policy: e2e-red-first` — do not write, edit or run E2E tests and do not
claim GREEN. Use Figma design content as mock data source. Do NOT invent data.
