# Phase 03 — Server data layer: queries, ledger, toggle action

## Context Links

- [technical-spec.md](spec/like-kudos/technical-spec.md) — FR-003, FR-006, FR-007, ALG-001, SM-001, INT-001, Call Hierarchy
- [architecture.md](spec/system/architecture.md) — §3 aggregate ledger, §4 frozen flag, §5 the "user if any" auth variant
- [edge-cases.md](spec/like-kudos/edge-cases.md) — rows 1, 7, 8, 9, 10
- Patterns: `lib/kudos/send/submit-kudos.ts` (server action shape), `lib/kudos/send/auth-gate.ts` (`getUser()`, never `getSession()`), `lib/supabase/server.ts`

## Overview

**Priority:** P1 · **Status:** done · **Effort:** ~2h
Every server-side read and the one write. Nothing renders here; this phase produces a small, testable surface that phase 04 consumes.

## Key Insights

- **The ledger cannot be pure SQL.** Hearts credit the *kudos sender*, but the database has no idea who sent `kudos-1` — that mapping lives in `lib/kudos/kudos-records.ts`. So the join happens in application code: slug → the static ids that slug authored → one `kudos_likes` query over those ids → weighted sum in TypeScript. Still an aggregate, still no counter column (architecture §3); the join simply lives where the data actually is. Say this out loud in the module header, because "why isn't this one SQL query" is the first thing a reader will ask.
- **Per-card counts are row counts, not weighted.** FR-003 adds the number of like *rows*; `is_special` only ever affects the sender's ledger (FR-006/007). Mixing the two would double-count on special days.
- **`requireSupabaseUser()` cannot be reused** — it redirects, and `/kudos` stays public (FR-005). A separate `getSupabaseUserOrNull()` goes in `lib/supabase/current-user.ts`. It duplicates four lines of `auth-gate.ts` on purpose: refactoring `auth-gate.ts` would drag the send feature and its specs into this phase's blast radius for no benefit. Recorded as a deliberate, bounded duplication.
- **Orphan rows must not crash the render** (edge-case row 10). The count map is keyed by `kudos_id`; the renderer looks up by static record id, so an orphan simply never gets read. A missing key must read `0`, not `undefined`/`NaN` (edge-case row 9).
- **A `23505` from a double-click is not an error** (edge-case row 1). The row already exists and the user's intent is satisfied — report `liked: true` and stop. Any other failure returns `ok: false` so the client can revert its optimistic state (edge-case row 8).
- `is_special` is never sent from the app. The phase 01 trigger owns it. Sending it would create a second source of truth for the exact value BR-005 needs frozen.

## Requirements

- **FR-003** — `count(kudos_id)` per kudos, merged with the static `heartCount` at render time.
- **FR-006 / FR-007 / ALG-001** — `heartsGranted = is_special ? 2 : 1`, applied on both accrual and revocation, always from the stored flag.
- **SM-001** — two states only; the row is the truth. No intermediate state is persisted.
- **INT-001** — identity via `getUser()`; never `getSession()`; no redirect on this path.
- Non-functional: every file under 200 lines; pure arithmetic isolated and unit-testable via `playwright.unit.config.ts` (`testDir: ./lib`, `testMatch: /\.test\.ts$/`).

## Architecture

```
app/kudos/page.tsx (phase 04)
  └─ getSupabaseUserOrNull()            lib/supabase/current-user.ts
  └─ resolveViewerSlug(userId)          lib/kudos/viewer-identity.ts   -> slug | null
  └─ loadBoardLikeState(userId)         lib/kudos/likes/queries.ts     -> { counts, likedIds }
  └─ heartsReceivedBySlug(slug)         lib/kudos/likes/ledger.ts      -> number

client heart (phase 05) -> toggleKudosLike(kudosId)   lib/kudos/likes/toggle-like.ts ('use server')
        insert {kudos_id, user_id}  |  delete where (kudos_id, user_id)
        (trigger stamps is_special; RLS decides)
```

Frozen exports:

```ts
// lib/kudos/likes/types.ts
export interface BoardLikeState { counts: Record<string, number>; likedIds: string[] }
export type ToggleLikeResult = { ok: true; liked: boolean } | { ok: false; error: string }

// lib/kudos/likes/heart-math.ts  (pure)
export function heartsGranted(isSpecial: boolean): number
export function tallyLikeCounts(rows: { kudos_id: string }[]): Record<string, number>
export function likeCountFor(counts: Record<string, number>, kudosId: string): number  // 0 when absent
export function ledgerTotal(rows: { is_special: boolean }[]): number
```

## Related Code Files

**Create:**
- `lib/supabase/current-user.ts` — `getSupabaseUserOrNull()`
- `lib/kudos/viewer-identity.ts` — `resolveViewerSlug(userId: string | null): Promise<string | null>`
- `lib/kudos/likes/types.ts`
- `lib/kudos/likes/heart-math.ts` + `lib/kudos/likes/heart-math.test.ts`
- `lib/kudos/likes/queries.ts` — `loadBoardLikeState(userId: string | null)`
- `lib/kudos/likes/ledger.ts` — `heartsReceivedBySlug(slug: string | null)`
- `lib/kudos/likes/toggle-like.ts` — `'use server'` `toggleKudosLike(kudosId: string)`

**Modify:** none. `lib/kudos/send/auth-gate.ts` is deliberately left untouched.
**Delete:** none

## Implementation Steps

1. `lib/supabase/current-user.ts`: `createClient()` → `auth.getUser()` → return `user ?? null`. Header comment: why this exists next to `requireSupabaseUser()` and why `getSession()` is still forbidden.
2. `lib/kudos/viewer-identity.ts`: `null` in → `null` out. Otherwise `from('profiles').select('id').eq('auth_user_id', userId).maybeSingle()`. A missing row returns `null` — DEC-002 says that viewer is blocked by nobody (edge-case row 7). Never throw.
3. `lib/kudos/likes/heart-math.ts`: the four pure functions above. No Supabase import in this file.
4. `lib/kudos/likes/heart-math.test.ts`: `heartsGranted(true) === 2` / `(false) === 1`; `tallyLikeCounts` over duplicates and an empty array; `likeCountFor` returns `0` for an unknown id (edge-case row 9); `ledgerTotal` over a mixed special/normal set; an orphan id contributes nothing to any static record (edge-case row 10).
5. `lib/kudos/likes/queries.ts`: one `select('kudos_id')` over `kudos_likes` for the counts (works for `anon` because of phase 01's grant + `using (true)` policy), plus, when `userId` is present, a `select('kudos_id').eq('user_id', userId)` for the viewer's set. Return `{ counts: tallyLikeCounts(rows), likedIds }`. On a query error, log and return an empty state — the board must still render (FR-005).
6. `lib/kudos/likes/ledger.ts`: `slug === null` → `0` (edge-case row 12). Otherwise derive the authored ids from `KUDOS_RECORDS.filter(r => r.senderId === slug).map(r => r.id)`; empty list → `0` without a query; else `select('is_special').in('kudos_id', ids)` → `ledgerTotal(rows)`. Header comment: this is the application-side half of the aggregate, and why.
7. `lib/kudos/likes/toggle-like.ts` (`'use server'`):
   a. `getSupabaseUserOrNull()`; `null` → `{ ok: false, error: 'Bạn cần đăng nhập để thả tim.' }` (no redirect — FR-005).
   b. Resolve the viewer slug; if it equals the static record's `senderId`, return `{ ok: false, error: '…' }`. Defence in depth mirroring `submit-kudos.ts`; RLS remains the real boundary.
   c. Unknown `kudosId` (not in `KUDOS_RECORDS`) → `ok: false`. Do not let an arbitrary string reach the table.
   d. Read the viewer's existing row (`select('id').eq('kudos_id', …).eq('user_id', user.id).maybeSingle()`). Present → `delete` → `{ ok: true, liked: false }`. Absent → `insert { kudos_id, user_id: user.id }` (never `is_special`) → `{ ok: true, liked: true }`.
   e. Insert failing with `23505` → `{ ok: true, liked: true }`; the concurrent request won and the outcome is what the user asked for.
   f. Everything else → log server-side, return `{ ok: false, error: 'Không thể cập nhật lượt tim.' }`.
8. Run `npx tsc --noEmit` (or `npm run build`) and `npm run test:unit`.

## Todo List

- [x] `getSupabaseUserOrNull()` with the "why not auth-gate" comment
- [x] `resolveViewerSlug()` — never throws, `null` on no match
- [x] `heart-math.ts` pure module + passing unit tests
- [x] `loadBoardLikeState()` works for both `anon` and authenticated
- [x] `heartsReceivedBySlug()` weighted sum, `0` for an unbridged viewer
- [x] `toggleKudosLike()` with `23505` tolerance and unknown-id rejection
- [x] Every file under 200 lines
- [x] `test:unit` green, typecheck clean

## Success Criteria

- **FR-003** — counts merge cleanly and an unknown id yields `0` (unit test).
- **FR-006 / FR-007 / ALG-001** — `ledgerTotal` weights by the stored flag only; nothing in this phase reads `current_date`.
- **SC-005 / SC-006** groundwork — the revoke path never recomputes the flag; proven end-to-end in phase 07.
- Edge-case row 1 — a concurrent double insert resolves to one row and one reported state.
- Edge-case row 8 — an expired session returns `ok: false` rather than throwing.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Ledger written as one SQL aggregate → silently wrong (DB has no sender) | Med × High | Module header states the constraint; `ledgerTotal` is unit-tested against a known mixed set |
| Weighted count leaks into the per-card number | Med × Med | `tallyLikeCounts` reads only `kudos_id`; the count query selects only that column |
| `23505` treated as failure → double-click makes the UI revert wrongly | Med × Med | Explicit code branch, called out in the todo list |
| Anon count query blocked → logged-out board shows zeros | Med × High | Phase 01 grants `anon`; phase 07 asserts real counts with no session |
| Files creep over 200 lines | Low × Low | Six small modules by design; arithmetic separated from I/O |

## Security Considerations

- The action derives `user_id` from the session and never from its argument; RLS re-checks it anyway (BR-006).
- The BR-002 check here is convenience. The database refuses independently, which is what edge-case row 3 requires.
- Errors returned to the client are generic Vietnamese strings; Postgres messages stay in the server log (matching `submit-kudos.ts`).
- `getUser()` only. A `getSession()` call anywhere in this phase is a review-blocking defect.

## Next Steps

Unblocks phase 04. Runs in parallel with phase 02; no shared files.
