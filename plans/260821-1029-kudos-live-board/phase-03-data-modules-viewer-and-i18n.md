---
phase: 3
title: "Kudos data modules, mock viewer identity and i18n"
owner: implementer
status: complete
priority: P1
effort: 3h
feature: F013
test_policy: e2e-red-first
depends_on: [1]
concurrent_with: [2]
mode: track-b
---

# Phase 3 — Kudos data modules, mock viewer identity, i18n

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `MaZUn5xHXZ`, node `2940:13431`
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- [`dom-contract.md`](dom-contract.md) §10 (seed constraints S1–S8) and §12 (the export seam) — **binding**
- [`design/kudos-content.md`](design/kudos-content.md) §3.3, §4.7, §5.4, §6 — every string and coordinate
- [`spec/kudos-live-board/technical-spec.md`](spec/kudos-live-board/technical-spec.md) — BR-005 tooltips, Key Entities
- [`spec/system/permissions.md`](spec/system/permissions.md) — the mock-identity narrative
- Precedent: `lib/awards.ts` (132 lines) + `lib/awards.test.ts`, run by `playwright.unit.config.ts`
- `AGENTS.md`: Next.js 16.3.1 — read `node_modules/next/dist/docs/` before writing code

## Overview

**Priority:** P1. **Status:** pending.

Every string, coordinate, count and vocabulary the screen renders lands here, in seven modules under
`lib/kudos/`, plus two additive `userId`/`displayName` fields on the existing mock session and the
`kudosPage.*` dictionary keys. No component holds inline literal content (clarifications). This is
the phase where the E2E suite's data contract is either honoured or quietly broken, so
[`dom-contract.md`](dom-contract.md) §10 is not advisory.

## Key Insights

- **The frame draws one kudos seven times** (defect #11). Seeding verbatim would make filtering,
  ranking, heart ownership and the empty state unassertable. Records are therefore *recombined* from
  real frame vocabulary — 7 word-cloud names, 4 badge tiers, both department spellings, both
  hashtags, the one category. The frame stays the vocabulary; nothing is authored from nothing.
- **`parseInt('1.000') === 1`.** The heart-toggle test asserts `count + 1` on the button's text, so
  the frame's verbatim `1.000` cannot survive the arithmetic. Counts are distinct integers in 10–999
  and no thousands-separator formatter is written (S2, F28). Record it as design defect #19.
- **The two department spellings are both real** (defect #15): `CECV10` on the three highlight cards,
  `CEVC10` on the four post cards. Keep both; they double as the filter vocabulary and give S5 its
  zero-match combination.
- **Two different message bodies** (defect #13): the highlight cards truncate at
  `…tạo động lực rất...`, the post cards run to `…<3 và cuộc sống...`. Do not substitute one for the
  other.
- TC `d662780b` (empty leaderboard) has no UI route on static data. It is closed here as a **pure
  helper** `leaderboardOrEmpty()` with a unit test — the honest home for it (F43).
- The mock session is not an auth boundary and must not start looking like one. Extend the existing
  SECURITY NOTE in place; keep the `localStorage → NEXT_PUBLIC_* → hard default` precedence exactly
  as it is.

## Requirements

**Functional**
1. `lib/kudos/kudos-records.ts` — `KudosRecord` + 9 records satisfying S1–S8.
2. `lib/kudos/kudos-queries.ts` — `KudosFilter`, `matchesFilter`, `filterRecords`, `highlightTop5`.
3. `lib/kudos/filters.ts` — `HASHTAG_OPTIONS`, `DEPARTMENT_OPTIONS`, `CLEAR_OPTION_LABEL` in the
   exact order S3 fixes.
4. `lib/kudos/spotlight-names.ts` — all **106** rows from §4.7 with `relX`/`relY`/`fontSize`/
   `highlighted`, plus `SPOTLIGHT_TOTAL_LABEL = '388 KUDOS'` and the ticker line.
5. `lib/kudos/leaderboard.ts` — 5 entries (names keep their trailing space) + `leaderboardOrEmpty()`.
6. `lib/kudos/viewer-stats.ts` — the 5 labelled stat rows, every value `25`.
7. `lib/kudos/star-tiers.ts` — `starTierFor()` with the three verbatim BR-005 tooltip sentences.
8. `lib/session/session-provider.tsx` — additive `userId` + `displayName`, SECURITY NOTE extended.
9. `lib/i18n/dictionaries/vi.ts` then `en.ts` — `kudosPage.*` keys for enumerable chrome copy only.
10. Unit tests: `lib/kudos/kudos-records.test.ts` (asserts S1–S7 mechanically),
    `lib/kudos/leaderboard.test.ts` (TC `d662780b`), `lib/kudos/star-tiers.test.ts` (BR-005 bounds).

**Non-functional**
- Every file under 200 lines; interface + typed const array + pure functions, no classes
  (the `lib/awards.ts` shape).
- Both dictionaries or the build breaks — `en` is `Record<DictionaryKey, string>`.
- Verbatim whitespace preserved (S8). No `.trim()` anywhere in these modules.
- Long-form body copy stays out of the dictionaries (the documented `vi.ts` scope rule).

## Architecture

```
KUDOS_RECORDS ──filterRecords(filter)──► AllKudosFeed  (Phase 7)
      │         └─highlightTop5(filter)─► HighlightCarousel (Phase 5)
      ├── record.senderId ═══compare═══► useSession().userId ──► heart disabled (BR-002)
      ├── record.hashtags ──────────────► hashtag buttons ──► setFilter (DEC-001)
      └── senderKudosReceived ──starTierFor()──► star count + tooltip (BR-005)

FILTER vocab (static, never narrowed) ──► KudosFilterBar menus (Phase 5)
SPOTLIGHT_NODES (106, board-relative) ──► SpotlightNameCloud (Phase 6)
LEADERBOARD ──leaderboardOrEmpty()────► KudosLeaderboard (Phase 7)
VIEWER_STATS ─────────────────────────► KudosSidebarStats (Phase 7)
```

`KudosFilter = { hashtag: string | null; department: string | null }`. `matchesFilter` is AND across
the two fields, with `null` meaning "no constraint" — that is what makes S5's empty combination
reachable and F42's dual empty state consistent across both regions.

### Seed shape (satisfies S1–S7)

| # | sender | dept | hashtags | hearts | in top-5 | notes |
|---|---|---|---|---|---|---|
| 1 | someone else | `CEVC10` | `#Dedicated`, `#Inspring` | highest | yes | feed position 1 → heart must be **enabled** (S6) |
| 2 | **mock viewer** | `CEVC10` | `#Dedicated` | — | — | feed position 2 → heart **disabled** (S6) |
| 3–4 | others | `CEVC10` | include `#Dedicated` | varied | yes | keeps `#Dedicated` and `CEVC10` at ≥4 records (S4) |
| 5–7 | others | `CEVC10` / mixed | mixed | varied | yes/no | fills the 9 and the 5-record highlight set (S1) |
| 8–9 | others | `CECV10` | `#Inspring` **only** | varied | no | never `#Dedicated` → the `#Dedicated`+`CECV10` empty combination (S5) |

## Related Code Files

**Create** — `lib/kudos/{kudos-records,kudos-queries,filters,spotlight-names,leaderboard,viewer-stats,star-tiers}.ts`
and `lib/kudos/{kudos-records,leaderboard,star-tiers}.test.ts`.
**Modify** — `lib/session/session-provider.tsx`, `lib/i18n/dictionaries/vi.ts`, `lib/i18n/dictionaries/en.ts`.
**Delete** — none.
**Read for context** — `lib/awards.ts`, `lib/awards.test.ts`, `playwright.unit.config.ts`,
`design/kudos-content.md`, `dom-contract.md`.

## Implementation Steps

1. Read `lib/awards.ts` for the module shape and `lib/session/session-provider.tsx:1-40` for the
   SECURITY NOTE before editing either convention.
2. Write `filters.ts` first — the vocabularies constrain the records, not the reverse.
3. Write `kudos-records.ts` against the seed-shape table, transcribing strings from
   `design/kudos-content.md` §3.3 and §5.4 with whitespace intact.
4. Write `kudos-records.test.ts` **before** believing the data: assert exactly 9 records; exactly 5
   in `highlightTop5(empty filter)`; `#Dedicated` count ≥ 4; `CEVC10` count ≥ 4; zero records match
   `{hashtag:'#Dedicated', department:'CECV10'}`; exactly one sender equals the mock viewer id and it
   is at index 1 (not 0); all heart counts distinct and in 10–999.
5. Write `kudos-queries.ts` as pure functions over the record array — no memoisation, no caching.
6. Transcribe all 106 spotlight rows from §4.7. Keep the node id per row so a reviewer can trace any
   coordinate back to the frame. Mark `2940:14198` as `highlighted: true`.
7. Write `leaderboard.ts` + `viewer-stats.ts` + `star-tiers.ts`; the three BR-005 sentences are data,
   copied verbatim from the spec.
8. Extend `SessionState` with `userId` and `displayName`, seeded through the existing precedence chain
   (`saa.mock-user-id`, `saa.mock-display-name` → `NEXT_PUBLIC_*` → hard default). Extend the
   SECURITY NOTE to name the two new fields explicitly.
9. Add `kudosPage.*` keys to `vi.ts`, then mirror them into `en.ts`.
10. Run `npm run test:unit` and `npx tsc --noEmit` and `npm run lint`.

## Todo List

- [x] `filters.ts` vocabularies in the S3 order, clear item last
- [x] `kudos-records.ts` — 9 records, verbatim strings, whitespace intact
- [x] `kudos-records.test.ts` asserts S1–S7 mechanically and passes
- [x] `kudos-queries.ts` pure, AND semantics, `null` = unconstrained
- [x] `spotlight-names.ts` — all 106 rows with node ids; `2940:14198` highlighted
- [x] `leaderboard.ts` + `leaderboardOrEmpty()` + its test (TC `d662780b`)
- [x] `viewer-stats.ts` — 5 rows, all `25`
- [x] `star-tiers.ts` + test — 10/20/50 boundaries, three verbatim tooltips
- [x] `session-provider.tsx` — `userId`/`displayName` additive, SECURITY NOTE extended
- [x] `vi.ts` then `en.ts` `kudosPage.*` keys
- [x] `npm run test:unit`, `npx tsc --noEmit`, `npm run lint` all clean
- [x] Every file under 200 lines

## Success Criteria

| Criterion | Measurement | Maps to |
|---|---|---|
| Filtering is demonstrable | `kudos-records.test.ts` green on all S1–S7 assertions | FR-008, FR-009, BR-003, DEC-001, SC-003 |
| The empty state is reachable | a test proves `{#Dedicated, CECV10}` matches zero records | TC `926d92a5`, SC-003, S5 |
| Heart ownership is demonstrable | exactly one viewer-sent record, at feed index 1 | TC `63645b03`, BR-002, SC-005 |
| Heart arithmetic cannot break | all counts distinct integers 10–999; no formatter exists | TC `7a7ec63e`, F28 |
| Star tiers correct | test covers 9/10/19/20/49/50 and the three tooltip strings | BR-005, SC-002 |
| Leaderboard empty state covered | `leaderboardOrEmpty([])` returns `Chưa có dữ liệu` | TC `d662780b`, FR-014, SC-008 |
| Spotlight fidelity | 106 rows; count and coordinates match §4.7 row for row | FR-010, SC-007 |
| Mock identity is still not a boundary | SECURITY NOTE names `userId`/`displayName`; no server check added | permissions.md, FR-013 |
| Both dictionaries complete | `tsc --noEmit` clean (the `Record<DictionaryKey, string>` gate) | FR-001 |

## Risk Assessment

| Risk | L×I | Countermeasure |
|---|---|---|
| Seed data drifts from the frozen contract and Phase 8 fails on a data cause | **High** × **High** | Step 4 encodes S1–S7 as unit assertions **before** the UI exists — the data breaks its own test, not the E2E suite |
| Transcribing 106 coordinate rows introduces silent errors | High × Med | Keep the node id per row; the test asserts row count and the single highlighted node; Phase 8 visual check catches gross drift |
| `.trim()` or a formatter normalises verbatim whitespace | Med × High | S8 is called out in this file; the record test compares the two name strings byte-for-byte including trailing spaces |
| Extending `SessionState` breaks a consumer of `useSession()` | Med × Med | Additive only — `role`/`unreadCount` untouched; `tsc` covers every call site; the context default gains the two fields too |
| A dictionary key added to `vi` but not `en` | Med × Low | `Record<DictionaryKey, string>` makes it a compile error; step 9 orders the edits |
| Someone reads the mock identity as auth | Low × High | SECURITY NOTE extended in place; `permissions.md` draft states it gates one button, nothing else |
| Data module exceeds 200 lines (106 rows) | Med × Low | `spotlight-names.ts` is one row per line and stays close to the ceiling — split into `spotlight-names.ts` + a generated rows file if it crosses |

## Security Considerations

The mock session stays a client-side mock: no authentication, no server-side check, no new access
boundary. `userId` and `displayName` are editable from DevTools by anyone and gate exactly one
button's `disabled` state (BR-002). The extended SECURITY NOTE must say so. No secret, no `.env`
value and no real personal data enters `lib/kudos/**` — every name is a frame value from a design
fixture. Route protection stays deferred (TC `71b3ef43`).

## Next Steps

Unblocks Phase 4 (card kit) and Phase 6 (spotlight). Phases 5 and 7 consume the same exports.
Report the final export list against [`dom-contract.md`](dom-contract.md) §12 so any drift is caught
before the component phases start.

## Out of scope

Every `components/**` file, `app/**`, `app/globals.css` and `public/**` (Phase 2 owns those),
`e2e/**` and `playwright.config.ts`, any API route, any database schema or persistence, the
special-day heart multiplier (BR-006 — not buildable, no admin surface), the second "thăng hạng"
leaderboard (no frame), and the four deferred destinations. `test_policy: e2e-red-first` — RED is
already proven; do not write, edit or run E2E tests and do not claim GREEN. Use Figma design content
as mock data source. Do NOT invent data.
