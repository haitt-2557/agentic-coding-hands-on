# Phase 09 — GREEN verification and regression

**Track:** tester · **Owner agent:** `tester` · **Priority:** P1 · **Status:** pending · **Effort:** 1h
**Depends on:** 07 (corrected suite), 08 (wired feature) · **Unblocks:** nothing — this closes the run

## Context Links

- [dom-contract.md](dom-contract.md) → C1–C4 (what changed and why), E1–E5 (regression surfaces)
- [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) → SC-001…SC-009
- [evidence/study-context.json](evidence/study-context.json) → the 13 acceptance criteria
- [evidence/red-evidence.json](evidence/red-evidence.json) → the command that must now pass

## Overview

Close the `e2e-red-first` loop: re-run the **exact** recorded command for GREEN, prove the shared
components did not regress, then own the visual validation the policy requires. This phase edits
no implementation and no test — it runs, reports, and returns bounded fixes to their owners.

## Key Insights

- The RED command is fixed and must not be reshaped:
  `npm run test:e2e -- --project=send-kudos`.
- A GREEN claim is only valid for tests that could actually have failed. C4's zero-assertion test
  must have been given assertions or removed in phase-07 — verify before counting it.
- The three highest-value regressions are all in **shared** components, not the new ones: the
  `/kudos` submit pill (E1–E3), the homepage quick-action widget (E4), and the single-`role=status`
  invariant on `/kudos` (E5).
- Port 3200 is a production build; a failure there can be a build failure rather than a screen
  failure. Distinguish them before reporting.
- `seedSupabaseSession` prefixes infra failures with `INFRA:` — those are never screen failures and
  must not be reported as such.

## Requirements

**Functional:** all 13 acceptance criteria in `study-context.json` demonstrated, or the shortfall named precisely.
**Non-functional:** real exit codes recorded verbatim; no failure rounded up to a pass; flaky vs deterministic distinguished by re-run.

## Architecture — verification matrix

| Layer | Command / method | Proves |
|-------|------------------|--------|
| Unit | `npm test` (or the repo's runner) on `lib/kudos/send/validation.test.ts` | BR-002…BR-007, ALG-001 in isolation (SC-003, SC-004, SC-008) |
| Build | `npx next build` | the port-3200 server can start at all |
| E2E target | `npm run test:e2e -- --project=send-kudos` | SC-001…SC-009, the 23-test suite, GREEN |
| E2E regression | `--project=kudos-board` | E1–E3, E5 — pill placeholder/focus/enabled, no second `role=status` |
| E2E regression | `--project=homepage-with-open-gate` | E4 — widget's two menuitems and order |
| E2E full | `npm run test:e2e` | no orphaned or newly-broken spec across all 7 projects |
| DB | psql on :54422 | 1 `kudos` row per submit with `sender_id = auth.uid()`; forged sender rejected (SC-009) |
| Visual | Playwright MCP capture of `/kudos/send` on :3200 | frame fidelity — field order, toolbar, chips, thumbnails, footer (policy requirement) |

## Related Code Files

**Owns:** nothing to edit. May re-run and read anything.
**Do not touch:** all implementation code, `e2e/**` (phase-07 owns corrections), `playwright.config.ts`.
Failures go back as bounded fixes: markup/D-rule → `momorph-ui-implementer` (phase-06);
behaviour/DB → `implementer` (phases 01–05, 08); test defect → `tester` (phase-07).

## Implementation Steps

1. Confirm local Supabase is up and seeded (`npx supabase status`; 8 hashtags, 7 profiles present).
2. Run the unit tests and `npx next build`. Stop and report if either fails — an E2E run on a
   broken build produces misleading failures.
3. Run `npm run test:e2e -- --project=send-kudos`. Record the real exit code and the pass/fail
   count verbatim.
4. For each failure, classify: (a) missing/incorrect markup → phase-06; (b) wrong behaviour or DB
   result → phases 01–05/08; (c) `INFRA:` or build failure → environment; (d) test defect → phase-07.
   Never weaken a test to move a failure off the list.
5. Run the two regression projects, then the full suite. Compare the collected total against the
   120-test / 26-file baseline in `red-evidence.json`.
6. Verify the DB rows and the forged-sender rejection in psql (SC-009).
7. Do the visual validation pass against the frame and note any material mismatch.
8. Write the report to `plans/reports/tester-260824-<slug>.md` with commands, exit codes, and the
   13 acceptance criteria each marked met / not met / covered-differently (with the C1 note where
   the mechanism changed from click to blur).

## Todo List

- [ ] Supabase up; seed verified (8 hashtags, 7 profiles)
- [ ] Unit tests green; `npx next build` green
- [ ] `--project=send-kudos` GREEN, exit 0, real counts recorded
- [ ] Every previously-unfailable test confirmed assertive before counting it
- [ ] `--project=kudos-board` green (E1–E3, E5)
- [ ] `--project=homepage-with-open-gate` green (E4)
- [ ] Full `npm run test:e2e` green; collection matches the 120/26 baseline
- [ ] psql: one row per submit, correct `sender_id`; forged sender rejected
- [ ] Visual validation done against frame `JsTvi8KVQA`
- [ ] Report written with verbatim exit codes and per-criterion status

## Success Criteria

- `npm run test:e2e -- --project=send-kudos` exits **0** with all tests passing and none skipped.
- Both regression projects and the full suite exit 0; no spec orphaned (26 files collected).
- SC-001…SC-009 each demonstrated by a named test or a named DB check.
- SC-009's forged-sender half proven at the database, not inferred from the policy text.
- The report states, for each of the 13 acceptance criteria, met / not met / covered-differently —
  with the deferred items (ID-12, ID-13, ID-33 mention autocomplete) called out as out of scope
  rather than silently passed over.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| GREEN claimed on tests that cannot fail | Med × **High** | Step 4 and a dedicated todo: verify assertiveness before counting (C4) |
| A shared-component regression ships because only the new project was run | Med × **High** | Both regression projects are mandatory success criteria |
| Build failure misread as a screen failure on :3200 | Med × Med | `next build` runs before the E2E step |
| `INFRA:` session-seeding failure reported as a feature bug | Med × Med | The sentinel is documented; classification is step 4 |
| Flaky pass accepted as green | Low × Med | Re-run any intermittent test before recording it |
| Test edited to force green | Low × **High** | This phase owns no edits; fixes are routed to owners |

## Security Considerations

- Re-verify FR-014 empirically: a client-forged `sender_id` must be rejected. A passing UI test
  does not demonstrate this — only the DB check does.
- Confirm the unauthenticated redirect leaks no form markup before the 307 (US001 scenario 2).
- Confirm the image bucket is still private and no public URL was introduced during integration.
- Do not paste fixture credentials or Supabase keys into the report.

## Next Steps

On green, the run is complete. Carry forward to `docs/` the items in plan.md's *Out of scope* list —
board rewiring is the one that makes sent kudos visible, and until it lands the seam stands as
designed. Hand the implementation to `reviewer` per the primary workflow.
</content>
