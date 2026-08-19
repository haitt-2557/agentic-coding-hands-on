---
phase: 5
title: "Tester GREEN + visual validation"
owner: tester
status: completed
priority: P1
effort: 2.5h
test_policy: e2e-red-first
depends_on: [3, 4]
blocks: [6]
---

# Phase 5 — GREEN + Visual Validation

## MoMorph refs

- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- RED evidence to re-run against: `evidence/red-gate-evidence.md`
- Design frame for comparison: [`design/login-frame-GzbNeVGJHz.png`](design/login-frame-GzbNeVGJHz.png)
- Values: [`clarifications.md`](clarifications.md) § Extracted design values
- Deferred-to-here test cases: `c18649fa` (button hover shadow), `cb42461d` (selector hover)

## Overview

**Priority:** P1 · **Status:** pending

Re-run the *same* command on the *same* spec and prove GREEN, then own the browser evidence: visual
comparison against the frame at three widths, and the two hover cases the E2E deliberately left out.

## Key Insights

- **The command and the assertions do not change.** `npm run test:e2e`, `e2e/login-screen.spec.ts`
  exactly as Phase 2 wrote it. Editing an assertion to reach green voids the gate.
- A failed GREEN or a material visual mismatch means **incomplete**, not "close enough": route the
  bounded fix back to the owning track (`momorph-ui-implementer` for pixels and markup, `implementer`
  for behaviour) without weakening a test.
- Responsive behaviour below 1440px is derived, not designed (defect #6) — judge it for legibility and
  non-overlap, not for pixel fidelity to a frame that does not exist.

## Requirements

**Functional**
- `npm run test:e2e` exits 0 with A1–A12 passing and the pre-existing suites still green.
- Playwright MCP capture of `/login` at 1440, 768 and 375 wide, compared against the frame.
- Hover states verified in the browser: the button gains its shadow/elevation, the language selector
  highlights and shows a pointer cursor.
- Keyboard reachability confirmed: the login button and the language selector are tab-reachable with a
  visible focus ring (spec § Accessibility lists this as `unknown`; this phase resolves it).

**Non-functional**
- No implementation file is edited by this phase. `tester` owns `e2e/**` and `playwright.config.ts`.

## Architecture

```
npm run test:e2e ──> same spec, same command as Phase 2 ──> exit 0 expected
        │
        └── on failure: classify → bounded fix request → owning track → re-run (no test edits)

Playwright MCP ──> /login @1440 / 768 / 375 ──> compare vs design/login-frame-GzbNeVGJHz.png
                                              ──> hover + focus evidence
                                              ──> evidence/phase-05-visual-validation.md
```

## Related Code Files

**Create:** `evidence/phase-05-visual-validation.md` (+ captures under `evidence/`)
**Modify:** none expected. Any `e2e/**` change must be a defect fix in the *test harness*, argued in
evidence — never a loosened assertion.
**Delete:** none

## Implementation Steps

1. Confirm the stack is up (`npx supabase status`) and `.env.local` is present, so a failure cannot be
   misread as infrastructure.
2. Run `npm run test:e2e`. Record the true exit code and the full pass/fail counts.
3. Any failure: classify as markup/visual (Track A) or behaviour (Track B), write the smallest possible
   reproduction, hand it back, re-run. Do not patch across the ownership line.
4. With GREEN in hand, capture `/login` at 1440×1024, 768 and 375 via Playwright MCP.
5. Compare against the frame: header logo left / selector right, hero wave + ROOT FURTHER logo, intro
   gap 120px, button 305×60 pale-yellow with the mark right, centred footer copyright.
6. Verify hover (`c18649fa`, `cb42461d`) and keyboard focus in the live browser.
7. Drive the error surface visually: `/login?error=access_denied` — confirm the alert sits directly
   below the button and reads exactly `Đăng nhập không thành công. Vui lòng thử lại.`
8. Write `evidence/phase-05-visual-validation.md`: exit code, counts, captures, hover/focus notes, and
   every remaining mismatch with a severity.

## Todo List

- [ ] Stack confirmed up before the run
- [ ] `npm run test:e2e` exit 0; counts recorded verbatim
- [ ] Pre-existing suites still green
- [ ] Captures at 1440 / 768 / 375
- [ ] Hover `c18649fa` + `cb42461d` verified
- [ ] Keyboard focus verified on button and selector
- [ ] `?error=` alert verified visually
- [ ] `evidence/phase-05-visual-validation.md` written

## Success Criteria

| # | Observable |
|---|---|
| SC5-1 | `npm run test:e2e` exits 0 |
| SC5-2 | Same command, same spec file, byte-identical assertions to Phase 2 (`git diff` on `e2e/login-screen.spec.ts` shows no assertion change) |
| SC5-3 | Three captures exist and are compared against the frame in writing |
| SC5-4 | Both hover cases and both focus cases confirmed |
| SC5-5 | Zero open mismatches rated major |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | GREEN reached by softening an assertion | Low × High | SC5-2 makes it checkable with `git diff`; Phase 6 review re-checks it. |
| R2 | The seeded-session test is flaky because the cookie helper races the first navigation | Med × Med | Seed cookies on the context *before* `goto`; on flake, add an explicit read-back assertion in the helper rather than a retry or a timeout bump. |
| R3 | `supabase start` not running at run time, read as a screen failure | Med × Med | Step 1's precheck plus the `INFRA:` sentinel from Phase 2. |
| R4 | Track A and Track B disagree on a prop and the page will not compile | Med × High | The contract is frozen in `plan.md`; a mismatch is a bounded fix to whichever side deviated from it, decided by reading the contract, not by negotiation. |
| R5 | Endless ping-pong between the two tracks on a visual nit | Low × Med | Rate each mismatch major/minor; only major blocks. Minors go to Phase 6 as recorded follow-ups. |

## Security Considerations

- The publishable key only; no secret enters the test run or the evidence files.
- Captures must not include a real user's tokens — the fixture user is the only account involved.

## Next Steps

Feeds Phase 6 with: GREEN evidence, the visual report, and any minor mismatch deferred.

## Rollback

Evidence-only phase — nothing to roll back. A failed GREEN simply holds Phase 6 shut.
