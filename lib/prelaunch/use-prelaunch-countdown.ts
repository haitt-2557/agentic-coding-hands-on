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

export interface PrelaunchCountdown {
  days: string;
  hours: string;
  minutes: string;
}

const SSR_DEFAULT: PrelaunchCountdown = { days: '00', hours: '00', minutes: '00' };
const TICK_MS = 1000;

export function usePrelaunchCountdown(): PrelaunchCountdown {
  const router = useRouter();
  const [display, setDisplay] = useState<PrelaunchCountdown>(SSR_DEFAULT);
  const hasRedirected = useRef(false);

  useEffect(() => {
    function tick() {
      const result = computeCountdown(process.env.NEXT_PUBLIC_EVENT_START_AT, new Date());
      setDisplay({ days: result.days, hours: result.hours, minutes: result.minutes });

      if ((result.isExpired || result.isInvalid) && !hasRedirected.current) {
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
