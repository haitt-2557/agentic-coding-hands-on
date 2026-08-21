---
phase: 4
title: "Shared kudos card kit (card, people, actions, hashtags, tooltips, toast)"
owner: momorph-ui-implementer
status: complete
priority: P1
effort: 3h
feature: F013
test_policy: e2e-red-first
depends_on: [2, 3]
concurrent_with: [6]
mode: section
---

# Phase 4 — Shared kudos card kit

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `MaZUn5xHXZ`, node `2940:13431`
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`dom-contract.md`](dom-contract.md) §6 (F25–F32), §5 (F24), §12 — **binding**
- [`design/kudos-content.md`](design/kudos-content.md) §3.3 (highlight card, node by node) and §5.3–§5.4 (post card)
- [`spec/kudos-live-board/technical-spec.md`](spec/kudos-live-board/technical-spec.md) — US001/US004/US005, FR-002/005/006/007/016/017, BR-001/002/005/007
- Phase 2 tokens + assets; Phase 3 exports (`KudosRecord`, `starTierFor`, `useSession()`)
- `AGENTS.md`: Next.js 16.3.1 — read `node_modules/next/dist/docs/` before writing code

## Overview

**Priority:** P1. **Status:** pending.

One card component serves both regions in two variants — `highlight` (528px, gold 4px border, both
action buttons, no attachments) and `post` (680px, no border, five 88×88 thumbnails, Copy Link only).
This phase is the A↔A seam: phases 5 and 7 both consume it, so it lands before either, and its props
are frozen. It also owns the heart (BR-001/BR-002), the clipboard + toast (BR-007), the clickable
hashtags (FR-009) and the star-tier tooltip (BR-005).

## Key Insights

- **The heart button's whole text content is the count digits.** The toggle test does
  `parseInt(textContent)` then asserts `+1`, so no `sr-only` text, no label, no separator may sit
  inside the button. The icon is `<img alt="">`; the accessible name lives in `aria-label`, which
  must contain the lowercase substring `like` (F26, F27).
- **The two card variants carry different message bodies** (defect #13) and different action bars.
  One component, two variants, zero forked files — the strings come from the record, not the code.
- **The frame's right-hand highlight card is genuinely incomplete** (defect #17): it has no receiver
  badge node and no `Xem chi tiết` label because it is clipped at the frame edge. Render both. That
  is an addition the design does not show, and it is deliberate.
- **Badges are raster** (defect #18) — a pill artwork image behind live text with a 0.5px `#FFEA9E`
  border and 48px radius. Never a solid gold fill. The `Super Hero` pill also carries a leftover
  `Super ` text layer at `opacity: 0.66`; render only `Super Hero` (defect #16).
- **At most one `role="tooltip"` in the DOM at a time** (F32). The star tooltip and the spotlight
  tooltip both obey it, so both must be conditionally mounted, never permanently hidden.
- **Clipboard rejection must fail silently** — no unhandled rejection, no false-success toast
  (BR-007). `navigator.clipboard` may also be `undefined` on a non-secure origin; guard both.

## Requirements

**Functional**
1. `kudos-card.tsx` — `KudosCard({ record, variant, viewerId, onHashtagClick })`, an `<article>`.
2. `kudos-card-people.tsx` — sender block, direction icon, receiver block: avatar (64×64, 1.869px
   white border), name, dept code, badge pill, 4×4 star dot, star tier + tooltip. Avatars and names
   are focusable triggers that navigate nowhere (FR-017).
3. `kudos-card-actions.tsx` — heart (count + `aria-pressed` + `disabled` on own kudos), `Copy Link`,
   and `Xem chi tiết` on the highlight variant only.
4. `kudos-hashtag-row.tsx` — one `<button>` per tag, text starting `#`, calling `onHashtagClick`.
5. `star-tier-tooltip.tsx` — conditionally mounted `role="tooltip"` with the verbatim BR-005 sentence.
6. `kudos-toast.tsx` — `KudosToast({ message })`, renders `null` when there is no message; the shell
   mounts exactly one.

**Non-functional**
- Each file under 200 lines; six files, no seventh "helpers" dumping ground.
- Client components only where interaction demands it (`kudos-card-actions`, `kudos-hashtag-row`,
  `star-tier-tooltip`, `kudos-toast`); `kudos-card` and `kudos-card-people` stay server-renderable so
  the cards exist in the server HTML.
- Zero inline literal content — every string comes from Phase 3 or the dictionaries.
- No new colour, radius or asset; Phase 2 owns those.

## Architecture

```
KudosCard({ record, variant, viewerId, onHashtagClick })   <article>
 ├─ KudosCardPeople   sender ─ direction icon ─ receiver
 │    └─ StarTierTooltip   (mounted only while the star is hovered/focused)
 ├─ timestamp            record.timestamp, 'HH:mm - MM/DD/YYYY'
 ├─ category row         highlight: centred text · post: text + 32px pen icon
 ├─ message box          1px #FFEA9E border, rgba(255,234,158,.40) fill, r12, pad 16/24
 ├─ attachments          post variant only — 5 × 88×88, 1px #998C5F, #FFF, r18
 ├─ KudosHashtagRow      one <button> per tag → onHashtagClick(tag)
 └─ KudosCardActions     heart(count) │ Copy Link │ [Xem chi tiết]
                              └─ onCopied('Link copied — ready to share!') → shell's KudosToast
```

Heart state: `Set<kudosId>` local to `KudosCardActions`, keyed by the viewer; `heartCount` renders as
`record.heartCount + (liked ? 1 : 0)`. Nothing is lifted — BR-001 is per card, and lifting it would
invite a shared-state bug the tests would not catch.

Frozen geometry (from `design/kudos-content.md`): highlight card `528px`, `padding 24/24/16/24`,
`gap 16`, `border 4px #FFEA9E`, `background #FFF8E1`, `radius 16px`; post card `680px`,
`padding 40/40/16/40`, `gap 16`, `radius 24px`, `background #FFF8E1`, no border. Dividers are 1px
`#FFEA9E` above the message block and above the action row. Message body 20/32/700 justified
`#00101A`; hashtags 16/24/700 `#D4271D`; heart count 24/32/700 `#00101A`; buttons 16/24/700 centred,
`padding 16px`, `radius 4px`, no background.

## Related Code Files

**Create** — `components/kudos/{kudos-card,kudos-card-people,kudos-card-actions,kudos-hashtag-row,star-tier-tooltip,kudos-toast}.tsx`.
**Modify** — none. **Delete** — none.
**Read for context** — `lib/kudos/{kudos-records,star-tiers}.ts`, `lib/session/session-provider.tsx`,
`components/awards/award-detail-card.tsx` (the house component idiom), `design/kudos-content.md`,
`dom-contract.md`.

## Implementation Steps

1. Read `design/kudos-content.md` §3.3 and §5.3–§5.4 in full. Every number below comes from there;
   guess nothing.
2. Read `components/awards/award-detail-card.tsx` for the prop-thin, named-export, class-constant
   idiom this repo uses.
3. Build `kudos-card-people.tsx` first — it is the densest node cluster (avatar, name, dept, badge,
   star dot, star tier).
4. Build `star-tier-tooltip.tsx` with `role="tooltip"`, mounted only on hover/focus of the star.
   Verify no second `role="tooltip"` can coexist.
5. Build `kudos-hashtag-row.tsx`: split `record.hashtags` into one button per tag; keep the frame's
   double space between the last two tags when rendering the row's spacing (defect #16 whitespace).
6. Build `kudos-card-actions.tsx`. Heart: `aria-label` containing `like`, `aria-pressed`, real
   `disabled` when `record.senderId === viewerId`, and **only** the count as text content. Copy Link:
   `try { await navigator.clipboard?.writeText(...) ; onCopied(...) } catch { /* silent, no toast */ }`.
7. Build `kudos-toast.tsx` — a single instance, `role="status"`, auto-hiding; not `role="tooltip"`.
8. Build `kudos-card.tsx` composing the above and branching on `variant` for border, padding,
   attachments and the second action button.
9. `npx tsc --noEmit` and `npm run lint`. A typecheck red on `kudos-board.tsx` (Phase 5) is expected
   during the concurrent window; a red inside these six files is not.
10. Asset-coverage check: every icon and image these components reference exists on disk from Phase 2.

## Todo List

- [ ] Six files created, each under 200 lines
- [ ] `KudosCard` is an `<article>`; both variants correct per §3.3/§5.3
- [ ] Heart: `aria-label` contains `like`, `aria-pressed` set, `disabled` on own kudos
- [ ] Heart button text content is the count digits and nothing else
- [ ] Heart toggle returns the count to its seed value on the second click
- [ ] Copy Link guarded try/catch; no toast on rejection; no unhandled rejection
- [ ] Hashtags are individual `<button>`s whose text starts `#`
- [ ] Star tier + verbatim BR-005 tooltip, conditionally mounted, single `role="tooltip"`
- [ ] Right-hand highlight card renders receiver badge + `Xem chi tiết` (defect #17)
- [ ] `Super Hero` renders once (defect #16 leftover layer dropped)
- [ ] Avatars/names focusable, navigating nowhere (FR-017)
- [ ] `npx tsc --noEmit` + `npm run lint` clean on owned files; asset coverage verified

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| Card shows all six information groups in both variants | visual check against `get_frame_image` at Phase 8 | US001 AS2, FR-002, FR-005, SC-001 |
| Heart increments then returns exactly | `7a7ec63e` green at Phase 8 | FR-006, BR-001, SC-005 |
| Own-kudos heart disabled while others stay actionable | `63645b03` green at Phase 8 | BR-002, SC-005 |
| Copy Link toast copy exact | `0adfd7ce` green; string is `Link copied — ready to share!` | FR-007, BR-007, SC-006 |
| Clipboard denial is silent | manual denial produces no console error and no toast | BR-007, edge-cases row 5 |
| Hashtag click re-filters | `d01729d4` green at Phase 8 (with Phase 5's shell) | FR-009, DEC-001, SC-003 |
| Star tooltip copy verbatim | the three sentences byte-match BR-005 | BR-005, SC-002 |
| Deferred triggers focusable, inert | keyboard tab reaches avatar, name, `Xem chi tiết`; no navigation | FR-016, FR-017, SC-009 |
| No invented visual value | every colour/radius/size traceable to §3.3/§5.3 or a Phase 2 token | clarifications |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| Extra text inside the heart button breaks `parseInt` arithmetic | **High** × **High** | F27 is restated in step 6; the count is the button's only text node; label goes to `aria-label` |
| A permanently-mounted star tooltip makes `[role="tooltip"]` resolve to many, breaking Phase 6's test | Med × **High** | Conditional mount enforced in step 4; F32 applies to every tooltip in the app |
| Hashtag buttons rendered from a single blob string, so `button:has-text("#")` finds nothing | Med × High | `record.hashtags` is already an array from Phase 3; the row never renders the joined string |
| Two forked card files appear ("highlight card" + "post card") | Med × Med | One component, `variant` prop, stated in the seam; review rejects a second card file |
| Card exceeds 200 lines | High × Low | Five collaborators already split out; move the attachment row out if it crosses |
| Clipboard on an insecure origin throws before `try` is entered | Low × Med | Optional-chain `navigator.clipboard?.writeText` inside the try |
| `aria-pressed` on a disabled button confuses assistive tech | Low × Low | Omit `aria-pressed` when disabled; the test tolerates a null attribute |

## Security Considerations

The viewer identity arrives as a prop from the mock session and gates one `disabled` attribute — it
is not an authorization check and must not be described as one. Clipboard writes are wrapped so a
denied permission cannot surface as an unhandled rejection. Card content is static fixture data; no
`dangerouslySetInnerHTML`, no user-supplied HTML, and the copied link is built from the record id, not
from anything a user typed.

## Next Steps

Unblocks Phase 5 (shell + carousel) and Phase 7 (feed + sidebar), which then run in parallel with
Phase 6. Report the final prop signatures against [`dom-contract.md`](dom-contract.md) §12.

## Out of scope

`lib/**` (Phase 3 owns the data), `app/globals.css` and `public/**` (Phase 2), `e2e/**` and
`playwright.config.ts`, the carousel and filter bar (Phase 5), the feed and sidebar (Phase 7), the
spotlight board (Phase 6), the four deferred destinations (submit dialog, detail page, profile page,
Secret Box), the special-day heart multiplier (BR-006), and route protection.
`test_policy: e2e-red-first` — RED is proven in Phase 1; do not write, edit or run E2E tests and do
not claim GREEN. Use Figma design content as mock data source. Do NOT invent data.
