# Login screen shipped — but the guards caught what the suite missed

**Date**: 2026-08-19 17:25
**Severity**: medium
**Component**: login screen + Supabase auth, E2E test contract, proxy gate, asset handling
**Status**: resolved

## What Happened

Built the `/login` screen from MoMorph frame `GzbNeVGJHz` + local Supabase Google OAuth on branch `feat/login-supabase-auth` (4 commits: `be531fc`, `2c11005`, `fb36417`, `6075bf4`). Final gate: 69/69 E2E, 62/62 unit, typecheck and lint clean. Everything passed. Except three things that didn't show in any green light.

## The Brutal Truth

The RED contract was a trap. The tester submitted E2E assertions that Playwright could never satisfy — but they compiled and failed for the "right" reasons, so the gate accepted them. Two test failures during implementation looked like Track B bugs; one was a security shortcut waiting to happen, the other a port topology issue. And the keyvisual asset was signed off as "acceptable at all widths" while carrying a picture of the page inside itself — ghosting plainly visible in the 375px viewport, invisible to all 69 assertions because the DOM was correct. The discipline that mattered — reading the contract carefully, tracing failures to their real cause, looking at the actual pixels — isn't something a green build reports.

## Technical Details

### 1. The RED gate was structurally broken

**First submission rejected.** Assertions contained:
- `page.waitForFunction(() => interceptedRequest !== null)` — JavaScript closure variable referenced in browser context, `ReferenceError` every run
- `await new Promise(() => {})` — promise never resolves, holding route handler forever
- Playwright `:has-text()` selector passed to `document.querySelector()` — invalid CSS, `SyntaxError`
- Three assertions computing a locator then asserting nothing (`expect(undefined).toBeVisible()`)
- A1 assertion demanding a `heading` matching `/login|đăng nhập/i` — element does not exist in the design frame
- A9 as disjunction: `spinner || disabled` — should be conjunction, `spinner && disabled`
- A11 accepting either `/` or `/awards` — clarifications settled `/` only

These aren't environmental issues (colima down, browser crash, net error). They're contractual lies — tests that would fail no matter what code was written.

**Second submission accepted** after rewrite. But the gate never catches structural test defects by reading — only by running. And a suite that runs and fails *for the wrong reasons* is harder to debug than one that fails clearly.

### 2. Two E2E failures nearly became a security hole

**A9 (button loading state):** The test holds the `/auth/v1/authorize` request open to check the button's loading state. Because `signInWithOAuth` assigns `window.location` rather than issuing an XHR, that intercept is holding a *top-level navigation*, which parks the page mid-teardown and makes the button element unreachable. Real cause: the test's intercept strategy, not the component. Fixed by fulfilling with HTTP 204 No Content instead of holding — a 204 leaves the browser on the current document, so the page stays alive and `loading` is still true.

**A11 (authenticated redirect) — this is the one that nearly became a security hole.** An authenticated user visiting `/login` should redirect to `/`. The test ran on port 3000, where the prelaunch gate is locked and `/` is unreachable by definition, so the assertion could never pass there regardless of the code. The proposed fix was *"proxy to check auth state before applying the prelaunch gate"* — which would have made the launch gate auth-aware and let any signed-in user skip the launch lock entirely, the exact opposite of the recorded decision that the gate is launch *timing*, never authorization. Rejected. Real cause: test port topology. Re-homed to the existing unlocked-gate project on port 3200. Both fixes preserved their assertions unchanged, and the reviewer later confirmed independently that no auth awareness reached `gate.ts`.

### 3. A visual defect the suite couldn't see

The keyvisual asset was extracted as a crop of the *composited* frame render — so the title, copy, and button were baked into the image. At 1440px they sat exactly under the live DOM elements. At 375px the layout shifted and the baked content drifted, creating ghosting. All 69 assertions passed because the DOM was correct. Only pixel inspection caught the misalignment.

Fixed by reworking the asset as artwork-only (wave pattern alone), 2.2 MB → 468 KB, with a transparent dissolve at the left edge.

### 4. A defect the blueprint prevented (cookies)

`@supabase/ssr` writes refreshed session cookies onto the response it receives. The merged `proxy.ts` returned the prelaunch gate's own redirect response in some branches, which would have silently dropped those cookies — signing out authenticated users on every gated request. Named in the plan before implementation. Fixed by copying the refreshed cookies onto whatever response ships.

### 5. Two research facts that averted debugging cycles

Next 16 loads *exactly one* `proxy.ts` per project — not `middleware.ts`. Every tutorial using the deprecated convention would have shipped non-functional code.

Supabase `additional_redirect_urls` matches by exact string. Mixing `localhost` and `127.0.0.1` causes silent oauth failures. Both facts documented, both acted on.

## What We Tried

1. **RED round 1:** Rejected. Rewrite assertions. Accepted round 2.
2. **A9 failure:** Traced to `window.location` navigation vs the intercept. Fulfilled with 204 instead of holding.
3. **A11 failure:** Proposed auth-aware gate (security shortcut). Rejected. Was port topology. Re-homed test.
4. **Keyvisual:** Passed visual validation (DOM correct). Caught on pixel inspection (misalignment at 375px).

## Root Cause Analysis

**The gate is not a guard for the things that matter.** An exit code of 1 is not a contract. A test that runs is not a test that passes for the right reasons. A green assertion is not visual correctness. The things that caught defects here — the careful reading that split A9 from A11, the pixel inspection that found ghosting, the plan that named the cookie risk before code — those aren't automated gates. They require a person who doesn't trust the build report.

## Lessons Learned

1. **Structural test defects need a lint pass before RED submission.** Pattern to catch: `page.waitForFunction` with closure variables, `new Promise(() => {})` with no resolve, selector syntax that is not valid CSS, assertions computing a value then asserting nothing. Should fail in CI before the test runs.

2. **When a test failure suggests changing a security boundary, the test is usually wrong.** The impulse to "make the gate auth-aware" was reasonable if A11's real cause were code. It was topology. This needs human judgment, not a rule.

3. **Exit code 1 is not a contract. The contract is readable — read it.** A valid RED requires the test file to be open-able, readable, and rationally structured. An exit code only proves the test ran.

4. **Visual validation on the DOM is not visual validation of pixels.** A green accessibility assertion, a correct locator, a properly positioned element — none of those catch baked ghosting. Need actual captures at all widths.

5. **Async OAuth flows in tests are fragile.** The interception+hold pattern breaks when the target uses `window.location`. Fulfill-immediately (204) is more robust.

## Next Steps

1. **Add pre-RED linting for test files.** Check for `page.waitForFunction(...=>...)` with closure refs, `new Promise(()=>{})` with no resolution, `:has-text()` or other Playwright syntax in `querySelector()`, assertions that compute but don't assert. Gate RED submission on this passing.
   - Assigned: orchestrator (add to create-plan)
   - Due: before next E2E feature

2. **Ship the real Google OAuth round trip.** Credentials not supplied; flow tested to `/auth/v1/authorize`, not beyond.
   - Assigned: user (supply credentials)
   - Due: whenever available

3. **Protect routes behind Supabase auth** and replace the mock session in next run. This run was login + session only.
   - Assigned: future implementer
   - Due: next phase

4. **Document the keyvisual asset export failure** (MoMorph returns 500/401 on both endpoints). If it's expected, record the workaround; if it's a defect, raise it.
   - Assigned: design owner or MCP maintainer
   - Due: clarification

---

**Status:** DONE
**Summary:** Login built and passing, but the three most interesting findings (broken contract, security near-miss, pixel defect) came from careful reading and pixel inspection, not from the green suite.

