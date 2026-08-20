# Implementer report — Phase 3, Track B: Award data and i18n

**Status:** DONE

## Files Touched

- `lib/awards.ts` (+58 lines, 0 deletions; 75 → 132 lines, under the 200-line limit — no split
  into `lib/awards-copy.ts` was needed)
- `lib/awards.test.ts` (+47 lines, 0 deletions; 6 new cases, 62 pre-existing cases untouched)
- `lib/i18n/dictionaries/vi.ts` (+5 lines — the five `awardsPage.*` keys)
- `lib/i18n/dictionaries/en.ts` (+5 lines — the same five keys, English values)

No other files touched. `lib/awards-copy.ts` was not created (not needed — see line-count note).

## Checks

- Typecheck (`npx tsc --noEmit`): clean, exit 0. No error surfaced from `components/awards/*`
  at this hand-off point (Track A had already landed or had no compile-blocking gap when this
  ran).
- Unit tests (`npm run test:unit`):
  - RED (before `lib/awards.ts` changes): exit 1, 6 new cases fail with a real `TypeError`
    (`Cannot read properties of undefined (reading 'length')` / `toHaveLength` on `undefined`)
    because `Award` did not yet carry `longDescription`/`quantity`/`prizeLines`. All 62
    pre-existing cases passed unchanged.
  - GREEN (after the change): exit 0, 68 passed (62 pre-existing + 6 new), none removed or
    rewritten.
- Lint (`npm run lint`): exit 0, 0 errors. 2 pre-existing warnings in `e2e/login-auth-redirect.spec.ts`
  and `e2e/login-screen.spec.ts` (unused imports) — outside this phase's ownership, not
  introduced by this change.
- Raw run records: `plans/260820-1020-award-system-page/evidence/raw-track-b-runs.json`.

## Acceptance Criteria (SC3-1…SC3-6)

- [x] SC3-1: `npm run test:unit` passes with 68 cases, strictly more than the pre-existing 62,
  none removed.
- [x] SC3-2: `git diff --stat lib/awards.ts` and a line-level diff show only additions — `+58
  -0`. `EXPECTED_AWARD_SLUGS`, `awardHref()`, and the existing four `Award` fields
  (`slug`/`title`/`description`/`image`) are byte-unchanged.
- [x] SC3-3: `npx tsc --noEmit` exits 0; `npm run lint` exits 0 (2 unrelated pre-existing
  warnings only).
- [x] SC3-4: verified programmatically — `vi` and `en` each have 38 keys, identical key sets,
  both containing all five `awardsPage.*` keys (`awardsPage.subtitle`, `awardsPage.heading`,
  `awardsPage.quantityLabel`, `awardsPage.prizeLabel`, `awardsPage.prizeOr`).
- [x] SC3-5: verified programmatically — extracted all 8 long-description paragraphs from
  `lib/awards.ts` and diffed them byte-for-byte against the `>` blockquote lines in
  `design/award-copy.md`; exact match, including en dashes (`–`), curly quotes (`“ ”`), and the
  `Sun*` asterisk.
- [ ] SC3-6: `e2e/homepage-awards-grid.spec.ts` still passing — deferred to Phase 4 as specified
  (that suite runs under `test:e2e`, owned by the `tester` phase, not this Track B unit-test
  gate).

## Implementation Notes

- **Shape delivered** (matches the frozen Integration contract exactly):
  `longDescription: string[]`, `quantity: { value: string; unit: string }` (new
  `AwardQuantity` interface), `prizeLines: { amount: string; note?: string }[]` (new
  `AwardPrizeLine` interface). All three fields are required (no `?`), so an incomplete entry
  fails `tsc`, not runtime — per Key Insight / R6.
- **Additive only.** Every one of the existing four `Award` fields, `EXPECTED_AWARD_SLUGS`, and
  `awardHref()` is untouched byte-for-byte. The short `description` (homepage card copy) and the
  new `longDescription` (awards-page body) both stay — two genuinely different surfaces reading
  the same array, per clarifications.md.
- **Defect #3 pinned as decided.** `top-talent.quantity` is `{ value: '10', unit: 'Cá nhân' }` —
  the frame's rendered text, not the spec CSV's `10 Đơn vị`. A dedicated unit test locks this in.
- **Prize-line shape covers all six with no discriminator:** Best Manager and MVP get one line
  with no `note`; Top Talent/Top Project/Top Project Leader get one line with a note; Signature
  gets two lines, each with its own `note` ("cho giải cá nhân" / "cho giải tập thể"), joined in
  the UI by `awardsPage.prizeOr`.
- **`lib/awards.ts` stayed under 200 lines** (132 total) with all six long descriptions inline as
  single-line array literals — no need for the planned `lib/awards-copy.ts` split. If a future
  phase adds more per-award copy and crosses the limit, that split is still the documented
  escape hatch and the public `@/lib/awards` import path would not move.
- **`awards.caption`/`awards.heading`/`awards.detailLink` left alone** — the awards-page section
  title uses its own new keys (`awardsPage.subtitle`/`awardsPage.heading`) so the homepage's
  `Hệ thống giải thưởng` heading (no "SAA 2025" suffix) is never touched.
- Ran `npx tsc --noEmit` and `npm run lint` after Track A's files were already present in the
  tree (no `components/awards/*`-only errors were seen to set aside); both were clean end to
  end.

## Issues Encountered

None. No file conflicts with Track A were hit — `app/**`, `components/**`, `e2e/**`, and
`playwright*.config.ts` were not read or touched.

**Status:** DONE
**Summary:** `lib/awards.ts` extended additively with `longDescription`/`quantity`/`prizeLines`
for all six awards (verbatim, byte-checked against `design/award-copy.md`), both dictionaries
gained the five `awardsPage.*` keys; unit RED exit 1 → GREEN exit 0, `tsc`/`lint` clean.
**Concerns/Blockers:** None.
