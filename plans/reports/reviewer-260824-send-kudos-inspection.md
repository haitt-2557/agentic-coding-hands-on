# Review: `/kudos/send` — Send Kudos Wishes (F014)

## Scope
- Files reviewed: `supabase/migrations/20260824031123_kudos_send_tables.sql`, `supabase/migrations/20260824031159_kudos_images_bucket.sql`, `supabase/seed.sql`, `lib/kudos/send/{types,validation,markdown,auth-gate,queries,submit-kudos,storage}.ts` + `validation.test.ts`, `app/kudos/send/page.tsx`, `components/kudos/send/**` (10 files), `components/kudos/{kudos-send-page-client,kudos-sent-toast,kudos-action-bar}.tsx`, `components/layout/quick-action-widget.tsx`, `lib/i18n/dictionaries/{vi,en}.ts`, `e2e/send-kudos-*.spec.ts` (6 files) + `e2e/support/send-kudos-form.ts`, `playwright.config.ts`.
- Lines: ~1934 (all under the 200-line ceiling).
- Depth: full — read every changed file, not just the diff hunks; cross-checked against `clarifications.md` (4 sessions), `study-context.json` (13 ACs), and the plan.

## Assessment
Solid first cut at real persistence and a real auth gate. RLS is correctly scoped (`sender_id = auth.uid()` forced server-side, own-row-only select, no update/delete granted anywhere), `getUser()` not `getSession()` is used for the gate, and the Storage path convention is enforced by policy, not just by convention. Client validation and server validation share one pure module (`validation.ts`), which is the right shape.

Two things pull this below "ready to ship": the server action never re-checks the image count against the same `IMAGE_MAX=5` it imports for everything else, and two e2e tests carry acceptance-criteria titles (image format accept/reject, add-button-hides-at-5) while asserting nothing about either behavior. Given the brief's explicit warning that this suite has twice already shipped tests that cannot fail, this second occurrence is a release blocker, not a nit — the corresponding acceptance criterion is uncovered, not merely under-covered.

## Critical

**1. Two e2e tests titled for image-validation ACs assert nothing about them — AC #9 is untested, not tested.**
`e2e/send-kudos-interactions.spec.ts:81-100` (title: `'image upload accepts .jpg/.png, rejects .pdf/.mp4/.txt with format error (ID-18–24, ID-55)'`) only asserts `input[type="file"]` is visible — it never sets an input file, never asserts a rejection error appears for `.pdf/.mp4/.txt`, never asserts a `.jpg/.png` is accepted. `e2e/send-kudos-interactions.spec.ts:102-122` (title: `'image add button hides at 5 and returns on removal (ID-19, ID-38, ID-40)'`) likewise only asserts the file input is visible, with the file's own comment admitting it: `// (Full test would require uploading 5 images; implementation will verify this)`. Both titles claim TC IDs from the 13 acceptance criteria (`study-context.json` AC #9); neither test can fail if the format allow-list, the reject-with-error path, or the hide-at-5/reappear-on-removal behavior regresses. This is exactly the "test passes for the wrong reason" class the brief flagged as critical, and it is a second, previously-uncaught instance (the ID-56 hashtag one was already fixed in commit `127117b`).
- Fix: use `page.setInputFiles()` with real temp files (one `.jpg`, one `.pdf`) and assert `sendKudos.imageFormatError` text appears/doesn't; for the max-5 test, actually attach 5 files via `setInputFiles` in a loop (or a single 5-element array) and assert the add control disappears, then remove one and assert it returns.
- `isAcceptedImage` itself is correctly unit-tested (`lib/kudos/send/validation.test.ts:106-122`) — the gap is purely in the E2E wiring proof that the real `<input>` + component + copy actually enforces it.

## High

**2. Image count is never re-validated server-side — contradicts the code's own stated contract.**
`lib/kudos/send/submit-kudos.ts:41-56` checks `validateDraft` (which covers recipient/title/message/hashtags) and `isAcceptedImage` (type+size) but never checks `input.images.length <= IMAGE_MAX`. The file's own header comment states "every check below re-runs server-side against the same pure functions" — that claim is false for image count. `KudosDraft` (the type `validateDraft` operates over, `lib/kudos/send/types.ts:25-32`) doesn't even carry an images field, so there is no single call that closes this gap. Since `submitKudos` is invoked directly as a function from a client component (`components/kudos/kudos-send-page-client.tsx:25`), not via a `<form action>`, nothing stops a modified/forged client from posting more than 5 image files per submission — each still has to pass the 5 MiB/jpg-png check, but there is no cap on count, so an authenticated user can upload arbitrarily many objects to the private bucket per kudos sent. This is an input-validation gap at the actual trust boundary (Server Action), not merely the UI, which is precisely what item 5 of the Eight Checks asks after.
- Fix: in `submit-kudos.ts`, add `if (input.images.length > IMAGE_MAX) return { ok: false, error: ... }` before the upload loop (reuse `IMAGE_MAX` from `validation.ts`, already imported transitively).

**3. Duplicate `hashtagIds` in the submitted payload can leave a persisted `kudos` row with zero hashtags.**
`validateField('hashtagIds', ...)` (`validation.ts:67-70`) only checks `length` bounds (1–5), never uniqueness. The UI can't produce duplicates (`handleToggleHashtag` in `kudos-send-form.tsx:55-62` toggles by membership), but the Server Action is reachable directly with an arbitrary array. If `hashtagIds` contains a repeat, `kudos` inserts successfully (`submit-kudos.ts:62-77`) and then the batch `kudos_hashtags` insert (`submit-kudos.ts:81-87`) fails the whole statement on the `(kudos_id, hashtag_id)` primary key — caught by the outer `catch`, generic error returned — but the parent `kudos` row is **not** rolled back (three separate network calls, no transaction). The result is an orphaned, business-rule-violating row (fewer than the required 1 hashtag) sitting in the table permanently. `clarifications.md`'s "Accepted caveat" only names Storage-image orphans after a *row-insert* failure — it does not cover a hashtags-insert failure after a *successful* kudos insert, so this isn't a documented, accepted trade-off.
- Impact is contained (RLS means only the submitter can ever read their own orphaned row back, and the board never queries this table), so High rather than Critical, but it's a real data-integrity hole reachable by any authenticated user crafting the request.
- Fix: dedupe server-side — `const hashtagIds = [...new Set(input.hashtagIds)]` before both the `validateDraft` call and the insert — or wrap the three inserts via an RPC/`pg` function for real atomicity (heavier, likely overkill for this run).

## Medium

**4. Stale code comment misdescribes a decision that was later reversed.**
`components/kudos/send/anonymous-toggle.tsx:6-9` says the label uses the short "Gửi ẩn danh" form and explains why — but the actual rendered copy (`lib/i18n/dictionaries/{vi,en}.ts:106`, both `'Gửi lời cám ơn và ghi nhận ẩn danh'`) and `clarifications.md`'s third-pass session both confirm the long form was restored. The code is correct; only the comment is wrong, and a future reader will trust the comment over the dictionary. Low risk but worth a one-line fix since this file was the exact site of a previously-recorded mistake.

**5. `en.ts` carries Vietnamese copy for nearly the entire `sendKudos.*` namespace.**
`lib/i18n/dictionaries/en.ts:65-112` — only the six toolbar button labels (`Bold`, `Italic`, …) are actually English; every other `sendKudos.*` key is the same Vietnamese string as `vi.ts`. This matches an existing pattern already present before this feature (e.g. `kudosPage.submitPillPlaceholder` in `en.ts:47` is likewise untranslated), so it is not a regression this feature introduced, and I'm not blocking on it — flagging so it doesn't get missed when someone eventually does the i18n pass.

## Low

**6. `kudos-action-bar.tsx`'s `readOnly` input is a second, purposeless keyboard stop.**
`components/kudos/kudos-action-bar.tsx:27-39`: DOM order is `<Link aria-label=...>` then `<input readOnly>`. Tab order visits the Link (activatable, correctly labelled) and then the input, which is focusable but does nothing — readOnly blocks typing and there's no click handler. Not broken (Enter on the Link still navigates), just a wasted tab stop for keyboard users. Given three existing specs pin this exact input shape (per the file's own header comment), I'm not asking for a change here — noting it because accessibility item 4 in the brief asked me to look, and this is the only thing I found. A `tabIndex={-1}` on the decorative input would remove the dead stop without touching the pinned attributes.

## Edge Cases Turned Up
- Self-kudos (recipient = sender): no gate anywhere in `submit-kudos.ts` or `validation.ts`. Confirmed as explicitly out of scope in `clarifications.md` Unresolved #3 — not a defect.
- Cancel (`Hủy`) mid-upload: `handleCancel` (`kudos-send-form.tsx:72-78`) only resets client state; since uploads happen at submit time only (not draft time, per `storage.ts` header comment), there is no draft-upload orphan to worry about — confirmed correct.
- `firstInvalidField` selection in `submit-kudos.ts:44-47` relies on `Object.keys()` insertion order matching `ALL_FIELDS`' order in `validation.ts:77-83` (recipientId → title → message → hashtagIds → nickname); this holds today because `validateDraft` builds the object by iterating `ALL_FIELDS` in that exact order, but it's an implicit contract with no test pinning the order. Not filing as a defect, just noting it's load-bearing.
- RLS `kudos_select_own`/`kudos_hashtags_select_own`/`kudos_images_select_own` all correctly re-check the parent row's `sender_id`, so a forged `kudos_id` on the join tables can't leak another user's row — verified by reading, consistent with the orchestrator's own RLS probe.

## Done Well
- `requireSupabaseUser()` uses `getUser()` (re-validates against Supabase Auth) never `getSession()`, and the file's own comment states why and forbids `try/catch` around the `redirect()` throw — good, defensible, and self-documenting.
- `sender_id` is never accepted from the client anywhere in `submit-kudos.ts` — derived once from `requireSupabaseUser()` and forced again independently by the RLS `with check (sender_id = auth.uid())`. Two independent controls, not one control described twice.
- Storage bucket policies correctly gate on `(storage.foldername(name))[1] = auth.uid()::text`, and the upload path (`storage.ts:37`) actually produces paths in that shape — checked that the two sides agree, they do.
- Grants are least-privilege: `authenticated` gets `select` only on `profiles`/`hashtags` (no insert/update/delete — writes are confined to `seed.sql`), and `select, insert` only (no update/delete) on `kudos`/`kudos_hashtags`/`kudos_images`. Nothing over-permissioned found here despite this being flagged as an area of concern.
- Error handling in `submit-kudos.ts` logs the real Supabase error server-side (`console.error`) but returns a generic Vietnamese message to the client — no stack trace or DB error text reaches the browser (Eight Checks item 8, clean).
- `validation.ts` is a single shared pure module imported by both the client form and the server action, so the "client validation is always defeatable" comment is actually backed by re-running the same functions, not a re-implementation that could drift (the one place this promise doesn't fully hold is the image-count gap in Finding 2).

## Actions In Order
1. Fix the two vacuous e2e tests (Critical #1) — real `setInputFiles` assertions for both format-reject and max-5-hide/reappear.
2. Add the missing server-side image-count guard in `submit-kudos.ts` (High #2).
3. Dedupe `hashtagIds` server-side before insert (High #3).
4. Correct the stale comment in `anonymous-toggle.tsx` (Medium #4).
5. (Optional, not blocking) Flag the `en.ts` translation debt for a future i18n pass (Medium #5).

## Acceptance Criteria (study-context.json, 13 total)
1. GET renders form when authenticated (ID-0) — **Covered**, real e2e (`send-kudos-access.spec.ts:6-30`), code correct.
2. GET redirects unauthenticated to `/login` (ID-1) — **Covered**, real e2e (`send-kudos-access.spec.ts:32-39`), code correct.
3. Field order (ID-3) — **Covered**, `send-kudos-layout.spec.ts:10-38`; component composition in `kudos-send-form.tsx:120-159` matches.
4. Recipient autocomplete, placeholder, trim (ID-8/10/25/26) — **Covered**, real e2e + unit tests on `filterProfiles`.
5. Gửi disabled until 4 fields filled (ID-48/49) — **Covered**, real e2e in both `send-kudos-submit.spec.ts` and `send-kudos-validation.spec.ts`, plus `canSubmit` unit tests.
6. Empty-field red border + "Không được để trống" (ID-7/11/14/50-56) — **Covered**, real per-field e2e in `send-kudos-validation.spec.ts` (including the corrected ID-56 hashtag test).
7. Hashtag pick/toggle/max-5/disable/remove (ID-15-17/34-36) — **Covered**, real e2e in `send-kudos-interactions.spec.ts:38-79` (the "must have real assertions or be deleted" note was honored here — this test is fine).
8. Message toolbar markdown + 1000 cap (ID-27-32 portion) — **Covered**, real e2e (`send-kudos-interactions.spec.ts:162-200`) plus full unit coverage of `applyMarkdown`.
9. Image type accept/reject, max-5, hide/reappear (ID-18-24/37-40/55) — **NOT covered end-to-end** — see Critical #1. Type-check logic itself is unit-tested; the wiring is not proven.
10. Anonymous checkbox default + reveal/hide nickname (ID-6/41-44) — **Covered**, real e2e (`send-kudos-interactions.spec.ts:124-160`, `send-kudos-layout.spec.ts:74-97`).
11. Hủy discards, no write, returns to `/kudos` (ID-45) — **Covered**, real e2e (`send-kudos-submit.spec.ts:44-65`).
12. Valid submit writes row, uploads images, redirects + toast (ID-46/47) — **Partially covered**: the no-image path is genuinely proven end-to-end (`send-kudos-submission.spec.ts`); the with-images path is not exercised by any test (compounds with Finding 1 — the actual Storage upload code path in `storage.ts` has zero E2E or integration proof of working).
13. RLS prevents forged `sender_id` — **Covered**, per the orchestrator's own live-JWT probe against the Data API (not re-run by me, but the policy text in the migration matches the claim).

## Numbers
- Type coverage: not separately measured this pass (TS strict mode presumed project-wide; no `any` found in the reviewed files).
- Test coverage: 115 unit / 24 e2e passing per orchestrator, but 2 of those 24 assert nothing about their titled behavior (see Critical #1) — effective coverage of AC #9 and the with-images half of AC #12 is 0%, not the ~100% the green run implies.
- Lint findings: none observed in the reviewed files (two justified `eslint-disable` comments for `react-hooks/set-state-in-effect`, both with inline rationale consistent with existing project patterns).

## Still Unresolved
- Whether the with-images submit path (`storage.ts` → `submit-kudos.ts` insert of `kudos_images`) actually works end-to-end has never been proven by any test in this repo — only by code reading. Recommend adding at minimum one integration test that uploads a real small `.jpg` through the full submit flow and asserts a `kudos_images` row exists, before treating AC #12 as fully met.
