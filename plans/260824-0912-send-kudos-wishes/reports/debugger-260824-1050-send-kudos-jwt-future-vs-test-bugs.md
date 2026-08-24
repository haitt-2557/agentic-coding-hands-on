## Status: DONE_WITH_CONCERNS

## Summary
The premise ("JWT issued at future" in `listHashtags()` causes all 7 failures) does **not**
reproduce. Two clean, independent `npm run test:e2e -- --project=send-kudos` runs both produced
the identical 7 failures with **zero** occurrences of "JWT issued at future" or "Failed to load
hashtags" in the webServer log, and every failing test's DOM snapshot shows the hashtag picker
fully loaded (`button "Hashtag Tối đa 5"`). Each of the 7 failures has its own independent,
verifiable cause **in the e2e test files**, unrelated to Supabase/JWT. No app/lib code was
changed — there is no evidence any exists to fix there.

## Evidence chain

### 1. Clock skew, fully ruled out (including the two containers the prior pass couldn't reach)
```
$ docker exec supabase_auth_agentic-coding-hands-on date -u   → Mon Aug 24 03:53:17 UTC 2026
$ date -u (host)                                              → Mon Aug 24 03:53:17 UTC 2026
$ curl -sI http://127.0.0.1:54421/auth/v1/health | grep Date  → Date: Mon, 24 Aug 2026 03:53:30 GMT
$ curl -sI http://127.0.0.1:54421/rest/v1/       | grep Date  → Date: Mon, 24 Aug 2026 03:53:30 GMT
$ date -u (host)                                              → Mon Aug 24 03:53:30 UTC 2026
```
`supabase_auth` (GoTrue, mints `iat`) and `supabase_rest` (PostgREST, validates `iat`) both match
the host clock to the second. Combined with the prior pass's db/studio/pg_meta/edge_runtime/
storage check, **every container in this stack has an identical clock**. Persistent skew is
eliminated as a live cause.

### 2. A freshly minted, correctly-shaped token is accepted by both `profiles` and `hashtags`
Minted a session exactly as `e2e/support/supabase-session.ts` does (same `createServerClient`
call, same capturing cookie adapter), decoded the access token:
```
iat: 1787543798, exp: 1787547398   (exp - iat = 3600 = config.toml jwt_expiry, as expected)
```
Fed the resulting cookie into a single curl request to the built `/kudos/send` page (port 3200):
`HTTP_STATUS:200`, no error string anywhere in the response or server log.

### 3. Concurrency stress does not reproduce it either
Minted 15 independent sessions concurrently (mirroring 15 parallel Playwright workers each
running `seedSupabaseSession`) and fired all 15 `/kudos/send` requests at once: `15/15` returned
200 with no server-log error. This directly tests the "two `createServerClient()` instances in
one `Promise.all` racing a token refresh" hypothesis under load — it does not fire.

### 4. Two full, real E2E runs — same 7 failures, no JWT error, hashtags visibly loaded
```
$ npx playwright test --project=send-kudos --reporter=list   (run 1)
$ npx playwright test --project=send-kudos --reporter=list   (run 2, servers restarted)
```
Both runs: **17 passed / 7 failed**, the identical 7 test names both times. `grep -n
"WebServer.*Error\|Failed to load\|JWT issued\|⨯"` against both full run logs: **zero matches**.
Every failing test's Playwright `error-context.md` snapshot (captured at the moment of timeout)
shows the fully-populated form, including `button "Hashtag Tối đa 5"` — i.e. `listHashtags()`
had already returned 8 rows and the picker rendered correctly. If the render had actually thrown
on `Failed to load hashtags`, the whole RSC tree fails via the `Promise.all` reject and NONE of
`SiteHeader`/`SiteFooter`/the form fields would be in the snapshot — but they all are, on every
one of the 7 failures.

Note one caveat found in the process: a stray `next-server` process (PID 38387, 10+ min old, not
part of this investigation) was squatting on port 3000 and had to be killed before Playwright's
own webServer could bind it — flagged as environment noise, not a finding about the app.

### 5. The 7 failures, individually, with their real cause
| Test | Cause | Evidence |
|---|---|---|
| `send-kudos-submission.spec.ts:11`, `:39` (via `fillAllRequiredFields`), `send-kudos-submit.spec.ts:11`, `send-kudos-validation.spec.ts:93` | `e2e/support/send-kudos-form.ts`'s `selectFirstHashtag()` (line 44-49) looks for `[role="option"]` **without ever clicking the "Hashtag" button first** to open the picker. `send-kudos-interactions.spec.ts:38` (which passes) clicks `hashtagButton` before checking options — the helper skips that step. | Snapshot shows `button "Hashtag Tối đa 5"` present but closed; `[role="option"]` genuinely absent because the popover was never opened. |
| `send-kudos-validation.spec.ts:129` | `page.locator('text=Hashtag')` is a strict-mode violation: it matches both the field label `"Hashtag*"` and the button's accessible name `"Hashtag Tối đa 5"`. | Playwright's own error: `resolved to 2 elements`. |
| `send-kudos-layout.spec.ts:74` | Test asserts `text=Gửi ẩn danh`; the actual rendered label is `"Gửi lời cám ơn và ghi nhận ẩn danh"` (confirmed in `components/kudos/send/...` checkbox label and in the snapshot) — `"Gửi ẩn danh"` is not a substring of it. | Snapshot line: `text: Gửi lời cám ơn và ghi nhận ẩn danh`. |
| `send-kudos-interactions.spec.ts:102` | Test queries `page.locator('button')...`, but `components/kudos/send/image-attachments.tsx:90-96` implements "Thêm ảnh" as `<input type="file">` (not a `<button>` tag) — browsers expose file inputs with an implicit ARIA `button` role, which is why Playwright's *accessibility* snapshot shows `button "Thêm ảnh"`, but the CSS-tag locator `page.locator('button')` never matches an `<input>`. | Component source line 90: `<input type="file" ... aria-label={...} />`, no sibling `<button>`. |

## Root cause, stated plainly
**The 7 currently-failing tests are not downstream of any server-side query error.** They fail
because of five independent defects inside the e2e test suite itself (a shared helper missing a
click-to-open step, an ambiguous text locator, a wrong expected label string, and a tag-selector
that doesn't match the component's actual (input-based) markup). `listHashtags()` and
`listProfiles()` both succeed on every run I captured.

## Was the original "JWT issued at future" premise fabricated?
No reason to believe so — the error string is real PostgREST vocabulary (confirmed absent from
this repo's own source, i.e. not a fake/mocked string) and the debugging trail describing it
(clock checks, the profiles/hashtags asymmetry) is coherent. But it is **not currently
reproducible** and **not what is failing the suite now**. The most evidence-consistent
explanation for a one-off past occurrence: local Supabase runs inside a Docker Desktop VM on
macOS, and VM clocks are well known to drift or jump relative to the host across a sleep/resume
cycle — if GoTrue's clock resynced (jumped forward) via NTP microseconds before PostgREST's did,
a token minted in that window would carry an `iat` briefly ahead of PostgREST's own clock,
self-correcting within the same NTP cycle. That fits: (a) a single historical incident, (b) the
listProfiles/hashtags split not reproducing when clocks are aligned (proven above — both
succeed together, always, once alignment holds), and (c) my inability to reproduce it under
either single-request or 15-way-concurrent load once the containers have been running steadily.
I did not find, and did not introduce, any code-level fix for this, because there is no evidence
of a code defect to fix — the two containers whose clocks were previously unverified are now
verified identical to the host.

## Deterministic or a race — confirmed
**Deterministic**, but for a different reason than stated: the failing set is identical across
both runs (byte-for-byte the same 7 test names) because the causes are static test-code bugs, not
timing-sensitive server behavior. This *is* the resolution to the task's open question: the
"same 7 failing across runs" observation is real, but it is evidence of **static test defects**,
not proof that a JWT race is deterministic — a genuine clock-skew race would need to reproduce
under stress (it did not, per §3 above) to be called deterministic in the sense the task meant.

## Fix
**No app/lib change applied** — I found no reproducible defect there to fix, and changing
`lib/kudos/send/queries.ts` or `lib/supabase/server.ts` without evidence would be exactly the
kind of unproven "fix" this brief asks me not to make.

The real fix is entirely inside `e2e/**`, which is out of my file scope per this task (tester
owns those). Handing off precisely, so no further debugging pass is needed:
- `e2e/support/send-kudos-form.ts`: `selectFirstHashtag()` needs a
  `page.locator('button', { hasText: /Hashtag/ }).first().click()` (matching what
  `send-kudos-interactions.spec.ts:38` already does) before it looks for `[role="option"]`.
- `e2e/send-kudos-validation.spec.ts:129`: scope `text=Hashtag` to the field label specifically
  (e.g. exact match `'Hashtag*'` or a more specific locator), not a bare substring.
- `e2e/send-kudos-layout.spec.ts:93`: fix the expected string to the real label,
  `"Gửi lời cám ơn và ghi nhận ẩn danh"` (or a substring that's actually contained in it).
- `e2e/send-kudos-interactions.spec.ts:102`: locate the add-image control by
  `input[type="file"]` (as `send-kudos-interactions.spec.ts:81` already does), or by its ARIA
  role/name (`page.getByRole('button', { name: /Thêm|Add/ })`), not `page.locator('button')`.

## Monitoring/guard gap
None found to be actively hiding a server error right now, because there is no server error —
but the ORIGINAL premise (a thrown `Error: Failed to load hashtags: ...` reduces to 7 unrelated
"element not found" assertions) is itself the gap worth naming: `queries.ts`'s deliberate
"throw rather than return `[]`" design (its own header comment) is correct for turning a swallowed
error into a loud one, but the throw only reaches the **webServer stdout**, never the Playwright
report or the test's own failure message. A test whose form never rendered and a test whose form
rendered-but-has-a-bad-selector currently produce an *identical* `element(s) not found` failure
in the Playwright reporter. Concretely: add a `page.on('console')`/response-status assertion (or
a `test.beforeEach` that asserts the RSC response was 200, not a rendered error boundary) so a
genuine 500/thrown-render failure is distinguishable at a glance from a selector bug — this is
exactly the ambiguity that made the original premise plausible without the dev-server log line
in hand.

## Unresolved
- I could not force a reproduction of the original "JWT issued at future" string under any load
  I tried (single request, 15-way concurrent fresh sessions, two full suite runs). If it recurs,
  capturing the exact wall-clock timestamp of the failing request against `docker logs
  supabase_auth_agentic-coding-hands-on`/`supabase_rest_agentic-coding-hands-on` at that moment
  (not after the fact) is the only way to confirm or refute the Docker-VM-clock-jump theory above.
- Did not touch `e2e/**` per scope; the four fixes above are ready for the tester to apply verbatim.
