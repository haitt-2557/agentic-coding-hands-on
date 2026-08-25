# Phase 05 — Heart button on persisted state

## Context Links

- [technical-spec.md](spec/like-kudos/technical-spec.md) — FR-001..005, DEC-001, SM-001
- [clarifications.md](clarifications.md) — decision 5 (logged-out visitors read the board, the heart is disabled)
- [dom-contract.md](../260821-1029-kudos-live-board/dom-contract.md) — F26, F27, F29, F30
- [red-evidence.json](evidence/red-evidence.json) — the exact assertions this phase turns green
- Phase 04's frozen `useLikes()` contract

## Overview

**Priority:** P1 · **Status:** done · **Effort:** ~1h
One file. `useState(false)` comes out, `useLikes()` goes in, and the disable rule moves from the DevTools-editable mock session onto real auth.

## Key Insights

- **DEC-001 is an ordered chain, not three independent conditions.** Not signed in → disabled (FR-005). Else bridged slug equals `record.senderId` → disabled (BR-002). Else enabled, coloured by whether the viewer's row exists. Reversing the first two would leave a logged-out visitor with an "it's your own kudos" label they cannot act on either way.
- **`aria-label` must always contain the lowercase substring `like`** (F26), including the new unauthenticated label — the RED spec asserts `expect(label).toContain('like')` on every disabled heart. `Đăng nhập để like kudos này` satisfies both F26 and FR-005's "explanatory label".
- **F27 is the fragile one.** The button's whole text content must remain the count digits. No spinner text, no "đang lưu", no `sr-only` note. Pending feedback, if any is added at all, must be visual only.
- **`viewerId` stays in the props interface** even though the heart no longer consults it. dom-contract §12 freezes `KudosCardActions`'s signature, and removing the prop would ripple into three components this phase must not touch. Do not destructure it; leave a comment saying why it survives.
- The count on screen is `record.heartCount + likeCount(record.id)` — static plus real delta, the split architecture §1 insists on keeping visible.
- The Copy Link half of this file, its toast and its silent-failure branch (F30) are not in scope. Do not refactor them while passing through.

## Requirements

- **FR-001 / FR-002** — click writes or removes the row; the rendered count and `aria-pressed` follow the shared state, and both survive a reload because the state was seeded server-side.
- **FR-004** — viewer slug equals `record.senderId` → real `disabled` attribute.
- **FR-005** — no session → every heart `disabled` with the explanatory label; a click does nothing, redirects nowhere, shows no toast (edge-case row 12).
- **DEC-001** — the ordering above.
- Non-functional: file stays under 200 lines; F26/F27/F29/F30 unchanged.

## Architecture

```
KudosCardActions ('use client')
  const { isAuthenticated, viewerSlug, isLiked, likeCount, toggle } = useLikes();

  liked          = isLiked(record.id)
  isOwnKudos     = viewerSlug !== null && record.senderId === viewerSlug
  disabled       = !isAuthenticated || isOwnKudos          // DEC-001, in order
  displayedCount = record.heartCount + likeCount(record.id) // FR-003

  <button aria-label={label} aria-pressed={liked} disabled={disabled}
          onClick={() => toggle(record.id)}>
    <svg aria-hidden="true" />{formatHeartCount(displayedCount)}
  </button>
```

Label table:

| Condition | `aria-label` |
|-----------|--------------|
| not signed in | `Đăng nhập để like kudos này` |
| own kudos | `Không thể like kudos của chính bạn` (unchanged) |
| liked | `Bỏ tim kudos này (like)` (unchanged) |
| not liked | `Thả tim kudos này (like)` (unchanged) |

## Related Code Files

**Modify:** `components/kudos/kudos-card-actions.tsx`
**Create:** none · **Delete:** none

## Implementation Steps

1. Read phase 04's provider contract before editing; this file consumes it and adds no state of its own beyond the existing `copyMessage`.
2. Delete `const [liked, setLiked] = useState(false);` and the `record.senderId === viewerId` line.
3. Add `const { isAuthenticated, viewerSlug, isLiked, likeCount, toggle } = useLikes();` and derive `liked`, `isOwnKudos`, `disabled`, `displayedCount` as above.
4. Replace the label ternary with the four-way table, keeping the three existing strings verbatim so no passing assertion moves.
5. `onClick={() => toggle(record.id)}`. No `await`, no local state write — the provider owns both.
6. Keep `aria-pressed={liked}` unconditional and keep the button's children exactly `<svg aria-hidden>` + `formatHeartCount(displayedCount)` (F27).
7. Leave `viewerId` in `KudosCardActionsProps`, undestructured, with a one-line comment pointing at dom-contract §12.
8. Update the file header: heart state is now server-seeded and persisted; the mock session no longer decides anything here; the disable rule is UI convenience over an RLS boundary (permissions §1).
9. `npm run lint` and `npm run build`.

## Todo List

- [x] `useState` heart state removed
- [x] `useLikes()` consumed; no new local state
- [x] DEC-001 order implemented exactly
- [x] Four-way label table, all containing `like`
- [x] `aria-pressed` unconditional; button text is digits only
- [x] `viewerId` retained in the interface with its comment
- [x] Header comment rewritten
- [x] Lint + build clean

## Success Criteria

- **SC-001** (FR-001/FR-002) — the RED spec's persistence test passes: click → +1 and `aria-pressed=true`; reload → still +1; click → back to seed; reload → still back.
- **SC-003** (BR-002) — with the fixture session, `kudos-2`'s heart is `disabled` even after the mock viewer id is set to an unrelated slug.
- **SC-004** (FR-005) — with no session, every heart in ALL KUDOS is `disabled` and each label contains `like`.
- **FR-003** — the displayed number equals static `heartCount` plus real rows.
- F26/F27/F29/F30 still hold; `e2e/kudos-board-interactions.spec.ts` stays green.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Pending/spinner text added inside the button breaks F27 | Med × High | Explicit prohibition here; phase 07/08 re-run the digit-parsing assertions |
| New unauthenticated label omits `like` → SC-004 fails on the label check | Med × High | Label fixed in this file's table and asserted in the RED spec |
| `viewerId` removed for tidiness → three untouched components break | Med × Med | Kept deliberately, with a comment explaining the freeze |
| Existing heart specs break because they never had a session | **High × High** | Known and owned by phase 07 (plan risk R1) — the tests gain the precondition, not weaker assertions |
| Copy Link branch disturbed while editing | Low × High | Out of scope; the `try/catch` and absent-clipboard guard are not to be touched |

## Security Considerations

- `disabled` is an affordance. The action re-checks and RLS refuses independently (permissions §1, edge-case row 3).
- A logged-out click must be inert: no redirect, no toast, no network call (FR-005, edge-case row 12).
- Nothing here reads `lib/session/session-provider.tsx`. The heart's identity is now real auth, which is precisely what moved BR-002 from illusion to boundary.

## Next Steps

Runs in parallel with phase 06 (disjoint files) and phase 07 (test files). Feeds phase 08's GREEN run.
