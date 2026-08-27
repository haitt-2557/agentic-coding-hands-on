---
phase: 01
title: "RED e2e — language dropdown design contract"
feature: F005
owner: tester
status: completed
effort: 30m
priority: P2
test_policy: e2e-red-first
depends_on: []
owns: [e2e/homepage-language-dropdown.spec.ts]
---

# Phase 01 — RED e2e design contract

## Context
- Values: `design/momorph-hUyaaugye2-node-values.md` · Decisions: `clarifications.md`
- Behaviour coverage, do NOT edit: `e2e/homepage-dropdown-menus.spec.ts`
- Seed helper: `e2e/support/seed-defaults.ts` (`seedDefaultSession` in `beforeEach`)

## Goal
One durable screen-level spec that fails NOW on the design contract, passes after phase 02.
Covers FR-020..FR-023, FR-025, FR-026, BR-009, BR-010 (SC-006).

## Files
CREATE `e2e/homepage-language-dropdown.spec.ts`. Nothing else — impl files are phase 02's.

## Assertions (exact design values — no rounding beyond ±1px on box)
1. Panel (`page.getByRole('menu')` after opening the language trigger): `background-color`
   `rgb(0, 7, 12)`, `border-radius` `8px`, `padding` `6px`, `border-width` `1px`,
   `border-color` `rgb(153, 140, 95)`.
2. Both rows carry a flag `img`: VN row → `src` contains `Flag_VN.svg`, EN row → `Flag_EN.svg`.
3. Selected row (`aria-current="true"`, VN at default locale) `background-color`
   `rgba(255, 234, 158, 0.2)`; the unselected row does not.
4. Row box ≈ `110 × 56` px; label text exactly `VN` / `EN`, `font-weight` `700`,
   `font-size` `16px`, `line-height` `24px`.
5. Trigger after switching to EN shows an `img` whose `src` contains `Flag_EN.svg` (BR-010).
6. Clicking the EN row still closes the panel AND swaps copy (`Award System` heading visible) —
   proves the restyle did not break SM-001.

## Steps
1. Read `e2e/homepage-dropdown-menus.spec.ts` for the established open/seed pattern; reuse it.
2. Write the spec above. Scope the menu with `getByRole('menu')` after clicking the language
   trigger — only one dropdown is open at a time. NOTE: `aria-labelledby` beats `aria-label`
   in accname, so the menu's name is the trigger text, not `Language`; do not filter by name.
3. Run `npm run test:e2e -- e2e/homepage-language-dropdown.spec.ts`.
4. Confirm a REAL assertion failure (`expect(...) toBe/toHaveCSS` message), non-zero exit.
   A dev-server / browser-install / import failure is NOT a valid RED — fix and rerun.
5. Record `redTestFiles`, `redCommand`, `redExitCode`, `redFailure` into
   `plans/260826-0932-language-dropdown/evidence/red-phase-01.md`.

## Todo
- [x] Six assertion groups written
- [x] Command exits non-zero on an assertion about panel chrome / row values
- [x] RED evidence recorded · `homepage-dropdown-menus.spec.ts` untouched

## Corrections during delivery
During phase 03, the spec hit a Playwright strict-mode violation at line 115 because
`updatedTrigger.locator('img')` matched two elements: the flag AND the `/saa/Down.svg`
chevron. Per the design, the chevron is a required element, so the fix went into the TEST
(not the component). The selector was tightened to `img[src*="Flag_"]`. No assertion was
weakened — the fix ensures we only match flag images.

## Success criteria
Valid RED evidence naming an assertion cause. No implementation file modified.

## Risks
- **Assertion order (Med/Low).** Panel-chrome assertion first, so RED fails on a value rather
  than on a missing `Flag_EN.svg`. That flag is not rendered before phase 02, so no 404.
- **Flaky open (Low/Med).** Await menu visible before reading computed styles.

## Rollback
Delete the new spec file.
