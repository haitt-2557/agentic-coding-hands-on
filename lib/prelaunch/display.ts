// Display clamping for the prelaunch countdown digits.
//
// The frame draws exactly two digit boxes per unit and the MoMorph spec fixes the days
// range at "2-digit zero-padded (00–99)". `computeCountdown` reports the TRUE remaining
// days, which is not bounded by 99 — the shipped `.env.example` target is 122 days out.
//
// Without this cap the renderer silently dropped the extra digit: `const [tens, ones] =
// '122'` rendered "12", understating the countdown by 110 days with nothing to signal it.
// Hours and minutes need no equivalent — they are derived by modulo and cannot exceed
// 23 and 59.

/** Highest value the two-box days unit can represent. */
export const MAX_DISPLAY_DAYS = 99;

/**
 * Clamp a zero-padded day count to what two digit boxes can show.
 *
 * Values at or below the cap pass through untouched, preserving `computeCountdown`'s own
 * zero-padding. A non-numeric input is returned unchanged rather than coerced — the
 * countdown's invalid/expired states already resolve to `'00'` upstream, so there is no
 * second failure mode to invent here.
 */
export function capDisplayDays(days: string): string {
  const parsed = Number.parseInt(days, 10);

  if (!Number.isFinite(parsed) || parsed <= MAX_DISPLAY_DAYS) {
    return days;
  }

  return String(MAX_DISPLAY_DAYS);
}
