'use client';

// SECURITY NOTE — read this before touching role checks anywhere in the app.
// This is a CLIENT-SIDE MOCK session, not an authentication or authorization boundary.
// `role`, `unreadCount`, `userId` and `displayName` all come from `localStorage` /
// `NEXT_PUBLIC_*` env vars that anyone can edit from DevTools (e.g.
// `localStorage.setItem('saa.mock-role', 'admin')` or
// `localStorage.setItem('saa.mock-user-id', 'anything')`). There is no backend and no
// server-side check anywhere behind this. `userId`/`displayName` (added for the Kudos board,
// FR-013) gate exactly one thing: whether the heart button on a kudos card renders disabled
// because `kudos.senderId === userId` (BR-002) — and cosmetically label the sidebar's "your
// stats" block. They control what UI renders (DISC-001), nothing more, and must never be
// treated as access control. Real authorization has to be re-implemented server-side before
// any route or data is actually gated on any field of this session.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type SessionRole = 'guest' | 'user' | 'admin';

export interface SessionState {
  role: SessionRole;
  unreadCount: number;
  /** Mock identity for the Kudos board's own-kudos heart-disable rule (BR-002). Must equal
   * `MOCK_VIEWER_ID` in `lib/kudos/kudos-records.ts` — see that file's header for why this is
   * a duplicated literal rather than a cross-import. */
  userId: string;
  displayName: string;
}

const ROLE_STORAGE_KEY = 'saa.mock-role';
const UNREAD_STORAGE_KEY = 'saa.mock-unread';
const USER_ID_STORAGE_KEY = 'saa.mock-user-id';
const DISPLAY_NAME_STORAGE_KEY = 'saa.mock-display-name';

const DEFAULT_SESSION: SessionState = {
  role: 'guest',
  unreadCount: 0,
  // Must equal MOCK_VIEWER_ID / MOCK_VIEWER_DISPLAY_NAME in lib/kudos/kudos-records.ts.
  userId: 'nguyen-hoang-linh',
  displayName: 'Nguyễn Hoàng Linh',
};

const VALID_ROLES: readonly SessionRole[] = ['guest', 'user', 'admin'];

function isSessionRole(value: string | null): value is SessionRole {
  return value !== null && (VALID_ROLES as readonly string[]).includes(value);
}

/** Parses an untrusted string into a non-negative integer, or `undefined` if it isn't one. */
function parseUnreadCount(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Parses an untrusted string into a non-empty identity value, or `undefined` if it isn't one. */
function parseNonEmptyString(value: string | null): string | undefined {
  return value !== null && value.trim().length > 0 ? value : undefined;
}

/**
 * Seed precedence: `localStorage` -> `NEXT_PUBLIC_*` env -> hard default.
 * Only called from `useEffect` — never during render (localStorage doesn't exist on the server).
 */
function resolveSession(): SessionState {
  const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
  const role = isSessionRole(storedRole)
    ? storedRole
    : isSessionRole(process.env.NEXT_PUBLIC_MOCK_ROLE ?? null)
      ? (process.env.NEXT_PUBLIC_MOCK_ROLE as SessionRole)
      : DEFAULT_SESSION.role;

  const storedUnread = parseUnreadCount(window.localStorage.getItem(UNREAD_STORAGE_KEY));
  const unreadCount =
    storedUnread ??
    parseUnreadCount(process.env.NEXT_PUBLIC_MOCK_UNREAD_COUNT ?? null) ??
    DEFAULT_SESSION.unreadCount;

  const userId =
    parseNonEmptyString(window.localStorage.getItem(USER_ID_STORAGE_KEY)) ??
    parseNonEmptyString(process.env.NEXT_PUBLIC_MOCK_USER_ID ?? null) ??
    DEFAULT_SESSION.userId;

  const displayName =
    parseNonEmptyString(window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY)) ??
    parseNonEmptyString(process.env.NEXT_PUBLIC_MOCK_DISPLAY_NAME ?? null) ??
    DEFAULT_SESSION.displayName;

  return { role, unreadCount, userId, displayName };
}

const SessionContext = createContext<SessionState>(DEFAULT_SESSION);

export function SessionProvider({ children }: { children: ReactNode }) {
  // SSR/first-paint default is `guest`/`0` so server and client markup match; the real
  // (mock) session is reconciled after mount (DISC-001 edge case: "chưa hydrate = guest").
  const [session, setSession] = useState<SessionState>(DEFAULT_SESSION);

  useEffect(() => {
    // Deliberate: SSR-default -> client-reconcile hydration pattern (see phase spec). A
    // lazy `useState` initializer would run during the hydration render itself and could
    // read a role from localStorage that differs from the server's `guest` default —
    // exactly the hydration mismatch this must avoid — so the reconcile happens post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(resolveSession());
  }, []);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  return useContext(SessionContext);
}
