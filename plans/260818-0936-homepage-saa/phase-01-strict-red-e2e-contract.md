---
phase: 1
title: "Strict RED — durable screen-level E2E contract"
owner: tester
status: completed
priority: P1
effort: 2h
test_policy: e2e-red-first
depends_on: []
blocks: [2, 3, 4, 5]
---

# Phase 1 — Strict RED E2E Contract (BLOCKING GATE)

## Context Links

- Recipe (binding): [`research/researcher-02-playwright-e2e-setup.md`](research/researcher-02-playwright-e2e-setup.md)
- Decisions (authoritative): [`clarifications.md`](clarifications.md)
- Test cases: [`design/test-cases-i87tDx10uM.csv`](design/test-cases-i87tDx10uM.csv) — 62 rows, **ID-14 STALE**
- Requirements: [`spec/homepage-saa/technical-spec.md`](spec/homepage-saa/technical-spec.md)
- Testing topology: [`spec/system/architecture.md`](spec/system/architecture.md) § Testing Topology
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM · testPolicy `e2e-red-first`

## Overview

**Priority:** P1 · **Status:** pending

Install `@playwright/test`, configure it per the researcher-02 recipe, author the durable
screen-level E2E contract for `/`, and prove a genuine assertion RED. Nothing downstream starts
until this phase records valid RED evidence.

## Key Insights

- No test runner exists. `e2e/` is empty. `tsconfig.json` `include` already covers `e2e/**/*.ts`
  and eslint does not ignore `e2e/` — neither file needs changing.
- `NEXT_PUBLIC_*` is frozen at server-process start, so the valid-env and invalid-env code paths
  need **two** `webServer` entries on two ports (3000 / 3100), not one server with a swapped var.
- The "event already started" zero state does **not** need a third server — Playwright's Clock API
  fast-forwards on the port-3000 server. Verify the exact Clock method names against the installed
  package's `.d.ts`; those names have shifted across 1.4x releases.
- The scaffold `app/page.tsx` still renders the Next.js starter, so every homepage assertion fails
  on content — that is exactly the genuine RED this gate wants.
- Role and locale must be steerable from the test without another server. Both providers read
  `localStorage` first (`saa.mock-role`, `saa.mock-unread`, `saa.locale`), env second, default third
  — so `page.addInitScript()` drives guest/user/admin and vi/en on the single port-3000 server.
  This is the seeding contract Track B implements; the RED spec is written against it now.
- Track B needs a fast pure-function TDD loop. A second, webServer-free config
  (`playwright.unit.config.ts`, `testDir: './lib'`) prevents two Next dev servers booting on every
  unit run — which would otherwise manufacture false REDs in Track B.

## Requirements

**Functional**
- One durable screen-level contract for `/`, expressed as `e2e/homepage.spec.ts` (project
  `chromium`, valid env) plus its invalid-env sibling `e2e/homepage-invalid-env.spec.ts` (project
  `invalid-env`) — the same contract in the two env states the recipe defines.
- Assertions derive from the 62 test cases **plus** the resolved clarifications. Frame copy wins:
  event info is `26/12/2025` · `Âu Cơ Art Center` · `Tường thuật trực tiếp qua sóng Livestream`;
  hero label is `Coming soon` (not the frame's "Comming soon"); nav label is `Award Information`;
  footer copyright is `Bản quyền thuộc về Sun* © 2025`.
- **TC ID-14 must not be asserted** — it is stale.
- Hover/focus/pressed-only rows (ID-23, ID-46, ID-51) stay out of the E2E and are validated
  visually in Phase 4.

**Non-functional**
- Locators are user-facing (`getByRole`, `getByText`), never CSS/XPath.
- Web-first auto-retrying `expect()` only — no `waitForTimeout`, no `waitForLoadState('networkidle')`
  (RSC streaming and the dev overlay make it unreliable).
- Do not shorten `webServer.timeout` (120s) or the default navigation timeouts; Turbopack's
  first-compile latency lives inside them.

## Architecture

```
playwright.config.ts
├── project chromium    → baseURL :3000  ← webServer `next dev --port 3000`
│                                          env NEXT_PUBLIC_EVENT_START_AT=2026-12-19T18:30:00+07:00
│      e2e/homepage.spec.ts   (counting state, clock fast-forward → zero state, all nav/UI contract)
└── project invalid-env → baseURL :3100  ← webServer `next dev --port 3100`
                                           env NEXT_PUBLIC_EVENT_START_AT=not-a-date
       e2e/homepage-invalid-env.spec.ts  (BR-003 fallback zero state, no crash)

playwright.unit.config.ts   → testDir './lib', testMatch /\.test\.ts$/, NO webServer  (Track B loop)
```

State steering inside a spec: `page.addInitScript()` writes `saa.mock-role` / `saa.mock-unread` /
`saa.locale` into `localStorage` before the app boots; providers read them on mount.

## Related Code Files

**Create:** `playwright.config.ts`, `playwright.unit.config.ts`, `e2e/homepage.spec.ts`,
`e2e/homepage-invalid-env.spec.ts`
**Modify:** `package.json` (devDependency + `test:e2e`, `test:e2e:ui`, `test:unit` scripts),
`package-lock.json`, `.gitignore` (`test-results/`, `playwright-report/`)
**Delete:** none
**Must not touch:** `app/**`, `components/**`, `lib/**`, `public/**`, `next.config.ts`, `.env.example`

## Implementation Steps

1. `npm install -D @playwright/test` then `npx playwright install chromium` (chromium only —
   `--with-deps` is CI-Linux only, a no-op on macOS).
2. Write `playwright.config.ts` exactly per researcher-02 §2 (two projects, two `webServer` entries,
   `testDir: './e2e'`, `reporter: 'list'`, CI retries 2 / workers 1).
3. Write `playwright.unit.config.ts`: no `webServer`, `testDir: './lib'`, `testMatch: /\.test\.ts$/`.
4. Add the three scripts to `package.json`. Add `test-results/` and `playwright-report/` to `.gitignore`.
5. Confirm the installed Clock API surface by reading `node_modules/@playwright/test` types before
   using it. Do not guess method names.
6. Author `e2e/homepage.spec.ts` in describes: structure & copy · countdown · navigation ·
   dropdown behaviour · role gating · awards grid & hash anchors · widget · footer.
7. Author `e2e/homepage-invalid-env.spec.ts`: page renders, countdown shows the zero state, no
   uncaught page error and no error-boundary text.
8. Run the exact command below. Confirm stdout carries a `\d+ (passed|failed)` summary line —
   that line is the bright line between a real assertion result and infrastructure noise.
9. Record `redTestFiles`, `redCommand`, `redExitCode`, `redFailure` (verbatim first failing
   assertion, with file:line) into `plans/reports/`. These pass read-only into Phases 2 and 3.

**redCommand (exact):**
```
npm run test:e2e -- e2e/homepage.spec.ts e2e/homepage-invalid-env.spec.ts
```

## Todo List

- [x] Install `@playwright/test` + chromium binary
- [x] `playwright.config.ts` (2 projects / 2 webServers)
- [x] `playwright.unit.config.ts` (no webServer, testDir `./lib`)
- [x] `package.json` scripts + `.gitignore` entries
- [x] Verify Clock API names against installed `.d.ts`
- [x] `e2e/homepage.spec.ts`
- [x] `e2e/homepage-invalid-env.spec.ts`
- [x] Run redCommand; confirm the `N passed/failed` summary line exists
- [x] Record redTestFiles / redCommand / redExitCode / redFailure to `plans/reports/`
- [x] `npm run lint` once over `e2e/`; add an eslint ignore only if a rule genuinely misfires

## Success Criteria

- `npm run test:e2e -- e2e/homepage.spec.ts e2e/homepage-invalid-env.spec.ts` exits non-zero **and**
  prints a test-results summary line, a failing test title with file:line, and an
  `expect(...)`-shaped actual-vs-expected diff.
- A `test-results/` artifact exists for the failing test (independent proof the test executed).
- `redFailure` names a **screen assertion** (e.g. `ROOT FURTHER` heading absent), not a missing
  module, a browser binary, a port, a boot timeout, or a TS diagnostic.
- The two specs together assert: **ID-0, ID-1, ID-5, ID-6, ID-7, ID-8, ID-9, ID-10, ID-11, ID-12,
  ID-13, ID-15, ID-16, ID-17, ID-18, ID-19, ID-20, ID-21, ID-22, ID-24, ID-25, ID-26, ID-27, ID-28,
  ID-29, ID-30, ID-31, ID-32, ID-33, ID-34, ID-35, ID-36, ID-37, ID-38, ID-39, ID-40, ID-41, ID-42,
  ID-43, ID-44, ID-45, ID-47, ID-48, ID-49, ID-50, ID-52, ID-53, ID-54, ID-55, ID-56, ID-57, ID-58,
  ID-59, ID-60, ID-62**. Excluded by policy: ID-23, ID-46, ID-51 (hover-only → Phase 4). Excluded as
  stale: **ID-14**.
- `npm run lint` passes with the new files present.

## Risk Assessment

| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| False RED from browser binaries / boot timeout / EADDRINUSE / TS error | Med | High | Gate on the `\d+ (passed\|failed)` summary line; fix infrastructure and re-run before declaring RED |
| A stray `next dev` on :3000 gets reused (`reuseExistingServer: !isCI`) and serves the wrong tree | Med | High | Kill stray dev servers before the run; confirm the page under test is the repo's build |
| Clock API method names differ from the researched recollection | Med | Low | Read the installed `.d.ts` first (step 5) |
| ID-39 (tick after 1 minute) makes the suite slow or flaky in real time | Med | Med | Assert the tick via Clock fast-forward, never a real 60s wait |
| Test asserts stale ID-14 event copy and stays red forever | Low | High | ID-14 is on the explicit exclusion list; frame values are quoted in this phase file |
| `--project=unit` runs would boot both dev servers | Med | Med | Separate `playwright.unit.config.ts` with no `webServer` |

## Security Considerations

The mock session is client-side and is **not a security boundary** — anyone can set
`localStorage['saa.mock-role'] = 'admin'` from DevTools. The E2E asserts UI visibility per role and
must not be written or read as evidence of access control. No secrets belong in
`playwright.config.ts`, the specs, or `.gitignore`d artifacts; `NEXT_PUBLIC_EVENT_START_AT` is a
public event date, nothing more.

## Next Steps

On valid RED, release Phase 2 and Phase 3 **concurrently**, passing `redTestFiles`, `redCommand`,
`redExitCode`, `redFailure` read-only to both. On repeated false RED, report BLOCKED with the
failure signature rather than weakening an assertion.
