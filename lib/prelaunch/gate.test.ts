import { test, expect } from '@playwright/test';
import { resolveGateRedirect } from './gate';

// FR-002 + BR-004/BR-005 + DEC-001 — pure app-wide launch gate. `now` is injected (no
// Date.now() inside), single source of truth shared with lib/countdown.ts so the gate and
// the display can never disagree on the target instant.

const FUTURE_TARGET = '2026-12-19T18:30:00+07:00';

test.describe('resolveGateRedirect', () => {
  test.describe('locked (countdown still running)', () => {
    const locked = new Date('2026-12-19T17:00:00+07:00'); // 1h30m before target

    for (const pathname of ['/', '/awards', '/kudos', '/profile', '/admin']) {
      test(`redirects ${pathname} to /prelaunch`, () => {
        expect(resolveGateRedirect(pathname, FUTURE_TARGET, locked)).toBe('/prelaunch');
      });
    }

    test('does not redirect /prelaunch to itself (no loop)', () => {
      expect(resolveGateRedirect('/prelaunch', FUTURE_TARGET, locked)).toBeNull();
    });
  });

  test.describe('unlocked (countdown at or past zero)', () => {
    const pastTarget = '2026-01-01T00:00:00Z';
    const afterExpiry = new Date('2026-01-02T00:00:00Z');

    test('/prelaunch redirects to / once expired', () => {
      expect(resolveGateRedirect('/prelaunch', pastTarget, afterExpiry)).toBe('/');
    });

    test('other routes pass through once expired', () => {
      expect(resolveGateRedirect('/awards', pastTarget, afterExpiry)).toBeNull();
      expect(resolveGateRedirect('/', pastTarget, afterExpiry)).toBeNull();
    });
  });

  test.describe('fail-open on invalid config', () => {
    const now = new Date('2026-01-01T00:00:00Z');

    for (const invalidTarget of [undefined, '', 'not-a-date']) {
      test(`targetIso=${JSON.stringify(invalidTarget)} never locks any route`, () => {
        expect(resolveGateRedirect('/', invalidTarget, now)).toBeNull();
        expect(resolveGateRedirect('/awards', invalidTarget, now)).toBeNull();
      });

      test(`targetIso=${JSON.stringify(invalidTarget)} never forces /prelaunch to redirect`, () => {
        expect(resolveGateRedirect('/prelaunch', invalidTarget, now)).toBeNull();
      });
    }
  });

  // FR-005 / BR-004 — /login and the OAuth callback must pass the gate in BOTH
  // directions (locked and unlocked), unlike /prelaunch which only flips at launch.
  test.describe('exempted routes (/login, /auth/callback)', () => {
    const locked = new Date('2026-12-19T17:00:00+07:00');
    const pastTarget = '2026-01-01T00:00:00Z';
    const afterExpiry = new Date('2026-01-02T00:00:00Z');

    for (const pathname of ['/login', '/auth/callback', '/auth/callback/anything']) {
      test(`${pathname} passes through while locked`, () => {
        expect(resolveGateRedirect(pathname, FUTURE_TARGET, locked)).toBeNull();
      });

      test(`${pathname} passes through while unlocked`, () => {
        expect(resolveGateRedirect(pathname, pastTarget, afterExpiry)).toBeNull();
      });

      for (const invalidTarget of [undefined, '', 'not-a-date']) {
        test(`${pathname} passes through with invalid targetIso=${JSON.stringify(invalidTarget)}`, () => {
          expect(
            resolveGateRedirect(pathname, invalidTarget, new Date('2026-01-01T00:00:00Z'))
          ).toBeNull();
        });
      }
    }
  });

  // Review finding (Low, regression guard) — `isAlwaysAllowed` is exact-match OR
  // `${allowed}/` prefix, not a bare `startsWith(allowed)`. These near-miss paths share a
  // prefix with an allowed entry but are NOT sub-paths of it, so they must still be gated.
  // Pins the distinction so a future refactor to `startsWith` doesn't silently exempt them.
  test.describe('near-miss paths are NOT exempted (regression guard)', () => {
    const locked = new Date('2026-12-19T17:00:00+07:00');

    for (const pathname of ['/loginX', '/auth/callbackX']) {
      test(`${pathname} redirects to /prelaunch while locked (not exempted)`, () => {
        expect(resolveGateRedirect(pathname, FUTURE_TARGET, locked)).toBe('/prelaunch');
      });
    }
  });

  test.describe('exact zero boundary', () => {
    test('now === target is unlocked (/prelaunch redirects to /)', () => {
      const now = new Date(FUTURE_TARGET);
      expect(resolveGateRedirect('/prelaunch', FUTURE_TARGET, now)).toBe('/');
      expect(resolveGateRedirect('/awards', FUTURE_TARGET, now)).toBeNull();
    });

    test('now === target - 1ms is still locked', () => {
      const now = new Date(new Date(FUTURE_TARGET).getTime() - 1);
      expect(resolveGateRedirect('/awards', FUTURE_TARGET, now)).toBe('/prelaunch');
      expect(resolveGateRedirect('/prelaunch', FUTURE_TARGET, now)).toBeNull();
    });
  });
});
