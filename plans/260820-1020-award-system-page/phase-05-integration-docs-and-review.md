---
phase: 5
title: "Integration, docs and review"
owner: reviewer, doc-writer
status: completed
priority: P2
effort: 1.5h
feature: F012
test_policy: e2e-red-first
depends_on: [4]
blocks: []
---

# Phase 5 — Integration, Docs and Review

## MoMorph refs

- Hệ thống giải (Award System): https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- Evidence to review against: `evidence/red-gate-evidence.md`, `evidence/phase-04-visual-validation.md`
- Spec draft to promote: [`spec/award-system-page/`](spec/award-system-page/) — provisional **F012**
- Docs conventions: `docs/vi/`, `docs/vi/generated/feature-list.md` (F001–F011 allocated),
  `docs/decisions/`, `docs/journals/`
- Design defects to report back: [`clarifications.md`](clarifications.md) § Design defects (seven)
- Deferred scope inherited from the login run: route protection for `/`, `/awards`, `/kudos`, `/profile`,
  `/admin`

## Overview

**Priority:** P2 · **Status:** pending

Close the run: adversarial review of the whole diff, then bring `docs/` in line and record the decisions,
the design defects and the questions that outlived the implementation.

## Key Insights

- **The riskiest lines are the shared ones, not the new ones.** `lib/awards.ts` feeds the homepage grid and
  `components/layout/site-header.tsx` renders on every route. Review those two first and hardest; the six new
  `components/awards/*` files can only break one page.
- **Seven design defects and three unresolved questions must leave this run visible**, not buried in a plan
  folder nobody reopens. Two of them (`/he-thong-giai` as the intended URL, and the missing responsive
  frames) are now on their third and fourth run respectively — say so, with the count.
- **`/awards` is still not protected.** A green suite and a finished page must not let a reader infer ID-1 is
  closed. State it where a reader will actually meet it.
- **This is the first screen in the app with genuinely new client behaviour** (the scrollspy). It belongs in
  `docs/system-architecture.md` as a pattern, not just as a page.

## Requirements

**Functional**
- `reviewer` reads the full branch diff and grades every finding critical / warning / suggestion.
- The spec draft under `spec/award-system-page/` is reconciled against the code that shipped: every
  `TBD (draft) — chưa viết code` marker either resolves to a real `file:line` or is deleted; `F012` and the
  real `SCR###`/`MODEL###` codes are allocated at promote.
- `docs/project-changelog.md` and `docs/development-roadmap.md` updated per `documentation-management.md`;
  `docs/system-architecture.md` gains the awards page and the scrollspy pattern (IntersectionObserver, no
  hash rewriting, reduced-motion honoured).
- The seven design defects are packaged for the design owner in one place.
- The deferred scope is recorded in `docs/development-roadmap.md`, not only here.

**Non-functional**
- No production code is edited by `doc-writer`. `reviewer` is read-only; fixes route back to the owner.
- `Docs impact: minor` — one new public page, one shared-data extension, one shared-header change; no new
  boundary, no new dependency, no schema.

## Architecture

```
branch diff ──> reviewer ──> critical / warning / suggestion
                   │ critical → back to Track A or Track B → Phase 4 re-run
                   └ clean ──> doc-writer ──> docs/{system-architecture, project-changelog,
                                                    development-roadmap}.md
                                          ──> spec/ TBD markers resolved to real file:line
                                          ──> design-defect report (7) + deferred-scope note
                                          ──> plan.md + phase statuses flipped to completed
```

## Related Code Files

**Create:** a design-defect report for the owner (in `docs/` or as a plan artefact)
**Modify:** `docs/**`, `spec/award-system-page/**`, `plan.md` and `phase-0*.md` statuses
**Delete:** none

## Implementation Steps

1. `reviewer` reads the full diff in this order: `lib/awards.ts` → `components/layout/site-header.tsx` →
   `components/awards/award-category-nav.tsx` → the remaining `components/awards/*` → `app/awards/page.tsx`
   → `lib/i18n/dictionaries/*` → `e2e/awards-page.spec.ts` + `playwright.config.ts`. Specifically check:
   the `Award` extension is additive (no deletion in `description`, `image`, the slugs, `EXPECTED_AWARD_SLUGS`
   or `awardHref()`); the six `#<slug>` ids survive in the server-rendered HTML; nothing writes
   `location.hash` or `history.pushState`; no global `scroll-behavior: smooth` was added; the observer is
   disconnected on unmount; the E2E assertions are unchanged since Phase 1 (SC4-2); every file under 200 lines.
2. Critical findings go back to the owning track; re-run Phase 4 before continuing. Warnings and suggestions
   are recorded, not silently applied.
3. `doc-writer` reconciles the spec draft against shipped code — real `file:line` or nothing. Allocate `F012`
   in `docs/vi/generated/feature-list.md` (F001–F011 are taken) and the `SCR###`/`MODEL###` codes.
4. `doc-writer` updates the three managed documents, adding the scrollspy pattern and the `/awards` route to
   the architecture doc, and noting that the page shares `lib/awards.ts` with the homepage grid.
5. Package the seven design defects (`/he-thong-giai` is not this app's route; instance overrides invisible in
   node names; CSV vs frame on Top Talent's quantity; no mobile/tablet frame — fourth run running; the nav's
   scroll behaviour unspecified; Best Manager/MVP missing the prize note while Signature carries two rows;
   access control specified but not buildable) with the decision taken for each.
6. Record the deferred scope explicitly: route protection for the five routes closing ID-1; the canonical
   award URL ruling; a mobile/tablet frame for this screen; and the keyboard trade-off from Track A (the nav
   click does not move focus into the target section) if Phase 4 recorded it as an open gap.
7. Flip every phase status in `plan.md` and set the plan frontmatter `status: completed`.
8. State the docs impact plainly: `Docs impact: minor`.

## Todo List

- [x] Reviewer verdict recorded with graded findings
- [x] Zero unresolved critical findings
- [x] `lib/awards.ts` diff confirmed additive, line by line
- [x] Spec `TBD (draft)` markers resolved to real `file:line` or removed
- [x] `F012` allocated in the feature list; `SCR###`/`MODEL###` codes assigned
- [x] `docs/system-architecture.md` carries the `/awards` route and the scrollspy pattern
- [x] `docs/project-changelog.md` and `docs/development-roadmap.md` updated
- [x] Seven design defects packaged for the design owner
- [x] Deferred scope recorded in the roadmap, not only in this plan
- [x] `plan.md` statuses flipped to completed

## Success Criteria

| # | Observable |
|---|---|
| SC5-1 | Reviewer report exists with every finding graded and every critical closed |
| SC5-2 | `grep -rn "TBD (draft)" spec/award-system-page/` returns nothing unexplained |
| SC5-3 | `git diff lib/awards.ts` shows zero deletions outside the added fields |
| SC5-4 | The design-defect report names all seven defects with the decision taken for each |
| SC5-5 | A reader of `docs/` alone learns that `/awards` is public and that route protection is still open |
| SC5-6 | `docs/vi/generated/feature-list.md` carries F012 with no code collision |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | Docs describe the intended design rather than the shipped code | Med × Med | `doc-writer` cites `file:line` for every behavioural claim; SC5-2 forces it. |
| R2 | A critical review finding is downgraded to keep the run closable | Low × High | Criticals route back to the owning track and re-open Phase 4. Grading is the reviewer's alone. |
| R3 | The missing responsive frames are flagged for a fourth time and still nothing changes | High × Med | Step 5 states the run count explicitly; a defect repeating across four screens is escalated as a process issue, not a per-screen note. |
| R4 | A reader infers from "the awards page is done" that `/awards` is now protected | Med × Med | SC5-5 puts the public-route fact in `docs/`, in the same words the gate's own comment uses: launch timing, not authorization. |
| R5 | `F012` collides with a code allocated by a concurrent run | Low × Med | Step 3 re-reads `feature-list.md` at promote time rather than trusting this plan's provisional code. |
| R6 | The scrollspy pattern is re-invented differently on the next long page | Med × Low | Step 4 records it as a named pattern in the architecture doc, with the no-hash-rewrite and reduced-motion rules attached. |

## Security Considerations

- Final sweep for secrets across the branch before merge — this run adds none, so anything found is a
  pre-existing leak and must be treated as one.
- Record plainly that **no route is protected yet**; the awards page being complete changes nothing there.
- Note that all award copy is public marketing content — no confidentiality classification applies, and the
  data module holds nothing role-dependent.

## Next Steps

Follow-up runs: route protection across `/`, `/awards`, `/kudos`, `/profile`, `/admin` (closing ID-1); the
`/kudos` screen; a mobile/tablet frame for this screen so the responsive collapse stops being derived.

## Rollback

Docs-only phase. Revert `docs/**` and the spec edits to undo; the shipped code is untouched here.
