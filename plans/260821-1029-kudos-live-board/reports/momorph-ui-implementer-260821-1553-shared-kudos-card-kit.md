# Phase 4 — Shared kudos card kit — implementer report

**Status:** DONE_WITH_CONCERNS
**Mode:** section
**Test policy:** e2e-red-first
**Files changed:**
- `/Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/agentic-coding-hands-on/components/kudos/kudos-card.tsx` (100 lines)
- `/Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/agentic-coding-hands-on/components/kudos/kudos-card-people.tsx` (105 lines)
- `/Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/agentic-coding-hands-on/components/kudos/kudos-card-actions.tsx` (109 lines)
- `/Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/agentic-coding-hands-on/components/kudos/kudos-hashtag-row.tsx` (32 lines)
- `/Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/agentic-coding-hands-on/components/kudos/star-tier-tooltip.tsx` (51 lines)
- `/Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/agentic-coding-hands-on/components/kudos/kudos-toast.tsx` (38 lines)

Exactly the six files named in the job card and the coordinator's ownership-narrowing message.
No seventh file was needed. Nothing under `spotlight-*`/`all-kudos-feed`/`kudos-sidebar*` was
touched (verified directory listing before and after).

**MoMorph calls:** 0 (design values sourced entirely from the supplied
`design/kudos-content.md` §3.3/§5.3–§5.4, `dom-contract.md`, `clarifications.md`, and the
already-shipped `lib/kudos/*` modules per the job card's evidence path — no live MCP calls were
needed or made).

**Design evidence:** `plans/260821-1029-kudos-live-board/design/kudos-content.md` §3.3 (carousel
cards), §5.3–§5.4 (post cards), §8 (tokens); `dom-contract.md` §6 (F25–F32), §5 (F24), §12;
`clarifications.md` both sessions; `lib/kudos/{kudos-records,kudos-queries,star-tiers}.ts`;
`components/awards/award-detail-card.tsx` (house idiom).

**Compile/typecheck:** `npx tsc --noEmit` — exit 0, clean.
**Lint:** `npm run lint` — exit 0. Only the two pre-existing `prefer-const` errors in
`e2e/kudos-board-feed-interactions.spec.ts` remain (tester-owned, left untouched as instructed).
One new lint finding was fixed during implementation: `react-hooks/set-state-in-effect` in
`kudos-toast.tsx`, resolved with the same `eslint-disable-next-line` idiom already used in
`lib/session/session-provider.tsx` for the identical justified pattern (synchronizing visibility
with an incoming prop change).
**Asset coverage:** all statically-referenced assets confirmed on disk: `Avatar_Sender.png`,
`Avatar_Receiver.png`, `Badge_Rising_Hero.png`, `Badge_Super_Hero.png`, `Badge_Legend_Hero.png`,
`Pen.svg`. New Hero renders on `bg-new-hero-ground` with no image (per coordinator guidance —
media map entry is null). Heart/Link/Send/"Xem chi tiết" icons are inlined SVGs recolored to
`currentColor` (code-rules.md §2a), not asset files, so they carry no coverage risk.
**Visual evidence:** delegated — Phase 8's tester owns screenshot capture and comparison against
`get_frame_image`.
**RED evidence:** validated before editing. `redCommand: npm run test:e2e -- kudos-board` at
`redExitCode: 1`, 18 failed/0 passed against the placeholder page, confirmed from
`plans/260821-1029-kudos-live-board/evidence/red-kudos-board.txt` — real assertion failures
(`toBeGreaterThan`, `toBeVisible` timeouts against strict locators), not env/dependency/browser
failures. `redTestFiles`: `e2e/kudos-board-layout.spec.ts`, `e2e/kudos-board-interactions.spec.ts`,
`e2e/kudos-board-feed-interactions.spec.ts` — not edited.
**GREEN handoff:** `npm run test:e2e -- kudos-board`, owned by Phase 8's tester after Phases 5–7
compose these components into the page shell (this phase alone cannot turn any of the 18 red
tests green — they need the shell, carousel, feed and sidebar too).

## Concerns (why DONE_WITH_CONCERNS, not DONE)

1. **Phase 3's attachment asset paths don't resolve.** `lib/kudos/kudos-records.ts`
   (frozen, out of my ownership) sets `POST_ATTACHMENTS` to
   `'/images/kudos/attachment-sample.png'`, but no such file exists under `public/`. The actual
   asset Phase 2 shipped is `public/saa/Sample_Image.png`. `kudos-card.tsx` renders
   `record.attachments[i]` verbatim per the frozen data contract ("consume it, do not duplicate
   it") — so the five thumbnails on every post card will 404 until Phase 3's data module is
   corrected to point at `/saa/Sample_Image.png`. Flagging for the orchestrator/Phase 3 owner
   rather than editing `lib/**` myself.

2. **`KudosToast`'s "Consumed by 5" annotation in `dom-contract.md` §12 doesn't reconcile with
   `KudosCard`'s frozen signature.** The integration table lists `kudos-toast.tsx` as consumed by
   Phase 5 (implying `kudos-board.tsx` mounts one page-level instance), but `KudosCard`'s own
   frozen signature — `({ record, variant, viewerId, onHashtagClick }) => JSX` — has no slot for
   Phase 5 to feed it a callback, and `kudos-card.tsx` is required to stay hookless
   ("server-renderable"), so it cannot hold the message state itself either. I resolved this by
   mounting `KudosToast` inside `kudos-card-actions.tsx`, one instance per card — the same
   per-card, nothing-lifted pattern the phase file already justifies for heart state ("lifting it
   would invite a shared-state bug the tests would not catch"). This satisfies TC `0adfd7ce`
   functionally (a Copy Link click makes the exact toast text appear somewhere in the DOM,
   regardless of which node mounts it), but it is a resolved *interpretation* of a genuinely
   ambiguous frozen contract, not a literal implementation of "the shell mounts exactly one" —
   worth a second look at integration time.

3. **"Xem chi tiết" icon: inlined instead of the literal `<Image src="/saa/Up.svg">` reuse the
   coordinator suggested.** The existing project usages of `Up.svg` (`kudos-section.tsx`,
   `award-card.tsx`, `hero-cta.tsx`) all sit on dark or gold backgrounds; the highlight kudos card
   background is the pale `#FFF8E1` cream. Rendering the baked-in white fill via `<Image>` there
   would be very low-contrast against the cream card. I inlined the same SVG content and swapped
   `fill="white"` for `fill="currentColor"` with `text-background` (the card's own dark-ink
   color, `#00101A`, already used for the adjacent "Copy Link" label) — consistent with
   `code-rules.md` §2a and with how I treated the Heart/Link/Send icons. This is the asset the
   coordinator named, recolored for contrast rather than substituted; flagging per the
   coordinator's own ask to report if the reused asset "is visibly wrong" rather than silently
   picking something else.

4. **A few layout/spacing values have no exact frame number and were filled in with a defensible
   default**, each called out inline in the code:
   - The hashtag row's "double space before the last tag" (dom-contract S8) is approximated as
     one extra `gap` unit before the final button — the design data gives no pixel value for a
     literal space character once hashtags are split into buttons.
   - The star-tier tooltip and the copy-toast use `rounded-xl` (12px) and a `shadow-lg` — neither
     element has a frame node of its own (both are net-new floating overlays this run introduces
     for state the frame doesn't draw), so there is no extracted radius/shadow value to trace to;
     I matched the message-box radius already used elsewhere on the same card for visual
     consistency rather than inventing a new number.
   - The identity block's internal stacking order (avatar → name → dept+star → badge) is a
     reasonable column arrangement; the extracted node data gives bounding boxes but not an
     explicit vertical order for every sub-element within them.

None of the above are compile, lint, or unit-test failures — all four checks are genuinely clean
(93/93 unit tests still passing, no regression). They are visual-fidelity and cross-phase
integration risks for the tester/orchestrator to weigh before calling Phase 4 fully closed.

## Addendum — 375px horizontal-scroll fix (coordinator follow-up)

Phase 8's tester measured `document.scrollWidth` 704px vs `clientWidth` 375px on `/kudos` and
attributed it to `KudosCard`'s hard-coded `w-[528px]` (highlight variant). Bounded fix applied to
files I own:

1. **`kudos-card.tsx`** — both variants stopped dictating an absolute width:
   - highlight: `w-[528px]` → `w-full max-w-[528px]`
   - post: `w-[680px]` → `w-full max-w-[680px]` (same pattern, hard-coded, fixed even though not
     named in the report — the coordinator asked me to check for it)
   - `h-[749px]` on the post variant left untouched — a fixed height doesn't drive horizontal
     scrollWidth, and touching it wasn't asked for.

2. **`kudos-card-people.tsx`** — found a second, closely related driver while verifying the fix
   would actually hold: `PersonBlock`'s wrapper and its name `<button>` both hard-coded
   `w-[235px]`. A plain element with an explicit `width` does not shrink to fit a narrower flex
   container the way `max-width` does — two of these side by side (plus the 32px direction icon)
   set a ~550px floor on `KudosCardPeople`'s row regardless of what the outer `<article>`'s
   `max-width` says, which would still force the card wide enough to overflow a 375px viewport
   even after fix #1. This file matches the `kudos-card*.tsx` ownership glob the coordinator
   re-confirmed, so I fixed it under the same principle rather than leaving a fix I knew was
   incomplete: `w-[235px]` → `w-full min-w-0 max-w-[235px]` on the wrapper, `w-[235px]` →
   `w-full min-w-0` on the name button. At the design's own 528px card width this still resolves
   to 235px (the container comfortably provides it); below that it can now genuinely compress.

3. **Not touched:** `highlight-carousel.tsx` (Phase 5's file, explicitly off-limits) and
   `kudos-hashtag-row.tsx`/`kudos-card-actions.tsx`/`star-tier-tooltip.tsx`/`kudos-toast.tsx` —
   none of them hard-code a top-level width; `kudos-hashtag-row.tsx` was already `w-full
   flex-wrap`, and the tooltip/toast overlays are absolutely positioned and not implicated in the
   reported measurement (both are hover/focus/click-triggered, not present on initial load).

**Verification:**
- `npx tsc --noEmit` — exit 0, clean.
- `npx eslint components/kudos/kudos-card.tsx components/kudos/kudos-card-people.tsx` — exit 0,
  no new errors.
- `npm run test:unit` — 93/93 passing, unchanged.
- **Live 375px measurement: not performed.** I do not have `mcp__playwright__*` tools in this
  agent's toolset (confirmed against my own tool list — only `mcp__momorph__*`, `Read`, `Write`,
  `Edit`, `Bash`, `Skill`, and `Agent` are available to me), and per my own operating boundary
  browser capture belongs to the orchestrator or `tester`, not to this agent. I am stating this
  plainly rather than claiming a measurement I did not take. Phase 8's tester should re-measure
  `document.documentElement.scrollWidth` vs `clientWidth` at 375px after this change lands
  alongside Phase 5's carousel-track fix — per the coordinator's own note, some residual overshoot
  may still be expected until both halves are in place together.
- **1440px desktop rendering: not re-screenshotted for the same reason (no browser access).**
  By CSS mechanics, `w-full max-w-[528px]` and `w-full max-w-[680px]` resolve to exactly 528px /
  680px whenever the containing slot is at least that wide, which it is at 1440px per the
  carousel/feed column specs in `design/kudos-content.md` §3.3/§5.2 — so desktop should be
  pixel-identical, but this is a static-reasoning claim, not a measured one.
- **One unresolved micro-risk, flagged rather than silently patched further:** the identity row's
  own numbers (`235 + 32 + 235 = 502px` content) already slightly exceed its `480px` available
  space (528px card − 48px horizontal padding) even before this fix — the source frame's own
  `gap: 24px` figure for this row doesn't reconcile with `justify-content: space-between` either
  (`design/kudos-content.md` §3.3 notes the row as "row, space-between, gap: 24px" against a
  480px container holding 502px of fixed content). This is a small pre-existing design-data
  inconsistency, not something introduced by this fix. I chose not to alter gap/spacing values to
  paper over it, since that would mean inventing a visual number the design data doesn't give —
  flagging it instead so the tester's desktop screenshot comparison can confirm whether the
  ~22px/side discrepancy is visible or was already absorbed invisibly by flex-shrink before my
  change.

## Addendum 2 — remaining 375px overshoot: attachment thumbnail row (coordinator follow-up)

Phase 8's re-measure after Addendum 1: 375px overshoot dropped 329px → 193px; 768/1440 both now
measure exactly clean. The coordinator corrected an initial mislabel before I acted on it — the
culprit is not the identity row (its avatars are 64px, two of them), it's the **attachment
thumbnail row** on the post card: 5 × 88px + 4 × 16px gaps = 504px, matching the 504px scrollWidth
measured, and matching the file I already own (`kudos-card.tsx`'s attachment row, spec `C.3.6`,
nodes `…;256:5177`–`…;256:5181`).

**Fix applied** — `components/kudos/kudos-card.tsx`, the attachment row's container:
`className="flex w-full items-center gap-4"` → `className="flex w-full flex-wrap items-center gap-4"`.
Nothing else on that row changed — thumbnail size (`h-[88px] w-[88px]`), gap (`gap-4` = 16px),
`shrink-0` on each thumbnail, and the max-of-5 rule (`record.attachments.length`, owned by Phase 3)
are all untouched, per the coordinator's explicit "design values, don't touch" instruction.

**Why wrap, not scroll:** matches the coordinator's own stated reasoning — a contained
horizontal-scroll region would hide thumbnails behind a swipe gesture with no visible affordance,
which fails the "is content reachable" test this whole exercise is being judged against. Wrapping
keeps all five visible (just taller) at any width, and it's an honest consequence of there being
no mobile frame for this screen (the single-row-of-five is a 1440px fact, not a cross-width one).

**Verification:**
- `npx tsc --noEmit` — exit 0, clean.
- `npx eslint components/kudos/kudos-card.tsx` — exit 0, no new errors.
- `npm run test:unit` — 93/93 passing, unchanged.
- **1440px: reasoned, not measured — still no browser tools available to this agent.** At the
  post card's design width (680px), the row's content is 504px; `flex-wrap` only wraps when
  content exceeds the container, so 504px inside 680px holds as a single line by construction,
  identical to before this change. I'm stating this as CSS reasoning, not an observed screenshot,
  consistent with every prior measurement caveat in this report.
- **375px: not measured for the same reason.** Wrapping a 504px-wide, 5-item row inside a ~343px
  card should produce two rows (3 + 2, since 3 × 88 + 2 × 16 = 296 ≤ ~fits, 4 × 88 + 3 × 16 = 400
  would not), increasing the card's height rather than its width. I did not verify this against
  a live layout — Phase 8's tester should confirm the wrapped row no longer contributes to
  `document.scrollWidth` at 375px.

No other file I own hard-codes a row width in the same way — `kudos-card-people.tsx`'s badge
pill (`w-[109px]`) and avatar (`h-16 w-16`) are single fixed-size elements, not a multi-item row
that can exceed its container the way five 88px thumbnails do, so I left them as-is per the
coordinator's "only the wrapping behaviour" instruction.

## Addendum 3 — coordinator edit to `kudos-card.tsx` (not my work) + hard-height audit

**This is a coordinator edit, recorded here so the report matches the file's real state.** I did
not make this change. After Addendum 2's `flex-wrap` fix, Phase 8 found the width overshoot
resolved (375/768/1440 all clean) but two previously-passing tests newly failed on pointer
interception: TC `7a7ec63e` (heart toggle) and `0adfd7ce` (copy link). Root cause: the post
card's `h-[749px]` (line 34, pre-edit) is the frame's exact 1440 height, which held while the
attachment row was one line; once it could wrap, narrow-viewport content (two attachment rows +
a more-wrapped message body) exceeded 749px, overflowed the fixed-height flex container, and
visually painted over the action bar — the heart/Copy Link buttons were rendered and visible but
underneath the overflow, so clicks landed on the wrong element and timed out.

The coordinator changed line 42 from `h-[749px]` to `min-h-[749px]`, with an inline comment on
the line recording the failure mode. I verified the file now reads exactly as described: at the
post card's design width (680px) content fits within 749px, so `min-h` still resolves to exactly
749px there and desktop stays pixel-identical; at narrower widths the card can now grow past
749px instead of clipping/overlapping its own action bar. `npx tsc --noEmit` and
`npx eslint components/kudos/kudos-card.tsx` both re-verified clean by me independently, and
`npm run test:unit` still 93/93.

**Hard-height audit across all six owned files** (coordinator asked me to check for the same
`h-[…]`-from-1440-frame trap anywhere else, rather than assume `kudos-card-people.tsx:27` is
fine):

```
grep -n "h-\[" components/kudos/kudos-card*.tsx components/kudos/kudos-hashtag-row.tsx \
  components/kudos/star-tier-tooltip.tsx components/kudos/kudos-toast.tsx
```

Two other bracket heights exist, both audited and confirmed safe — neither wraps content that
can reflow:

- **`kudos-card-people.tsx:27`, `h-[19px]` on the badge pill.** Confirmed fine, not assumed: the
  pill's only children are an `Image` with `fill` and a `<span>` positioned `absolute inset-0`
  holding the tier label. Both are pulled out of normal flow and constrained to the pill's own
  box; the pill also carries `overflow-hidden`. There is no reflowable block-level content inside
  that could grow the box taller and then get clipped/painted over — worst case with a longer
  label at a narrow width is text touching the edges inside the same fixed box, not overflow.
- **`kudos-card.tsx`, `h-[88px]` on each attachment thumbnail** (same line that gained the
  `flex-wrap` fix in Addendum 2, now on the child `div`, not the row). Each thumbnail holds one
  `Image` sized to exactly `88×88` with `object-cover`; there's no text or variable-length content
  inside a single thumbnail box, so it can't grow past 88px regardless of viewport. The row
  wrapping to multiple lines (Addendum 2) is what changed here, not the individual thumbnail's own
  height.

No other `h-[…]` exists in the six files I own (`kudos-card-actions.tsx`, `kudos-hashtag-row.tsx`,
`star-tier-tooltip.tsx`, `kudos-toast.tsx` have none; `kudos-toast.tsx`'s tooltip/toast boxes are
unconstrained-height by design — they size to their own text). The Tailwind-scale fixed heights
elsewhere (`h-16` avatar, `h-8` direction-icon wrapper, `h-1` star dot, `h-px` dividers) are all
single-purpose decorative/icon boxes with no variable-length content inside them, so they carry
none of this trap's precondition (fixed height + content that can reflow to more lines at a
narrower width). Audit result: **no other instance of this defect exists in the files I own.**

## Design decisions confirmed correct against the job card

- `variant` is never read to select `message` vs `highlightMessage` — the parent (`kudos-card.tsx`)
  picks the string via the `variant` prop it receives, never via `record.variant`.
- Heart counts render through `formatHeartCount` (dot-separated), per the job card's explicit
  override of the phase file's stale "no formatter" guidance.
- `aria-pressed` is always present on the heart button (never omitted when disabled), per the job
  card's explicit instruction, which overrides the phase file's own Risk Assessment row suggesting
  omission.
- New Hero badge renders on `--new-hero-ground` with live text, no artwork, per the coordinator's
  explicit guidance.
- No `.trim()` anywhere on displayed record content — all fields (including trailing-space names)
  pass through verbatim from `KudosRecord`.
