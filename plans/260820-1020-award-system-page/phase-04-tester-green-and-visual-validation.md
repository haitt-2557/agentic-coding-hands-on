---
phase: 4
title: "Tester GREEN + visual validation"
owner: tester
status: completed
priority: P1
effort: 2h
feature: F012
test_policy: e2e-red-first
depends_on: [2, 3]
blocks: [5]
---

# Phase 4 — GREEN + Visual Validation

## MoMorph refs

- Hệ thống giải (Award System): https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- RED evidence to re-run against: `evidence/red-gate-evidence.md`
- Design frame for comparison: [`design/frame-zFYDgyj_pD.png`](design/frame-zFYDgyj_pD.png) (1440×6410)
- Values and derived responsive rules: [`clarifications.md`](clarifications.md) § Extracted design values
- Deferred-to-here test cases: ID-10 (nav hover highlight), the gold + underline styling of the active item,
  responsive behaviour below 1440px
- Copy to read against the screen: [`design/award-copy.md`](design/award-copy.md)

## Overview

**Priority:** P1 · **Status:** pending

Re-run the *same* command on the *same* spec and prove GREEN, then own the browser evidence: visual
comparison against the frame at three widths, the hover and active-styling cases the E2E deliberately left
out, and a keyboard pass over the category nav.

## Key Insights

- **The command and the assertions do not change.** `npm run test:e2e`, `e2e/awards-page.spec.ts` exactly as
  Phase 1 wrote it. Editing an assertion to reach green voids the gate.
- **A failed GREEN or a material visual mismatch means incomplete**, not "close enough": route the bounded
  fix back to the owning track — `momorph-ui-implementer` for pixels, markup and scroll behaviour,
  `implementer` for copy and data — without weakening a test.
- **Port 3200 runs `next build`,** so a Track A or Track B type error surfaces here as a webServer failure,
  not an assertion failure. Read the reporter's first lines before concluding anything about the screen.
- **The regression suites matter as much as the new one.** `homepage-awards-grid` (the six deep links),
  `homepage-structure-and-copy` (the "About SAA 2025" header link) and `homepage-navigation` ID-59 (which
  fetches `/awards` and demands a 200) are the three that the header and data changes could break.
- **Scrollspy is judged in the browser, not only by the spec.** Scroll slowly through all six sections and
  confirm the active item never sticks, never shows two at once, and never lands one section behind.
- Responsive behaviour below 1440px is derived, not designed (defect #4) — judge legibility, no horizontal
  overflow and no overlap, not pixel fidelity to a frame that does not exist.

## Requirements

**Functional**
- `npm run test:e2e` exits 0 with A1–A13 passing and all 13 pre-existing spec files still green.
- Playwright MCP capture of `/awards` at 1440, 768 and 375 wide, compared against the frame.
- Hover verified in the browser: a nav item under the cursor shows its highlight (ID-10); the active item
  shows gold text plus underline.
- Scroll-sync verified by hand across all six sections, plus `/awards#mvp` deep link and
  `/awards#khong-ton-tai` unknown hash.
- Keyboard pass: every nav item is tab-reachable with a visible focus ring and activates on Enter
  (spec § Accessibility lists keyboard and focus as `unknown`; this phase resolves them or records the gap).
- `prefers-reduced-motion: reduce` honoured — with the emulated setting, the click jump is instant.

**Non-functional**
- No implementation file is edited by this phase. `tester` owns `e2e/**` and `playwright.config.ts` only.
- Captures are stored under `evidence/`; nothing is written into `components/**` or `lib/**`.

## Architecture

```
npm run test:e2e ──> same spec, same command as Phase 1 ──> exit 0 expected
        │
        └── on failure: classify → bounded fix request → owning track → re-run (no test edits)
                         markup / pixels / scroll  -> momorph-ui-implementer
                         copy / data / dictionary  -> implementer

Playwright MCP ──> /awards @1440 / 768 / 375 ──> compare vs design/frame-zFYDgyj_pD.png
                                             ──> hover (ID-10) + active styling + focus ring
                                             ──> manual scroll sweep + #mvp + #khong-ton-tai
                                             ──> reduced-motion emulation
                                             ──> evidence/phase-04-visual-validation.md
```

## Related Code Files

**Create:** `evidence/phase-04-visual-validation.md` (+ captures under `evidence/`)
**Modify:** none expected. Any `e2e/**` change must be a defect fix in the *test harness*, argued in
evidence — never a loosened assertion.
**Delete:** none

## Implementation Steps

1. Confirm both tracks report done and `npx tsc --noEmit` is clean, so a build failure at port 3200 cannot be
   misread as a screen failure.
2. Run `npm run test:e2e`. Record the true exit code and the full per-file pass/fail counts.
3. Any failure: classify as markup/pixels/scroll (Track A) or copy/data (Track B), write the smallest
   reproduction, hand it back, re-run. Never patch across the ownership line.
4. With GREEN in hand, capture `/awards` at 1440, 768 and 375 via Playwright MCP — full-page plus one capture
   per award section so the alternating sides are checkable.
5. Compare against the frame: hero band with the ROOT FURTHER logo and no countdown/CTA; muted subtitle over
   the gold heading; the sticky nav holding position while the content column scrolls; image 336×336 with the
   alternation Top Talent left, Top Project right, Top Project Leader left, Best Manager right, Signature
   left, MVP right; quantity and prize rows with their icons; Signature's two prize lines joined by `Hoặc`;
   Best Manager and MVP with no note row (defect #6 — reproduced, not fixed).
6. Verify hover (ID-10), the active item's gold + underline, and the focus ring in the live browser.
7. Sweep the scrollspy by hand through all six sections; then `/awards#mvp` (MVP active on load) and
   `/awards#khong-ton-tai` (no active item, no jump, clean console). Confirm the URL never gains or changes a
   hash while scrolling or clicking.
8. Emulate `prefers-reduced-motion: reduce` and confirm the nav click jumps instantly.
9. At 768 and 375: nav becomes a horizontal strip, cards stack to one column, no horizontal overflow
   (`document.documentElement.scrollWidth <= innerWidth`).
10. Write `evidence/phase-04-visual-validation.md`: exit code, per-file counts, captures, hover/focus/scroll
    notes, reduced-motion result, and every remaining mismatch with a severity.

## Todo List

- [x] Both tracks done and typecheck clean before the run
- [x] `npm run test:e2e` exit 0; counts recorded verbatim
- [x] All 13 pre-existing spec files still green — `homepage-awards-grid`, `homepage-structure-and-copy` and
      `homepage-navigation` checked by name
- [x] Captures at 1440 / 768 / 375
- [x] Hover ID-10 + active gold/underline verified
- [x] Keyboard reachability and focus ring verified
- [x] Manual scroll sweep, `#mvp`, `#khong-ton-tai` verified; URL hash never rewritten
- [x] `prefers-reduced-motion` verified
- [x] No horizontal overflow at 768 and 375
- [x] `evidence/phase-04-visual-validation.md` written

## Success Criteria

| # | Observable |
|---|---|
| SC4-1 | `npm run test:e2e` exits 0 |
| SC4-2 | Same command, same spec: `git diff e2e/awards-page.spec.ts` since Phase 1 shows no assertion change |
| SC4-3 | Three width captures exist and are compared against the frame in writing |
| SC4-4 | Hover, active styling, focus ring and reduced-motion each confirmed with evidence |
| SC4-5 | The scroll sweep shows exactly one active item at every position, never stale by a section |
| SC4-6 | Zero open mismatches rated major |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | GREEN reached by softening an assertion | Low × High | SC4-2 makes it a `git diff` check; Phase 5 review re-checks it. |
| R2 | The scrollspy passes the spec but reads wrong to a human — active item one section behind at slow scroll speeds | Med × Med | Step 7's manual sweep, judged by eye. Fix is a `rootMargin` adjustment in Track A's nav, not a test change. |
| R3 | A build failure at port 3200 is misdiagnosed as a screen defect and bounced to the wrong track | Med × Med | Step 1's precheck plus step 2's rule to read the reporter's opening lines first. |
| R4 | A homepage regression is missed because only the new file is read | Med × High | The todo names the three at-risk spec files explicitly; per-file counts are recorded, not just the total. |
| R5 | Endless ping-pong between the tracks on a visual nit | Low × Med | Rate each mismatch major/minor; only major blocks. Minors go to Phase 5 as recorded follow-ups. |
| R6 | The 6410px-tall page makes full-page captures unwieldy or times out | Med × Low | Capture per section as well as full page; raise no timeout in the spec to accommodate a screenshot. |

## Security Considerations

- The page is public and carries no user data; captures cannot leak a session, and none should show one.
- The reduced-motion and hover checks are cosmetic — no security surface is exercised, and none should be
  inferred from the run.
- Record plainly that `/awards` is still unprotected: a green suite here says nothing about ID-1.

## Next Steps

Feeds Phase 5 with: GREEN evidence, the visual report, and any minor mismatch deferred.

## Rollback

Evidence-only phase — nothing to roll back. A failed GREEN simply holds Phase 5 shut.
