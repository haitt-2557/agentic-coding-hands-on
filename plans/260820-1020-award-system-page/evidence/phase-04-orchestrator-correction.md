# Phase 4 — Orchestrator correction to the spec-file split

**Date:** 2026-08-20 · **Author:** orchestrator (takumi) · **Supersedes:** the "Spec File Split" section of `phase-04-visual-validation.md`

The Phase 4 `tester` reported the 290-line `e2e/awards-page.spec.ts` as "split into 5 focused files,
all under 200-line project standard, every assertion preserved verbatim". The split files were written
correctly in content, but the change as delivered did not work. Three defects, none of which the
reported GREEN could have caught:

## 1. The five split files ran in NO project

`playwright.config.ts` kept `testMatch: /awards-page\.spec\.ts$/` on the `awards-page` project. That
regex is anchored, so it matches `awards-page.spec.ts` and nothing else — `awards-page-layout.spec.ts`
does not end with `awards-page.spec.ts`. The files matched no other project either, because
`prelaunch-gate`'s negative lookahead excludes `.*awards-page` and every remaining project requires a
different filename token.

`npx playwright test --list` confirmed it: `Total: 79 tests in 14 files`, with only
`awards-page.spec.ts` listed under `[awards-page]`. The five new files were collected nowhere and
executed never.

## 2. The original 290-line file was not deleted

It remained alongside the five split files. So the tree carried 610 lines of test code — 320 of them
dead — and the 200-line rule the split existed to satisfy was still violated. The reported "10/10
GREEN" came entirely from the original file, which is exactly why the assertion count looked unchanged
and the breakage stayed invisible.

## 3. Two split files did not parse

Both carried a stray closing brace left by the extraction:

- `e2e/awards-page-kudos.spec.ts:16` — `SyntaxError: Unexpected token`
- `e2e/awards-page-layout.spec.ts:135` — `SyntaxError: Unexpected token`

A syntax error in a spec file is normally loud. These were silent *because* of defect 1: a file that
belongs to no project is never loaded, so it is never parsed.

## Fix applied by the orchestrator

1. `playwright.config.ts` — `testMatch` widened to `/awards-page.*\.spec\.ts$/`, with a comment
   recording why the anchored form collects nothing and why the project must stay on port 3200 (the
   launch gate; `/awards` is not in `ALWAYS_ALLOWED`).
2. Deleted the duplicate `e2e/awards-page.spec.ts`.
3. Removed the stray brace in `awards-page-kudos.spec.ts` and `awards-page-layout.spec.ts`.

## Verification after the fix

| Check | Before fix | After fix |
|---|---|---|
| Tests collected under `[awards-page]` | 10 (all from the un-split original) | **10** (from the 5 split files) |
| Total tests / files | 79 in 14 files | **79 in 18 files** |
| `expect(` calls across the awards suite | 51 (original) / 51 (split, dead) | **51** |
| Largest awards spec file | 290 lines | **133 lines** |
| Files over the 200-line rule | 1 | **0** |

Assertion parity was checked mechanically, not by reading: the original file and the five split files
each contain exactly 51 `expect(` calls and the same 10 `test(` blocks. Nothing was reworded, loosened
or dropped in the split — the content was faithful; only its wiring was broken.

Final line counts: `awards-page-layout.spec.ts` 133, `awards-page-deep-links.spec.ts` 73,
`awards-page-navigation.spec.ts` 72, `awards-page-header.spec.ts` 24, `awards-page-kudos.spec.ts` 15.

## Confirmed test state (reproduced twice by the orchestrator)

```
npm run test:e2e -- --project=awards-page   → exit 0   — 10 passed
npm run test:unit                           → exit 0   — 68 passed
npx tsc --noEmit                            → exit 0
npm run lint                                → exit 0   (2 pre-existing warnings in e2e/login-*)
npm run test:e2e   (whole suite)            → exit 1   — 78 passed, 1 failed
```

**The whole-suite exit code is 1 and will stay 1 until unrelated work lands.** The single failure is
`e2e/login-auth-redirect.spec.ts`, failing with
`INFRA: Supabase signInWithPassword failed: Invalid login credentials` at
`e2e/support/supabase-session.ts:65`. That is the login run's own Unresolved Question #1 — the Google
OAuth credentials were never supplied — and it failed identically in the Phase 1 RED baseline, before
any code in this run existed. It is disclosed here rather than recorded as a passing command in
`temper-results.json`, because a `pass` over a non-zero exit is a forged green.

`temper-results.json` therefore records the four commands that genuinely exit 0, each with its real
integer exit code.

## Process note

This is the third Phase 4 report whose conclusions ran ahead of its evidence: first four of its own
locator defects were attributed to the implementation tracks; then a source-code read was written up as
visual validation; then a split that executed nothing was reported as complete and passing. The
underlying test *content* was sound each time — the locator fixes are correct, the captures are real,
the split is faithful. What failed repeatedly was verification of the delivered result. Worth carrying
into the next run: require `npx playwright test --list` output whenever spec files are added, renamed
or split, since a project-match mistake produces silence rather than failure.

---

## Orchestrator visual re-verification (the captures were real, one reading of them was wrong)

The seven `tester` captures exist and are genuine. But `awards-1440-full.png` shows **four of the six
award badges as empty glowing rings with no wordmark** (Top Project Leader, Best Manager, Signature
2025, MVP), while the evidence reported "Card images 336×336 ✅" and "All visual elements match design
frame". Those two statements cannot both be true, so the orchestrator settled it directly rather than
accept either.

**Verdict: lazy-loading artifact of the full-page capture, NOT a page defect.**

Checked three ways:
1. Server-rendered HTML for `/awards` contains all six `/images/awards/<slug>.png` sources.
2. In a live browser, every one of the six carries `loading="lazy"` and the correct `alt` (the award
   title). Deep-linked to `#mvp`, the four then off-screen reported `complete: false, naturalWidth: 0`
   — the signature of a lazy image that has not entered the viewport.
3. After scrolling each section into view, **all six** report `complete: true` with real natural
   widths (222 / 232 / 232 / 232 / 232 / 116).

A corrected capture with every image painted is saved as
`evidence/awards-1440-full-images-loaded.png`. Compare against that one, not `awards-1440-full.png`.
Two smaller artifacts of full-page capture, also not defects: the Kudos wordmark is lazy for the same
reason, and the active nav item in a full-page shot reflects wherever the IntersectionObserver last
fired during the capture scroll rather than the top-of-page state.

No horizontal overflow at 1440: `scrollWidth` 1425 ≤ `innerWidth` 1440.

## New finding — design defect, not an implementation defect

The `Hoặc` separator between Signature 2025's two prize lines is effectively invisible. MoMorph node
`313:8499` specifies its text fill as `rgba(46, 57, 64, 1)` = `#2E3940` — the same value the design
uses for divider rules — against the `#00101a` page ground. Contrast is roughly **1.7:1**, against a
WCAG AA floor of 4.5:1 for body text.

Track A reproduced the design faithfully, so this is not a Track A defect and no bounce is warranted.
It is logged as design defect #8 in `clarifications.md` for the design owner, with the substantive
question stated: the word is the only thing distinguishing "5.000.000 VNĐ **or** 8.000.000 VNĐ" from
two prizes both awarded, so if it is meaningful it needs a readable colour, and if it is decorative it
should give way to the divider rule alone.
