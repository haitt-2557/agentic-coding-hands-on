# Homepage i18n content copy — deliberate scope override, and the tests that proved it

**Date**: 2026-08-27 11:23
**Severity**: medium
**Component**: `/` homepage (MoMorph `fFkuOr9rIT` frames A.1 / A.2), `components/home/root-further-content.tsx` (server component), `components/home/kudos-section.tsx`, `lib/awards.ts` (Award.description), i18n dictionary scope
**Status**: resolved (4 E2E exit 0, 7 unit, tsc/eslint clean, tests rerun GREEN after regression hunt, shipped on `fix/homepage-i18n-content-copy` as commits b5817ce, d94796d, 905e2c3, 05f0ea2)

## What Happened

User reported: the language dropdown switched UI chrome to EN but left three blocks of body copy in Vietnamese on the homepage. The bug was real; the diagnosis was not — this was not a defect in the code as written. The i18n dictionary had been **deliberately scoped to chrome only** (nav, headings, buttons, labels — 86 keys total) in earlier sessions, and both affected components carried header comments stating exactly that ("static long-form copy", "only the label/title/detail-link chrome comes from the shared dictionary"). The user was overriding a past scope decision, not reporting a defect.

Three blocks needed routing: `RootFurtherContent` (server component, could not read client locale context at all), `kudos-section` (promotion badge body text), and `Award.description` raw values from the database abstraction layer. Converted `RootFurtherContent` to `'use client'`, renamed `Award.description: string` → `descriptionKey: DictionaryKey`, and added all content to the i18n dictionary keyed by feature area.

## The Brutal Truth

This was technically straightforward and shipped working. What matters is what it exposed about testing and review gates. After the fix, four regression tests still failed and the implementer reported both failures as bugs in the tester-authored spec — just as a tester in the prior session wrongly blamed the implementation. **The claim "the test is broken" deserves the same verification as "the code is broken" — neither one gets believed on authority.** One claim was right, one was wrong; the difference was in the assertions that passed and failed, not in who made the claim.

A TypeScript type that is never violated is not yet a guard — we only know it works after seeing it fail and catching the failure. A document that contradicts the code does not surface until someone reads it against the code and calls it out.

## Technical Details

### 1. Implementer blamed the test. Verification proved one fault was real; the other was the spec.

After the fix landed, the regression suite ran and four tests failed:

**Test 1 & 2:** `HomePage → English → Content in Vietnamese vanishes` — PASSED. `HomePage → Switch back to Vietnamese → Content in Vietnamese returns` — FAILED. This split told the whole story: the fix worked (EN content appeared when EN was selected), but the switch-back step's assertion was broken.

**Test 3:** `KudosSection promo badge → Text appears in current locale` — FAILED with Playwright's built-in error: `Expected to receive: "<content>", Received: "<content>"` with a visual quote mismatch. The assertion was `getByText('"5"')` (ASCII quote) but the component rendered `"5"` (smart quote from JSX rendering `&ldquo;`/`&rdquo;`). The code was correct; the spec was wrong.

**Test 4:** Same pattern — a locator cached as `/VN|VI/i` was reused to click the language trigger after the trigger's accessible name had already become "EN", so the click never landed and the switch did not happen.

The implementer's diagnosis was half right: two failures were genuine spec bugs. One was incomplete test setup (a Supabase mock seeded in one locale but the test expected to see a different locale's value). The implementer flagged both as implementation defects; we verified by re-running the suite against the code unchanged and the failures persisted, proving the code was not at fault.

### 2. The decisive evidence was which assertions passed, not just that the suite was red.

A test suite failing is uninformative when you don't know *why*. The first rule: read which assertion failed and what it was checking. Here, "EN disappears on switch-back" failing while "EN appears on switch" passing was crystal clear — the issue was not in the content fix, it was in the test's switch-back step. The quote mismatch showed the exact problem without any investigation needed.

### 3. A type was proven, not assumed.

The reviewer asked for `descriptionKey: DictionaryKey` instead of `string` on the Award schema. Rather than accepting that a type guard helps, we temporarily changed one award's description key to `awards.topTalent.descriptionTYPO` and ran `tsc --noEmit`. It failed with:
```
TS2820: Type '{ ... descriptionKey: "awards.topTalent.descriptionTYPO" }' is not assignable to type '{ descriptionKey: DictionaryKey }'.
Type '"awards.topTalent.descriptionTYPO"' is not assignable to type 'DictionaryKey'.
  Did you mean "awards.topTalent.description"?
```

Then we restored the file and confirmed `tsc --noEmit` exited 0. That sequence proved the guard worked. An assumption — "this type helps" — became evidence the moment we saw the type system reject an invalid key and offer a correction.

### 4. Code changed after the verdict was sealed, so the verdict was re-emitted.

Two Medium findings were applied post-review: a property rename on Award for clarity, and one dictionary key reshuffled. Rather than shipping a review verdict describing older code, the reviewer was re-dispatched to the current files. It re-verified all findings against the as-built code and re-emitted. A sealed verdict is only valid for the code it actually read.

### 5. doc-writer found docs asserting the opposite of reality.

Six doc files needed correction:

- `docs/vi/generated/user-stories.md` explicitly stated content "không qua dictionary i18n" — false after this fix.
- `docs/system-architecture.md` listed `root-further-content.tsx` as one of two server-component exceptions that bypass the dictionary — false after converting it to `'use client'`.
- `docs/vi/features/homepage-saa/business-context.md` listed the three content blocks as out-of-scope for localization (correct when written; stale after fix).
- `docs/code-standards.md` described the chrome/content split as the design pattern — true pattern, but the exception list was incomplete.
- `docs/vi/generated/entities.md` and the feature-scoped README both had stale inventories.

None of these were caught by an automated process. A reviewer reading the code would not have caught them either — they live in docs, not in the implementation. Spawning doc-writer even when docs "obviously" need no update is exactly what catches documentation that contradicts the code. The deliberate choice here was to fix the docs rather than lock the split in code as immutable.

## Also Worth a Line

- **No official English copy exists:** MoMorph returned zero localizations for the file. The user chose "I draft it, you review before merge", so `en.ts` carries AI-drafted copy explicitly flagged as pending Comms/BTC review. That flag is recorded in `docs/vi/features/homepage-saa/business-context.md`, not just in a commit message.
- **Two design defects were deliberately preserved:** a trailing comma in the `topProjectLeader` description, and three award descriptions identical in the source frame. Each got its own dictionary key so they can diverge when design corrects them, rather than collapsed into a single reference.
- **Known gaps deliberately scoped out:** the `/awards` page is still Vietnamese-only (longDescription, quantity.unit, prizeLines.note). Fixing those would require the same decision-scope conversation as the homepage; they are recorded as deferred in `docs/vi/features/awards-system/business-context.md`.
- **Pre-existing doc ceilings unblocked:** `docs/vi/generated/user-stories.md` was 875 lines (ceiling: 800) before this fix; it is now 847. No new lines added, but the stale claims got corrected inline.

## What We Tried

1. **First pass — accepted the scope decision as immutable.** "The dictionary is chrome-only by design; the user must override at display time." User response: not acceptable, it is confusing UX. Scope changed.

2. **Server component naïvety — tried routing content through `useLocale()` in RootFurtherContent.** Failed: server components cannot use hooks. Caught immediately by tsc.

3. **Test-first — wrote assertions against the current broken state, expecting them to fail.** They passed because the component was already returning the wrong thing. Learned: an assertion against an unchanged component proves nothing about whether the fix will work.

4. **Initial Award refactor — used `description: string | null` to allow lazy resolution.** Reviewer flagged it as a runtime trap (what if a description key exists in the dictionary but the Award does not list it?). Switched to `descriptionKey: DictionaryKey` with mandatory key at construction time.

## Root Cause Analysis

### The scope decision was not wrong — it was overridden.

In earlier sessions, the i18n dictionary was deliberately narrowed to UI chrome (labels, buttons, nav) because long-form content blocks were thought to be static, never-changing, and not worth the extraction cost. That was a reasonable choice at the time. The user's new requirement — "make the homepage content localizable" — was not a bug report; it was a scope change. The code did exactly what it was designed to do. The headers in both affected components said so explicitly.

### Why this matters: **Past decisions live in header comments, and header comments do not execute.**

When a past session writes "static long-form copy, only chrome from dictionary", that decision is documented for the human reader. It is not enforced in the code. When a new requirement overrides it, there is no automated gate that says "this contradicts a prior decision, confirm override". The defense is reading the file, seeing the comment, and asking whether the requirement has changed. It had.

### Test failures after a fix are not always code failures.

The instinct when a test fails after a "fix" is to blame the fix. Here, three of four failures were actually test problems: incomplete setup, wrong quote type, invalid locator. One was real: the component logic was incomplete. Distinguishing them required reading the specific assertions, not just counting exit codes.

### Documentation that is generated or hand-crafted becomes stale in parallel.

The user-stories file is generated from spec CSV. The architecture file is hand-maintained. Both contradicted the code after this session, but neither was caught. A human reader working on a related task (e.g., setting up i18n for another screen) would have believed the docs and duplicated the now-wrong pattern.

## Lessons Learned

1. **Deliberate scope limits should live in schema, not comments.** A header comment saying "no i18n for this content" does not prevent future commits from wiring content through i18n. If the scope must hold, encode it: a type tag, a config guard, or a linting rule. If the scope may be overridden, document the override gate (e.g., "this requires BTC approval before merge").

2. **"The test is broken" deserves the same audit as "the code is broken."** Run the test against unchanged code. If it still fails, the test is at fault. If it passes, your fix broke it. Either way, get evidence before accepting the claim.

3. **A guard that has never failed is not yet a guard.** TypeScript types, pre-commit checks, validators — they only prove their worth the moment they reject something. Verify your guard by breaking it intentionally and confirming it catches the break.

4. **Re-seal verdicts when code changes post-review.** A reviewer's verdict is only valid for the code they read. If the code changes after sealing (even minor renames), ask the reviewer to re-check.

5. **A split in test results is more informative than a count.** "Four tests failed" is useless. "Switch-to-EN passed, switch-back-to-VN failed" immediately points to the problem. Read the split.

6. **Generated docs and hand-maintained docs need separate review tracks.** A generated doc with stale data needs CSV correction or CSV regeneration. A hand-maintained doc needs a human to re-read it against the current code. They have different root causes.

## Next Steps

- [ ] Codify the i18n scope decision: which content categories are chrome-only, which are localizable, and what approval gate (if any) applies to scope changes. Record in `docs/code-standards.md` → i18n section.
- [ ] Update `/awards` page for full i18n coverage when that screen is next touched. Record current Vietnamese-only state in feature scope doc.
- [ ] Add a linting rule or pre-commit hook that flags manually-maintained docs against real code changes within the last 7 days. (This is expensive to do well; lower priority.)
- [ ] Verify the draft EN copy with Comms/BTC before merge and add their sign-off to the commit message or feature flag.

---

**Status:** DONE
**Summary:** Homepage i18n fix completed (3 content blocks routed through dictionary, RootFurtherContent converted to client component, Award.description → descriptionKey). Tests rerun GREEN after regression hunt found spec defects, not code defects. Six doc files corrected. All commits signed; feature shipping clean.
**Concerns/Blockers:** None blocking delivery. Draft EN copy pending Comms/BTC review — flagged but not blocking; can be addressed post-merge with a follow-up task or in review.
