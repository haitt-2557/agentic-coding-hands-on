---
phase: 1
title: "Strict RED E2E contract for /awards"
owner: tester
status: completed
priority: P1
effort: 2.5h
feature: F012
test_policy: e2e-red-first
depends_on: []
blocks: [2, 3, 4, 5]
---

# Phase 1 — Strict RED Gate (BLOCKING)

## MoMorph refs

- Hệ thống giải (Award System): https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- Clarifications: [`clarifications.md`](clarifications.md)
- testPolicy: `e2e-red-first`

## Context Links

- 15 test cases: `mcp__momorph__download_test_cases(screen_id='zFYDgyj_pD', format='csv')` — **not yet on
  disk**; this phase downloads it to `design/test-cases-zFYDgyj_pD.csv`
- Acceptance criteria, already mapped to TC IDs: [`evidence/study-context.json`](evidence/study-context.json)
- Decisions: [`clarifications.md`](clarifications.md) (decision 2 makes ID-1 unassertable; decision 3 adds scrollspy)
- Verification codes: [`spec/award-system-page/technical-spec.md`](spec/award-system-page/technical-spec.md) SC-001..SC-005
- Frozen names + scroll contract: [`plan.md`](plan.md) § Integration contract
- Verbatim copy: [`design/award-copy.md`](design/award-copy.md)
- House style: `e2e/homepage-awards-grid.spec.ts`, `e2e/login-screen.spec.ts`, `e2e/support/seed-defaults.ts`

## Overview

**Priority:** P1 · **Status:** pending

One durable screen-level E2E spec for `/awards`, written from the 15 test cases plus the resolved
clarifications, run with the exact project command `npm run test:e2e`. It must go RED on real screen
assertions before Track A or Track B is released.

## Key Insights

- **The default project would run this spec against a locked launch gate.** `prelaunch-gate`'s
  `testMatch` is a negative lookahead that `awards-page.spec.ts` matches, and its `baseURL` is port 3000
  whose `NEXT_PUBLIC_EVENT_START_AT` is future-dated. `/awards` is **not** in `ALWAYS_ALLOWED`
  (`lib/prelaunch/gate.ts:19`), so every request would 307 to `/prelaunch`. That is a failure no
  implementation can ever fix — an invalid RED. The spec belongs on port 3200 (past-dated, unlocked,
  `next build && next start`), which is where the homepage suites already prove `/awards` reachable.
- **Two config edits, not one.** Adding an `awards-page` project is not enough: without also adding
  `.*awards-page` to `prelaunch-gate`'s lookahead the file runs twice — once correctly at 3200 and once
  doomed at 3000. The config's own comment on `homepage-invalid-env` records this exact trap.
- **Today's RED is clean and content-shaped.** `app/awards/page.tsx` already returns 200 with an `<h1>`
  reading `Award Information` and six short-description sections, so failures land on missing nav, missing
  hero, missing title block and wrong copy — never on a 404 or a redirect.
- **The nav item and the section heading share a name.** Both read e.g. `Top Talent`. Query by role
  (`link` vs `heading`) and never by bare text. `MVP (Most Valuable Person)` needs its parentheses escaped
  in any regex.
- **The scrollspy assertions must be web-first.** `IntersectionObserver` resolves a frame or two after the
  scroll settles; `expect(locator).toHaveAttribute('aria-current', 'location')` auto-retries, a bare
  `getAttribute` does not. No `waitForTimeout`.
- **BR-003 is observable as a URL assertion.** After clicking a nav item from a clean `/awards` load, the
  URL must still be `/awards` with no hash. That single assertion pins both the `preventDefault` decision
  and the "scrolling never rewrites the hash" rule.

## Requirements

**Functional** — assertions in scope, with the test case and requirement each answers:

| # | Assertion | Covers |
|---|---|---|
| A1 | `/awards` returns 200 and renders header, hero, title block, nav, six award sections, Kudos block and footer in that document order; the placeholder `<h1>Award Information</h1>` is gone | ID-0, ID-3, FR-001, SC-001 |
| A2 | On `/awards` the header link `Award Information` carries `aria-current="page"`; on `/` it is `About SAA 2025` that carries it | ID-2, FR-002 |
| A3 | Title block: muted `Sun* Annual Awards 2025` above the gold heading `Hệ thống giải thưởng SAA 2025` | ID-4, FR-003 |
| A4 | The nav renders exactly 6 links, in `AWARDS` order: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP (Most Valuable Person) | ID-5, FR-006, BR-001 |
| A5 | Each of the six sections carries its frame-verbatim `<h2>`, long description, `Số lượng giải thưởng:` + value + unit, and `Giá trị giải thưởng:` + amount(s); Signature shows two prize lines joined by `Hoặc`; Best Manager and MVP show no note row | ID-6, FR-004, SC-002 |
| A6 | Each section renders its award graphic with `alt` equal to the award title | ID-7, FR-005, BR-004 |
| A7 | Click a nav item → its section is scrolled into the viewport, that item gains `aria-current="location"`, the previously active item loses it, **and `page.url()` still has no hash** | ID-9, ID-11, FR-007, BR-002, BR-003, SM-001 |
| A8 | Scroll the page manually (`window.scrollTo` to a later section, no click) → the active nav item follows without any click | FR-008, decision 3, SM-001 |
| A9 | `goto('/awards#mvp')` → the MVP section is in view and the MVP nav item is already active on load; scrolling away then back never rewrites the hash to another slug | FR-008, BR-003, ID-47-52 regression |
| A10 | `goto('/awards#khong-ton-tai')` → no console error, `window.scrollY` still 0, no nav item carries `aria-current` | ID-13, FR-009, SC-004 |
| A11 | The Kudos block shows `Phong trào ghi nhận`, `Sun* Kudos`, its body and `Chi tiết`; the CTA navigates to `/kudos` | ID-8, ID-12, FR-010, FR-011, SC-005 |
| A12 | All six `#<slug>` section ids exist in the **server-rendered** HTML (`page.request.get('/awards')` body contains `id="top-talent"` … `id="mvp"`) | homepage ID-47-52, ID-62 regression |
| A13 | No uncaught page error on load | house pattern |

**Explicitly out of E2E scope, and why**
- ID-1 (unauthenticated redirect to login) — route protection is deferred (`clarifications.md` decision 2).
- ID-10 nav hover highlight — CSS-only; Phase 4 visual validation owns it.
- Responsive behaviour below 1440px — derived, not designed (defect #4); Phase 4 capture owns it.
- Gold-and-underline styling of the active item — the semantic marker is asserted here, the pixels in Phase 4.

**Non-functional**
- The 13 pre-existing spec files must report the same pass counts after this phase.
- `e2e/awards-page.spec.ts` under 200 lines. No new helper unless one is genuinely shared.
- `e2e/support/seed-defaults.ts` is reused read-only (locale `vi`), never edited.

## Architecture

```
playwright.config.ts
  projects[prelaunch-gate].testMatch  += `|.*awards-page`   (lookahead — stop the double run)
  projects[awards-page]  = { testMatch: /awards-page\.spec\.ts$/,
                             use: { baseURL: 'http://localhost:3200' } }   # past-dated, gate OPEN

e2e/awards-page.spec.ts
  beforeEach seedDefaultSession (locale vi, role guest)
  describe Layout & copy      -> A1, A3, A5, A6, A11, A13
  describe Header current-page-> A2       (visits '/' and '/awards')
  describe Category nav       -> A4, A7, A8
  describe Deep links & hash  -> A9, A10, A12
```

## Related Code Files

**Create:** `e2e/awards-page.spec.ts`, `design/test-cases-zFYDgyj_pD.csv`, `evidence/red-gate-evidence.md`
**Modify:** `playwright.config.ts` (one new project + one lookahead term — nothing else)
**Delete:** none

## Implementation Steps

1. Download the test cases to `design/test-cases-zFYDgyj_pD.csv` via
   `mcp__momorph__download_test_cases(screen_id='zFYDgyj_pD', format='csv')`. If the download fails, do not
   stall: `evidence/study-context.json` already carries every acceptance criterion with its TC ID. Record
   which source was used.
2. Read every row against the A1–A13 table. Any row that maps to nothing must be either added to the table
   or listed under "out of scope" with a reason — no silent drops.
3. Edit `playwright.config.ts`: add `|.*awards-page` inside the `prelaunch-gate` negative lookahead, then
   append an `awards-page` project with `testMatch: /awards-page\.spec\.ts$/` and
   `baseURL: 'http://localhost:3200'`. Add a comment saying why 3200 and not 3000 (the gate). Touch nothing
   else — no new `webServer`, port 3200 already exists.
4. Write `e2e/awards-page.spec.ts` per the architecture sketch. Use role queries throughout; copy every
   Vietnamese string from `design/award-copy.md`, never retype it from the frame image.
5. Run `npm run test:e2e`. Record the true exit code — do not paraphrase it.
6. Classify every `awards-page` failure. A valid RED is a missing element or wrong copy **on a 200 response
   from `/awards`**. A 307 to `/prelaunch`, a missing-browser error, a webServer timeout, a build failure or
   a module-resolution error is **not** a valid RED — fix the cause and re-run.
7. Confirm the 13 pre-existing spec files still pass at their previous counts; a regression here is a defect
   in step 3, not in the app.
8. Write `evidence/red-gate-evidence.md` with `redTestFiles`, `redCommand`, `redExitCode`, `redFailure`
   (the verbatim first failing assertion), the per-file pass counts of the untouched suites, and the A1–A13
   → test-name map.

## Todo List

- [x] `design/test-cases-zFYDgyj_pD.csv` downloaded (or the fallback source recorded)
- [x] Every test-case row mapped to an assertion or an explicit out-of-scope reason
- [x] `playwright.config.ts`: `awards-page` project at 3200 + lookahead term added
- [x] `e2e/awards-page.spec.ts` covering A1–A13, under 200 lines
- [x] `npm run test:e2e` executed; exit code recorded verbatim
- [x] Every awards failure classified as a genuine screen assertion on a 200 response
- [x] 13 pre-existing spec files still green at their previous counts
- [x] `evidence/red-gate-evidence.md` complete with the four `red*` fields

## Success Criteria

| # | Observable |
|---|---|
| SC1-1 | `npm run test:e2e` exits non-zero |
| SC1-2 | Every `awards-page.spec.ts` failure names a missing element or wrong copy on a 200 `/awards` — zero redirect, browser-install, build or dev-server failures |
| SC1-3 | `awards-page.spec.ts` appears under exactly one project in the reporter output |
| SC1-4 | The pre-existing spec files report the same pass counts as before this phase |
| SC1-5 | `evidence/red-gate-evidence.md` carries `redTestFiles`, `redCommand`, `redExitCode`, `redFailure` |
| SC1-6 | A1–A13 each map to at least one named test in the file |

## Risk Assessment

| # | Risk | L×I | Countermeasure |
|---|---|---|---|
| R1 | The spec runs at port 3000 and the whole RED is a `/prelaunch` redirect — a gate that never opens | High × High | Step 3's two edits, proven by SC1-2 and SC1-3. This is the single most likely way to waste the phase. |
| R2 | The lookahead is edited but the new project is forgotten (or vice versa) → the file runs twice or not at all | Med × High | SC1-3 checks the reporter, not the config diff. Zero runs is as bad as two. |
| R3 | Assertions are written against the *placeholder's* markup and pass by accident | Med × High | Step 4 writes assertions only from `design/award-copy.md` + the frozen names in `plan.md`. Any test that is green in the RED run is reported in the evidence and re-examined. |
| R4 | Scrollspy assertions flake because the observer has not fired | High × Med | Web-first `toHaveAttribute` retries only; no `waitForTimeout`, no manual polling. If a case still flakes, assert after `scrollIntoViewIfNeeded` on the target section rather than raising a timeout. |
| R5 | Nav link and section heading collide in a locator | Med × Med | Role-scoped queries plus a `nav` container locator; regex-escape `MVP (Most Valuable Person)`. |
| R6 | Port 3200 runs a **built** server, so a Track A type error blocks the whole run later | Med × Med | Expected and correct: Phase 4 wants build-level truth. Track A and B each run `npx tsc --noEmit` before hand-off so the build failure surfaces in their phase, not here. |
| R7 | Tests are later weakened to make Phase 4 pass | Low × High | Phase 4 may only re-run this command; SC4-2 diffs the spec file. Any assertion change must be re-argued here and re-evidenced. |

## Security Considerations

- The page is public and has no data layer; no credential, cookie or key enters this spec.
- `seedDefaultSession` writes only mock locale/role keys to `localStorage` — it is not an auth boundary and
  must not be mistaken for one.
- Nothing in the spec asserts route protection; ID-1 stays visibly unasserted so no reader infers `/awards`
  is gated.

## Next Steps

Releases Phases 2 and 3 concurrently. Hand both tracks read-only: `redTestFiles`, `redCommand`,
`redExitCode`, `redFailure`, and the accessible-name + scroll freeze from `plan.md`.

## Rollback

Delete `e2e/awards-page.spec.ts` and revert the two `playwright.config.ts` edits. The pre-existing suite is
untouched.
