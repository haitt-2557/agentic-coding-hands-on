# Phase 08 — GREEN verification, regression sweep, evidence

## Context Links

- [red-evidence.json](evidence/red-evidence.json) — the command and the three failures that must invert
- [technical-spec.md](spec/like-kudos/technical-spec.md) — SC-001..SC-008
- MoMorph refs: Sun* Kudos - Live board · https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ · testPolicy `e2e-red-first`
- **Owner: `tester`.** Runs commands and records results; fixes go back to the owning phase.

## Overview

**Priority:** P1 · **Status:** done · **Effort:** ~0.75h
The gate. The exact RED command is re-run unchanged, the rest of the suite is swept for collateral damage, and the result is written down honestly.

## Key Insights

- **The command does not change.** `e2e-red-first` means the same invocation that produced exit 1 must now produce exit 0. A different command, a different project or a narrowed selection is not a GREEN.
- **Three named failures must invert, individually.** SC-001's count surviving reload, SC-003's own-kudos heart disabled, SC-004's zero enabled hearts with no session. A pass count is not the evidence; those three assertions are.
- **The blast radius is wider than this feature's specs.** `kudos-board-interactions`, `kudos-board-feed-interactions`, `kudos-board-layout`, plus `send-kudos-*` and `login-*` — the last two because the seed and the auth helper were touched. Sweep them.
- **`next build` is a real gate here**, not a formality: `/kudos` became dynamic when it started reading cookies, and the port-3200 web server builds before it starts (plan risk R3). A build failure would surface as a Playwright timeout that looks nothing like its cause.
- A material visual mismatch or a failed GREEN means the work is incomplete. Return a bounded fix to the owning phase; never adjust a test to fit the implementation.

## Requirements

- Re-run `npx playwright test --project=kudos-board e2e/kudos-board-like-persistence.spec.ts` → exit 0.
- Full `kudos-board` project green, including the phase 07 additions.
- `send-kudos` and `login-auth-redirect` projects green (seed and auth-helper blast radius).
- `npm run test:unit`, `npm run lint`, `npm run build` all clean.
- Visual validation of the heart in all four states (enabled/unliked, enabled/liked, own-kudos disabled, logged-out disabled) plus the sidebar hearts row.
- Evidence written to `evidence/green-evidence.json` with real exit codes.

## Architecture

```
supabase db reset                       # clean, seeded baseline
npm run build                           # dynamic /kudos compiles (R3)
npm run test:unit                       # heart-math
npx playwright test --project=kudos-board e2e/kudos-board-like-persistence.spec.ts   # THE gate
npx playwright test --project=kudos-board                                            # full screen suite
npx playwright test --project=send-kudos --project=login-auth-redirect               # blast radius
npm run lint
→ evidence/green-evidence.json
```

## Related Code Files

**Create:** `plans/260825-1237-like-kudos-supabase/evidence/green-evidence.json`
**Modify:** none · **Delete:** none — this phase writes no code and no test.

## Implementation Steps

1. `supabase db reset` and confirm phase 02's seed applied (bridge set, 9 author rows, `special_days` empty).
2. `npm run build`. A failure here is R3 and goes back to phase 04.
3. `npm run test:unit` for the pure heart arithmetic.
4. Run the exact RED command. Record the real exit code. Confirm each of the three previously failing assertions now passes, by name, not by aggregate count.
5. Run the full `kudos-board` project. Any failure in `feed-interactions` means phase 07's precondition change is incomplete; any failure in `layout` means phase 06 disturbed the sidebar.
6. Run the `send-kudos` and `login-auth-redirect` projects — the seed file and the auth path were both touched this run.
7. `npm run lint`.
8. Visual validation on port 3200 via Playwright MCP: heart enabled/grey, enabled/red after a like, `kudos-2` disabled under the fixture session, all hearts disabled with no session, and the sidebar hearts row showing a real number. Confirm the count text is digits only (F27) and `aria-pressed` is present in every state (F26).
9. Write `evidence/green-evidence.json`: `greenCommand`, `greenExitCode`, per-SC status for SC-001 through SC-008, the regression projects and their exit codes, the build and lint results, and `capturedAt`. Record any deviation truthfully rather than rounding it to green.
10. Re-run the whole `kudos-board` project a second time without a database reset — a suite that only passes on a clean database is not passing.

## Todo List

- [x] `supabase db reset` clean; seed verified
- [x] `next build` succeeds with `/kudos` dynamic
- [x] `test:unit` green
- [x] RED command re-run verbatim → exit 0
- [x] SC-001 / SC-003 / SC-004 individually confirmed inverted
- [x] Full `kudos-board` project green
- [x] `send-kudos` + `login-auth-redirect` green
- [x] Lint clean
- [x] Visual validation across all four heart states + sidebar row
- [x] `green-evidence.json` written with real exit codes
- [x] Second consecutive run green without a reset

## Success Criteria

- **SC-001..SC-004** — proven by the original RED spec at exit 0.
- **SC-002, SC-005, SC-006, SC-007, SC-008** — proven by phase 07's specs.
- No previously passing test in any project is failing.
- Every heart-button contract (F26/F27/F29/F30) survives.
- The evidence file states real numbers, including anything still outstanding.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| GREEN claimed from a narrowed or altered command | Low × High | The command is quoted verbatim from `red-evidence.json` and re-quoted in the evidence file |
| Suite passes only on a freshly reset database | Med × Med | Step 10 runs it twice without a reset |
| A test is edited to make the run green | Low × High | This phase writes no test files; failures route back to the owning phase |
| Build failure misread as a flaky timeout | Med × Med | Build runs before Playwright, as its own step |
| Collateral break in `send-kudos` / `login` goes unnoticed | Med × High | Both projects are explicitly in the sweep |

## Security Considerations

- Confirm during the sweep that no `getSession()` call entered the codebase and that no service-role key appears in application code or in the e2e helpers.
- Confirm `special_days` and `kudos_static_authors` are still ungranted: an `anon` or `authenticated` select on either must fail.
- Confirm the forged-`user_id` insert (SC-007) is still refused after all phases have landed, not only when phase 01 was fresh.

## Next Steps

On GREEN: hand to `reviewer`, then promote the two forward-drafted system docs (`spec/system/architecture.md`, `spec/system/permissions.md`) at implement-start and let `doc-writer` reconcile `docs/`. On a failure: a bounded fix returns to the owning phase, and this phase re-runs whole — never partially.
