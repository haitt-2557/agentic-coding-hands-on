// ALG-001 — countdown to NEXT_PUBLIC_EVENT_START_AT.
// Pure function: `now` is injected by the caller so this stays unit-testable and lets
// the E2E's Clock API drive it deterministically. Never call Date.now() inside.

export interface CountdownResult {
  /** Zero-padded to at least 2 digits, e.g. "05", "30". */
  days: string;
  hours: string;
  minutes: string;
  /** True once `now` is at or past the target instant (BR-002). */
  isExpired: boolean;
  /** True when `targetIso` is missing or unparseable (BR-003) — never throws. */
  isInvalid: boolean;
}

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function zeroState(isExpired: boolean, isInvalid: boolean): CountdownResult {
  return { days: '00', hours: '00', minutes: '00', isExpired, isInvalid };
}

/**
 * Compute a countdown breakdown from an ISO-8601 target and a reference instant.
 *
 * `targetIso` originates from `process.env.NEXT_PUBLIC_EVENT_START_AT`, an external,
 * unvalidated input — a missing, empty, or unparseable value degrades to the zero
 * state (BR-003) rather than throwing.
 */
export function computeCountdown(targetIso: string | undefined, now: Date): CountdownResult {
  if (!targetIso) {
    return zeroState(false, true);
  }

  const targetMs = Date.parse(targetIso);
  if (Number.isNaN(targetMs)) {
    return zeroState(false, true);
  }

  const diffMs = targetMs - now.getTime();
  if (diffMs <= 0) {
    return zeroState(true, false);
  }

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);

  return {
    days: pad2(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    isExpired: false,
    isInvalid: false,
  };
}
