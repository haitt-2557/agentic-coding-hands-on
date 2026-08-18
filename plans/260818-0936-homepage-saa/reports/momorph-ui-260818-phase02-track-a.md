---
phase: 2
title: "Track A — Presentational UI: implementation report"
owner: momorph-ui-implementer
status: done_with_concerns
mode: screen
testPolicy: e2e-red-first
---

# Phase 2 — Track A Presentational UI: Report

## MoMorph refs
- Homepage SAA: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
- Clarifications: `plans/260818-0936-homepage-saa/clarifications.md`

## Summary

Built every presentational surface of `/` plus the two placeholder routes against the
frozen A↔B seam. Ran directly (single screen-mode agent, not fanned out to `section`
subagents) since full design context (node tree, styles, media map) was already gathered
in Phase 1 of this task and the file ownership was already singular per the task prompt.

## Files changed

**Created**
- `app/awards/page.tsx`, `app/kudos/page.tsx`
- `components/ui/dropdown-menu.tsx`, `components/ui/language-switcher.tsx`,
  `components/ui/notification-bell.tsx`, `components/ui/account-menu.tsx`
- `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`,
  `components/layout/quick-action-widget.tsx`
- `components/home/hero-keyvisual.tsx`, `components/home/countdown-timer.tsx`,
  `components/home/event-info.tsx`, `components/home/hero-cta.tsx`,
  `components/home/root-further-content.tsx`, `components/home/awards-section.tsx`,
  `components/home/award-card.tsx`, `components/home/kudos-section.tsx`
- `public/saa/*` (21 unique MoMorph asset files) + `public/images/awards/*.png` (6 copies,
  see "Seam reconciliation" below)

**Modified**
- `app/layout.tsx` (Server component; `data-scroll-behavior="smooth"`, Montserrat +
  Montserrat Alternates fonts, `SessionProvider`/`LocaleProvider` wrap, separate `viewport`
  export)
- `app/page.tsx` (full rewrite — scaffold content replaced)
- `app/globals.css` (dark token set replaces the light-theme scaffold; `prefers-color-scheme`
  block removed per instructions)

**Not touched**: `lib/**`, `.env.example`, `next.config.ts`, `e2e/**`, `playwright*.ts`,
`package.json` — confirmed via `git status --short`.

## Seam reconciliation (worth flagging)

Track B's `lib/awards.ts` (landed concurrently, mid-session) declares
`Award.image: '/images/awards/<slug>.png'` — a single flat path per award, whereas the
Figma structure is two layered assets per card (one shared circular badge background +
one unique wordmark). Reconciled by:
- Placing the 6 downloaded wordmark PNGs at the exact paths `lib/awards.ts` expects
  (`public/images/awards/top-talent.png`, etc.) — the AWARDS data contract is honored
  as-is, no `lib/` edit.
- Rendering the shared `Award_BG.png` badge background as CSS/`<Image fill>` chrome in
  `award-card.tsx`, independent of the AWARDS data model (same asset for all 6 cards).

Also discovered Track B's `lib/i18n/dictionaries/vi.ts` combines the event-info line
("Thời gian: ... · Địa điểm: ... · Tường thuật ...") into ONE dictionary string, not
three separately-styled fragments. `event-info.tsx` renders it as `t('hero.eventInfo')`
verbatim — this means the frame's yellow accent-color highlight on the date/venue values
specifically is not reproduced (whole line renders in white). Functional i18n switching
and the RED test's regex assertion both still hold; flagging as a minor visual-fidelity
delta for Phase 4 visual review.

## Design evidence
- `get_overview`, `get_frame_node_tree` (×2, once via skill Phase 1 + once compact),
  `get_media_files` (×2, second call to refresh expiring presigned URLs), `get_node` (×1),
  `query_section` (×10 — header, countdown+event-info, CTA, root-further, awards header,
  one award card, kudos, footer, widget)
- Reference image: `plans/260818-0936-homepage-saa/design/homepage-saa-full.png` (1512×4480)
- Asset manifest: `plans/260818-0936-homepage-saa/data/assets.md`

## MoMorph calls (count)
- `get_overview`: 1
- `get_frame_node_tree`: 1 (includeSpecs=false)
- `get_media_files`: 2
- `get_node`: 1
- `query_section`: 10

## Asset coverage

35 MoMorph media nodes → 21 unique files (dedup by node name: shared "Up" arrow icon ×6,
shared "Award BG" ×6, shared header/footer "Logo" ×2). All 21 downloaded successfully —
zero failures, zero placeholders. Verified with the skill's own validator after adding
`mm:{nodeId}` code markers:

```
python3 .claude/skills/momorph-implement-design/scripts/validate_coverage.py \
  --assets plans/260818-0936-homepage-saa/data/assets.md --code components
→ Code marker IDs: 35 / Assets to cover: 35 / ✅ Every asset in assets.md appears in code.
```

## Compile/typecheck

`npx tsc --noEmit` — **1 pre-existing error, outside Track A ownership**:
```
e2e/homepage.spec.ts(60,25): error TS2339: Property 'getByContentEditable' does not
exist on type 'Page'.
```
Confirmed via `git status --short`: `e2e/` is untracked (Phase 1 tester's deliverable),
never touched this phase. `getByContentEditable` is not part of the installed
`@playwright/test@1.62.1` API surface at all (checked `node_modules/playwright-core`
type defs directly) — a pre-existing issue in the RED test file, not a version-lag
artifact of anything Track A did. All files under `app/`, `components/`, and the `lib/`
files this phase consumes typecheck clean.

## Lint

`npx eslint app components lib` → **0 problems**. (Repo-wide `npm run lint` reports ~732
errors/252 warnings, all inside `.claude/skills/**` internal tooling scripts unrelated to
this phase — pre-existing repo lint debt, not part of Track A's owned files.)

One real finding fixed during this phase: `countdown-timer.tsx`'s mount effect tripped
`react-hooks/set-state-in-effect` on `setMounted(true)` (the same SSR-reconcile pattern
Track B's `session-provider.tsx`/`locale-provider.tsx` already use with a documented
`eslint-disable-next-line`) — suppressed the same way, with the same rationale comment.

## Build

`npm run build` → **exit 1**, blocked by the same `e2e/homepage.spec.ts` type error above
(Next's own build type-checks the whole project by default). Next's bundler step itself
reports `✓ Compiled successfully` before the typecheck stage runs — confirming this
phase's components/pages have no bundling issues. Cannot fix without editing `e2e/**`,
which is out of scope for this phase; flagging for the orchestrator/tester to resolve
(likely: relax that one assertion, or the Playwright version needs revisiting) before a
clean `npm run build` is possible end-to-end.

## Visual evidence

Not applicable to this report — Track A does not own browser/visual evidence under this
policy. Reference image path recorded above; actual-screenshot capture and comparison is
Phase 4 (`tester`)'s job.

## RED evidence

Validated as provided, read-only, unchanged: `redTestFiles: ["e2e/homepage.spec.ts",
"e2e/homepage-invalid-env.spec.ts"]`, `redCommand: npm run test:e2e -- e2e/homepage.spec.ts
e2e/homepage-invalid-env.spec.ts`, `redExitCode: 1`, `redFailure: expect(locator).toBeVisible()
failed · getByRole('banner') · element(s) not found`. Neither test file was edited.

## GREEN handoff

`npm run test:e2e -- e2e/homepage.spec.ts e2e/homepage-invalid-env.spec.ts` — for Phase 4
`tester` to run against this implementation. Note the `getByContentEditable` type error
above will also surface if that command runs through `tsc` first (Playwright's own test
runner may or may not type-check as strictly as `next build`; flagging either way).

## Known concerns for Phase 4 / integration

1. **Blocking for `npm run build`**: `e2e/homepage.spec.ts` uses `Page.getByContentEditable`,
   not present in `@playwright/test@1.62.1`'s types. Out of Track A's file ownership.
2. Event-info accent-color sub-highlight not reproduced (see "Seam reconciliation").
3. Quick-action widget vertical position: Figma exports it as an absolute frame coordinate
   (`top: 830px` within the 4480px document), which doesn't translate literally to a
   "fixed, always visible" element. Implemented as `position: fixed; top: 50%` (vertically
   centered on the right edge) — a reasonable INFERRED placement, not a measured one;
   flagging for Phase 4 visual review against the reference image.
4. `components/home/root-further-content.tsx`'s small ROOT/FURTHER watermark logo
   (two overlapping raster images) is approximated with percentage-based absolute
   positioning derived from the Figma group's bounding box, not pixel-exact.
5. Two E2E test locators (`:has-text("Sun* Kudos")` in the Kudos test, and the general
   `getByText(/Sun\* Kudos/i)` structural assertion) can match both the nav link and the
   section heading — a pre-existing test-file ambiguity, not something fixable from the
   UI side without removing legitimate required content.

## Todo List

See `plans/260818-0936-homepage-saa/phase-02-track-a-presentational-ui.md` — updated in
place, all boxes checked with the one flagged exception noted inline.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** All owned presentational files implemented against the frame + frozen A↔B
seam; typecheck/lint/asset-coverage clean for every Track-A-owned file. `npm run build`
exits 1 solely because of a pre-existing type error in the read-only `e2e/homepage.spec.ts`
(`Page.getByContentEditable` not in the installed Playwright version's types) — not
introduced by this phase and not fixable without touching an out-of-scope file.
**Concerns/Blockers:** (1) `e2e/homepage.spec.ts` type error blocks a clean `npm run build`
— needs orchestrator/tester attention, not a Track A fix. (2) Minor visual-fidelity notes
on event-info color-highlight, widget fixed position, and the Root/Further watermark logo
— flagged for Phase 4 visual validation, not blocking GREEN.
