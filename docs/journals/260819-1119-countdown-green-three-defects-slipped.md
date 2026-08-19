# Build xanh, nhưng ba lỗi vượt mặt ba agent

**Date**: 2026-08-19 10:59  
**Severity**: high  
**Component**: countdown / prelaunch gate, test authoring, linting  
**Status**: resolved (lỗi số 3 fix, mục 1-2 ghi nhận pattern)

## What Happened

Build countdown prelaunch page hoàn tất: 55 E2E pass, 40 unit pass, tsc/lint/build sạch, reviewer 8/10 với 0 critical. Nhưng orchestrator lục sâu vào evidence phát hiện ba lỗi thật sự đã thoát khỏi: (1) RED contract không thật RED vì xung đột port + assertions mâu thuẫn, (2) visual validation xanh nhưng against env sai, (3) lỗi logic mà không test nào trong suite bắt được.

Cái tệ nhất là hai trong ba lỗi đó **đã ghi nhận từ build trước** (`260818-0936-homepage-saa/clarifications.md` + `red-gate-evidence.md` line 56), và nó vẫn lặp lại ở track khác. Đó là trọng tâm của entry này.

## Điểm mấu chốt

Khoảng cách giữa cái từng agent report ("tất cả xanh") và cái thực sự xảy ra là quá lớn. Không phải đột biến lần này — nó là **failure mode hệ thống** trong quy trình kiểm tra, kéo dài ít nhất hai build. Cách sửa đã được **viết xuống** ở build trước, rồi vẫn lặp lại.

Điểm chung của cả ba lỗi: không cái nào lộ ra từ report của agent. Cả ba chỉ lộ khi có người chạy lại lệnh và đọc output thật. Một report "xanh" không phải bằng chứng — nó là một tuyên bố cần kiểm chứng.

## Technical Details

### 1. RED contract bị từ chối lần 1 — port conflict + assertions mâu thuẫn

**Submission 1 report:** "14 genuine assertion failures"

**Accepted:** 0 — bị reject vì 4 cái trong 14 là `net::ERR_CONNECTION_REFUSED`:

```
⨯ Another next dev server is already running.
  - Local: http://localhost:3000
  - PID:   65433
```

Lý do: Next.js 16 chỉ cho phép **một** `next dev` per project directory bất kể port. Tester muốn 3 server: 3000 (dev, gate đóng), 3100 (build, env invalid), 3200 (build, gate mở). Chiến lược là `next dev` cho cái đầu, `next build && next start` cho hai cái kia. Nhưng solution mở rộng port 3200 thành `next dev` thay vì `next build && next start` — không xảy ra được.

Fixed bằng cách gán `distDir` tách từng server:
- Port 3000: `.next`
- Port 3100: `.next-invalid-env`
- Port 3200: `.next-unlocked`

**Assertion defects cũng trong round 1:**

1. `try { await navigationPromise } catch {}` — nuốt lỗi
2. `expect(page.url()).toContain('/')` — luôn đúng (mỗi URL chứa dấu `/`)
3. `page.waitForRequest(req => req.url().includes('/'))` — thấy request đầu tiên bất kỳ (RSC prefetch, font, ảnh background) rồi xanh mà chưa thực thi unlock
4. Một test polling element `00MINUTES` sau khi nó bị xoá — đua với feature nó đang test
5. Spec file 227 dòng vi phạm rule "under 200"
6. Assertions mâu thuẫn: một test khẳng định digits hiện hành tại T-0, một khác khẳng định page redirect tại T-0 — không code nào satisfaction cả hai

Tester sửa lại (round 2 accepted).

### 2. Visual validation xanh trước env sai

Tester chạy Playwright visual validation. Kết quả: 0 console error, layout matching.

Nhưng screenshots lấy từ `next dev` **không có `NEXT_PUBLIC_EVENT_START_AT`**. 

`computeCountdown` code:
```typescript
if (isInvalid) return { days: '00', hours: '00', minutes: '00', isInvalid: true };
```

Vậy mọi digit = `00`. Layout vẫn đúng (boxes render), nhưng **rendering behavior không được chứng minh**.

**Điểm đáng chú ý:** `260818-0936-homepage-saa/clarifications.md` line 56 đã ghi rõ bài học này:

> "Suite từng xanh nhờ may. Config để `reuseExistingServer: !isCI`, mà `next dev` mở tay lúc visual validation không có `NEXT_PUBLIC_EVENT_START_AT`. Playwright mượn luôn server đó → `computeCountdown` trả `isInvalid` → "Coming soon" biến mất sau hydration..."

Fix: đổi `reuseExistingServer: !isCI` thành `reuseExistingServer: false`.

Đó là lần trước. Build này, **bài học vẫn bị lặp lại** — không ở test path (strict E2E), mà ở visual path (Playwright MCP visual validation). Vì sao không ai check? Vì assumption là "code đã done, visual chỉ kiểm asset coverage".

### 3. Countdown digit rendering — 122 ngày render thành 12

Spec: Days unit, "2-digit zero-padded (00-99)", hai digit boxes trong frame.

Code (trước fix):
```typescript
const [tens, ones] = String(days);  // destructuring '122' → tens='1', ones='2'
```

Result: `computeCountdown('2026-12-19T18:30:00+07:00', 2026-08-19)` → `{ days: '122', ... }`
Rendered: `12` (dropped `2`)

Shipped `.env.example` target: `2026-12-19T18:30:00+07:00` = 122 ngày. Vậy dev repo render DAYS = `12` — sai 110 ngày.

**Why not caught by E2E?** Mỗi clock instant trong suite nằm dưới 24 giờ từ target. Spec assertion: `expect(DAYS).toMatch(/^[0-9]{2}$/)` — pass vì `12` is 2-digit. Không test case nào chạm vào "122 days" scenario.

Fix: `capDisplayDays()` trong `lib/prelaunch/display.ts`:
```typescript
export const capDisplayDays = (days: number): string => {
  const capped = Math.min(days, 99);
  return String(capped).padStart(2, '0');
};
```

Plus: thay destructuring bằng map từng character, vậy extra digit sẽ **visible** (extra box) thay vì vanish.

### 4. Recurring pattern — vacuous assertions cross build

**Build này:** 3 lần:
- `try { await navigationPromise } catch {}` ← line 45
- `expect(page.url()).toContain('/')` ← line 67
- `page.waitForRequest(req => req.url().includes('/'))` ← line 89

**Build trước** (`260818-0936-homepage-saa/`):
- 8 assertions vô hiệu với `.catch(() => {})`
- 3 more empty: `expect(page).toBeTruthy()`, `expect(updatedText).toBeTruthy()`

**Pre-existing** (spotted now): `e2e/homepage-navigation.spec.ts:20` — `expect(page.url()).toContain('/')`

Grep sweep across codebase:
```bash
grep -r "\.catch\s*(\s*(\)\s*=>\s*{}\|\.catch.*{}" e2e/
```

Có **tối thiểu 12 patterns** như vậy. Cái gần nhất là lỗi **logic** chứ không phải "may mắn test". Nếu test fail được thì pass được, nhưng nó không fail được vì assertion vô nghĩa.

### 5. Deprecated convention — middleware.ts vs proxy.ts

Tester brief: "use `middleware.ts`"

Planner read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` (per `AGENTS.md` instruction).

Found: Next 16 **deprecated** `middleware.ts`, renamed to `proxy.ts`.

Implemented: `app/proxy.ts` (correct).

Cost: zero — nhưng rủi ro là nếu planner không read bundled docs, sẽ implement sai convention.

### 6. Reviewer finding — clock skew flicker

Client unlock guard:
```typescript
if (isExpired && !hasNavigated) {
  router.replace('/');
  setHasNavigated(true);
}
```

Hiện tượng: nếu user clock run ahead (user time > target), client redirect, server bounce back (gate still locked), remount, retry. Flicker cho toàn unlock window tại **đúng moment người xem countdown**.

Fix: `sessionStorage` throttle (30s):
```typescript
const lastNavigateTime = sessionStorage.getItem('prelaunch-last-nav');
const now = Date.now();
if (!lastNavigateTime || now - parseInt(lastNavigateTime) > 30000) {
  router.replace('/');
  sessionStorage.setItem('prelaunch-last-nav', String(now));
}
```

### 7. Other worth a note

**Gate broke homepage suite by design.** Port 3000 = future date ⇒ mọi homepage test redirect đến `/prelaunch`. Fix: re-point 40 homepage test từ port 3000 → 3200 (gate open). Không phải app change — topology re-point.

**Overlapping Playwright testMatch.** Config đặt `testMatch: ['e2e/**/homepage*.spec.ts']` + `['e2e/homepage*.spec.ts']`. Cùng file match hai pattern → chạy twice. Cái thứ hai cũng pass (countdown expired vs unparseable = same zero state), nên suite report 40+40 pass thay vì 40+1 dup.

**npm run lint died.** Config để `eslint` crawl toàn project. New `distDir` output (`.next-*/`) bị vào scan → 7,308 problems (99% unrelated), gate lint coi như vô nghĩa. Fix: thêm `globalIgnores` cho `.next-*/**`, `plans/**`, `.claude/**`.

**Digital Numbers font missing.** Spec item: "Figma font 'Digital Numbers' (seven-segment LED)". User chưa supply file. `@font-face` fallback → monospace. 404 per load, expected. Zero code change khi file land.

## What We Tried

1. **RED round 1:** Rejected. Fixed port conflict → isolated distDir. Fixed assertions → removed catch swallows, fixed always-true patterns, deleted racy test, resolved contradictions.
2. **Visual validation:** Passed (0 errors). Didn't validate the env var was set — learned from prior session's clarifications but applied to wrong layer.
3. **Unit tests:** 40/40 pass. Didn't include "122 days" edge case because spec assertion pattern matches 2-digit output regardless.
4. **Assertion sweep:** Found 12+ vacuous patterns but after build was green. Was a post-review, post-implementation discovery.
5. **Lint:** Configured without `.next-*` exclusion → gate rendered noise. Re-ran after exclusion → clean.

## Root Cause Analysis

### Defect 1 & 2 — Test authoring failure mode (recurring across sessions)

Pattern: **Assertions that cannot fail.**

Why: No automated sweep during RED gate. Tester knows shape (try/catch, toContain('/'), etc.) but **no lint rule** flags them. They pass validation because the suite structure is correct; they just assert nothing.

**The meta-failure:** Prior session's clarifications.md documented this *exact* bug and the fix (reuseExistingServer: false). But:
- Documentation went to `clarifications.md` (one-off design notes)
- Fix was applied to E2E runner (`playwright.config.ts`)
- Visual path (different validation step) reused the same stale config
- No grep sweep was runnable as a gate — defect had to be caught by reading

Why it recurs: **No automatic guard.** If there were a `grep` rule in the lint gate that failed on `\.catch\s*(\s*(\)\s*=>\s*{}`, defect 1 (and pre-existing defect in homepage-navigation) would have been caught at RED stage. Defect 2 (env var not set) would require a `playwright.config.ts` validation check or env-var override.

### Defect 3 — Edge case unreachable by test

Why not caught: Test clock sits **under 24h from target**. Spec is 2-digit zero-padded; test regex matches any 2-digit output. Real bug requires 99+ days remaining.

Fix was right — cap at 99 per spec — but the **discovery method** was manual inspection, not test-first. If there were a **generator** that emitted Playwright test instants from spec bounds (00 days, 99 days, 100 days), edge case would have surfaced in RED.

### Recurring pattern — systemic in test-authoring

Why happens repeatedly: No linting on test files. ESLint rules exist for app code; they don't exist for `e2e/**`:
- No rule flags `expect(X).toBeTruthy()` when X is derived from a selector that might be falsy
- No rule flags `.catch(() => {})` on promise chains in tests
- No rule flags `.toContain('/')` when it's always true

**Why it spread:** Each session author independently wrote tests, independently made the same mistake, and independently saw them pass locally (because nothing failed). A cross-session sweep of `red-gate-evidence.md` + `clarifications.md` from prior builds would have shown the pattern — but there's no **escalation** between sessions.

## Lessons Learned

### 1. Vacuous assertions need a lint sweep as a RED-gate prerequisite

Pattern to catch:
```
grep -E '\.catch\s*\(\s*\(\)\s*=>\s*\{\s*\}|expect\([^)]*\)\.toBeTruthy\(\)|\.toContain\(["\']\/["\']' e2e/**/*.spec.ts
```

Should fail in RED-gate CI, not after implementation. Orchestrator already sweeps for this when reviewing RED — **automate it**.

### 2. Environment-var validation for visual testing

Prior session's fix was `.reuseExistingServer: false` to force a clean server per run. Applies to visual path too. Check:
- In `playwright.config.ts`, any `webServer` entry that runs visual validation must either (a) set env vars explicitly in the config, or (b) reuse false.
- Document: "Visual validation runs against a fresh server with explicit env vars, never a stale dev server."

### 3. Edge-case test generation from spec bounds

Spec says "00-99". E2E test clock should tick through at least: 00 days, 99 days, 100 days (overflow case). If generator emitted test instants from spec CSV bounds, overflow would surface.

Tool: parse `clarifications.md` "Extracted design values" section, emit Playwright test instants. Cost: small. Payoff: edge cases visible without manual inspection.

### 4. Cross-session pattern escalation

The identical bug (vacuous assertions, reuseExistingServer) appeared in homepage-saa and countdown-prelaunch **builds two days apart**. The lesson was written; the mistake repeated.

**Action:** At end of each RED gate, if defects are found and fixed, search prior sessions' clarifications/evidence for the same pattern. If found 2+ times, **escalate to development-rules.md** as a standing guard for future builds.

Current instance: `//. KNOWN ANTI-PATTERN: vacuous test assertions across X,Y,Z builds. Scout these in RED before implementation: ...`

### 5. Middleware → Proxy convention was caught because planner read bundled docs

Reinforces: `AGENTS.md` instruction to read `node_modules/next/dist/docs/` is load-bearing. Without that read, wrong convention ships. Make sure plan briefing says "read the bundled Next docs for file conventions" explicitly, or planner may skip it.

## Next Steps

1. **Add lint rule for vacuous assertions** — new ESLint rule or pre-commit script that greps for `.catch(() => {})`, `.toBeTruthy()` on selector results, `.toContain('/')`. Gate RED submission on this passing.
   - Assigned: orchestrator (add to RED gate checklist in `create-plan`)
   - Due: before next E2E feature
   - Evidence: grep rule in CI logs

2. **Playwriteconfig env-var validation** — document and verify: every `webServer` entry used for visual validation must set env vars in config or reuse false. Add comment block to `playwright.config.ts`.
   - Assigned: developer (on review of next playwright.config change)
   - Due: standing rule, not retroactive
   - Evidence: playwright.config.ts comment + next code review

3. **Cross-session pattern search** — after fixing defects in RED round 1, grep prior sessions for same pattern. If 2+ hits, escalate to development-rules.md.
   - Assigned: orchestrator (when defects are found)
   - Due: within same build
   - Evidence: development-rules.md update

4. **Spec-bounds test generation** — parse clarifications.md, emit test instants for edge cases (00 days, 99 days, 100 days, etc.). Pilot on next countdown-like feature.
   - Assigned: planner or tester (spec research phase)
   - Due: planning phase, before RED authoring
   - Evidence: new generator script in `lib/test-utils/spec-bounds.ts`

5. **Supply Digital Numbers font** — design owner to provide `.ttf` or `.woff2` file, licence check.
   - Assigned: design owner
   - Due: whenever available
   - Evidence: file in `public/fonts/`

---

**How this land:** The code built fine and tests passed. But three real defects — two **systemic patterns that recurred across sessions**, one **logic edge case invisible to test scope** — slipped through because:

1. No automated guard for vacuous assertions in RED.
2. Visual validation reused stale config from prior session's fix, and the fix was documented in one place, applied in another, missed in a third.
3. Test scope (0-24h clock) matched spec assertion pattern (2 digits) but didn't cover spec bounds (0-99 days).

The _actual_ lesson is not "use cap() on days" — it's that **three agent sign-offs ("tester: RED valid", "UI: visual pass", "implementation: unit pass") did not constitute "the feature works correctly."** The orchestrator's post-implementation sweep caught what the agents' own checklists missed.

That sweep shouldn't be manual. Grep rule, env-var check, spec-bounds generator, prior-pattern search — these should be **automated gates** between RED and GREEN, not orchestrator initiative.
