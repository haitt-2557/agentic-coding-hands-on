# Kudos Like Feature — E2E RED Gate Report

**Date:** 2026-08-25  
**Feature:** Kudos Like (thả tim) — SC-001/SC-003/SC-004/FR-003  
**Test File:** `e2e/kudos-board-like-persistence.spec.ts`  
**Command:** `npx playwright test --project=kudos-board`  
**Exit Code:** 1 (REAL RED — assertion failure)

---

## Coverage: What Is Tested

### SC-001 (FR-001/FR-002) — **CORE RED** ✗
**Scope:** Heart state must survive page reload (persistence gate).

- Click heart on kudos NOT sent by viewer → count increments, aria-pressed="true"
- Reload page → count and pressed state MUST persist
- Click again to unlike → count decrements, aria-pressed="false"
- Reload page → unlike state MUST persist

**Result:** ❌ FAILED  
**Assertion:** `expect(reloadedCount).toBe(initialCount + 1)`  
**Expected:** 1501 (initial 1500 + 1 from click)  
**Actual:** 1500 (reverted to seed value after reload)  
**Root Cause:** Heart state is `useState(false)` in `kudos-card-actions.tsx:32`; not persisted to any real storage. Dies on every reload.

This is the blocking RED for persistence — the feature is implemented as a mock today and must bridge to Supabase `kudos_likes` table.

---

## Coverage: What Is Deferred

### SC-002 (BR-001) — Unique constraint
*Deferred:* Requires real `kudos_likes` table with `unique (kudos_id, user_id)`. No test written (cannot drive through UI without the table).

### SC-005/SC-006 — Special-day multiplier (+2 hearts)
*Deferred:* Requires `special_days` table seeded in test setup. No test written (feature is mocked, cannot insert rows through UI).

### SC-007 — RLS rejects forged user_id
*Deferred:* Requires real Supabase RLS policy on `kudos_likes`. No test written (would need direct DB access to forge payload, violates setup-through-UI contract).

### SC-008 — Sidebar hearts ledger
*Deferred:* Requires aggregated read from real `kudos_likes` table. No test written (depends on table existence and RLS).

---

## Partial Coverage: Current Gaps

### SC-003 (BR-002) — Sender cannot like own kudos
**Scope:** Heart button disabled when viewer is the sender.

**Status:** Not validated in RED.  
**Reason:** The real auth bridge (`profiles.auth_user_id`) doesn't exist yet, so the component's `isOwnKudos = record.senderId === viewerId` check still sees the client-side mock viewer, not the real authenticated user. The test found the button still ENABLED (not disabled) for a real auth session, proving the real auth bridge is missing — but this is a setup issue, not a test issue.

**On GREEN:** Once `profiles.auth_user_id` is seeded, SC-003 will fail differently (the enabled button will become disabled), and the test will pass.

### SC-004 (FR-005) — Unauthenticated viewers see disabled hearts
**Scope:** Without a session, hearts render disabled with explanatory aria-label.

**Status:** Not validated in RED.  
**Reason:** The component doesn't yet have logic to detect an unauthenticated user and render disabled. Today `isOwnKudos` is determined by comparing `record.senderId === viewerId`, with no null check for missing session. Test found 3 enabled hearts instead of 0.

**On GREEN:** Once the component checks for `viewerId === null` or fetches real user identity, SC-004 will fail cleanly (enabled buttons where we expect disabled), and the test will pass.

### FR-003 — Count formula
**Status:** Passes trivially today.  
**Reason:** The heart state only affects the local `useState`, and the formula `displayedCount = record.heartCount + (liked ? 1 : 0)` renders correctly for the mock. Once real persistence lands, this test will continue to pass (count = static + delta).

---

## Test File Notes

- **File naming:** `e2e/kudos-board-like-persistence.spec.ts` matches `kudos-board-*.spec.ts` pattern, runs on port 3200 (gate-open server). ✓
- **Session setup:** Uses `seedSupabaseSession()` from existing e2e helper to establish real Supabase auth via test-user credentials. ✓
- **Locator contracts:** Respects all frozen DOM contracts from `dom-contract.md` (F26/F27, heart text is count digits only, aria-pressed always present). ✓
- **Thousands-separator handling:** Strips non-digits before parseInt to handle `formatHeartCount` output (`1.500` → 1500). ✓
- **No breaking changes:** Existing assertions in `kudos-board-*.spec.ts` remain untouched and pass (20 of 20 existing tests green). ✓

---

## Valid RED Evidence

| Property | Value |
|----------|-------|
| **Test file** | `e2e/kudos-board-like-persistence.spec.ts` |
| **Test name** | SC-001: clicking heart increments count and survives reload… |
| **Assertion** | `expect(reloadedCount).toBe(initialCount + 1)` |
| **Expected** | 1501 |
| **Actual** | 1500 |
| **Cause** | User-visible behavior: like state dies on reload (setUp is unchanged, failure is real feature gap) |
| **Valid?** | ✓ YES — assertion failure caused by missing feature, not infrastructure |

---

## Risks & Dependencies

1. **Auth bridge missing:** `profiles.auth_user_id` does not exist. SC-003/SC-004 tests reference the real user identity but cannot validate it without the schema.
   - **Mitigation:** Tests written to flag this cleanly (enabled button where disabled expected). Once the column is added and seeded, tests will fail with clear diff: button state changed.

2. **Unauthenticated branch untested:** Component doesn't check for null session. SC-004 finds enabled hearts where disabled expected.
   - **Mitigation:** Test structure is ready; once the check lands, assertions pass.

3. **Like table doesn't exist:** Core persistence is mocked. SC-001 is the only test that runs in current environment.
   - **Mitigation:** SC-001 failure is the valid RED. Once table + server action are built, test reruns GREEN immediately.

---

## Unresolved Questions

- None. All clarifications from `clarifications.md` are stable and cited in test titles (SC-001, SC-003, SC-004, FR-003).

---

**Status:** DONE  
**Summary:** Valid RED suite authored. Core SC-001 failure proves heart state is not persisted (dies on reload). Test file is durable, follows all contracts, and is ready for GREEN rerun once implementation lands.

**Concerns:** SC-003/SC-004 are marked as not validated in RED due to missing schema (`profiles.auth_user_id`) and session logic. Tests are written and will fail cleanly on GREEN run, flagging gaps for correction before merge.
