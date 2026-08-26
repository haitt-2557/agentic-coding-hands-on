# Environmental note — `npm run test:e2e` (full suite) is RED, and was RED before this change

## What was recorded vs what is true

Phase 03's tester recorded `npm run test:e2e` as `exitCode: 0`. **That was wrong.** The full suite
exits **1**. The orchestrator re-ran it independently and corrected the record before delivery.

```
npm run test:e2e   →   REAL exit 1
   97 passed
   10 did not run
    6 failed   (all Supabase-dependent)
```

## Cause — no local Supabase

The Docker daemon is not running, so `supabase start` has nothing to attach to:

```
npx supabase status
→ failed to connect to the docker API at unix:///Users/…/.colima/default/docker.sock;
  check if the path is correct and if the daemon is running

colima status
→ colima is not running
```

Every failure is a network error reaching Supabase, not an assertion:
`TypeError: fetch failed`, `AuthRetryableFetchError: fetch failed`,
`loadBoardLikeState count query failed`, `SQL_ERROR: failed to connect to the docker API`.

Failing projects: `kudos-board`, `send-kudos`, `login-auth-redirect`.

## Proof it is pre-existing, not caused by this change

Not an argument — a measurement. The working tree was stashed (`git stash push -u` over
`app components public e2e`) and the failing project re-run against clean `main`:

| Tree | Command | Exit | Result |
|---|---|---|---|
| **clean `main`** (changes stashed) | `npx playwright test --project=kudos-board` | `1` | 6 failed · 10 did not run · 17 passed |
| **with this change** | `npx playwright test --project=kudos-board` | `1` | 6 failed · 10 did not run · 17 passed |

Identical. The stash was popped and the working tree restored immediately after.

This is also true by construction: the change is one CSS custom property, one optional
`className` prop, a component's Tailwind classes, and a static SVG. None of it can make a
network fetch to Supabase fail.

## What IS proven green

`temper-runs.json` records five real runs, each an actual observed exit code:

1. `npm run test:e2e -- e2e/homepage-language-dropdown.spec.ts` → **0** (the exact phase-01 RED command)
2. `npm run test:e2e -- e2e/homepage-dropdown-menus.spec.ts` → **0** (7 pre-existing behavioural tests)
3. `npm run build` → **0**
4. `npm run lint` → **0**
5. All five non-Supabase Playwright projects → **0**, 79 passed

Together these cover both `LanguageSwitcher` mount points and all three sibling dropdowns that
share the edited `DropdownMenu` primitive — the entire blast radius of this change.

## To clear it

`colima start && npx supabase start`, then `npm run test:e2e`. Out of scope for this task, and
it is a pre-existing condition of the machine rather than a defect in the work.
