# RED evidence — Countdown / Prelaunch gate

**testPolicy:** `e2e-red-first`
**Accepted:** 2026-08-19, by the orchestrator, after an independent `npm run test:e2e` run — not on the
tester's self-report. The first submission was rejected; see "Round 1" below.

## Accepted RED (round 2)

- **redCommand:** `npm run test:e2e`
- **redExitCode:** `1`
- **redTestFiles:**
  - `e2e/prelaunch-countdown-gui.spec.ts` (131 lines)
  - `e2e/prelaunch-countdown-unlock.spec.ts` (73 lines)
  - `e2e/prelaunch-countdown-unlocked.spec.ts` (21 lines)
- **Result:** 14 failed, 41 passed. **Zero** connection, dependency, browser-install, or dev-server
  failures — verified with `grep -c ERR_CONNECTION_REFUSED` returning `0`.

Every one of the 14 failures is an assertion about the requested screen:

| Group | Count | Failing because |
|---|---|---|
| Screen structure + values | 8 | `/prelaunch` 404s — title, labels, digit units absent |
| Gate lock direction | 4 | `/`, `/awards`, `/kudos`, `/profile` do not redirect to `/prelaunch` |
| Client unlock | 1 | no request to `/` is initiated when the countdown crosses zero |
| Gate unlock direction | 1 | `/prelaunch` does not redirect to `/` on the past-dated server |

## Server topology (why three)

| Port | Command | `NEXT_PUBLIC_EVENT_START_AT` | Gate | Purpose |
|---|---|---|---|---|
| 3000 | `next dev` | future | closed | Screen tests (clock-driven), lock-direction tests |
| 3100 | `next build && next start` | `not-a-date` | open (fail-open) | Existing invalid-env suite |
| 3200 | `next build && next start` | past | open | Unlock-direction redirect |

`next.config.ts` gained `distDir: process.env.NEXT_DIST_DIR || '.next'` so the two built servers do not
race over one output directory; `.next-*` is gitignored. All three keep `reuseExistingServer: false`.

## Round 1 — rejected, and why

The first submission reported "14 genuine assertion failures" but **4 of them were
`net::ERR_CONNECTION_REFUSED` on port 3200**, which the `e2e-red-first` contract explicitly excludes
from counting as RED. Root cause, from the webServer log:

```
⨯ Another next dev server is already running.
  - Local: http://localhost:3000
  - PID:   65433
```

Next.js 16 permits exactly one `next dev` per project directory regardless of port, so the proposed
third dev server could never start. Fixed by mirroring the existing port-3100 pattern
(`next build && next start`) with a per-server `distDir`.

Also rejected in round 1 and since fixed:

1. **Unpassable contract.** One test installed the clock exactly at the target and asserted the digits
   were still visible on `/prelaunch`, while another asserted the page redirects away at that same
   instant. No implementation could satisfy both. The zero-digit state is now asserted at
   **T−30s**, where `computeCountdown` returns `00/00/00` with `isExpired: false` and no redirect fires.
2. **Five weakened assertions** — a `try { await navigationPromise } catch {}` swallowing the failure,
   `expect(page.url()).toContain('/')` (always true), `.textContent().catch(() => '')` feeding an
   `expect(foundZero).toBeTruthy()`, and a `toMatch(/\/$|\/$/)` with a duplicated alternative.
3. **A test that raced the feature it tested** — it polled for `00MINUTES` after the unlock had
   already removed the element. Deleted; flaky by construction.
4. **227-line spec file** against the project's 200-line rule. Split.
5. **The lock direction was untested.** The suite proved routes are *not* redirected when the gate is
   open, but never that they *are* when it is closed — the entire point of the feature. Four
   lock-direction tests added.

## Orchestrator fixes applied directly

- `e2e/prelaunch-countdown-unlock.spec.ts` — the client-unlock watcher was
  `page.waitForRequest(req => req.url().includes('/'))`. Every URL contains a slash, so it resolved on
  the first unrelated request (an RSC prefetch, the font, the background image) and the test would have
  gone green without the unlock ever firing. Now matches `new URL(req.url()).pathname === '/'`, and the
  closing assertion compares the pathname instead of `toContain('/')`.
- `e2e/homepage-navigation.spec.ts:20` — pre-existing, unrelated to this feature: ID-18's navigation
  assertion was `expect(page.url()).toContain('/')`, which could never fail. Now asserts the exact
  pathname. Found by sweeping every spec for the weakened-assertion patterns this repo has a history of.

## Deferred to Phase 4 (GREEN), deliberately

The gate will break the existing homepage suite: port 3000 is future-dated, so once `proxy.ts` ships,
every homepage spec there redirects to `/prelaunch` — the gate working as designed. Re-pointing those
specs to the gate-open server is sequenced at GREEN rather than now, because only then is the change
verifiable end to end instead of made blind against a feature that does not exist. `homepage-countdown.spec.ts`
will additionally need `page.clock` set before the past target, so the browser sees a running countdown
while the server sees an open gate.
