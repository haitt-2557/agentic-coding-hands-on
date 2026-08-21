# Kudos Live Board — Docs Reconciliation

Verdict: **updated**. Read the full `components/kudos/`, `lib/kudos/` trees, `app/kudos/page.tsx`,
`lib/session/session-provider.tsx`, `components/layout/site-header.tsx` before writing anything.
Validated with `validate_feature_spec.py` and `validate_source_citations.py` (both `--spec` per file)
after edits — all four feature files and the screen spec return zero issues.

## Task 1 — `technical-spec.md` § Source Code References (done)

Rewrote the section entirely against the real tree (`ls components/kudos/ lib/kudos/`, `git status`):
- Tables for `lib/kudos/` (10 files: 7 modules + 3 test), `components/kudos/` (19 files), Sửa (3
  files), Tái dùng, and E2E (3 files) — every path:line citation checked against the actual file
  (line ranges confirmed with `wc -l` + `Read`).
- Named the 3 real deltas vs. the pre-code plan: `kudos-submit-pill.tsx` was never built (pill lives
  in `kudos-action-bar.tsx`); `e2e/kudos-live-board.spec.ts` was never built (3 files replace it:
  `kudos-board-layout.spec.ts`, `kudos-board-interactions.spec.ts`,
  `kudos-board-feed-interactions.spec.ts`); `spotlight-ticker.tsx` was built but wasn't in the
  original plan.
- Added real test results (e2e 18/18, suite 96/97, unit 93/93, `tsc --noEmit` clean).

Also fixed every `**Source:** TBD (draft) — chưa viết code` line inside the BR-001/002/003/004/005/007,
DEC-001, SM-001, SM-002 blocks with real `path:N-M` citations (BR-006 stays `N/A` — genuinely never
built, out of scope by design). This wasn't strictly required by validator rule F8 as read literally
(see Process Gap #3 below — the block-level check never fires on this repo's `####` heading
convention), but leaving pre-code "chưa viết code" text in a shipped, `implemented` spec is exactly
the drift this agent exists to catch.

Fixed the `# F000_KudosLiveBoard` H1 (should have been `F013` — `fcode: F013` was already correct in
frontmatter, only the heading was stale from the scaffold placeholder).

## Task 2 — rest of the 4-file set + screen spec (done)

Found and fixed, beyond what Task 1 named directly:

| File | What was wrong | Fix |
|---|---|---|
| `technical-spec.md` US007/FR-011 | Claimed tooltip shows "tên/thời gian" | `SpotlightNode` (`lib/kudos/spotlight-names.ts:7-14`) has no timestamp field — tooltip shows name only. Fixed in `What happens`, AC2, and `Requirements fulfilled` |
| `technical-spec.md` Key Entities | `KudosRecord` "8–10 bản ghi", `SpotlightEntry` "~100 tên" | Exactly 9 records, 106 nodes (`spotlight-names.ts` has 106 rows). `ViewerStats` claimed "gắn với danh tính mock-user" — actually a hard-coded constant, no `useSession()` call in `kudos-sidebar-stats.tsx` |
| `technical-spec.md` SM-001 | Fixed "5 trạng thái" | `highlightTop5()` caps at 5 but a restrictive filter yields fewer — states are `page1..pageN`, N ≤ 5 |
| `technical-spec.md` US001/US003 | "biến thể carousel/list" | Real union type is `'highlight' | 'post'` (`kudos-card.tsx:17`) — noted as a naming mismatch, not fabricated |
| `technical-spec.md` Overview/Assumptions | "~100 tên", "carousel 5 thẻ" (absolute) | 106 tên; "tối đa 5" (filter-dependent) |
| `edge-cases.md` | Responsive row said "hẹp hơn 375px" triggers 1-up carousel + sidebar stacking | Wrong breakpoints — carousel 1-up is `< 1440px` (`min-[1440px]:` in `highlight-carousel.tsx`), sidebar/feed stack at `lg` (1024px, Tailwind default in `all-kudos-feed.tsx`); SPOTLIGHT BOARD scales continuously via container query, no breakpoint |
| `screens.md` | `SCR-KudosLiveBoard (TBD at promote)` | `SCR008_KudosLiveBoard` (already allocated) |
| `screens/SCR008_KudosLiveBoard/spec.md` | H1/`**Screen**`/`**Feature**` still `SCR-KudosLiveBoard`/`F000_KudosLiveBoard (provisional...)` | `SCR008_KudosLiveBoard` / `F013_KudosLiveBoard` (matches the promoted-file convention already used in `award-system-page/screens/SCR002_Awards/spec.md`) |
| same file, Layout Regions R2 | `Key Components: KudosSubmitPill` | No such component exists — pill is inside `KudosActionBar`, corrected |
| same file, R6 | `Position: sticky` for the sidebar | `kudos-sidebar.tsx` has no `sticky` class at all — corrected to "not sticky" |
| same file, R5/R6 responsive | "dưới 1440px" for the 2-col→1-col collapse | Real breakpoint is `lg` (1024px), distinct from R3's 1440px |
| same file, Branches/UI States `Source` column | All `TBD (draft)` | Filled with real citations (same files as the technical-spec blocks) |
| same file, Accessibility | "chưa xác nhận vì chưa có code" | Updated with real citations and the actual e2e pass result |

`business-context.md` needed no changes — it's UX-narrative prose (who/why/what), and it already
correctly describes the deferred triggers and the ~8–10→9-record recombination as forward-looking
intent that held up.

## Task 3 — wider docs impact

- **`docs/vi/system/architecture.md`** — the `## Routing` table still said `/kudos` → "Placeholder có
  chủ đích — chỉ tiêu đề, chưa có nội dung Sun* Kudos" (`app/kudos/page.tsx (10 dòng)`). This was
  genuinely stale (route shipped). Fixed the table row and the follow-up paragraph ("4 route còn
  lại" → "3 route còn lại", matching the precedent already set when `/awards` shipped on 2026-08-20).
- **`docs/vi/system/permissions.md`** — already merged this session with the Kudos addendum. Verified
  PERM001–004 all present and the merge reads coherently; one stale line found and fixed: the
  provisional Kudos PERM row still said `kudos-card-actions.tsx (dự kiến, chưa viết)` — updated to
  cite the real `isOwnKudos`/`disabled` lines now that the code exists.
- **`docs/vi/system/business-rules.md`** — added two new curated entries (matching the file's
  existing Applies-when/Says/Source-artifact format): heart-toggle + self-exclusion (BR-001/BR-002),
  and star-tier thresholds (BR-005). Both source-linked to `technical-spec.md`.
- **`docs/vi/system/overview.md`** — the Executive Summary still grouped `/kudos` with `/profile`/
  `/admin` as "route placeholder có chủ đích". Patched surgically (same precedent pattern used for
  `/awards` on 2026-08-20): `/kudos` removed from the placeholder group, dated addendum added.
- **`docs/vi/README.md`** — auto-generated navigation index, no feature/screen counts to reconcile;
  no change needed.
- **`docs/vi/generated/{feature-list,screen-list,route-list}.md`** — verified (not re-done): F013 row,
  SCR008 entry, ROUTE003 update, and the Summary-count reconciliation note in feature-list.md are all
  internally consistent and accurate against the shipped code.

## Pre-existing problems — reported, not fixed (outside this run's scope)

1. **`F012_AwardSystemPage`'s frontmatter violates the contract.** `status: promoted` and
   `fcode: F012_AwardSystemPage` (plus a `promoted_from:` line) don't match
   `spec-authoring-contract.md`'s `status: draft|implemented` and `fcode: ^F\d{3}$`. F013 was written
   to the contract (`status: implemented`, `fcode: F013`), so the two siblings now genuinely differ.
   Someone needs to rule on which is canonical. Not touched.
2. **`F012`'s own `## Source Code References` has the identical pre-implementation staleness** this
   run fixed for F013 — it still says no code was written and lists planned files (confirmed: `grep
   -n "Source:" docs/vi/features/award-system-page/technical-spec.md` returns nothing at all — zero
   citations anywhere in that file, not even inside BR blocks). Its screen spec
   (`SCR002_Awards/spec.md`) has the same pattern: every Branches/UI-States `Source` cell is still
   `TBD (draft)` despite `status: promoted`. This is a systemic pattern — promoted specs in this repo
   never get their citations reconciled post-implementation — worth a process fix, not just a
   one-off patch.
3. **New finding, not in the original brief:** `validate_feature_spec.py`'s
   `FeatureSpec.block_source_missing` check (rule that would require every `BR-###`/`SM-###` block to
   carry a real `**Source:** path:N-M` line once a spec is `status: implemented`) never actually
   fires on any spec in this repo — `_BLOCK_HEADING_RE` requires exactly `### BR-...` (3 `#`), but
   every technical-spec.md in `docs/vi/features/**` (F011, F012, F013, homepage, countdown) writes
   these as `#### BR-...` (4 `#`). Confirmed by grep across all 4 feature dirs. This means the
   per-block citation requirement is currently unenforced repo-wide; only the file-level
   `## Source Code References` body check (F8a) is live. I still filled in the per-block citations
   for F013 on the merits (accuracy, not just to satisfy a gate that isn't running), but this
   validator/heading-convention mismatch is worth a maintainer's attention — either fix the regex or
   the convention, they currently disagree everywhere.
4. **Minor, unrelated to Kudos:** `docs/vi/system/overview.md` § Scalability still says "Current
   Capacity: 6 route" — this was already wrong before this run (the Executive Summary above it
   already lists 9 routes since the Login delivery on 2026-08-19). Left untouched — not caused by
   this delivery and outside the requested scope.

## Files changed

- `docs/vi/features/kudos-live-board/technical-spec.md` (745 → 799 lines, under the 800 ceiling)
- `docs/vi/features/kudos-live-board/edge-cases.md`
- `docs/vi/features/kudos-live-board/screens.md`
- `docs/vi/features/kudos-live-board/screens/SCR008_KudosLiveBoard/spec.md`
- `docs/vi/system/architecture.md`
- `docs/vi/system/permissions.md`
- `docs/vi/system/business-rules.md`
- `docs/vi/system/overview.md`

Not touched: `business-context.md` (no drift found), `docs/vi/generated/*` (verified only, per the
per-path edit rules), `docs/.spec-promote-pending.json`, any code/test file, `plans/**`.

**Status:** DONE
**Summary:** Rewrote F013_KudosLiveBoard's Source Code References against the real tree, fixed
per-block citations and several real behavioral deltas (spotlight tooltip has no timestamp, exact
counts of 9 records/106 names, responsive breakpoints, min-h vs fixed height, per-card toast), fixed
the same staleness in the SCR008 screen spec, and patched architecture.md/permissions.md/overview.md/
business-rules.md for the shipped route. All edited feature-spec files validate clean.
**Concerns/Blockers:** Two pre-existing F012 contract/staleness issues and one validator/convention
mismatch reported above — none blocking, all need a human/maintainer decision rather than a docs
patch.
