'use client';

// FR-003 + BR-006/BR-007 — client-side half of the launch gate. The proxy holds every
// route server-side, but a viewer already sitting on /prelaunch when the countdown
// crosses zero needs to be moved without a reload: this hook ticks every second and fires
// `router.replace('/')` once, on the first tick where the countdown is expired or invalid.
//
// SSR-default -> client-reconcile, same pattern as components/home/countdown-timer.tsx and
// lib/session/session-provider.tsx: `process.env.NEXT_PUBLIC_EVENT_START_AT` and the real
// clock don't exist identically on the server, so the pre-hydration paint is always
// '00'/'00'/'00' and the real value is only computed inside the mount effect.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { computeCountdown } from '@/lib/countdown';
import { capDisplayDays } from '@/lib/prelaunch/display';

export interface PrelaunchCountdown {
  days: string;
  hours: string;
  minutes: string;
}

const SSR_DEFAULT: PrelaunchCountdown = { days: '00', hours: '00', minutes: '00' };
const TICK_MS = 1000;

// The unlock is a race between two clocks. This hook reads the BROWSER clock; `proxy.ts`
// decides on the SERVER clock. If the viewer's machine runs ahead, `router.replace('/')`
// fires, the proxy bounces the request back to /prelaunch, the component remounts, and a
// guard scoped to one mount would reset and fire again immediately — a continuous flicker
// for the whole skew window, at exactly the moment the page is being watched.
//
// So the attempt is throttled across mounts via sessionStorage. A skewed client retries at
// most every 30s instead of every second, and still lands on / by itself once the server
// agrees. Deliberately not a one-shot flag: that would strand a waiting viewer at 00:00:00
// until they reloaded, which is the failure mode the client-side unlock exists to prevent.
const UNLOCK_ATTEMPT_KEY = 'saa.prelaunch-unlock-attempted-at';
const UNLOCK_RETRY_MS = 30_000;

/**
 * True when an unlock navigation should be attempted now, recording the attempt so a
 * bounced redirect cannot immediately retry on the next mount.
 *
 * Storage being unavailable (private mode, disabled cookies) degrades to "always attempt" —
 * the per-mount guard still prevents repeats within a single mount, and a working unlock
 * matters more than throttling an edge case we cannot detect.
 */
function claimUnlockAttempt(nowMs: number): boolean {
  let storage: Storage;
  try {
    storage = window.sessionStorage;
  } catch {
    return true;
  }

  const previous = Number.parseInt(storage.getItem(UNLOCK_ATTEMPT_KEY) ?? '', 10);
  if (Number.isFinite(previous) && nowMs - previous < UNLOCK_RETRY_MS) {
    return false;
  }

  storage.setItem(UNLOCK_ATTEMPT_KEY, String(nowMs));
  return true;
}

export function usePrelaunchCountdown(): PrelaunchCountdown {
  const router = useRouter();
  const [display, setDisplay] = useState<PrelaunchCountdown>(SSR_DEFAULT);
  const hasRedirected = useRef(false);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const result = computeCountdown(process.env.NEXT_PUBLIC_EVENT_START_AT, now);
      // `result.days` is the true remaining day count and is not capped at 99; the two
      // digit boxes can only show two characters. Clamp here so the display contract this
      // hook advertises ("exactly two digits") is actually enforced at its source.
      setDisplay({
        days: capDisplayDays(result.days),
        hours: result.hours,
        minutes: result.minutes,
      });

      if (
        (result.isExpired || result.isInvalid) &&
        !hasRedirected.current &&
        claimUnlockAttempt(now.getTime())
      ) {
        hasRedirected.current = true;
        clearInterval(intervalId);
        router.replace('/');
      }
    }

    // Declared before the manual first call so `tick`'s reference to `intervalId` is
    // already assigned by the time it runs (including this synchronous first call).
    const intervalId = setInterval(tick, TICK_MS);
    tick();
    return () => clearInterval(intervalId);
  }, [router]);

  return display;
}
