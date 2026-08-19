import { DigitBox } from './digit-box';

interface CountdownUnitProps {
  /** Exactly two digits, guaranteed by usePrelaunchCountdown() — never re-padded here. */
  value: string;
  label: string;
}

// mm:2268:35139 — one time unit (digit pair + label). Sibling units 2268:35144
// (Hours) / 2268:35149 (Minutes) share this same structure.
//
// DOM contract (RED suite): this container's normalized text must be exactly
// `{value}{label}` (e.g. "01HOURS") — two digit glyphs then the label, no
// separator text node. Not an aria-live region: a 1s live region is hostile to
// screen readers, so the whole value is exposed once via aria-label instead.
export function CountdownUnit({ value, label }: CountdownUnitProps) {
  // Render one box per character rather than destructuring the first two. Destructuring
  // discarded anything beyond two digits without a trace — a 122-day countdown displayed
  // as "12". The cap now lives in usePrelaunchCountdown (see lib/prelaunch/display.ts), and
  // mapping the whole string means that if the guarantee is ever broken again the extra
  // digit shows up as a visible third box instead of vanishing.
  const digits = value.split('');

  return (
    <div
      className="flex flex-col items-start gap-[clamp(9.45px,1.389vw,21px)]"
      aria-label={`${value} ${label}`}
    >
      {/* mm:2268:35140 — digit pair */}
      <div className="flex flex-row items-center gap-[clamp(9.45px,1.389vw,21px)]">
        {digits.map((digit, index) => (
          <DigitBox key={index} digit={digit} />
        ))}
      </div>
      {/* mm:2268:35143 — unit label */}
      <span className="font-sans text-[clamp(16.2px,2.381vw,36px)] font-bold uppercase leading-[1.333] text-white">
        {label}
      </span>
    </div>
  );
}
