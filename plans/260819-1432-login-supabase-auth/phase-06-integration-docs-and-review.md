---
phase: 6
title: "Integration, docs and review"
owner: reviewer, doc-writer
status: completed
priority: P2
effort: 1.5h
test_policy: e2e-red-first
depends_on: [5]
blocks: []
---

# Phase 6 — Integration, Docs and Review

## MoMorph refs

- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- Evidence to review against: `evidence/red-gate-evidence.md`, `evidence/phase-01-infrastructure.md`, `evidence/phase-05-visual-validation.md`
- Spec draft to promote: [`spec/login/`](spec/login/), [`spec/system/`](spec/system/)
- Docs conventions: `docs/vi/`, `docs/decisions/`, `docs/journals/`
- Design defects to report back: [`clarifications.md`](clarifications.md) § Design defects (six)

## Overview

**Priority:** P2 · **Status:** pending

Close the run: adversarial review of the whole diff, then bring `docs/` in line and record the
decisions and the open questions that outlived the implementation.

## Key Insights

- The riskiest lines in this diff are the fewest: `proxy.ts` and `lib/prelaunch/gate.ts` sit on every
  request in the app. Review those first and hardest.
- Six design defects and three unresolved questions must leave this run **visible**, not buried in a
  plan folder nobody reopens.
- `skip_nonce_check = true` and the Google placeholder credentials are local-only settings that would
  be genuine defects in a hosted project. They belong in `docs/`, stated as such.

## Requirements

**Functional**
- `reviewer` reads the full branch diff and grades every finding critical / warning / suggestion.
- The spec draft under `spec/` is reconciled against the code that actually shipped: every `TBD (draft)
  — chưa viết code` marker either resolves to a real `file:line` or is deleted.
- `docs/project-changelog.md` and `docs/development-roadmap.md` updated per
  `documentation-management.md`; `docs/system-architecture.md` gains the auth boundary and the
  merged-proxy sequence.
- A setup section covering `supabase start`, `.env.local`, and the Docker prerequisite.
- The six design defects are packaged for the design owner in one place.

**Non-functional**
- No production code is edited by `doc-writer`. `reviewer` is read-only; fixes route back to the owner.

## Architecture

```
branch diff ──> reviewer ──> critical / warning / suggestion
                   │ critical → back to Track A or Track B → Phase 5 re-run
                   └ clean ──> doc-writer ──> docs/{system-architecture, project-changelog,
                                                    development-roadmap}.md + setup section
                                          ──> spec/ TBD markers resolved to real file:line
                                          ──> design-defect report + deferred-scope note
```

## Related Code Files

**Create:** a design-defect report for the owner (in `docs/` or as a plan artefact), setup
documentation for the Supabase local stack
**Modify:** `docs/**`, `plans/260819-1432-login-supabase-auth/**` (statuses, evidence links)
**Delete:** none

## Implementation Steps

1. `reviewer` reads the full diff, in this order: `proxy.ts` → `lib/prelaunch/gate.ts` →
   `lib/supabase/**` → `app/auth/callback/route.ts` → `app/login/**` → `components/login/**` →
   `supabase/**`. Specifically check: refreshed cookies survive every response path (Phase 4 R1);
   `getSession(` appears nowhere server-side; the E2E assertions are unchanged since Phase 2 (SC5-2);
   no secret is committed; every file under 200 lines.
2. Critical findings go back to the owning track; re-run Phase 5 before continuing. Warnings and
   suggestions are recorded, not silently applied.
3. `doc-writer` reconciles the spec draft against shipped code — real `file:line` or nothing.
4. `doc-writer` updates the four managed documents and writes the setup section: Docker/colima must be
   running, `npx supabase start`, copy the emitted URL/key into `.env.local`, Google credentials still
   pending, and `skip_nonce_check = true` is local-only.
5. Package the six design defects (`/todo` not a real route; no error state drawn; `NEXT_LOCALE` vs
   `localStorage`; fixed header/footer on a non-scrolling frame; new-tab vs same-tab; no responsive
   frames) into one report for the design owner.
6. Record the deferred scope explicitly: route protection for `/`, `/awards`, `/kudos`, `/profile`,
   `/admin`; replacing the mock session; wiring `account.signOut`; test case `45278c06` step 2 still
   unasserted; the asymmetric-JWT / `getClaims()` decision from the research's open questions.
7. Flip every phase status in `plan.md` and set the plan frontmatter `status: completed`.
8. State the docs impact plainly: `Docs impact: major` — this run adds the app's first auth boundary.

## Todo List

- [ ] Reviewer verdict recorded with graded findings
- [ ] Zero unresolved critical findings
- [ ] Spec `TBD (draft)` markers resolved to real `file:line` or removed
- [ ] `docs/system-architecture.md` carries the auth boundary + proxy sequence
- [ ] `docs/project-changelog.md` and `docs/development-roadmap.md` updated
- [ ] Supabase local setup documented, including the local-only `skip_nonce_check`
- [ ] Six design defects packaged for the design owner
- [ ] Deferred scope recorded
- [ ] `plan.md` statuses flipped to completed

## Success Criteria

| # | Observable |
|---|---|
| SC6-1 | Reviewer report exists with every finding graded and every critical closed |
| SC6-2 | `grep -rn "TBD (draft)" spec/` returns nothing unexplained |
| SC6-3 | A new reader can bring the stack up from `docs/` alone, without reading this plan |
| SC6-4 | The design-defect report names all six defects with the decision taken for each |
| SC6-5 | `git status` clean of `.env`, `.env.local`, and any real credential |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | Docs describe the intended design rather than the shipped code | Med × Med | `doc-writer` cites `file:line` for every behavioural claim; SC6-2 forces it. |
| R2 | A critical review finding is downgraded to keep the run closable | Low × High | Criticals route back to the owning track and re-open Phase 5. Grading is the reviewer's alone. |
| R3 | The gate exemption is later misread as an authorization decision | Med × Med | State it in `docs/system-architecture.md` in the same words the gate's own header comment uses: launch timing, not authorization. |
| R4 | `skip_nonce_check = true` reaches a hosted project | Low × High | Documented as local-only in the setup section and in the config comment. |
| R5 | The deferred scope is forgotten and the mock session quietly becomes permanent | Med × Med | Step 6 writes it into `docs/development-roadmap.md`, not only into this plan folder. |

## Security Considerations

- Final secret sweep across the branch before merge: no `.env`, no service-role key, no real Google
  credential, no token in an evidence file or capture.
- Record plainly that **no route is protected yet** — a reader must not infer from "login works" that
  `/admin` is now guarded.
- Note that the mock session remains explicitly not a security boundary.

## Next Steps

Follow-up run: route protection in `proxy.ts`, replacing `lib/session/session-provider.tsx` with the
real Supabase session, wiring `account.signOut`, and closing test case `45278c06` step 2.

## Rollback

Docs-only phase. Revert `docs/**` to undo; the shipped code is untouched here.
