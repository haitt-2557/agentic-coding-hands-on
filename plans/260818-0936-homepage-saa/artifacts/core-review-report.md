---
failed: 0
warnings: 2
missing: 0
result: PASS
---

# Review Report — Rebuild-Spec Artifacts

**Reviewer**: Staff Engineer (automated)
**Date**: 2026-08-18
**Scope**: 11 core artifacts (system-overview, architecture, data-model, behavior-logic, permissions, permissions-matrix, user-stories, feature-list, route-list, screen-list, screen-flow). No feature specs, flows, or glossary in this run (not generated).

---

## Summary

| Metric | Value |
|--------|-------|
| Artifacts reviewed | 11 core |
| Critical issues | 0 |
| Warnings | 2 |
| Missing (`.pending` markers) | 0 |
| Result | **PASS** |

**Ground truth for this system** (independently confirmed, not taken on faith): static Next.js 16 App Router site, 0 backend routes, 0 `middleware.ts`, 1 data model (`lib/awards.ts`), 0 background-logic items, 3 UI-visibility "permissions" that are explicitly *not* real authorization, 5 screens, 16 user stories, 9 features. Confirmed directly: `find` for `route.ts`/`middleware.ts` returns nothing; `app/` contains exactly the 5 `page.tsx` files the artifacts claim; `lib/awards.ts` is the only file scout tagged `model`. Spot-checked citations (`account-menu.tsx:16`, `notification-bell.tsx:16`, `account-menu.tsx:51`, `app/admin/page.tsx:1-4`) all quote the cited line/comment verbatim — no fabricated citation found anywhere I sampled.

For a backend-free static site, the near-empty `behavior-logic.md`, the single-entity `data-model.md`, and the `route-list.md` "None found" Backend Routes section are the **correct** output, not a defect — treated as PASS throughout, per the task's own framing.

---

## Critical Issues

_(none)_

One candidate was investigated and **rejected** rather than raised: `screen-flow.md:28` contains the raw `{POPULATED_BY_W6}` token in `## Feature Entry Points`, which `verification-checklist-core-artifacts.md` labels critical if found "not [as] an HTML comment." I traced this through `references/pipeline-w7-w9.md` (Wave 9 pre-promote step, lines 378–394): the token-to-HTML-comment replacement is explicitly a **W9** action that runs *after* W7a review, and it fires only if `--feature-specs` hasn't already populated real content. This plan has not run `--feature-specs` or `W9` yet, so the raw token at this point in the pipeline is the expected, correct state, not a regression. Raising it as a critical here would have been a manufactured finding — do not re-flag it at a future W7a pass unless W9 has already run and the token is still raw.

---

## Warnings

### W1: `route-list.md` Frontend Routes "Owner F###" column not backfilled after Wave 5 — OPEN

- **Severity**: warning
- **Location**: `plans/260818-0936-homepage-saa/artifacts/route-list.md:27-32`
- **Description**: All 5 rows in the Frontend Routes/Pages table (ROUTE001–ROUTE005) carry `—` in the `Owner F###` column. The file's own header note (line 21) says this is deferred: "mọi ô Owner F### ghi '—' và sẽ được đối chiếu ngược ở review pass sau khi feature-list.md tồn tại" (will be cross-referenced back at a review pass once feature-list.md exists). `feature-list.md` now exists (Wave 5 ran, 9 features) and unambiguously attributes every route: ROUTE001 → F001/F002/F003/F004/F005/F006/F007/F008/F009, ROUTE002 → F003, ROUTE003 → F004, ROUTE004 → F007, ROUTE005 → F007. This is exactly the review pass the note pointed to, and the backfill still hasn't happened.
- I ran the project's own deterministic linker, `scripts/validate_feature_api_link.py --plan-dir plans/260818-0936-homepage-saa`, to get an objective severity read rather than assert one — it returned `PASS` with 0 issues. Reading the script (`_route_link_lib.py`), it only parses tables under a `## Backend Routes` heading; this project's Backend Routes section is prose-only ("None found" — correct, there are 0 backend routes), so the script never inspects the Frontend Routes/Pages table where the actual `Owner F###` cells live. That's a scope gap in the validator for frontend-only stacks, not evidence that this artifact is fine — this is exactly the kind of gap the semantic reviewer (not the deterministic gate) is supposed to catch. The validator's own docstring states the intended severity policy for an unclaimed cell either way: "empty/'—'/placeholder cell on a migrated table → soft `link.unmapped` WARN. An unclaimed Owner ('—') is NOT a twin-consistency mismatch" — so I've graded this at the same severity the tool itself would use if it covered frontend tables.
- **Fix**: Populate `Owner F###` in `route-list.md` from `feature-list.md`'s "Related APIs/Routes" sections (ROUTE001→F001,F002,F003,F004,F005,F006,F007,F008,F009; ROUTE002→F003; ROUTE003→F004; ROUTE004→F007; ROUTE005→F007). Consider filing a tooling follow-up so `validate_feature_api_link.py` also walks the Frontend Routes/Pages table on route-view stacks with no backend routes.

### W2: `screen-list.md` / `user-stories.md` Cross-Reference Validation checkboxes still say "pending Wave 5" — OPEN

- **Severity**: warning
- **Location**: `plans/260818-0936-homepage-saa/artifacts/screen-list.md:227`, `plans/260818-0936-homepage-saa/artifacts/user-stories.md:655`
- **Description**: Both files carry an unchecked `[ ]` item — "All SCR### codes are referenced in FeatureList.md — pending Wave 5" and "All US### codes are referenced in FeatureList.md — pending Wave 5" respectively — with a note that `feature-list.md` didn't exist yet at generation time. It now does (9 features, Wave 5 complete), and I independently confirmed full coverage by reading `feature-list.md`'s "Related Screens"/"Related User Stories" fields: all 5 SCR### and all 16 US### are referenced by at least one F###. The checkboxes are stale, not wrong — the underlying claim they're waiting to verify is true — but they still read as an open item to anyone reading these two files without also reading `feature-list.md`.
- **Fix**: Flip both checkboxes to `[x]` now that Wave 5 has run and coverage is confirmed complete (16/16 US, 5/5 SCR).

---

## Passed Checks

✓ Universal.artifact_nonempty @ system-overview.md..screen-flow.md (11/11)
✓ Universal.no_placeholder_text @ system-overview.md, architecture.md, data-model.md, behavior-logic.md, permissions.md, permissions-matrix.md, user-stories.md, feature-list.md, route-list.md, screen-list.md (10/10; screen-flow.md `{POPULATED_BY_W6}` is pre-W9 expected state, see Critical Issues note)
✓ Universal.required_sections_in_order @ system-overview.md..screen-flow.md (11/11)
✓ Universal.content_completeness_traceable_to_source @ data-model.md, route-list.md, screen-list.md, behavior-logic.md, permissions-matrix.md (5/5 — spot-verified against filesystem + scout-report.md)
✓ Universal.citation_accuracy_spotcheck @ permissions-matrix.md:PERM001, PERM002, PERM003 (3/3 — quoted lines match source verbatim)
✓ SystemOverview.template_structure_matches_authoritative_template @ system-overview.md
✓ Architecture.mermaid_diagrams_present_and_valid @ architecture.md (graph TB, sequenceDiagram, 2x graph LR/TD)
✓ Architecture.tech_stack_table_columns @ architecture.md
✓ Architecture.tech_documented_matches_codebase @ architecture.md (Next.js 16.3.1, React 19.2.8, Tailwind v4, Playwright — cross-checked against package.json-derived claims in the doc)
✓ DataModel.check1_entity_completeness @ MODEL001_Award
✓ DataModel.check2_disc_scope @ DISC-001_role, DISC-002_locale
✓ DataModel.check3_model_code_uniqueness @ data-model.md
✓ DataModel.check4_disc_anchor @ DISC-001, DISC-002
✓ DataModel.check5_relationship_completeness @ data-model.md (vacuous — 0 relationships, 1 entity)
✓ BehaviorLogic.type_values_valid @ behavior-logic.md (vacuous — 0 items)
✓ BehaviorLogic.cardinality_cross_check @ behavior-logic.md (see block below)
✓ Permissions.auth_system_type_valid @ permissions.md (`other`)
✓ Permissions.no_perm_codes_in_curated_view @ permissions.md
✓ Permissions.curated_view_consistent_with_matrix @ permissions.md, permissions-matrix.md
✓ PermissionsMatrix.perm_code_uniqueness_and_format @ PERM001..PERM003
✓ PermissionsMatrix.route_and_screen_refs_valid @ PERM001..PERM003 (ROUTE004/ROUTE005 in route-list.md; SCR001/SCR005 in screen-list.md)
✓ RouteList.backend_routes_correctly_empty @ route-list.md (0 backend routes, confirmed via filesystem)
✓ RouteList.frontend_pages_match_filesystem @ route-list.md (5 page.tsx + 1 auto-generated _not-found)
✓ ScreenList.scr_code_format_and_uniqueness @ SCR001..SCR005
✓ ScreenList.every_screen_has_us_mapped @ SCR001..SCR005 (via user-stories.md Screen → US Map)
✓ ScreenList.composite_detection_h1_h6_2of3_gate_applied @ SCR001..SCR005 (all atomic, reasoning documented per screen)
✓ ScreenList.trap1_independence_signal @ SCR001 (correctly stayed atomic — no backend, no independent API/auth/mutation signal per region candidate)
✓ ScreenFlow.all_scr_in_screenlist_present_in_screenflow @ screen-flow.md (5/5)
✓ ScreenFlow.navigation_transitions_match_source @ screen-flow.md (cross-checked against screen-list.md Related Screens)
✓ ScreenFlow.no_circular_dependencies @ screen-flow.md
✓ UserStories.check1_single_intent @ US001..US016 (16/16)
✓ UserStories.check2_human_actor @ US001..US016 (16/16)
✓ UserStories.check5_uniqueness @ US001..US016 (16/16)
✓ UserStories.ui_us_has_scr_mapped @ US001..US016 (16/16)
✓ UserStories.no_orphan_destructive_action_without_us @ screen-list.md, user-stories.md (Sign Out / Admin Dashboard both have dedicated US with the behavior gap disclosed, not invented)
✓ FeatureList.fcode_uniqueness_and_format @ F001..F009 (9/9)
✓ FeatureList.type_rules_ui_requires_scr @ F001..F009 (9/9)
✓ FeatureList.no_orphan_us_scr_route_model_perm @ feature-list.md (16/16 US, 5/5 SCR, 5/5 ROUTE, 1/1 MODEL, 3/3 PERM all resolve)
✓ FeatureList.every_bl_and_perm_owned_by_feature @ feature-list.md (vacuous for BL — 0 items; PERM001/002→F007, PERM003→F008)
✓ FeatureList.no_name_or_keyword_overlap_duplication @ F001..F009

### BehaviorLogic Cardinality
- Inventory total: 0
- Artifact BL count: 0
- Gap: 0% (PASS)
- Missing categories: none
- Orphan files: none

---

## Metrics

| Metric | Value |
|--------|-------|
| Feature Specs | 0 (not generated this run — core pass only) |
| User Stories | 16 |
| Screens | 5 |
| Background Logic Items | 0 |
| Permissions | 3 |
| Backend Route Rows | 0 |
| Frontend Pages | 6 (5 with source + 1 auto-generated `_not-found`) |
| Data Model Entities | 1 |
