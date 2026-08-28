# /kudos/send shipped without its card container — dark text was invisible on a dark page

**Date**: 2026-08-28 09:35
**Severity**: high (visual — form was effectively illegible, no behavior change)
**Component**: Send Kudos form (F014, route `/kudos/send`), presentational layer only
**Status**: resolved — SEALED review (score 8/10, 0 critical), 24/24 e2e green, tsc/lint clean; changes staged in the working tree on `main`, not yet committed

## What Happened

`/kudos/send` never implemented the cream card container that MoMorph design frame
`RO7O6QOhfJ` ("Gửi lời chúc Kudos", file `9ypp4enmFmdK3YAFJLIu6C`) draws around the whole
form — node `662:9637`: `#FFF8E1` background, 24px radius, 40px padding, 32px gap, 752px
width. Every piece of dark text inside the form (`text-background` / `#00101a` — the page
heading, all field labels, the six markdown-toolbar glyphs, the anonymous checkbox label)
was styled correctly in isolation, but with no light card underneath it rendered on the
site's dark `bg-background` page. The form was there; nobody could read it.

Three smaller drifts from the same frame shipped alongside it and were fixed together:
- Heading was 24px, left-aligned — spec calls for 32px/40px, centered.
- Field labels sat stacked above their controls — the design's row nodes
  (`I662:9637;520:9871` etc.) are `flexDirection: row`, label beside control.
- Footer buttons lost their icons and "Hủy" rendered in `text-white` instead of the design's
  dark text on the cream card.

## Root Cause

The card container was simply never coded — not a regression, an omission from the
original F014 build. `git log` shows one feature commit for this route (`7dbc334 feat:
send kudos (#7)`) and no prior fix touched these files, so this was the first pass at
visual conformance for the container itself.

## Fix

Presentation-only; no validation, state, or submit logic changed (confirmed by the reviewer
diffing non-JSX code as identical across all six component files).

- `components/kudos/send/kudos-send-form.tsx` — added the card:
  `rounded-3xl bg-kudos-card-ground p-10 gap-8 max-w-[752px]` (`--kudos-card-ground: #fff8e1`
  in `app/globals.css`), heading now `text-[32px] leading-10 font-bold text-center`.
- `components/kudos/send/{anonymous-toggle,recipient-field,title-field,image-attachments}.tsx`
  — restructured to row layout, label beside control, per the design's row nodes.
- `components/kudos/send/form-footer.tsx` — "Hủy ✕" in dark text, "Gửi →" with icons.
- `app/kudos/send/page.tsx` — one-line pass-through change.
- `e2e/send-kudos-layout.spec.ts` — added a regression-prevention test asserting the card's
  `rgb(255, 248, 225)` background, the heading's `rgb(0, 16, 26)` color, and label/control
  horizontal alignment, so this defect class fails again if it recurs.

## Evidence

| Command | Result |
|---|---|
| `npx playwright test e2e/send-kudos-{access,layout,interactions,validation,submission,submit}.spec.ts` | 24/24 pass |
| `npx playwright test e2e/send-kudos-layout.spec.ts` | 5/5 pass (includes the 3 new regression assertions) |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 errors (6 pre-existing warnings, unrelated files) |

Visual comparison against the live MoMorph frame: card, heading, label layout, toolbar
visibility, checkbox label, and footer styling all matched. The design mock shows a filled
state (chips selected, 5 images, nickname visible); the empty-state screenshot differs from
that only where content is genuinely absent — not treated as a defect.

Full command log, before/after screenshots, and the sealed inspection verdict:
`plans/reports/fix-260828-0847-kudos-send-visual/evidence/`,
`plans/reports/tester-260828-0915-kudos-send-visual-verify.md`.

## Also Worth a Line

- **Two accepted, non-blocking findings** from review: (1) the first draft of the new e2e
  assertion located the card via a fragile `[class*="card"]` substring match; fixed to
  `page.locator('form')`, the actual card element, and re-verified green. (2) `title-field.tsx`
  uses `items-center` on a row whose right side can grow taller once an error line appears —
  the label may drift vertically then. Accepted as Low, not fixed this pass.
- **Two frames share the name "Gửi lời chúc Kudos"** in this MoMorph file —
  `JsTvi8KVQA` (the frame F014's original build was scoped to, per
  `plans/260824-0912-send-kudos-wishes/clarifications.md` decision 8) and `RO7O6QOhfJ` (the
  one this fix's evidence cites). Both apparently share the same card node ID (`662:9637`),
  which is why the fix's node references line up with the original component's `mm:` code
  comments. Worth a second look before the next MoMorph pass on this screen, so the "in
  scope" frame stays a deliberate choice, not an accident of two identically-named twins.

## Lesson

A missing container is easy to miss in isolated component review — every piece styled fine
on its own. It only became visible (or rather, didn't) once composed on the actual page
background. Catching this class of defect earlier means checking composed-page screenshots
against the design frame, not just each component's own props.
