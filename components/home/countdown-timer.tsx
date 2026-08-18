'use client';

// FR-004/FR-006/FR-007/FR-008 + BR-001/BR-002/BR-003 + ALG-001 — countdown to
// NEXT_PUBLIC_EVENT_START_AT. Pre-hydration paint is the zero state with "Coming soon"
// visible so server and first client render match (never read the real clock during
// render — only inside the mount effect).

import { useEffect, useState } from 'react';
import { computeCountdown, type CountdownResult } from '@/lib/countdown';
import { useI18n } from '@/lib/i18n/locale-provider';

const ZERO_STATE: CountdownResult = {
  days: '00',
  hours: '00',
  minutes: '00',
  isExpired: false,
  isInvalid: false,
};

export function CountdownTimer() {
  const { t } = useI18n();
  const [result, setResult] = useState<CountdownResult>(ZERO_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deliberate SSR-default -> client-reconcile pattern (matches lib/session +
    // lib/i18n providers): pre-hydration paint must stay static, so the real countdown
    // is only computed post-mount, not during a lazy `useState` initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    function tick() {
      setResult(computeCountdown(process.env.NEXT_PUBLIC_EVENT_START_AT, new Date()));
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const showComingSoon = !mounted || (!result.isExpired && !result.isInvalid);

  return (
    <div className="flex flex-col items-start gap-4">
      {showComingSoon && (
        <p className="text-2xl font-bold text-white">{t('hero.comingSoon')}</p>
      )}
      <div className="flex items-center gap-8 sm:gap-10">
        <CountdownBox value={result.days} label={t('countdown.days')} />
        <CountdownBox value={result.hours} label={t('countdown.hours')} />
        <CountdownBox value={result.minutes} label={t('countdown.minutes')} />
      </div>
    </div>
  );
}

function CountdownBox({ value, label }: { value: string; label: string }) {
  const digits = value.padStart(2, '0').split('');
  return (
    <div className="flex flex-col items-start gap-3.5">
      <div className="flex items-center gap-3.5">
        {digits.map((digit, index) => (
          <span
            key={index}
            className="flex h-[82px] w-[51px] items-center justify-center rounded-lg bg-white/10 text-3xl font-bold text-white"
          >
            {digit}
          </span>
        ))}
      </div>
      <span className="text-2xl font-bold text-white">{label}</span>
    </div>
  );
}
