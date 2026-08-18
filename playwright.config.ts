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

  // Both servers carry a NEXT_PUBLIC_EVENT_START_AT the assertions depend on, so neither
  // may be reused: a plain `npm run dev` already on :3000 has no such value, and reusing it
  // silently turns the countdown assertions into a race the suite can still report green.
  // Owning the servers costs a cold start; borrowing one costs the suite its meaning.
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
      env: { NEXT_PUBLIC_EVENT_START_AT: 'not-a-date' },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
