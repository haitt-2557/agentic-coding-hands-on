---
phase: 5
title: "Integration, review and documentation"
owner: reviewer, doc-writer
status: in-progress
priority: P2
effort: 1h
depends_on: [4]
---

# Phase 5 — Integration, Review and Documentation

## Context Links

- Plan of record: [`plan.md`](plan.md)
- Evidence: `plans/reports/` (Phase 1 RED, Phase 4 GREEN + visual)
- Spec drafts to promote: [`spec/homepage-saa/`](spec/homepage-saa/), [`spec/system/`](spec/system/)
- ADR obligation: [`clarifications.md`](clarifications.md) § Post-spec decisions
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM

## Overview

**Priority:** P2 · **Status:** pending

Close the run: full-suite and production-build verification, code review, promotion of the plan-local
spec drafts into `docs/`, ADR-001, and the design-defect report back to the design owner.

## Key Insights

- `docs/` does not exist yet. This phase creates it — `docs/system/{architecture,permissions}.md`
  from the plan-local drafts, plus `docs/decisions/ADR-001-mock-session-and-hand-rolled-i18n.md`,
  which resolves the two dangling `TBD (draft)` pointers in the system drafts.
- The Phase 4 GREEN ran against `next dev`, chosen for RED→GREEN iteration speed. A single
  production-fidelity confirmation via `next build && next start` belongs here, at the merge gate —
  that was researcher-02's explicit deferral, not an oversight.
- Four design defects are logged for the design owner and must be reported, not silently absorbed:
  "Comming soon", "thuộc vè", the stale ID-14 event details, and the contradictory C2 responsive rows.
- Spec drafts are `lang: vi` and stay Vietnamese on promotion; plan and phase files stay English.
- Both `/awards` and `/kudos` remain intentional placeholders. Say so in the docs so a later reader
  does not mistake a stub for an unfinished feature.

## Requirements

**Functional** — full E2E suite plus unit suite green; `npm run build` succeeds; `npm run lint`
clean; review verdict recorded; `docs/` populated; ADR-001 written; design defects reported.

**Non-functional** — no secrets committed; conventional commit messages with no AI references;
every source file under 200 lines; docs match the as-built code rather than the draft's intentions.

## Architecture

```
Phase 4 GREEN ─► full-suite rerun (`npm run test:e2e`, `npm run test:unit`)
              ─► production-fidelity check (`npm run build` [+ `next start` spot-check])
              ─► `reviewer` over the whole diff (app/ + components/ + lib/ + e2e/ + config)
              ─► `doc-writer`: spec/system drafts ─► docs/system/
                               clarifications rationale ─► docs/decisions/ADR-001-*.md
              ─► design-defect report ─► design owner
```

## Related Code Files

**Create:** `docs/system/architecture.md`, `docs/system/permissions.md`,
`docs/decisions/ADR-001-mock-session-and-hand-rolled-i18n.md`, review + defect reports in `plans/reports/`
**Modify:** `plan.md` phase statuses; the two `spec/system/*.md` drafts' `TBD (draft)` ADR pointers
**Delete:** none
**Must not touch:** implementation files, except to apply an accepted review finding through the
phase owner who owns that file

## Implementation Steps

1. Run the full suites: `npm run test:e2e` (no file args now) and `npm run test:unit`. Both green.
2. Run `npm run build`; spot-check `/` under `next start` for a production-fidelity confirmation of
   the countdown, the role gating and the hash anchors.
3. `npm run lint` clean.
4. `reviewer` reads the whole diff — contract adherence to the seam, error paths, accessibility,
   file sizes, dead scaffold code, any leaked secret. Findings graded critical / warning / suggestion.
5. Route each accepted finding back to the phase owner that owns the file. Critical findings are
   fixed and the Phase 4 GREEN is rerun before this phase closes.
6. `doc-writer`: promote the two `spec/system/` drafts into `docs/system/`, reconciled against the
   as-built code; author ADR-001 (why the session is mocked, why i18n is hand-rolled, and the
   conditions that should trigger replacing each); resolve the `TBD (draft)` pointers.
7. Write the design-defect report (four items) for the design owner.
8. Update `plan.md` phase statuses to `completed`.

## Todo List

- [x] Full `npm run test:e2e` green (all specs, no file args) — 39 passed
- [x] `npm run test:unit` green — 16 passed
- [x] `npm run build` succeeds; `next start` spot-check of `/` — countdown live, h1="ROOT FURTHER", heading order valid, `data-scroll-behavior="smooth"` present, hero keyvisual renders, zero console errors
- [x] `npm run lint` clean
- [x] `reviewer` verdict recorded; zero critical findings
- [ ] `docs/system/{architecture,permissions}.md` promoted and reconciled (doc-writer)
- [ ] `docs/decisions/ADR-001-mock-session-and-hand-rolled-i18n.md` authored (doc-writer)
- [ ] Design-defect report (4 items) sent to the design owner (doc-writer)
- [x] `plan.md` statuses updated

## Success Criteria

- Both suites green in one clean run, with real exit codes recorded — the full E2E covers **ID-0
  through ID-13, ID-15 through ID-60, and ID-62**; **ID-14 is excluded as stale**.
- `npm run build` exits 0 with no Next 16 deprecation warnings (no surviving `priority` prop, no
  `themeColor` inside `metadata`, no `tailwind.config.ts`).
- Zero critical review findings open.
- `docs/system/architecture.md` and `docs/system/permissions.md` describe the code as built, and
  neither still points at a non-existent ADR.
- ADR-001 exists and states the replacement triggers for both the mock session and the hand-rolled i18n.
- The design-defect report names all four logged items.
- No `.env*` file other than `.env.example` is committed; no key, token or credential in the diff.

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| `next build` fails though `next dev` passed (Turbopack default, prerender differences) | Med | High | Build runs here, before merge, with time budgeted for a fix round |
| Promoted docs describe the draft's intent rather than the as-built code | Med | Med | `doc-writer` reads the source before writing; reconcile, do not copy |
| A critical review finding lands after GREEN and invalidates it | Med | Med | Rerun the Phase 4 GREEN after any critical fix; do not close on the stale run |
| Design defects never reach the design owner and reappear next screen | Med | Low | Explicit report step and a success criterion covering all four |
| Placeholder `/awards` and `/kudos` mistaken for finished work | Med | Low | Marked "intentional placeholder" in the routing docs |
| A `.env.local` created during development gets committed | Low | High | Confirm `.gitignore` coverage and scan the diff before commit |

## Security Considerations

The docs must state plainly that the role model is **UI visibility over a client-side mock, not
access control**, and that every rule in the permissions matrix has to be re-derived and enforced
server-side when real authentication arrives. ADR-001 records the same caveat as a replacement
trigger. The review explicitly scans for committed secrets, for `NEXT_PUBLIC_` leakage of anything
that should have stayed server-side, and for any comment or doc line that overstates the mock
session as a security boundary.

## Next Steps

Out of scope for this run and worth queueing: real `/awards` and `/kudos` screens (their MoMorph
screens were never fetched), real authentication replacing `SessionProvider`, a CI workflow running
both suites, and a screen-reader accessibility audit — `spec/.../SCR-homepage/spec.md` marks screen
reader compatibility as `unknown` and no test case covers it.
