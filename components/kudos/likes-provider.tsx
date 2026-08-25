'use client';

// Phase 04 — the seam between the server-resolved like state and the two client trees that
// render a kudos card twice (`HighlightCarousel` and `AllKudosFeed`, dom-contract §12). A
// context mounted once in `KudosBoard` reaches both without `kudos-card.tsx` gaining a single
// prop — that file stays hookless/server-renderable by design. State is keyed by `kudosId` in
// one shared store on purpose: `kudos-1` renders in both trees, and per-card local state would
// let the two copies disagree the moment either is clicked.
//
// FR-001/FR-002 — `toggle` applies the flip immediately (optimistic), then calls the server
// action. `ok: false` (or a thrown error) restores the exact pair of values it changed; `ok: true`
// reconciles to the server's own `liked` value, settling a double-click race on whatever the
// database actually holds. A per-id in-flight guard stops two writes for the same id from ever
// running concurrently — but (edge-cases.md row 1, severity high; SM-001's two-state toggle) it
// must NOT simply drop a second click that arrives while the first is still in flight: the click
// is real user intent, and the toggle only has two states, so losing it silently means the user's
// final click can be left unreflected. Instead, a second click while one is in flight is
// *coalesced*: it still applies its own optimistic UI flip immediately, and records the desired
// end state in `pendingDesired`. When the in-flight request settles, if the desired state still
// disagrees with what the server actually holds, exactly one follow-up toggle fires to converge —
// never one write per extra click, since `pendingDesired` only ever holds the latest intent.

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { toggleKudosLike } from '@/lib/kudos/likes/toggle-like';
import type { BoardLikeState } from '@/lib/kudos/likes/types';

export interface LikeBoardState extends BoardLikeState {
  isAuthenticated: boolean;
  viewerSlug: string | null;
  heartsReceived: number;
}

export interface LikesContextValue {
  isAuthenticated: boolean;
  viewerSlug: string | null;
  heartsReceived: number;
  /** Real delta only (row count), 0 when the id has no rows yet — never the static heartCount. */
  likeCount(kudosId: string): number;
  isLiked(kudosId: string): boolean;
  /** Optimistic; reverts itself on failure, reconciles to the server's answer on success. A
   * click that arrives while a prior request for the same id is in flight is coalesced, not
   * dropped (edge-cases.md row 1 / SM-001) — see the module comment above. */
  toggle(kudosId: string): void;
}

const LikesContext = createContext<LikesContextValue | undefined>(undefined);

interface LikesProviderProps {
  initial: LikeBoardState;
  children: ReactNode;
}

export function LikesProvider({ initial, children }: LikesProviderProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initial.counts);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set(initial.likedIds));
  const inFlight = useRef<Set<string>>(new Set());
  // Synchronous mirror of `likedIds`. React state updates are not guaranteed to have flushed
  // between two clicks that land within the same tick, but `toggle` needs the true "current"
  // liked value on every call (both to compute the next optimistic value and, below, to decide
  // whether a given target value is a no-op) — so it reads/writes this ref instead of the state.
  const likedRef = useRef<Set<string>>(new Set(initial.likedIds));
  // Per-id latest desired end state recorded while a request for that id is in flight. A Map
  // (not a queue) on purpose: it holds only the single most recent intent, so any number of
  // rapid clicks collapse into at most one follow-up request once the in-flight one settles.
  const pendingDesired = useRef<Map<string, boolean>>(new Map());

  const likeCount = useCallback((kudosId: string) => counts[kudosId] ?? 0, [counts]);
  const isLiked = useCallback((kudosId: string) => likedIds.has(kudosId), [likedIds]);

  // Idempotent "set to" — not a blind +1/-1 delta. Coalescing means a click can apply an
  // optimistic flip, and later a settle/correction can also apply a value, for the same id
  // without the two being causally ordered relative to each other's starting point. Comparing
  // against `likedRef` (the current known-true value) before touching count keeps every one of
  // those calls safe to repeat: applying the same target value twice is a no-op, never a double
  // count change.
  const setLiked = useCallback((kudosId: string, liked: boolean) => {
    if (likedRef.current.has(kudosId) === liked) {
      return;
    }
    if (liked) {
      likedRef.current.add(kudosId);
    } else {
      likedRef.current.delete(kudosId);
    }
    setLikedIds((current) => {
      const next = new Set(current);
      if (liked) {
        next.add(kudosId);
      } else {
        next.delete(kudosId);
      }
      return next;
    });
    setCounts((current) => {
      const base = current[kudosId] ?? 0;
      const delta = liked ? 1 : -1;
      return { ...current, [kudosId]: Math.max(0, base + delta) };
    });
  }, []);

  // Fires the actual server round trip(s) for `kudosId`, starting from a known liked value of
  // `wasLikedBeforeRequest`. A `while` loop, not recursion, drives any follow-up request that
  // coalescing needs — after each round trip settles, it checks whether a click's desired end
  // state (recorded in `pendingDesired` while this was running) still disagrees with the
  // server's answer, and loops exactly once more per such disagreement. This is what turns any
  // number of clicks that arrive mid-flight into at most one extra request instead of either
  // dropping them (the old bug) or firing one write per click.
  const sendToggle = useCallback(
    async (kudosId: string, wasLikedBeforeRequest: boolean) => {
      inFlight.current.add(kudosId);
      let settledLiked = wasLikedBeforeRequest;

      while (true) {
        const optimisticGuess = !settledLiked;
        try {
          const result = await toggleKudosLike(kudosId);
          if (result.ok) {
            if (result.liked !== optimisticGuess) {
              // The server settled on a different value than the optimistic guess (e.g. a
              // concurrent request already flipped it) — reconcile past the guess to the truth.
              setLiked(kudosId, settledLiked);
              setLiked(kudosId, result.liked);
            }
            settledLiked = result.liked;
          } else {
            setLiked(kudosId, settledLiked);
          }
        } catch {
          setLiked(kudosId, settledLiked);
        }

        const desired = pendingDesired.current.get(kudosId);
        pendingDesired.current.delete(kudosId);
        if (desired === undefined || desired === settledLiked) {
          break;
        }
        // The latest click's intent still disagrees with what the server just confirmed —
        // loop for exactly one follow-up request, regardless of how many clicks piled up
        // while the request above was outstanding.
      }

      inFlight.current.delete(kudosId);
    },
    [setLiked]
  );

  const toggle = useCallback(
    (kudosId: string) => {
      const wasLiked = likedRef.current.has(kudosId);
      const nextLiked = !wasLiked;
      // Always apply the optimistic flip immediately, even mid-flight — the user must see their
      // click land every time, not just when no request happens to be outstanding.
      setLiked(kudosId, nextLiked);

      if (inFlight.current.has(kudosId)) {
        // edge-cases.md row 1 / SM-001: a request for this id is already running. Recording the
        // desired end state — instead of returning here and doing nothing else — is what stops
        // this click from being silently dropped; `sendToggle`'s loop picks it up once it settles.
        pendingDesired.current.set(kudosId, nextLiked);
        return;
      }

      void sendToggle(kudosId, wasLiked);
    },
    [setLiked, sendToggle]
  );

  const value: LikesContextValue = {
    isAuthenticated: initial.isAuthenticated,
    viewerSlug: initial.viewerSlug,
    heartsReceived: initial.heartsReceived,
    likeCount,
    isLiked,
    toggle,
  };

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes(): LikesContextValue {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
}
