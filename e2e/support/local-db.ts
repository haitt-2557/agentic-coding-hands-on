import { execSync } from 'node:child_process';

// Real infra failure only: the `docker` CLI could not be run at all, or the daemon/container it
// targets is unreachable. These come from `docker`'s OWN diagnostics on stderr (or Node failing
// to spawn the binary) — never from anything a *working* container's psql prints, since a live
// container always answers in valid psql/Postgres text on stderr, not "Cannot connect..." prose.
const INFRA_FAILURE_PATTERNS = [
  /cannot connect to the docker daemon/i,
  /is the docker daemon running/i,
  /no such container/i,
  /error response from daemon/i,
];

/**
 * Execute SQL directly against the local Supabase Postgres instance via docker exec.
 * Used only for test setup/teardown on tables sealed from the Data API (special_days, etc).
 * Throws `INFRA:`-prefixed errors only for a genuine docker/container failure; a real SQL error
 * from a healthy container (e.g. a constraint violation) is thrown as `SQL_ERROR:` instead, so
 * one is never mistaken for the other.
 *
 * Classification bug (fixed here): the command string itself always contains the literal word
 * "docker" (`docker exec -i ...`), and Node's execSync wraps that command into every thrown
 * error's `.message` ("Command failed: docker exec -i ..."). A naive `message.includes('docker')`
 * check is therefore true for EVERY failure, including a plain SQL error, and was misreporting
 * real database errors as "docker/Supabase unavailable" — masking them. Inspecting `stderr` (what
 * docker/psql actually printed) instead of the reconstructed command string fixes that.
 */
export function execSql(sql: string): string {
  const cmd = `docker exec -i supabase_db_agentic-coding-hands-on psql -U postgres -d postgres -A -t -c "${sql.replace(/"/g, '\\"')}"`;
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    const execErr = err as NodeJS.ErrnoException & { stderr?: string | Buffer; stdout?: string | Buffer };
    const stderr = (execErr.stderr ?? '').toString();
    const stdout = (execErr.stdout ?? '').toString();

    const isInfraFailure =
      execErr.code === 'ENOENT' || INFRA_FAILURE_PATTERNS.some((re) => re.test(stderr));

    if (isInfraFailure) {
      throw new Error(
        `INFRA: docker/Supabase unavailable. Ensure docker is running and the container ` +
        `'supabase_db_agentic-coding-hands-on' exists. Error: ${stderr || execErr.message}`
      );
    }

    throw new Error(
      `SQL_ERROR: ${(stderr || stdout || execErr.message || '').trim()}\nSQL: ${sql}`
    );
  }
}

/**
 * Insert a special_days row covering a date range, run a callback, then delete the row.
 * Ensures the row is always cleaned up, even if the callback throws.
 */
export async function withSpecialDay(
  startsOn: string, // 'YYYY-MM-DD'
  endsOn: string,   // 'YYYY-MM-DD'
  fn: () => Promise<void>
): Promise<void> {
  const id = `'${crypto.randomUUID()}'`;
  try {
    execSql(
      `INSERT INTO public.special_days (id, starts_on, ends_on) ` +
      `VALUES (${id}, '${startsOn}', '${endsOn}')`
    );
    await fn();
  } finally {
    execSql(`DELETE FROM public.special_days WHERE id = ${id}`);
  }
}

/**
 * Insert a like row from a secondary (different from the current test user) auth user.
 * Uses an existing auth user to avoid foreign key issues.
 * Returns the user's uuid for use in assertions or cleanup.
 */
export async function insertSecondaryLike(kudosId: string): Promise<string> {
  // Get a user that is definitely NOT the E2E test user (who may be creating likes too)
  // Select a user that exists but is unlikely to be the fixture user
  const userResult = execSql(
    `SELECT id FROM auth.users WHERE email NOT LIKE '${process.env.E2E_TEST_USER_EMAIL || 'nonexistent'}' ` +
    `AND id IS NOT NULL LIMIT 1`
  );

  if (!userResult || userResult.trim() === '') {
    // If no other user exists, create one
    const email = `e2e-secondary-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const userId = crypto.randomUUID();
    execSql(
      `INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at) ` +
      `VALUES ('${userId}', '${email}', '{}', now(), now())`
    );
    // Wait a bit to ensure the insert is visible
    await new Promise(resolve => setTimeout(resolve, 100));
    execSql(
      `INSERT INTO public.kudos_likes (kudos_id, user_id) ` +
      `VALUES ('${kudosId}', '${userId}')`
    );
    return userId;
  }

  const userId = userResult.trim();
  // Insert the like row from the existing user
  execSql(
    `INSERT INTO public.kudos_likes (kudos_id, user_id) ` +
    `VALUES ('${kudosId}', '${userId}')`
  );
  return userId;
}

/**
 * Clean up test rows: delete any likes on the given kudos ids. Idempotent — safe to call even
 * when no rows exist, and safe to call in both `beforeEach` (clean start from a dirty database
 * left by a crashed prior run) and `afterEach` (leave the table clean for the next run).
 *
 * Each spec file owns a disjoint set of kudos ids (kudos-board-like-rules.spec.ts: kudos-3/4;
 * kudos-board-like-sidebar.spec.ts: kudos-2; kudos-board-like-persistence.spec.ts: kudos-1) and
 * MUST only ever pass its own ids here. Playwright's `fullyParallel: true` runs different spec
 * *files* concurrently in different workers with no ordering guarantee between them, so a file
 * that deleted another file's in-flight rows would reintroduce the exact race this exists to
 * prevent — disjoint ownership is what keeps concurrent files from touching each other's rows.
 *
 * Defaults to kudos-3/4 to preserve the original call sites in kudos-board-like-rules.spec.ts.
 */
export function cleanupTestRows(kudosIds: string[] = ['kudos-3', 'kudos-4']): void {
  const idList = kudosIds.map((id) => `'${id}'`).join(', ');
  execSql(`DELETE FROM public.kudos_likes WHERE kudos_id IN (${idList})`);
}
