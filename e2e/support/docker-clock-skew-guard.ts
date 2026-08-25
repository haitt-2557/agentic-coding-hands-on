import { execSync } from 'node:child_process';

const CONTAINER = 'supabase_db_agentic-coding-hands-on';
// PostgREST (`supabase_rest_...`) allows a 30s clock-skew tolerance on `iat`/`exp`/`nbf` before
// raising PGRST303 "JWT issued at future". Failing at half that margin catches drift early,
// before it is large enough to actually break a request.
const MAX_TOLERATED_SKEW_SECONDS = 15;

function readContainerEpochSeconds(): number {
  const out = execSync(`docker exec ${CONTAINER} date -u +%s`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return parseInt(out.trim(), 10);
}

/**
 * Diagnoses and corrects clock skew between the host and the Docker Desktop Linux VM that runs
 * every Supabase container.
 *
 * Root cause (evidence): Next.js server logs showed `loadBoardLikeState count query failed:` with
 * a PostgREST PGRST303 "JWT issued at future" error. GoTrue (`supabase_auth_...`) stamps a JWT's
 * `iat` from ITS OWN clock (the shared Docker Desktop VM clock) at `signInWithPassword` time;
 * PostgREST (`supabase_rest_...`) validates that `iat` against the SAME VM clock plus a 30s
 * tolerance. Docker Desktop's Linux VM is documented to stop advancing its clock while the host
 * sleeps and not immediately catch back up on wake — a host/VM gap of even a few seconds, layered
 * onto request latency, is enough to push `iat` past PostgREST's tolerance. This is host-vs-VM
 * skew, not skew between individual containers (they all share the one VM clock), which is why
 * `docker exec ... date` on the db container is measured directly against `Date.now()` here.
 *
 * `lib/kudos/likes/queries.ts` degrades to an empty board on this failure (FR-005: the board must
 * still render for a signed-out-equivalent view rather than 500) — so the symptom a developer
 * sees is silently-wrong like counts, not a thrown error, which is what makes this worth guarding
 * against explicitly rather than leaving it to surface downstream as a confusing count mismatch.
 *
 * This performs a real correction (resyncing the VM clock to the host, the same remedy documented
 * for this class of Docker Desktop issue) rather than a sleep/retry that would only wait out an
 * unknown amount of drift. When skew is within tolerance (the common case — verified 0s in this
 * environment) it does one fast `docker exec ... date` and returns; the resync path only runs
 * when actual drift is measured.
 */
export function ensureDockerClockSynced(): void {
  const hostSecondsBefore = Math.floor(Date.now() / 1000);
  let containerSeconds: number;
  try {
    containerSeconds = readContainerEpochSeconds();
  } catch {
    // Container missing/unreachable is a pre-existing INFRA condition that every DB-touching
    // test already detects and reports on its own (e2e/support/local-db.ts) — nothing to add.
    return;
  }

  const skew = Math.abs(hostSecondsBefore - containerSeconds);
  if (skew <= MAX_TOLERATED_SKEW_SECONDS) {
    return;
  }

  console.warn(
    `[docker-clock-skew-guard] Docker VM clock is ${skew}s off the host clock — this causes ` +
      `PostgREST PGRST303 "JWT issued at future" once skew exceeds its own 30s tolerance. ` +
      `Attempting to resync the VM clock to the host.`
  );

  try {
    const hostTimestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
    // Resyncs the Docker Desktop Linux VM's clock (not just one container) via `nsenter` into
    // PID 1's namespaces — the standard documented workaround for this Docker Desktop behavior.
    execSync(
      `docker run --rm --privileged --pid=host alpine:3 ` +
        `nsenter -t 1 -m -u -n -i date -u -s "${hostTimestamp}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
  } catch (err) {
    throw new Error(
      `INFRA: Docker VM clock is ${skew}s ahead of/behind the host and the automatic resync ` +
        `failed (${(err as Error).message}). Restart Docker Desktop to force a clock resync, ` +
        `then rerun — auth tokens will otherwise intermittently fail PostgREST's PGRST303 check.`
    );
  }

  const hostSecondsAfter = Math.floor(Date.now() / 1000);
  const skewAfter = Math.abs(hostSecondsAfter - readContainerEpochSeconds());
  if (skewAfter > MAX_TOLERATED_SKEW_SECONDS) {
    throw new Error(
      `INFRA: Docker VM clock is still ${skewAfter}s off the host after an attempted resync. ` +
        `Restart Docker Desktop before rerunning the suite.`
    );
  }
}
