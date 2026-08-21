---
phase: 9
title: "Integration, docs and review for /kudos"
owner: reviewer, doc-writer
status: complete
priority: P2
effort: 1.5h
feature: F013
test_policy: e2e-red-first
depends_on: [8]
concurrent_with: []
mode: integration
---

# Phase 9 — Integration, docs and review

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `MaZUn5xHXZ`, node `2940:13431`
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`plan.md`](plan.md), all eight preceding phase files, [`dom-contract.md`](dom-contract.md)
- `spec/kudos-live-board/**` + `spec/system/permissions.md` — the drafts to promote
- Precedent: [`../260820-1020-award-system-page/phase-05-integration-docs-and-review.md`](../260820-1020-award-system-page/phase-05-integration-docs-and-review.md) and `docs/vi/features/award-system-page/` (4 files, 502 lines)
- `.claude/rules/documentation-management.md` — roadmap/changelog obligations

## Overview

**Priority:** P2. **Status:** pending.

Close the run: an adversarial review of the whole diff, promotion of the four spec drafts into
`docs/vi/features/kudos-live-board/`, reconciliation of the permissions doc with the new mock-identity
fields, status updates across `plan.md` and the phase files, and a design-defect report the design
owner can act on — 19 items now, including the one this run discovered.

## Key Insights

- The awards run's docs landed as exactly four files (`business-context`, `technical-spec`, `screens`,
  `edge-cases`) totalling 502 lines. Match that shape; the 800-line-per-file ceiling is not a target.
- **Defect #19 is new**: the frame's verbatim heart count `1.000` is incompatible with the count
  arithmetic the test contract requires (`parseInt('1.000') === 1`). It has to reach the design owner
  along with the other 18, because the resolution — plain integers — visibly departs from the frame.
- `spec/system/permissions.md` is a forward-drafted delta, not a replacement. Merging it into
  `docs/vi/system/permissions.md` must preserve the three existing PERM### rows and the standing
  warning, and must not invent a PERM id.
- Highest-value review targets in this diff: the shared filter state (one source, two consumers), the
  heart's per-viewer state, the clipboard guard, the shared-chrome edits, and the 106-row coordinate
  transcription. Those are where a defect would clear CI and still be wrong.
- Unresolved questions from `clarifications.md` must be carried forward, not silently dropped —
  four of them block future work.

## Requirements

**Functional**
1. `reviewer` reads the full diff and grades every finding critical / warning / suggestion with a
   concrete fix; critical findings return to the owning phase before merge.
2. Promote the four drafts to `docs/vi/features/kudos-live-board/`, replacing `TBD (draft)` markers
   with real source references now that the code exists.
3. Reconcile `docs/vi/system/permissions.md` with the mock-identity extension, additively.
4. Update `docs/development-roadmap.md` and `docs/project-changelog.md` per the docs rules.
5. Flip `plan.md` and all nine phase files to `completed`.
6. Write the design-defect report (19 items) and the follow-up list.

**Non-functional**
- Every docs file under 800 lines; the four feature files stay proportionate to the awards precedent.
- No application code changes here — a critical finding routes back to its owning phase.
- Conventional-commit messages, no AI references, no secrets.

## Architecture

```
reviewer  ──► findings (critical | warning | suggestion)
               critical → back to phase 4/5/6/7 → Phase 8 re-runs → return here

doc-writer ──► docs/vi/features/kudos-live-board/{business-context,technical-spec,screens,edge-cases}.md
           ──► docs/vi/system/permissions.md            (additive merge of the draft delta)
           ──► docs/development-roadmap.md              (F013 status)
           ──► docs/project-changelog.md                (entry + defect summary)
           ──► plans/reports/reviewer-{date}-kudos-board.md
```

## Related Code Files

**Modify** — `docs/vi/system/permissions.md`, `docs/development-roadmap.md`,
`docs/project-changelog.md`, `plan.md`, `phase-01`…`phase-09` (status fields).
**Create** — `docs/vi/features/kudos-live-board/` (4 files),
`plans/reports/reviewer-{date}-kudos-board.md`.
**Delete** — none. The plan-dir `spec/**` drafts stay as the historical record.
**Read for context** — the full diff, `docs/vi/features/award-system-page/**`,
`clarifications.md`, `dom-contract.md`, Phase 8's report.

## Implementation Steps

1. `reviewer`: read the whole diff. Concentrate on the shared filter state, the heart's per-viewer
   state and disabled path, the clipboard guard, the two chrome files, and a sample of the 106
   coordinate rows against `design/kudos-content.md` §4.7.
2. `reviewer`: verify each `dom-contract.md` rule is actually honoured in code, not just green in a
   test — particularly F16, F20, F27, F32, F35, F40.
3. `reviewer`: confirm every code file is under 200 lines and that no second card, dropdown or tooltip
   implementation was introduced (DRY).
4. Route critical findings to the owning phase; re-enter at Phase 8 after the fix.
5. `doc-writer`: promote the four drafts, replacing `TBD (draft)` with real paths and line references.
6. `doc-writer`: merge the permissions delta additively, preserving the existing three PERM### rows and
   the standing warning, and leaving the new gate as `TBD` until an id is assigned.
7. `doc-writer`: roadmap + changelog entries, including the 19-item defect summary.
8. Flip all statuses; run `ck plan check <id>` per phase where available.
9. Write the reviewer report with the defect list and the four unresolved questions carried forward.
10. Final gate: `npm run lint`, `npx tsc --noEmit`, `npm run test:e2e`, `npm run test:unit` all green
    before the run is declared closed.

## Todo List

- [ ] Full-diff review complete; findings graded with concrete fixes
- [ ] Every `dom-contract.md` rule verified in code, not just via a green test
- [ ] All code files under 200 lines; no duplicated card/dropdown/tooltip implementation
- [ ] Critical findings routed and re-verified through Phase 8
- [ ] `docs/vi/features/kudos-live-board/` — 4 files, `TBD (draft)` markers resolved
- [ ] `docs/vi/system/permissions.md` merged additively; 3 existing PERM### rows intact
- [ ] Roadmap + changelog updated
- [ ] `plan.md` and all nine phase files marked `completed`
- [ ] Reviewer report written with the 19 defects and 4 unresolved questions
- [ ] `lint`, `tsc --noEmit`, `test:e2e`, `test:unit` all green

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| No critical finding left open | reviewer report shows zero unresolved criticals | code quality rules |
| Docs describe the shipped code | every `TBD (draft)` in the promoted files replaced with a real reference | documentation rules |
| Permissions doc still truthful | the mock identity is described as a UI affordance, not a boundary | `spec/system/permissions.md` |
| Statuses reconciled | `plan.md` + 9 phase files `completed`; no phase claims done without evidence | plan hygiene |
| Design owner has something actionable | 19 defects, each with node ids and the resolution taken | clarifications |
| Follow-up work is named, not lost | route protection, Pan/Zoom spec, "thăng hạng" frame, heart multiplier, mobile frame | Next Steps |
| Quality gates green at close | four commands, real exit codes recorded | pre-commit rules |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| Review rubber-stamps a green build and misses a logic defect | Med × **High** | Step 2 checks rules in code, not via tests; steps 1 and 3 name the specific high-risk sites |
| The permissions merge overwrites the existing three PERM### rows | Med × High | Additive merge only; the draft is explicitly a delta and says so |
| Docs promoted with `TBD (draft)` markers intact | Med × Med | Step 5 makes marker resolution the acceptance condition |
| Defect #19 never reaches the design owner because it looks like an implementation choice | Med × Med | It is listed explicitly in this file and in the report requirements |
| Statuses flipped to completed while a phase is unverified | Low × High | Phase 8 evidence is the precondition; `ck plan check` per phase |
| Docs file drifts over 800 lines | Low × Low | Mirror the awards shape (≈500 lines across four files) |

## Security Considerations

The docs must not describe the mock session as authentication or authorization — the SECURITY NOTE and
the permissions narrative both stay explicit that anyone can change `userId` from DevTools and that no
server-side check exists. No secret, key or `.env` value enters `docs/**`, a commit message or a report.
Route protection stays deferred and is recorded as an open gap, not as delivered.

## Next Steps

Run closed. Carried forward as separate features: real persistence (schema, RLS, like rules with the
special-day multiplier and its clawback), the four deferred destinations (each needs its own frame),
route protection for the five app routes (closing TC `71b3ef43`), a Pan/Zoom interaction spec (closing
TC `cac4b7a3`), a frame for the "thăng hạng" leaderboard, and a mobile/tablet frame for this screen.

## Out of scope

Application code changes (findings route back to the owning phase), `e2e/**` and
`playwright.config.ts` (Phase 1/8 own those), building any deferred destination, implementing route
protection, and assigning real `PERM###`/`SCR###`/`F###` ids where the source artifacts do not yet
exist. `test_policy: e2e-red-first`.
