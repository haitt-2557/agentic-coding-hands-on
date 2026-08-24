# Phase 07 — RED suite corrections

**Track:** tester (owns executable E2E tests; may read implementation, never edit it)
**Owner agent:** `tester` · **Priority:** P1 · **Status:** pending · **Effort:** 1h
**Depends on:** 02 (needs the real seeded names) · **Unblocks:** 09

## Context Links

- [dom-contract.md](dom-contract.md) → **C1–C5**, S2, S3, D3, D13
- [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) → FR-011, BR-007, DEC-001, SC-008, ID-48…ID-56
- [evidence/red-evidence.json](evidence/red-evidence.json) · [clarifications.md](clarifications.md)

## Overview

Three defects in the RED suite make tests that **no correct implementation can pass**, plus one
file with no assertions at all. Fix them in the test files, with the FR/SC citation for each.
This is the only phase permitted to touch `e2e/**`. It still may not touch
`playwright.config.ts` (shared by all 7 projects; the `send-kudos` project is already correct).

## Key Insights

- **C1 is a genuine self-contradiction in the suite, not an implementation gap.**
  `send-kudos-validation.spec.ts` tests 1–4 click `Gửi` while a required field is empty, but
  `send-kudos-submit.spec.ts:18-54` asserts `Gửi` is `disabled` in exactly that state
  (BR-007/DEC-001/ID-48/ID-49). Playwright's `click()` auto-waits for actionability, so a
  disabled button means a timeout. Enabling the button to make the click land would break the
  other spec **and** contradict a sealed clarification — that direction is closed.
- Coverage of ID-50…ID-56 (red border + `Không được để trống`) must survive the fix. Dropping
  those tests would trade one defect for a coverage hole.
- **C3 is a data-fabrication trap.** `'Thái Anh'` matches no seeded profile, and inventing one
  would violate "Do NOT invent data" (S3). The query string changes, not the seed.
- **C2 is a DOM-availability defect:** `DropdownMenu` renders children only when open
  (`components/ui/dropdown-menu.tsx:101`), so the widget item does not exist until the trigger
  is clicked.
- A test that cannot go red proves nothing. C4's zero-assertion test must gain real assertions
  or go — it may not be counted toward GREEN either way.

## Requirements

**Functional:** preserve assertion coverage for FR-010, FR-011, FR-012, BR-004…BR-007, SC-008; keep every test able to fail for the right reason.
**Non-functional:** no assertion weakened to accommodate implementation; no `if`/`catch` guard that lets an assertion be skipped; test count and file count stay accountable against the 120/26 baseline.

## Architecture — the four corrections

| id | File(s) | Change |
|----|---------|--------|
| C1 | `e2e/send-kudos-validation.spec.ts` tests 1–4 | Stop clicking `Gửi`. Trigger field validation by **blur**: focus the required field, leave it empty (or fill then clear), blur, then assert `Không được để trống` is visible and the field carries its error styling. Keep one test asserting `Gửi` stays `disabled` throughout. Cite FR-011, SC-008, ID-50…ID-56. |
| C2 | `e2e/send-kudos-submission.spec.ts` last test | Click the widget trigger before locating the item: `page.getByRole('button', { name: /widget\|action\|quick/i }).click()`, mirroring `homepage-widget-and-kudos.spec.ts:12-14`. Then assert the `Viết Kudos` menuitem navigates to `/kudos/send`. |
| C3 | `send-kudos-interactions.spec.ts:18`, `validation.spec.ts:53/93/130`, `submit.spec.ts:22`, `submission.spec.ts:17/65` | Replace `'Thái'` / `'Thái Anh'` with a substring of a real seeded name — **`'Trang'`** (unique to `Lê Kiều Trang`). Verify against phase-02's reported list before editing. |
| C4 | `e2e/send-kudos-interactions.spec.ts:43-81` | The hashtag test has **zero** `expect()` calls and its disable assertion is commented out at :69. Give it real assertions (select 5 rows → the 3 unselected rows are `disabled`; toggle one off → it is enabled again; BR-004, SC-005) or delete it. Also remove the `.catch(() => false)`/`if (isVisible())` guards that let assertions be skipped elsewhere in the file. |
| C5 | all 6 spec files | Drop the unused `type Browser` import (lint). Optional: read the port from the project `baseURL` instead of hardcoding `3200` in every file. |

## Related Code Files

**Modify (owned exclusively):** `e2e/send-kudos-access.spec.ts`, `send-kudos-layout.spec.ts`, `send-kudos-validation.spec.ts`, `send-kudos-interactions.spec.ts`, `send-kudos-submit.spec.ts`, `send-kudos-submission.spec.ts`
**Read for context:** `components/ui/dropdown-menu.tsx`, `e2e/homepage-widget-and-kudos.spec.ts`, `e2e/support/supabase-session.ts`, `supabase/seed.sql`, dom-contract.md
**Do not touch:** `playwright.config.ts`, any other `e2e/*.spec.ts`, and all implementation code.

## Implementation Steps

1. Read phase-02's completion message for the verbatim seeded `display_name` list; confirm `'Trang'` matches exactly one profile.
2. Apply C3 across the 5 sites (mechanical, do it first — several later assertions depend on the recipient actually being selectable).
3. Rewrite the four C1 tests around blur-triggered validation. Add a comment in each naming the contradiction and citing BR-007/ID-48/ID-49, so the next reader does not "restore" the click.
4. Apply C2, then C4, then C5.
5. Re-run `npm run test:e2e -- --project=send-kudos`. It must still be **RED** — the screen does not exist yet. Confirm every failure is an assertion/locator failure on the missing screen, not a timeout on a disabled control, not an `INFRA:` error from `seedSupabaseSession`.
6. Re-record `evidence/red-evidence.json` with the corrected file list, exit code, failure summary and the new test/file counts, and correct its inaccurate "no catch() guards" claim.
7. Confirm no other project's collection changed: total files still 26, and the 97 pre-existing tests still collect under their original projects.

## Todo List

- [x] Seeded name list obtained from phase-02; `'Trang'` verified unique
- [x] C3 applied at all 6 call sites
- [x] C1: 4 validation tests rewritten to blur-triggered, each carrying the citation comment
- [x] C1: one test still asserts `Gửi` remains `disabled` while fields are missing
- [x] C2: widget trigger clicked before locating the menuitem
- [x] C4: hashtag test has real assertions (or is deleted); skip-guards removed
- [x] C5: unused `Browser` import removed from all 6 files
- [x] Suite re-run: still RED, and red for the right reason
- [x] `red-evidence.json` re-recorded and its guard claim corrected
- [x] No `playwright.config.ts` edit; orphan check clean

## Success Criteria

- `npm run test:e2e -- --project=send-kudos` exits non-zero, and **every** failure is traceable to
  the absent screen — zero actionability timeouts on a disabled `Gửi`, zero `INFRA:` failures.
- Every test in the six files can fail: no `expect`-free test, no assertion inside an `if` or
  after a `.catch(() => …)` that swallows it.
- ID-50…ID-56 coverage still present (search the files for `Không được để trống`).
- `npx playwright test --list` reports 26 files and the pre-existing 97 tests under unchanged
  projects.
- `git diff --name-only` shows only `e2e/send-kudos-*.spec.ts` and `evidence/red-evidence.json`.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| C1 "fixed" by enabling `Gửi` so the click lands | Med × **High** | Explicitly closed above; `send-kudos-submit.spec.ts` asserts `toBeDisabled()` and BR-007 is sealed. Implementation is not permitted to change either |
| Validation tests deleted instead of rewritten → ID-50…ID-56 uncovered | Med × High | Success criterion greps for the error copy; deletion of coverage is not an accepted resolution |
| A profile is invented to keep `'Thái Anh'` working | Low × **High** | S3; the fix is in the test, and phase-02 owns the seed |
| Rewritten tests pass vacuously against a missing screen | Med × High | Step 5 requires the suite to stay RED for the right reason |
| A `testMatch` "tidy-up" orphans another suite | Low × **High** | `playwright.config.ts` is off-limits; orphan check is a success criterion |

## Security Considerations

Tests carry a local-only fixture credential already in `supabase/seed.sql`
(`e2e-login@example.com`); no new secret is introduced and none is committed.
`seedSupabaseSession` reads credentials from `.env.local` — do not inline them into a spec.

## Next Steps

Hand the corrected suite to phase-09, which re-runs the same command for GREEN. Report which
tests changed shape and which acceptance criteria are now covered by a different mechanism than
the original test cases described.
</content>
