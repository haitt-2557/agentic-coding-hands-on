# Doc-writer report — Award System page docs sync

**Docs impact: minor** (surgical edits only, no new pages, no F### spec created — that layer
was already promoted by the orchestrator before this task).

## Verified before writing

Read the actual shipped source, not just the plan: `app/awards/page.tsx`,
`components/layout/site-header.tsx`, `components/layout/site-footer.tsx`,
`components/awards/{awards-hero,award-section-title,award-category-nav,award-detail-list,
award-detail-card}.tsx`, `components/home/kudos-section.tsx`, `lib/awards.ts`. Confirmed
directly (not assumed from clarifications.md) that `/awards` now composes `SiteHeader` +
`SiteFooter` — a real navigation change the existing docs did not anticipate, since prior
`screen-list.md`/`screen-flow.md` explicitly stated SCR001 was the *only* route with real
chrome.

## Files touched

1. `docs/vi/generated/route-list.md` — ROUTE002 row rewritten: dropped "placeholder có chủ
   đích" wording (no longer true), described the real page content, added `F012` to Owner
   F### alongside existing `F003`.
2. `docs/vi/generated/screen-list.md`:
   - SCR001 description: removed the now-false "duy nhất mang header/footer/nav thật" claim
     (SCR002 also has it now); corrected "4 route còn lại" → "3 route còn lại" for the
     no-chrome placeholders.
   - SCR002_Awards fully rewritten: Description, Components table (1 row → 8 rows), Data
     Displayed (1 → 2 entities), Related Screens (added SCR003_Kudos as a real exit; SCR001
     exit is no longer "browser Back only").
   - Screen Index row for SCR002: Components 1→8, Data Displayed 1→2.
   - Kept the atomic verdict (no REG### added) — verified the nav+detail-list pairing shares
     one `IntersectionObserver` with no independent loading/API/auth signal per section, same
     reasoning already recorded for SCR001's four visual `<section>`s.
3. `docs/vi/generated/screen-flow.md`:
   - Navigation Map mermaid: SCR002→SCR001 and SCR002→SCR003 changed from n/a to real solid
     edges (header/footer nav, Kudos CTA); removed SCR002 from the "browser Back only" dashed
     group (now 3 screens, not 4).
   - "Đọc sơ đồ" paragraph, Screen Access Paths table, and the SCR002_Awards Screen
     Transitions subsection all updated to match — new Exit Points, new Decision Points
     (scrollspy active-state contract, invalid-hash no-op).
4. `docs/vi/generated/user-stories.md` — added a short advisory note (not a renumbering):
   `F012_AwardSystemPage`'s own technical-spec defines *local* `US001–US003` codes that
   collide in number (not content) with this file's global `US001–US003`. Did not merge or
   renumber either side — recorded the gap and pointed at `/tkm:rebuild-spec --features F012`
   for the next pass, mirroring how the F011 gap was handled previously.
5. `docs/vi/system/overview.md` — the Executive Summary listed `/awards` among the
   still-placeholder routes; removed it from that list and added a dated note pointing at the
   real feature.
6. `docs/vi/system/architecture.md` — two spots: the `## Routing` table's `/awards` row (was
   flatly "Placeholder có chủ đích"), and the sentence right below it claiming "5 route cũ …
   không đổi file nguồn" (now false as a blanket statement — `/awards`'s source did change,
   for reasons unrelated to the `proxy.ts` gate). Both patched in place, structure/headings
   untouched.

Both `docs/vi/system/*` files have no `doc_lock: user` frontmatter — checked before editing.
Edits were patches within existing sections/rows, not full rewrites.

## Deliberately left alone

- `docs/vi/features/award-system-page/{technical-spec,business-context,screens,edge-cases}.md`
  — already promoted by the orchestrator before this task; confirmed they exist and are
  internally consistent with the code (`AwardCategoryNav`'s scrollspy logic matches SM-001,
  `AwardDetailCard`'s alternating-side math matches BR-005). Not touched, per instructions.
- `docs/vi/generated/feature-list.md` — already updated with the F012 row; not touched.
- `docs/vi/generated/permissions-matrix.md`, `docs/vi/generated/behavior-logic.md` — grepped
  for `/awards`/`SCR002`, zero hits. F012 adds no new permission and no new background logic
  (read-only page, route protection stays deferred), so nothing there needed a change — this
  was a real verdict after checking, not an assumption.
- `docs/vi/generated/entities.md` — still accurate; `lib/awards.ts`'s `AWARDS` constant was
  extended with fields, not replaced or renamed, so the existing entity description holds.
- `docs/vi/system/permissions.md` line ~102 — still generically true (`proxy.ts` gates every
  route incl. `/awards` by time, not by role); no F012-specific claim there to contradict.
- Design defects #6 (missing prize note on Best Manager/MVP) and #8 (unreadable "Hoặc"
  contrast) from `clarifications.md` — reproduced as drawn in code; documented nowhere as bugs,
  consistent with the instruction to record them as known design issues only if a docs surface
  covers them (none of the surfaces I touched describe per-award visual QA, so nothing to add).

## Concern (pre-existing, not introduced by this task)

`docs/vi/generated/user-stories.md` was already over the project's 800-line docs ceiling
before this session (864 lines from the prior Login run) and is now at 875 after my minimal
6-line advisory. I did not split it — splitting a machine-generated inventory file into
topic/part files is a structural change with cross-reference risk (US-code links from
`feature-list.md`, `screen-flow.md`, and the feature-spec `Related User Stories` sections)
that belongs to a `rebuild-spec` pass, not a surgical row-edit. Flagging for the next
`/tkm:rebuild-spec` run rather than silently growing it further or unilaterally restructuring
it.

**Status:** DONE_WITH_CONCERNS
**Summary:** Synced 6 docs (`route-list.md`, `screen-list.md`, `screen-flow.md`,
`user-stories.md`, `docs/vi/system/{overview,architecture}.md`) to the real `/awards` page —
the biggest correction was that `/awards` now renders real `SiteHeader`/`SiteFooter` chrome
and is no longer a navigational dead-end, which several existing docs asserted was impossible.
No F### spec files were touched (already promoted). Left the F012 local-vs-global US001–US003
numbering collision unresolved by design, recorded as an advisory instead.
**Concerns/Blockers:** `docs/vi/generated/user-stories.md` is over the 800-line ceiling
(pre-existing, now 875 lines) — recommend a `rebuild-spec` split pass rather than further ad
hoc growth.
