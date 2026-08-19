// FR-002 + BR-004/BR-005 + DEC-001 — app-wide launch-timing gate.
// Pure function: `now` is injected by the caller (proxy.ts or a test), never read from
// Date.now() inside. Shares `computeCountdown` with the display so the gate and the
// on-screen digits can never disagree about whether the target instant has passed.
//
// This is launch timing, not authorization — it reads only the public target instant and
// the server clock, never `role` or any session state.

import { computeCountdown } from '@/lib/countdown';

const PRELAUNCH_PATH = '/prelaunch';
const HOME_PATH = '/';

/**
 * Decide whether a request to `pathname` should be redirected to hold or release the
 * launch gate.
 *
 * - Locked (countdown still running) and not already on `/prelaunch` -> redirect there.
 * - Locked and already on `/prelaunch` -> `null` (no self-redirect loop).
 * - Unlocked (countdown at/past zero) and on `/prelaunch` -> redirect to `/`.
 * - Unlocked elsewhere, or `targetIso` missing/unparseable (fail-open, BR-003) -> `null`.
 *
 * A config typo in `targetIso` must never lock the whole site behind a dead countdown, so
 * an invalid target always resolves to `null` regardless of `pathname`.
 */
export function resolveGateRedirect(
  pathname: string,
  targetIso: string | undefined,
  now: Date,
): '/prelaunch' | '/' | null {
  const { isExpired, isInvalid } = computeCountdown(targetIso, now);

  if (isInvalid) {
    return null;
  }

  const locked = !isExpired;

  if (locked) {
    return pathname === PRELAUNCH_PATH ? null : PRELAUNCH_PATH;
  }

  return pathname === PRELAUNCH_PATH ? HOME_PATH : null;
}
