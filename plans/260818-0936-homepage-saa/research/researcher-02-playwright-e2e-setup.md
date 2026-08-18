# @playwright/test setup recipe — Homepage SAA (e2e-red-first)

Researched 2026-08-18. Not installed, not executed — recipe only, for `tester` to run.

## Verified project state (confirmed cheaply, not re-derived)
- App Router confirmed: `app/page.tsx`, `app/layout.tsx` exist, no `pages/`.
- `app/page.tsx` is still the stock `create-next-app` template — feature not yet built.
- `e2e/` exists, empty. No playwright/vitest/jest config anywhere.
- `tsconfig.json` include is `["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts",".next/dev/types/**/*.ts","**/*.mts"]`, exclude `["node_modules"]` — this glob **already covers** `e2e/**/*.ts`. No tsconfig change needed.
- `eslint.config.mjs` (flat config) = `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`, `globalIgnores` = `.next/**, out/**, build/**, next-env.d.ts` only — `e2e/` is **not** ignored, so it lints by default.
- `npx playwright --version` resolves `1.62.1` from npx's own cache (not installed in-project) — current upstream version as of this research; pin whatever `npm install` actually resolves, don't hardcode this number in configs.
- `clarifications.md` fixes the fact pattern this recipe must serve: env var `NEXT_PUBLIC_EVENT_START_AT` (ISO-8601), invalid/unparseable value → zero state, no crash (TC ID-60).

---

## 1. Install

```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Chromium only is correct here.** Source (1) `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` demonstrates the full three-engine setup as the generic quickstart, but that's Playwright's own scaffold default, not a project requirement — this is one durable screen-level contract test, not a cross-browser compat suite. Installing Firefox/WebKit triples binary download and CI time for zero marginal assertion value at this stage. Add `firefox`/`webkit` later only if a real cross-engine bug surfaces.

CI only (not local macOS): `npx playwright install --with-deps chromium` — pulls the OS-level shared libs Chromium needs on a bare Linux runner. `--with-deps` is a no-op/unnecessary on macOS dev machines.

---

## 2. `playwright.config.ts`

Two Playwright **projects**, each bound to its own **webServer** entry on a distinct port, because `NEXT_PUBLIC_*` values are inlined by the Next compiler at server-process start (or build time) — not swappable mid-run. This is the only way to assert genuinely different code paths (parsed-valid vs. unparseable) without restarting a server between assertions inside one spec.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'list',

  projects: [
    {
      name: 'chromium',
      testMatch: /^(?!.*invalid-env).*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
    {
      name: 'invalid-env',
      testMatch: /invalid-env\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3100' },
    },
  ],

  webServer: [
    {
      command: 'npx next dev --port 3000',
      port: 3000,
      env: { NEXT_PUBLIC_EVENT_START_AT: '2026-12-19T18:30:00+07:00' },
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: 'npx next dev --port 3100',
      port: 3100,
      env: { NEXT_PUBLIC_EVENT_START_AT: 'not-a-date' },
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
```

**`next dev` vs `next build && next start` — decision: `next dev`, for now.**

- Source (1) explicitly recommends the opposite for the *shipped* suite: "We recommend running your tests against your production code... Run `npm run build` and `npm run start`, then run `npx playwright test`." That's the right call for a pre-merge/CI gate.
- But this is `e2e-red-first`: the test is authored RED, then re-run repeatedly (seconds apart) while UI/behavior code lands, per `momorph-development.md`'s tester hand-off loop. `next build` on this stack (Next 16 + Turbopack) costs tens of seconds per iteration; `next dev` serves the first compile in ~1-3s and Turbopack HMR keeps subsequent hits fast. Trading production-fidelity for iteration speed is the correct call *during* the RED→GREEN loop.
- Recommendation: keep `next dev` in `playwright.config.ts` for the whole red-first loop. Add a one-line note (not a new script — YAGNI) for whoever runs the final pre-merge gate to optionally rerun once against `next build && next start` if they want production-fidelity confirmation before ship. Do not build a second config for this now; nothing in the brief asks for it yet.

---

## 3. package.json scripts to add

```jsonc
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

**Exact `redCommand` for the tester to run and record:**

```
npm run test:e2e -- e2e/homepage.spec.ts e2e/homepage-invalid-env.spec.ts
```

(Scoped to the two new files, not the whole `e2e/` tree — deterministic, fast, no noise from tests that don't exist yet. Once more specs exist, drop the file args and just run `npm run test:e2e`.)

---

## 4. Env vars reaching the app under `webServer`

- **Precedence, per Next's own doc** (`node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`, "Environment Variable Load Order"): `process.env` > `.env.$(NODE_ENV).local` > `.env.local` (skipped when `NODE_ENV=test`) > `.env.$(NODE_ENV)` > `.env`.
- `webServer.env` in Playwright is documented (playwright.dev/docs/test-webserver, confirmed live) as: *"Environment variables for the command. Defaults to inheriting process.env with `PLAYWRIGHT_TEST=1` added."* Explicit keys you set there land in the **spawned process's `process.env`** — the highest-precedence slot in Next's own lookup order, so it wins over any `.env`/`.env.local`/`.env.example` value unconditionally. That's why the config above sets `NEXT_PUBLIC_EVENT_START_AT` directly in each `webServer` entry instead of relying on a `.env.test` file.
- **`.env.test` is deliberately NOT used here.** Next's doc frames it as being for tools "like `jest` or `cypress`" that force `NODE_ENV=test` themselves; `next dev`/`next start` set `NODE_ENV` to `development`/`production` internally and don't read `.env.test` unless something external forces `NODE_ENV=test` before spawning `next`, which would also change Next's own dev/prod code paths in ways this recipe doesn't want. Pinning the value via `webServer.env` sidesteps that whole ambiguity — it's simpler (KISS) and deterministic regardless of `NODE_ENV`.
- **Two states, two code paths, two servers** (per project's `testMatch` routing):
  - Port 3000 / `chromium` project — `NEXT_PUBLIC_EVENT_START_AT=2026-12-19T18:30:00+07:00` (valid, ~90 days out per clarifications' `.env.example` seed) → drives the "counting" (non-zero DAYS/HOURS/MINUTES) assertion.
  - Port 3100 / `invalid-env` project — `NEXT_PUBLIC_EVENT_START_AT=not-a-date` → drives the TC ID-60 fallback-to-zero-state assertion (parse failure, no crash).
- **The "past date" zero state does NOT need a third server.** Use Playwright's Clock API against the *same* port-3000 server: install the clock, advance it past the pinned future date, and assert the countdown recomputes to `00d 00h 00m 00s`. This is the leaner option versus a third `webServer`/project pair, and it's a real Playwright capability (`page.clock.install()` / `.setFixedTime()` / `.fastForward()`), not something invented for this project — verify exact API name against the installed Playwright version's TS types before use (`@playwright/test` ships `.d.ts`), since Clock API method names have shifted across 1.4x releases.
- Net effect for the tester's spec files:
  - `e2e/homepage.spec.ts` (project `chromium`, port 3000): assert counting state on load; then use Clock to fast-forward past event start and assert the `00/00/00` zero state on the same page.
  - `e2e/homepage-invalid-env.spec.ts` (project `invalid-env`, port 3100): assert the fallback zero state renders without a thrown error / error boundary / console exception.

---

## 5. Genuine assertion RED vs. false RED

A **genuine RED** looks like: non-zero exit code from `playwright test`, AND stdout contains a printed test-results summary section (e.g. `1 failed`, `X passed`) with the failing test's title, file:line, and an `Error: expect(locator).toHaveText(...)`-shaped diff (or `.toBeVisible()`, `.toHaveCount()`, etc.) showing actual vs. expected. Playwright also writes a trace/screenshot under `test-results/` for that specific test on failure — that artifact existing is a second, independent confirmation the test actually executed.

**Do NOT count these as RED** — none of them ever reach the "N passed / N failed" summary line, because zero tests actually ran:

| Failure mode | Signature | Why it's not a real RED |
|---|---|---|
| Missing browser binaries | `Error: browserType.launch: Executable doesn't exist at ...` | Environment setup issue, not an assertion result |
| `webServer` boot timeout | `Error: Timed out waiting 120000ms from config.webServer.` | Server never became reachable; no page was ever visited |
| Port already in use | `Error: listen EADDRINUSE: address already in use :::3000` (or Playwright silently attaches to the wrong process if `reuseExistingServer: true` masks it) | Wrong/no server under test — false positive risk cuts both ways here |
| TS compile error in the spec file | esbuild/tsc diagnostic (`TSxxxx`) printed before any test executes, "0 tests found" or immediate crash | Syntax/type error, not a behavioral assertion |
| Missing dependency | `Error: Cannot find module '@playwright/test'` | Install problem, not test logic |

**Practical check for the tester:** grep the run's stdout for a line matching `\d+ (passed|failed)` — its presence is the bright line between "a test executed and asserted something" and "the run never got that far." If that line is absent, exit code 1 is infrastructure noise, not a valid RED, and must be fixed (browser install, port, timeout, syntax) before it counts.

---

## 6. Lint / tsconfig for `e2e/`

- **tsconfig.json: no change needed.** Current `include` glob (`**/*.ts`) already matches `e2e/**/*.ts`; `exclude` only excludes `node_modules`. Confirmed by reading the file directly — verified, not assumed.
- **eslint.config.mjs: no ignore entry needed up front.** `e2e/` isn't in `globalIgnores`, so it will lint by default under `eslint-config-next/core-web-vitals` + `/typescript`. Those rule sets target JSX/React/Next conventions (`next/no-img-element`, react-hooks rules, etc.) that simply won't fire on plain Playwright spec files (no JSX, no hooks). Recommendation: don't add an ignore preemptively (YAGNI) — write the spec, run `npm run lint`, and only add `e2e/**` to `globalIgnores` if a genuinely irrelevant rule fires. If noise does show up, the common industry fix is `eslint-plugin-playwright`, but don't add that dependency unless the plain lint run actually produces false positives — no evidence of that yet on this config.

---

## 7. Next 16 / React 19 gotchas + waiting strategy

- **Default strategy: Playwright's own web-first, auto-retrying assertions** — `await expect(locator).toBeVisible()` / `.toHaveText()` etc., not manual `isVisible()` checks or `waitForTimeout`. Confirmed straight from playwright.dev/docs/best-practices: *"By using web first assertions Playwright will wait until the expected condition is met,"* contrasted explicitly against the anti-pattern `expect(await page.getByText(...).isVisible()).toBe(true)`.
- **Locator strategy: `getByRole`/`getByText` over CSS/XPath**, same source: *"Prefer user-facing attributes to XPath or CSS selectors"* — e.g. `page.getByRole('button', { name: 'Viết Kudos' })` over a class-based `page.locator(...)`. This also naturally covers the i18n toggle (`vi`/`en` dictionaries per clarifications) since accessible name assertions are the same mechanism used to verify the copy actually switched.
- **RSC streaming / hydration:** App Router pages stream from the server and hydrate client components (the mock session context, the language provider, the countdown) after initial paint. Auto-retrying `expect()` already absorbs this — it polls until the assertion holds, so no manual `waitForLoadState('networkidle')` is needed and is actively discouraged for apps with any streaming/long-lived connections (Next.js dev overlay, RSC payload streaming) since `networkidle` can hang or fire prematurely on such apps. Rely on Playwright's default `'load'`/`'domcontentloaded'` waits plus assertion polling instead.
- **Turbopack dev-server first-compile latency:** the *first* request to a route after `next dev --port N` starts triggers on-demand compilation (can take a few seconds under Turbopack on first hit). This is exactly what `webServer.timeout: 120_000` and Playwright's own `url`-polling readiness check absorb — don't shorten that timeout to "optimize" iteration speed; the first real page load inside the test itself may still be the slow one, so keep default navigation timeouts (don't override `actionTimeout`/`navigationTimeout` down).
- **Client-only mock session / language provider (from clarifications):** both are seeded via `localStorage`/dev toggle and rendered post-hydration. First assertion against role-gated UI (e.g. "Admin Dashboard" menu item) should target the *hydrated* state via `expect(...).toBeVisible()` polling, not an immediate synchronous check right after `page.goto()`.

---

## Trade-off matrix

| Decision | Chosen | Alternative | Why chosen wins here |
|---|---|---|---|
| Browsers | Chromium only | Chromium+Firefox+WebKit (scaffold default) | One screen-level contract test; 3x install/run cost buys nothing yet (YAGNI) |
| webServer command | `next dev` | `next build && next start` | RED-first loop reruns constantly; dev's fast first-compile + Turbopack HMR beats a full build per iteration. Revisit for pre-merge gate. |
| Env delivery | `webServer.env` per project | `.env.test` + forced `NODE_ENV=test` | Next docs frame `.env.test` for jest/cypress, not `next dev/start`; forcing `NODE_ENV=test` fights Next's own dev/prod branching. `webServer.env` is `process.env`-level, highest precedence, deterministic. |
| Zero-state (expired) | Playwright Clock API on the valid-env server | Third webServer/project pair | Same code path (valid parse, time passed) — a client clock mock is enough, no need for a third Next process |
| Invalid-value fallback | Second webServer/project pair on port 3100 | Skip / cover in a unit test instead | Different code path (parse failure); `e2e-red-first` policy (momorph-development.md) forbids downgrading a screen-level TC (ID-60) to a non-E2E test |

## Adoption / maturity note
`@playwright/test` is Microsoft-maintained, is the tool Next.js's own docs recommend, and is already the version resolving via `npx` on this machine (1.62.1) — mature, actively released, low abandonment risk. `webServer` array + per-entry `env` and the Clock API are both stable, documented public API surface, not edge-case/experimental features.

## Unresolved / left uncovered
- Exact Clock API method names should be re-checked against the actually-installed `@playwright/test` version's `.d.ts` at implementation time — I did not install the package to inspect its shipped types, per the "do not install anything" constraint on this research task.
- Whether `eslint-config-next/typescript`'s type-aware rules need a `parserOptions.project` tweak to see `e2e/tsconfig` cleanly wasn't verified by an actual `npm run lint` run (also blocked by the no-install/no-modify constraint) — flagged in §6 as "verify by running lint once," not asserted as fact.
- Did not fetch Playwright's CI guide in depth (`playwright.dev/docs/ci`) — deferred since this recipe's redCommand target is local/dev-server execution, not a CI pipeline design.

**Status:** DONE
**Summary:** Recipe delivered: `npm install -D @playwright/test` + chromium-only browser install; two-project/two-webServer `playwright.config.ts` (port 3000 valid-env via `next dev`, port 3100 invalid-env) pins `NEXT_PUBLIC_EVENT_START_AT` deterministically through `webServer.env` rather than `.env.test`; zero-state via Playwright Clock API on the same server, not a third process; exact redCommand given; RED vs false-RED failure signatures enumerated; tsconfig needs no change, eslint needs no ignore up front (verify-then-add only if noisy).
**Concerns/Blockers:** None blocking. Two verification steps (exact Clock API method names, actual `npm run lint` pass on e2e/) are explicitly deferred to implementation time since installing/modifying was out of scope for this research task.
