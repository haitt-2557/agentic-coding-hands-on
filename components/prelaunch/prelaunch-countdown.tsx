'use client';

// mm:2268:35136 — countdown block (title + time row). Values come from Track B's
// usePrelaunchCountdown() (1s tick + T-0 redirect are its concern, not this component's);
// label copy reuses the existing countdown.* dictionary keys already shared with the
// homepage timer.

import { useI18n } from '@/lib/i18n/locale-provider';
import { usePrelaunchCountdown } from '@/lib/prelaunch/use-prelaunch-countdown';
import { CountdownUnit } from './countdown-unit';

export function PrelaunchCountdown() {
  const { t } = useI18n();
  const { days, hours, minutes } = usePrelaunchCountdown();

  return (
    <div className="flex flex-col items-center gap-[clamp(10.8px,1.587vw,24px)]">
      {/* mm:2268:35137 — title */}
      <h1 className="text-center font-sans text-[clamp(16.2px,2.381vw,36px)] font-bold leading-[1.333] text-white">
        {t('prelaunch.title')}
      </h1>
      {/* mm:2268:35138 — time row */}
      {/* Responsive floors are DERIVED, not designed — the frame exists only at 1512 wide.
          Every value scales proportionally with the viewport down to ~680px, then holds at
          45% of the frame size instead of shrinking further. Pure proportional scaling left
          the block occupying 43% of a 375px screen with 18px digits, losing the frame's 2:1
          digit-to-label dominance; holding a floor keeps that ratio intact (33.18 : 16.2)
          and the row measures ~290px, so it still fits a 320px viewport with margin. */}
      <div className="flex flex-row items-center justify-center gap-[clamp(27px,3.968vw,60px)]">
        <CountdownUnit value={days} label={t('countdown.days')} />
        <CountdownUnit value={hours} label={t('countdown.hours')} />
        <CountdownUnit value={minutes} label={t('countdown.minutes')} />
      </div>
    </div>
  );
}
