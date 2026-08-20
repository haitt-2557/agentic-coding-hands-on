import { defineConfig, devices } from '@playwright/test';

try { process.loadEnvFile('.env.local'); } catch { /* optional in CI */ }

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
      name: 'prelaunch-gate',
      testMatch: /^(?!.*awards-page|.*homepage|.*invalid-env|.*prelaunch-countdown-unlocked|.*login-auth-redirect).*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
    {
      name: 'awards-page',
      // `awards-page-*` too, not just `awards-page.spec.ts` — the suite is split across
      // awards-page-{layout,header,navigation,deep-links,kudos}.spec.ts to stay under the
      // 200-line file rule. An anchored `/awards-page\.spec\.ts$/` silently collects NONE
      // of them: they match no other project either (prelaunch-gate's lookahead excludes
      // `.*awards-page`), so they would run nowhere and read as coverage that does not exist.
      // Port 3200 is past-dated, so the launch gate is open — `/awards` is not in
      // `ALWAYS_ALLOWED` (lib/prelaunch/gate.ts), so on port 3000 every request 307s to
      // /prelaunch and no implementation could ever turn the suite green.
      testMatch: /awards-page.*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3200' },
    },
    {
      name: 'homepage-with-open-gate',
      // `homepage-invalid-env` must be excluded even though it starts with `homepage`:
      // it also matches the invalid-env project below, so without this it runs twice. Worse,
      // it PASSES on this past-dated server for the wrong reason — an expired countdown and
      // an unparseable one render the same zero state, so the duplicate proves nothing about
      // BR-003 while looking like coverage. Its only meaningful home is port 3100.
      testMatch: /^(?!.*invalid-env).*homepage.*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3200' },
    },
    {
      name: 'invalid-env',
      testMatch: /invalid-env\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3100' },
    },
    {
      name: 'prelaunch-unlocked',
      testMatch: /prelaunch-countdown-unlocked\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3200' },
    },
    {
      name: 'login-auth-redirect',
      testMatch: /login-auth-redirect\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3200' },
    },
  ],

  // Three servers with distinct env values: the assertions depend on each server's specific
  // NEXT_PUBLIC_EVENT_START_AT, so neither may be reused. Port 3000 (future date) drives
  // clock-based tests; port 3200 (past date) drives server-side redirect tests.
  // Each built server has its own distDir to avoid race on .next rebuild.
  webServer: [
    {
      command: 'npx next dev --port 3000',
      port: 3000,
      env: { NEXT_PUBLIC_EVENT_START_AT: '2026-12-19T18:30:00+07:00' },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npx next build && npx next start --port 3100',
      port: 3100,
      env: {
        NEXT_PUBLIC_EVENT_START_AT: 'not-a-date',
        NEXT_DIST_DIR: '.next-invalid-env',
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npx next build && npx next start --port 3200',
      port: 3200,
      env: {
        NEXT_PUBLIC_EVENT_START_AT: '2026-08-01T12:00:00+07:00',
        NEXT_DIST_DIR: '.next-unlocked',
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
