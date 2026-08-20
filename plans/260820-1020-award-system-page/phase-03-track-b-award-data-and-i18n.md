---
phase: 3
title: "Track B — Award data and i18n"
owner: implementer
status: completed
priority: P1
effort: 2.5h
feature: F012
test_policy: e2e-red-first
depends_on: [1]
concurrent_with: [2]
---

# Phase 3 — Track B: Award Data and i18n

## MoMorph refs

- Hệ thống giải (Award System): https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- Verbatim copy to transcribe: [`design/award-copy.md`](design/award-copy.md) — the only source
- Frozen shape: [`plan.md`](plan.md) § Integration contract
- Requirements: [`spec/award-system-page/technical-spec.md`](spec/award-system-page/technical-spec.md)
  FR-003, FR-004, BR-001, § Key Entities
- Blast radius and contracts: [`evidence/study-context.json`](evidence/study-context.json)
- Existing code to extend, not replace: `lib/awards.ts`, `lib/awards.test.ts`,
  `lib/i18n/dictionaries/{vi,en}.ts`
- Consumers that must not notice: `components/home/award-card.tsx`, `components/home/awards-section.tsx`,
  `e2e/homepage-awards-grid.spec.ts`

## Overview

**Priority:** P1 · **Status:** pending

The data half of the screen: extend `Award` with the awards-page fields, transcribe the six long
descriptions, quantities and prize lines verbatim, and add the five `awardsPage.*` keys to both
dictionaries. Runs concurrently with Track A behind the same Phase 1 gate. RED-first on the unit surface:
`lib/awards.test.ts` gets its failing cases before `lib/awards.ts` changes.

## Key Insights

- **This is the highest-regression file in the run.** `lib/awards.ts` is the homepage grid's data source.
  `description` (the short card copy), `image`, the six slugs, `EXPECTED_AWARD_SLUGS` and `awardHref()` are
  a live contract with `components/home/award-card.tsx` and `e2e/homepage-awards-grid.spec.ts`. The change is
  **additive only** — new fields beside the old ones, no rename, no reshaping, no second module.
- **The two surfaces genuinely show different text.** The homepage card shows the one-line
  `description`; this page shows `longDescription`. Both stay. Replacing the short copy with the long copy
  would silently rewrite the homepage.
- **New fields are required, not optional.** `longDescription`, `quantity` and `prizeLines` carry no `?`, so
  `tsc` refuses to compile until all six entries are filled. An optional field lets a half-filled record
  ship as a blank section.
- **`prizeLines` is an array because Signature has two.** One shape covers all six: Best Manager and MVP get
  one line with no `note`; the other four get one line with a note; Signature gets two lines with notes,
  joined in the UI by `awardsPage.prizeOr`. No discriminator field, no per-award branch (spec § Polymorphic
  Behavior).
- **The spec CSV and the frame disagree on Top Talent's quantity.** CSV says `10 Đơn vị`, the frame renders
  `10 Cá nhân`. The frame wins (defect #3) — `design/award-copy.md` already holds the settled value.
- **Both dictionaries or the build breaks.** `DictionaryKey` is inferred from `vi`; `en` is typed
  `Record<DictionaryKey, string>` (`lib/i18n/dictionaries/en.ts:5`). A vi-only key fails `tsc`, not runtime.
- **Do not reuse `awards.heading`.** The homepage heading is `Hệ thống giải thưởng`; this page's is
  `Hệ thống giải thưởng SAA 2025`. Editing the shared key would silently change the homepage and its e2e.

## Requirements

**Functional**
- FR-004 — `Award` carries `longDescription: string[]` (1–2 paragraphs), `quantity: { value, unit }` and
  `prizeLines: { amount, note? }[]` (1–2), filled verbatim from `design/award-copy.md` for all six awards.
- FR-003 — `awardsPage.subtitle`, `awardsPage.heading`, `awardsPage.quantityLabel`, `awardsPage.prizeLabel`,
  `awardsPage.prizeOr` exist in `vi` and `en` with identical key sets.
- BR-001 — array order stays `top-talent, top-project, top-project-leader, best-manager,
  signature-2025-creator, mvp`; the nav derives its order from it, so no separate ordering source is added.

**Non-functional**
- `lib/awards.ts` under 200 lines. If the six long descriptions push past it, split the copy into
  `lib/awards-copy.ts` re-exported by `lib/awards.ts` — the public import path `@/lib/awards` must not move.
- Every existing case in `lib/awards.test.ts` is kept and still passes; cases are added, never rewritten.
- Vietnamese text is transcribed byte-for-byte: en dashes `–`, curly quotes `“ ”`, the `Sun*` asterisk.

## Architecture

```
design/award-copy.md  ──(verbatim transcription)──>  lib/awards.ts
                                                      Award { slug,title,description,image      # UNCHANGED
                                                              longDescription, quantity, prizeLines }  # NEW
                                                      EXPECTED_AWARD_SLUGS, awardHref()          # UNCHANGED
                                        │                                   │
        components/home/award-card.tsx ─┘ (reads the old fields only)       └─> components/awards/* (Track A)

lib/i18n/dictionaries/vi.ts  ──DictionaryKey inferred──> en.ts : Record<DictionaryKey, string>
   awardsPage.subtitle | heading | quantityLabel | prizeLabel | prizeOr   (5 keys, both files)
```

## Related Code Files

**Create:** `lib/awards-copy.ts` (only if the 200-line limit demands it)
**Modify:** `lib/awards.ts`, `lib/awards.test.ts`, `lib/i18n/dictionaries/vi.ts`,
`lib/i18n/dictionaries/en.ts`
**Delete:** none

## Implementation Steps

1. **RED first.** Add to `lib/awards.test.ts` before touching `lib/awards.ts`: every award has ≥1 non-empty
   `longDescription` paragraph; `quantity.value`/`quantity.unit` non-empty; `prizeLines` length 1 or 2 with
   non-empty `amount`; `signature-2025-creator` has exactly 2 prize lines; `best-manager` and `mvp` have
   exactly 1 line and no `note`; `top-talent.quantity` equals `{ value: '10', unit: 'Cá nhân' }` (defect #3
   pinned). Run `npm run test:unit`, confirm it fails.
2. **Regression guard, same commit.** Add cases asserting the old contract explicitly: `awardHref` still
   returns `/awards#top-talent` and `/awards` for `undefined`/`''`; every `description` and `image` still
   non-empty; `AWARDS.map(a => a.slug)` still deep-equals `EXPECTED_AWARD_SLUGS`. These must be green both
   before and after the change — if any goes red, the extension stopped being additive.
3. Extend the `Award` interface with the three required fields plus the two small helper interfaces from the
   frozen contract. Do not touch the existing four fields or the header comment's provenance note.
4. Fill all six entries from `design/award-copy.md`. Copy-paste; do not retype, do not re-wrap, do not
   normalise punctuation. Signature and MVP split on the double space into two paragraphs.
5. Re-run `npm run test:unit` — the new cases and every pre-existing case pass.
6. Add the five `awardsPage.*` keys to `vi.ts` with the values frozen in `plan.md`, then the same five keys
   to `en.ts` (`Sun* Annual Awards 2025`, `SAA 2025 Award System`, `Award quantity:`, `Prize value:`, `Or`).
   Leave `awards.caption`/`awards.heading`/`awards.detailLink` alone.
7. `npx tsc --noEmit` and `npm run lint`. A typecheck error pointing only at `components/awards/*` is Track A
   mid-flight, not this phase's defect — note it and move on.
8. Report honestly: unit RED→GREEN evidence, and confirmation that no existing test was edited or removed.

## Todo List

- [x] `lib/awards.test.ts` extended and failing before `lib/awards.ts` changes (RED recorded)
- [x] Old-contract regression cases added and green on both sides of the change
- [x] `Award` extended additively; existing four fields byte-unchanged
- [x] Six entries filled verbatim from `design/award-copy.md`
- [x] `npm run test:unit` green, with strictly more cases than before and none removed
- [x] Five `awardsPage.*` keys in `vi.ts` **and** `en.ts`
- [x] `awards.*` homepage keys untouched
- [x] `npx tsc --noEmit` and `npm run lint` clean of anything outside `components/awards/*`

## Success Criteria

| # | Observable |
|---|---|
| SC3-1 | `npm run test:unit` passes with strictly more cases than before this phase and none removed |
| SC3-2 | `git diff lib/awards.ts` shows only additions to `Award` and to each entry — zero deletions in the existing four fields, `EXPECTED_AWARD_SLUGS` or `awardHref()` |
| SC3-3 | `npx tsc --noEmit` exits 0 once Track A lands; `npm run lint` exits 0 now |
| SC3-4 | `Object.keys(vi).length === Object.keys(en).length` and both contain the five `awardsPage.*` keys |
| SC3-5 | Every long description in `lib/awards.ts` is byte-identical to its block in `design/award-copy.md` |
| SC3-6 | `e2e/homepage-awards-grid.spec.ts` still passes in Phase 4's run |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | The homepage grid breaks — short `description` overwritten with the long copy, a slug renamed, or `Award` reshaped | Med × High | Step 2's regression cases run before *and* after; SC3-2 makes it a mechanical `git diff` check; SC3-6 proves it in the browser. This is the run's single biggest regression risk. |
| R2 | A key lands in `vi.ts` only and the build breaks late, inside Track A's typecheck | Med × Med | Step 6 edits both files in one action; SC3-4 counts keys. The failure is compile-time, so it cannot reach production. |
| R3 | Copy is paraphrased, re-wrapped, or its punctuation normalised — the E2E's exact-text assertions fail for a reason nobody can see | Med × High | Transcribe by copy-paste only; SC3-5 is a byte comparison, not a reading. |
| R4 | `awards.heading` reused "to stay DRY", silently changing the homepage | Low × High | Named explicitly in Key Insights and step 6; the two strings genuinely differ, so sharing them is the bug, not the fix. |
| R5 | `lib/awards.ts` crosses 200 lines with six long descriptions inline | High × Low | Planned split into `lib/awards-copy.ts` re-exported from `lib/awards.ts`; the `@/lib/awards` import path never moves, so no consumer changes. |
| R6 | Optional new fields let a half-filled record ship as a blank section | Low × Med | Required fields; `tsc` refuses to compile an incomplete entry. |

## Security Considerations

- Static public copy only — no user input, no secret, no persistence, no network call.
- Nothing here is an authorization surface: `/awards` stays public (decision 2), and no field carries
  anything role-dependent.
- The strings are rendered as text, never as HTML — no `dangerouslySetInnerHTML` for the two-paragraph
  bodies; the array is mapped to `<p>` elements by Track A.

## Next Steps

Feeds Phase 4 together with Track A. Report to the orchestrator: unit RED→GREEN evidence, the final field
shape, whether `lib/awards-copy.ts` was needed, and whether typecheck was still red on missing
`components/awards/*` at hand-off.

## Rollback

Revert `lib/awards.ts`, `lib/awards.test.ts` and the two dictionaries. Purely additive, so the revert
restores the homepage's exact current behaviour with no data migration and nothing persisted to undo.
