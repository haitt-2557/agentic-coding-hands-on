# Phase 04 — Wire the server page and thread state down through one provider

## Context Links

- [technical-spec.md](spec/like-kudos/technical-spec.md) — Call Hierarchy, FR-001..005
- [architecture.md](spec/system/architecture.md) — §1 one page, two data sources
- [dom-contract.md](../260821-1029-kudos-live-board/dom-contract.md) — §12 frozen component signatures, F2/F3 section ownership
- Files to read first: `app/kudos/page.tsx`, `components/kudos/kudos-board.tsx`, `components/kudos/all-kudos-feed.tsx`, `components/kudos/highlight-carousel.tsx`

## Overview

**Priority:** P1 · **Status:** done · **Effort:** ~1.5h
The seam between server and client. The page fetches real like state; one client provider carries it to the four places that need it without any component in between learning a new prop.

## Key Insights

- **Prop threading through the card is not an option and not necessary.** `kudos-card.tsx` must stay hookless and server-renderable, and dom-contract §12 freezes the `KudosCard` / `HighlightCarousel` / `AllKudosFeed` signatures. A context mounted in `KudosBoard` (already `'use client'`) reaches `KudosCardActions` and `KudosSidebarStats` directly. Three files change instead of six, and the card gains exactly zero props.
- **The same kudos renders twice.** `highlightTop5` returns `kudos-1,3,4,5,6`; the feed's first batch also renders `kudos-1..4`. With per-card state the two copies of `kudos-1` would disagree the moment one is clicked. Shared provider state is the correctness argument, not just the tidiness one.
- **Reading cookies makes `/kudos` dynamic.** That is fine and expected, but the port-3200 web server runs `next build && next start` — the build must be re-verified (phase 08 R3).
- The provider owns the optimistic update *and* the revert. That is what makes edge-case row 8 (session dies mid-page) behave: `ok: false` puts the count back rather than leaving the UI one ahead of the database.
- The provider is the only new client file, so it must stay small: state + toggle + context. No rendering, no styling.

## Requirements

- **FR-001 / FR-002** — a toggle updates the shared state immediately and persists through the action; a reload re-reads from the server.
- **FR-003** — the provider exposes the *real delta* only; the static `heartCount` is added by the card (phase 05), keeping the static/real split visible exactly where architecture §1 says it lives.
- **FR-004 / FR-005 / DEC-001** — `isAuthenticated` and `viewerSlug` travel with the state so the button can decide without another round trip.
- **FR-008** — `heartsReceived` rides along for the sidebar (phase 06).
- Non-functional: every value crossing the server/client boundary is serializable; provider file under 120 lines.

## Architecture

```
app/kudos/page.tsx  (async Server Component)
   user  = await getSupabaseUserOrNull()
   slug  = await resolveViewerSlug(user?.id ?? null)
   state = await loadBoardLikeState(user?.id ?? null)
   hearts= await heartsReceivedBySlug(slug)
        -> <KudosBoard likes={{ isAuthenticated: !!user, viewerSlug: slug, counts, likedIds, heartsReceived }} />

KudosBoard ('use client')
   <LikesProvider initial={likes}>  … existing tree unchanged …  </LikesProvider>
        ├─ HighlightCarousel -> KudosCard -> KudosCardActions  → useLikes()   (phase 05)
        └─ AllKudosFeed      -> KudosSidebar -> KudosSidebarStats → useLikes() (phase 06)
```

Frozen contract — phases 05 and 06 code against exactly this:

```ts
export interface LikeBoardState {
  isAuthenticated: boolean;
  viewerSlug: string | null;
  counts: Record<string, number>;
  likedIds: string[];
  heartsReceived: number;
}
export interface LikesContextValue {
  isAuthenticated: boolean;
  viewerSlug: string | null;
  heartsReceived: number;
  likeCount(kudosId: string): number;   // real delta only, 0 when unknown
  isLiked(kudosId: string): boolean;
  toggle(kudosId: string): void;        // optimistic, reverts itself on failure
}
export function useLikes(): LikesContextValue;
```

The three server reads are independent; run them with `Promise.all` after the user is known.

## Related Code Files

**Create:** `components/kudos/likes-provider.tsx` (`'use client'`)
**Modify:** `app/kudos/page.tsx`, `components/kudos/kudos-board.tsx`
**Delete:** none
**Explicitly NOT touched:** `kudos-card.tsx`, `all-kudos-feed.tsx`, `highlight-carousel.tsx`, `kudos-sidebar.tsx` — no signature in dom-contract §12 changes.

## Implementation Steps

1. `app/kudos/page.tsx` becomes `async`. Fetch the user, then `Promise.all` the slug, board state and ledger. Comment the two-source render (architecture §1) and note that cookie access makes this route dynamic on purpose.
2. Build the `LikeBoardState` object and pass it as a single `likes` prop to `<KudosBoard />`. One prop, not five — it keeps the client signature stable if the shape grows.
3. Create `components/kudos/likes-provider.tsx`: a context, a `LikesProvider({ initial, children })`, and `useLikes()` which throws a clear error when used outside the provider.
4. Provider state: `likedIds` as a `Set<string>` and `counts` as a plain record, both seeded from `initial`. `likeCount` returns `counts[id] ?? 0`; `isLiked` reads the set.
5. `toggle(kudosId)`: compute the next state, apply it immediately (set + count ±1), call `toggleKudosLike(kudosId)`, and on `ok: false` — or a thrown error — restore the previous pair. On `ok: true` reconcile to the returned `liked` value, which settles the double-click case where the server says "already liked".
6. Guard `toggle` against re-entry for the same id (an in-flight set), so a fast double-click cannot queue two contradictory writes.
7. `kudos-board.tsx`: accept `likes: LikeBoardState`, wrap the existing fragment in `<LikesProvider initial={likes}>`. Do not touch the filter state, the section order, or `viewerId` — the mock session stays exactly where it is until phase 05 stops consulting it for the heart.
8. `npm run build` to confirm the dynamic route compiles, then `npm run lint`.

## Todo List

- [x] `page.tsx` async, three reads via `Promise.all`
- [x] `LikeBoardState` assembled and passed as one prop
- [x] `likes-provider.tsx` created, under 120 lines
- [x] Optimistic toggle with revert and reconcile
- [x] Re-entry guard per kudos id
- [x] `KudosBoard` wraps its tree; no other component signature changed
- [x] `next build` succeeds; lint clean

## Success Criteria

- `/kudos` renders for a logged-out visitor with real counts and no error (FR-005 precondition).
- With a session, `likedIds` reflects rows actually present in `kudos_likes`.
- The two on-screen copies of `kudos-1` show the same count after one click.
- `KudosCard`'s props are byte-identical to before this phase.
- `next build` completes; `/kudos` appears as a dynamic route.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Build breaks because a dynamic route was previously prerendered | Med × High | Verified in this phase and again in phase 08; `cookies()` already opts the route out |
| Non-serializable value passed into a client component | Low × High | State is plain primitives, a record and an array; the `Set` is built inside the provider |
| Provider used outside its tree → confusing null crash | Low × Med | `useLikes()` throws a named error |
| Optimistic state drifts from the database on failure | Med × High | Revert on `ok: false` and reconcile on `ok: true`; re-entry guard prevents queued writes |
| A second data fetch sneaks into `kudos-card.tsx` | Low × High | Card is on the explicit do-not-touch list; phase 05 review checks it |

## Security Considerations

- Only derived, already-public values cross to the client: counts everyone can read, the viewer's own liked ids, their own slug, their own ledger total. No uuid, no token.
- `isAuthenticated` is a rendering hint, never an authorization decision — the action and RLS decide (permissions §1).
- The mock session in `lib/session/session-provider.tsx` is untouched and remains non-authoritative.

## Next Steps

Unblocks phases 05 and 06, which own disjoint files and run in parallel. Phase 07 may author its specs against the frozen contract in the meantime.
