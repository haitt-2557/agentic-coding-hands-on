# Review — Sun* Kudos Live board (`/kudos`), pre-seal

Scope: `app/kudos/page.tsx`, `components/kudos/**` (19 files), `lib/kudos/**` (10), `lib/session/session-provider.tsx`,
`site-header.tsx`/`site-footer.tsx`, `app/globals.css` (kudos tokens), `e2e/kudos-board-*.spec.ts`, `playwright.config.ts`.
~2335 LOC across kudos-owned files, all under the 200-line ceiling. Read against `clarifications.md`,
`dom-contract.md` (43 rules), `spec/kudos-live-board/technical-spec.md`, `design/kudos-content.md`.
Verified independently: `npx tsc --noEmit` clean, all referenced `--color-*`/`--*` tokens exist in
`app/globals.css`, all referenced `/saa/*` assets exist on disk, `next/image`'s `preload` prop is real in
this Next 16 (`node_modules/next/dist/client/image-component.d.ts:19` — `priority` is the deprecated name now).

## Assessment

Solid. Seed data (`KUDOS_RECORDS`, 9 records) independently checked against every S1–S8 constraint in
dom-contract.md §10 and holds. Filter/carousel/feed wiring is correct: one shared `KudosFilter` state in
`kudos-board.tsx` drives both `highlightTop5` and `filterRecords`, resets on every change. Heart
ownership (`isOwnKudos = record.senderId === viewerId`) and disable path are correct and not
bypassable — `disabled` is a real DOM attribute, native buttons block both click and keyboard activation.
`record.variant` confirmed genuinely inert (grepped — the only place it's read is the doc comment saying
not to read it). No deferred feature was quietly built (grepped for zoom/pan/dialog/modal — none found;
route files untouched). Two real gaps found below, both outside what the current test suite exercises.

## Critical

None.

## High

1. **F32 ("at most one `role=\"tooltip\"` in the DOM") is reachable-violable via ordinary combined
   mouse+keyboard use, not just theoretically.** `components/kudos/star-tier-tooltip.tsx:35-38` opens on
   `onMouseEnter`/`onFocus` and closes on `onMouseLeave`/`onBlur`; `components/kudos/spotlight-name-cloud.tsx:63-66`
   does the same independently. Each is correctly single-instance-safe on its own, but there is no
   shared registry across the ~18 star-tier instances (2 people × up to 9 cards) and the 106 spotlight
   nodes. Sequence: hover a star dot (tooltip A opens, stays open — nothing moves the mouse), then Tab
   through spotlight cloud nodes with the keyboard (each Tab opens tooltip B via `onFocus`, the previous
   Tab target's `onBlur` closes its own — but tooltip A never gets a blur or mouseleave, since the mouse
   never moved). Result: 2 `role="tooltip"` elements simultaneously in the DOM, which is exactly what
   `page.locator('[role="tooltip"]')` (frozen as strict, page-wide) is designed to catch — it just isn't
   exercised by the current tests (`33ca8f8a` only hovers, never combines with a prior/concurrent focus).
   Fix: lift "which tooltip id is active" into one piece of state owned above both component families
   (e.g. a page-level `activeTooltipId` in `kudos-board.tsx`, or at minimum a single shared hover/focus
   coordinator hook) so opening one closes any other, rather than each component independently gating on
   its own hover/focus.
   `components/kudos/star-tier-tooltip.tsx:20-51`, `components/kudos/spotlight-name-cloud.tsx:36-97`

2. **A clipboard write that never happens can still show the success toast.** `handleCopy` in
   `components/kudos/kudos-card-actions.tsx:43-51` calls `navigator.clipboard?.writeText(...)`. BR-007
   ("a rejected clipboard permission must not throw an unhandled rejection") is honored by the
   `try/catch`, but the optional-chain silently no-ops when `navigator.clipboard` is `undefined`
   entirely (non-secure context, older browser, some embedded webviews) rather than rejecting — `await
   undefined` resolves cleanly, so `setCopyMessage(COPY_TOAST_MESSAGE)` still fires and the user sees
   "Link copied — ready to share!" for a link that was never copied. Fix: `if (!navigator.clipboard) return;`
   before the write, so absence is treated the same as a denied permission (silent no-op, no false-positive
   toast). Not caught by TC `0adfd7ce` because Playwright grants clipboard permissions in a secure
   context, so `navigator.clipboard` always exists there.
   `components/kudos/kudos-card-actions.tsx:43-51`

## Medium

1. **dom-contract F31 ("Feed cards have 5 attachment thumbnails") silently breaks under the CECV10
   department filter.** `kudos-8`/`kudos-9` (`lib/kudos/kudos-records.ts:89-90`) carry `NO_ATTACHMENTS`
   ([]) because they were seeded as the highlight-derived, zero-match-with-`#Dedicated` pair (S5). But
   `filterRecords`/`AllKudosFeed` don't scope by `record.variant` (correctly, per the accepted-deviation
   note that `variant` is inert) — so filtering the ALL KUDOS feed to `CECV10` surfaces `kudos-8`/`9`
   there, rendered as post cards with an empty attachment row instead of the frame's 5 thumbnails. Not
   caught by any test (`159fed13` only asserts department-text containment, not attachment count) but a
   real content gap if a user actually filters to CECV10 and looks at the feed. Low cost either way:
   either give `kudos-8`/`9` `POST_ATTACHMENTS` too (they can still be `NO_ATTACHMENTS` conceptually for
   the highlight card render, since attachments are only rendered `!isHighlight`), or accept it as a
   known seed-data limitation with a one-line comment next to `NO_ATTACHMENTS`.
   `lib/kudos/kudos-records.ts:70-71,88-90`

2. **TC `63645b03`'s own-kudos-disabled assertion is weaker than its name suggests.**
   `e2e/kudos-board-feed-interactions.spec.ts:56-67` asserts "at least one disabled heart AND at least
   one enabled heart exist" — it never confirms the *specific* disabled card actually belongs to the
   mock viewer, so a bug that disabled hearts by some unrelated rule (e.g. every third card, or a typo'd
   id comparison) would still pass as long as the mix existed. The implementation itself is correct
   (`isOwnKudos = record.senderId === viewerId`, verified directly), so this is a test-design gap in a
   file `tester` owns, not an implementation defect — flagging per the request to read the suite
   adversarially. A tightening would locate the card containing `MOCK_VIEWER_DISPLAY_NAME` as sender and
   assert *that specific* heart is disabled.

3. **Four `kudosPage.*` i18n keys are defined in both dictionaries but never read.**
   `copyLinkButton`, `viewDetailButton`, `secretBoxButton`, `bannerTitle` exist in
   `lib/i18n/dictionaries/{vi,en}.ts` but the components hardcode the literal strings instead
   (`kudos-card-actions.tsx:81,95` "Copy Link"/"Xem chi tiết", `kudos-sidebar-stats.tsx:57` "Mở Secret
   Box", `kudos-banner.tsx:11` `BANNER_TITLE`). Harmless today because `vi`/`en` hold byte-identical
   Vietnamese values for these frame-verbatim strings, but it's dead config and an inconsistent pattern
   next to the sibling strings in the same files that do go through `t(...)` (e.g.
   `kudosPage.sectionSubtitle`, `kudosPage.filterHashtagLabel`). Worth reconciling one way or the other so
   a future locale change doesn't silently miss these four.

## Low

1. **Two different patterns for the same "reset a counter when the shared filter changes" problem.**
   `highlight-carousel.tsx:62-66` resets `page` in a post-commit `useEffect`; `all-kudos-feed.tsx:42-47`
   resets `revealedCount` synchronously during render (the React-documented "adjusting state during
   render" pattern, chosen there specifically to avoid a stale-content flash). Both are individually
   correct and each has a code comment justifying its own choice, but a reader has to notice they're
   solving the identical problem two different ways. Not worth blocking on, but a natural candidate to
   unify next time either file is touched.

2. `components/kudos/kudos-board.tsx:39` — `const viewerId = userId || MOCK_VIEWER_ID;` is dead
   defensiveness: `session-provider.tsx`'s `DEFAULT_SESSION.userId` is always a non-empty string, so
   `userId` can never be falsy in practice. Harmless, but slightly overstates the real risk.

3. `AllKudosFeedProps.onCopied` (`all-kudos-feed.tsx:27`) is typed and threaded down from
   `kudos-board.tsx:65` as `NOOP_ON_COPIED` but never destructured/used inside `AllKudosFeed` — documented
   as deliberate API-parity dead wiring in the file header. Fine as a documented choice; flagging only so
   it isn't mistaken for an oversight later.

## Edge Cases Turned Up (scouting pass, before reading the diff)

- Combined hover+Tab-focus across the star-tier and spotlight-cloud tooltip families → two
  `role="tooltip"` elements at once (High #1 above).
- `navigator.clipboard` absent (not just denied) → false "copied" toast (High #2).
- Department-filtering to `CECV10` surfaces the two zero-attachment records inside the ALL KUDOS feed
  (Medium #1).
- Double-clicking Copy Link within the 3s auto-hide window: `KudosToast`'s effect keys on `[message]`
  (`kudos-toast.tsx:29`), and the second `setCopyMessage(COPY_TOAST_MESSAGE)` is the same string value as
  the first, so React bails the re-render and the auto-hide timer from the *first* click keeps running
  unaffected — a second click doesn't extend the visible window. Cosmetic only, not spec-mandated to
  restart.
- IntersectionObserver dependency array (`[exhausted, filtered.length]` in `all-kudos-feed.tsx:70`) looked
  suspicious at first (doesn't depend on `filtered` itself, or `revealedCount`) but traced through
  correctly: the sentinel DOM node is stable across re-renders (unkeyed, same tree position), and the
  callback only ever needs the `.length` primitive it already closes over — re-running the effect only
  when that primitive or `exhausted` changes is the correct minimal dependency set, not a staleness bug.

## Done Well

- Seed data (`kudos-records.ts`) independently re-derived and checked against all 8 seed constraints
  (S1–S8) in dom-contract.md §10 — every one holds, including the easy-to-miss ones (S5's zero-match
  combination, S6's "not at position 1").
- `formatHeartCount`/thousands-separator handling is a clean resolution of a real conflict between the
  frame's verbatim `1.000` and the arithmetic the heart-toggle test needs — done by fixing the *test's*
  parsing (documented in clarifications' Withdrawn section) rather than quietly truncating the frame's
  own formatting, and both directions are unit-tested (`kudos-records.test.ts:139-149`).
- `min-h-[749px]` fix (from a hard `h-[749px]`) is exactly the right instinct — a fixed height on a card
  containing reflowable text is a pointer-interception bug waiting to happen, and it's the *only* fixed
  height on any content-bearing container in this feature (checked all `h-[` usages).
- `record.variant` is documented as inert and actually is — grepped for it, no component branches on it.
- Correct, non-obvious use of `preload` over the deprecated `priority` for `next/image` in a Next.js
  major with real API churn — the implementer read the local docs rather than trusting training data
  (per `AGENTS.md`'s own warning).
- The session-provider hydration pattern (SSR default `guest`, reconcile in `useEffect` post-mount) is
  correctly mirrored by `kudos-toast.tsx` and `highlight-carousel.tsx`'s own effect-based state syncs,
  with each one calling out the precedent it's following in a comment — genuinely aids a reviewer.
- Honest gap logging: Pan/Zoom, the four deferred destinations, the second leaderboard, and the
  heart multiplier are all verifiably absent (grepped for zoom/pan/dialog/modal, checked route files
  untouched) rather than partially stubbed.

## Actions In Order

1. Fix the clipboard-absence false-positive toast (High #2) — one-line guard, cheap and real.
2. Decide on the tooltip-coordination fix (High #1) — lowest-risk version is a single `activeTooltipId`
   lifted to `kudos-board.tsx` or a shared hook; not urgent (untested edge case) but is a genuine
   violation of a rule the contract calls "frozen."
3. Either give `kudos-8`/`kudos-9` attachments or add a one-line comment accepting the F31 gap under
   department filtering (Medium #1).
4. Reconcile the four unused i18n keys — wire them up or remove them (Medium #3).

## Numbers

- Type coverage: `npx tsc --noEmit` clean, 0 errors.
- Test coverage: 18/18 e2e (`kudos-board-*`) + unit tests for `kudos-records`, `leaderboard`, `star-tiers`
  all read and independently verified as non-vacuous (see Medium #2 for the one exception, which is a
  test-design gap rather than a false pass).
- Lint findings: not rerun independently in this pass (relied on the prior verified state); no `any`,
  no empty catches, no string-built queries found while reading.

## Still Unresolved

- Whether the tooltip-coordination fix (High #1) is worth doing now given it's not test-covered — my
  read is yes, since F32 is stated as a frozen/binding rule and the violation is reachable through
  completely ordinary use (hover, then tab away), not a contrived attack.
- Whether Medium #1 (CECV10 attachment gap) is worth a code fix vs. a documented-and-accepted gap — either
  is defensible; flagging for a call rather than picking one.

**Status:** DONE_WITH_CONCERNS
**Summary:** No critical or breaking issues; core filter/carousel/heart/empty-state logic is correct and
matches the frozen contract. Two High findings are real but neither is test-covered nor blocking: a
tooltip-singleton (F32) violation reachable via combined hover+keyboard-focus, and a clipboard-absence
edge case that shows a false "copied" toast. Both are cheap to fix. Medium findings are minor/cosmetic.
**Concerns/Blockers:** None block sealing; recommend fixing High #2 (one-line guard) before or shortly
after seal, and tracking High #1 as a follow-up since it needs a small architectural change (shared
tooltip-active state) rather than a one-line patch.
