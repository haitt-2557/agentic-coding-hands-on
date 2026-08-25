import { ensureDockerClockSynced } from './docker-clock-skew-guard';

// Playwright global setup: runs once before any project's tests, regardless of `--project`
// filtering. See docker-clock-skew-guard.ts for why this check exists (Defect D / PGRST303).
export default function globalSetup(): void {
  ensureDockerClockSynced();
}
