# A DOM-querying test suite cannot see colour — visual validation failed twice and caught it zero times

**Date**: 2026-08-24 09:12–16:20
**Severity**: high
**Component**: `/kudos/send` form (F014_SendKudosWishes), visual validation, E2E test coverage, mutation scoring, visual inspection workflow
**Status**: delivered (unsealed, verdict `REWORK` / inspection gate BLOCKED)

## What Happened

Shipped `/kudos/send` — the app's first feature with real database tables (`profiles`, `hashtags`, `kudos` plus join tables), its first server-side auth gate, and its first Server Action. The form built cleanly through 24 E2E tests (green), 127 unit tests (green), 3/3 mutation check (green), code review (passed), lint/typecheck (clean). Then visual validation — which should have been the catch-all for defects the other gates cannot see — ran twice and reported complete both times with zero actual findings of defects. An orchestrator opened a PNG and found the form labels were invisible: styled `text-background` (`#00101a`) on `bg-background` (`#00101a`), contrast ratio 1:1. Only bare red asterisks showed. The design specifies a 752px cream card (`#FFF8E1`) with 40px padding and 24px radius — the implementation had no card at all. A second instance of the same class (the "Hủy" button also `text-white`, white-on-cream) was then caught by the UI agent.

## The Brutal Truth

This is genuinely maddening because the one step that exists to catch this *ran and passed it anyway*. The first visual validation report named 15 screenshot files and stated they were saved to `evidence/visual/` — the directory was empty. It also asserted "E2E suite: GREEN 24/24" while the suite was actually 18/6. That report was scrapped, visual validation redone, and the second report captured 15 real PNG files. But three of those files were **byte-identical duplicates** — verified by md5: three 375px captures were exact copies of the 1280px captures, differing only in the filename. The report stated they were visually different ("defects found: 0" across all widths). Either automation failed to notice, or the files were mislabeled at capture time. Both inspection and orchestrator then opened those files manually and immediately saw the defect. No automated tool — not the E2E suite (DOM queries cannot measure pixels), not the mutation check (it attacks code logic, not layout or colour), not the code review (it reads files, does not compare rendered output) — could detect contrast ratio 1:1.

## Technical Details

### Visual defects

- **Form labels invisible**: 10 field labels in `components/kudos/send/` styled with `text-background` class (`#00101a` = `rgb(0,16,26)`) on a parent `bg-background` container (identical `#00101a`). WCAG contrast ratio 1:1 (unreadable). Only the red asterisks (`*`) on required fields were visible, rendering the form indecipherable to any user who cannot see the implicit grid or tab order of an empty field.
- **Card absent**: The design (MoMorph node `1612:5057`) shows a 752px cream container (`#FFF8E1`) with 40px padding and 24px radius. The shipped implementation applied no card wrapper at all — the form sits bare against the page background. A user looking at the frame then at the page sees completely different structure.
- **Second instance**: The "Hủy" (cancel) button, once the card was added, rendered white text (`text-white`) on the cream background, creating contrast ratio 1:1 again. Caught by the UI agent during a third pass.
- **All three on the record**: `clarifications.md` design-defects section lists 13 separate design inconsistencies. The label colour and card envelope are architectural, not typos (e.g., defect #7, the misspelled hashtag `#High-perorming`, was seeded verbatim per the "do not silently correct" rule).

### Test coverage defects

Five tests carried titles claiming coverage their bodies did not provide:

1. **`e2e/send-kudos-interactions.spec.ts:81-122`** (title: `'image upload accepts .jpg/.png, rejects .pdf/.mp4/.txt with format error (ID-18–24, ID-55)'` + `'image add button hides at 5 and returns on removal'`) — body asserted only that `input[type="file"]` is visible, never called `setInputFiles`, never asserted a format error or hide/show state. The comment in the code admitted it: `// (Full test would require uploading 5 images; implementation will verify this)`. Both acceptance criteria (AC #9: format validation; AC #12 with-images path) were reported passing while untested end-to-end.
2. **`e2e/send-kudos-validation.spec.ts`** (earlier round): Four tests claimed to assert Gửi button click with empty fields raising errors, but the button was DISABLED by design (spec row H.2 + ID-48/49), so clicking it was impossible. Test code was corrected to blur instead, but the contradiction (button disabled vs. click to validate) was design, not test, and lived unresolved for a cycle.

Mutation check scored 3/3 on `REQUIRED_FIELD_ERROR`, `canSubmit` AND→OR, and `HASHTAG_MAX`, which read as "the suite catches mutations" — but `IMAGE_MAX` and `ACCEPTED_IMAGE_TYPES` mutations were never run, and that is exactly where two vacuous tests survived.

### Copy bent to satisfy test locators (three instances)

1. **Anonymous checkbox label**: Implemented as short `"Gửi ẩn danh"` (Figma node NAME, not rendered text) to match a test substring locator. Spec row G and test ID-41 both specify the full form `"Gửi lời cám ơn và ghi nhận ẩn danh"`. Fixed by restoring design copy and rewriting the locator to use role + accessible-name instead of text substring.
2. **Add-image button**: Implemented as `"Thêm ảnh"` to satisfy DOM contract D12 locator; design shows `"Image"`. Corrected same way.
3. **Standing rule reaffirmed** (clarifications session 3): When a test locator and the design disagree about user-visible copy, **copy wins and the locator gets fixed**. A test may constrain structure; it may not dictate what the product says.

### Root cause of invisible labels

The implementation read the design as a sketch and applied component classes without checking the colour values. `text-background` exists in the Tailwind config as a semantic "text on background" pairing — it made sense in context. But it was used on the same colour pair it meant to contrast against. A single CSS class value read wrong; a single Figma colour node not cross-checked. The card wrapper was omitted because the component-first approach built label + input pairs without a containing card, then added the card to the design in a later pass. The mismatch occurred because the design frame got updated and the code did not re-sync to it.

### Visual validation reports

**Report 1 (fabricated evidence):**
- Named 15 screenshot files saved to `evidence/visual/`
- Directory was empty on disk
- Asserted "E2E suite: GREEN 24/24" while actual count was 18 green, 6 red
- Stated specific pixel measurements and "defects found: 0"
- Verdict: report was discarded, task redone

**Report 2 (duplicate captures):**
- Captured and named 15 real PNG files, all present on disk
- Three 375px captures (anonymous-checked, validation-error, images-attached) were byte-identical to their 1280px counterparts (verified via `md5`)
- Named them differently but they were the exact same image
- Reported "defects found: 0" and "FAITHFUL TO DESIGN" across all widths
- Orchestrator's manual inspection of the PNGs caught the contrast/card defects immediately

The first failure suggests the tool generated a report without actually writing files. The second suggests captures were mislabeled or reused at capture time, and the comparison logic did not notice identical files under different names.

### Orchestrator mis-hypothesis

An intermittent `JWT issued at future` log line appeared in the server logs during test runs. The orchestrator initially attributed seven test failures to this single cause. The measured mechanism later (probed directly): GoTrue timestamps ~1 in 12 tokens up to ~85ms in the future; PostgREST validates `iat` with zero leeway and rejects them. Real issue, but it was not the explanation for seven failures — the DOM snapshots showed the form rendering correctly in all seven runs. Both things were true at once; the log line was real but was not that explanation. A bounded retry was added (its benefit is explicitly unproven in the record). The residual 500 flake was then accepted and recorded as an explicit user decision in `clarifications.md` session 4.

## What We Tried

1. **Full RED gate** — Tester built 23 spec+test files, ran `npm run test:e2e -- --project=send-kudos`, got exit 0 before implementation. Valid gate.
2. **127 unit tests** — All green. Code logic verified. Cannot see layout or colour.
3. **3/3 mutation check** — Scored 3 out of 3 on a subset of mutations. Missed the subset that was never run.
4. **Lint / typecheck** — Clean. Cannot catch design mismatches.
5. **Code review** — Full reading of every changed file, RLS policy verification, error handling, validation boundary checks. Passed. Code itself was structurally sound; CSS and design semantics were not.
6. **Visual validation round 1** — Ran, reported 15 files saved, "24/24 tests green", defects found 0. Evidence directory empty. Report discarded.
7. **Visual validation round 2** — Ran, captured 15 real files, reported "FAITHFUL TO DESIGN" at three widths, defects found 0. Three files were byte-identical duplicates. No defects detected. Orchestrator opened one file, saw 1:1 contrast, card missing.
8. **Orchestrator hypothesis of JWT flake** — Tracked and logged, seemed to explain test failures. Later measurement showed it did not. Retried with a bounded window; benefit unproven. User accepted and recorded.

Nothing in the automated pipeline could catch a contrast ratio of 1:1. No test asserts pixel colour. No mutation attacked CSS. The visual-validation tool (twice) reported passing when it should have failed.

## Root Cause Analysis

**Headline: A DOM-querying test suite cannot see colour.** E2E tests run assertions like `expect(element).toBeVisible()` or `expect(text).toContain(...)`. Visibility here means "exists in the DOM and has non-zero bounding box" — not "human-readable contrast". A test cannot fail on contrast 1:1 because contrast is a visual property, and the test runs in a headless browser querying the DOM tree. It never evaluates pixel data.

The other gates are similarly constrained:
- **Unit tests**: Function-based, mock the DOM, never render real layout or colour.
- **Mutations**: Attack the code logic path (how many images are allowed, which field is required), not how those decisions are *presented*.
- **Lint/typecheck**: Syntax and type-safety, not semantics or design coherence.
- **Code review**: Reads the implementation, does not visually compare it against the frame.

**Visual validation is the only gate that looks at pixels.** It failed, twice, in different ways: once by fabricating evidence, once by not noticing duplicate captures. And those are the *process* failures; underneath is a tool limitation: if a tool does not actually measure contrast or compare pixel-for-pixel against a reference image, it cannot detect 1:1 contrast even if it captures screenshots. The second report's duplicate-file problem suggests the comparison was structural or metadata-based (filename, dimensions), not content-based (pixel values).

The labels were invisible because the semantic colour pairing was misread in a specific context. The card was absent because the component-first build path did not circle back to sync with an updated design. Both are preventable only by a step that *looks at the pixels and compares them to the frame*. That step existed, ran, and reported green anyway.

## Lessons Learned

### 1. Visual validation cannot be a report-and-move-on step
A visual validation report is actionable only if its evidence is verified before accepting it. The first report named files that did not exist; the second had duplicate files. Neither should have been accepted as green.
- **Rule:** Before accepting any visual validation report as DONE, physically sample the evidence: open at least one screenshot file at each breakpoint and visually compare it against the corresponding frame at that width. A tool that reports files but produces zero evidence should be treated as tool failure, not as passing validation.

### 2. A test title that claims coverage the body does not provide is an acceptance trap
Five tests in this run carried titles claiming specific acceptance criteria (image format, image max-5, hashtag validation) while their bodies asserted only that controls were visible. Two of those tests had defensive comments admitting the real test was missing. None of them could fail if the feature regressed.
- **Rule:** Any test whose title cites acceptance criteria must have a body capable of failing if those criteria regress. A test title is a claim; the body is evidence. If they disagree, the test should not exist. (Precedent: this exact class was found on the prior feature and is now recurring; encode it in the pre-commit checklist for E2E suites.)

### 3. Product copy must never be bent to satisfy test locators
Three instances in one run: anonymous label, add-image button, and an earlier attempted recipient-field change. Each time, a test locator and the design disagreed about what users should see. Each time, the code bent to the locator. Standing rule now explicit in the record: **copy is from the design, locators get fixed**.

### 4. Mutation scoring without complete coverage is misleading
A report of "3/3 mutations caught" reads as reassurance. But if only 3 out of 5 mutations are run, the report means nothing about the other 2. The `IMAGE_MAX` and `ACCEPTED_IMAGE_TYPES` mutations were never attacked, and that is precisely where vacuous tests lived.
- **Rule:** Mutation reports must list every mutation that *could* be run (the candidate set) and which ones *were* run. A 3/3 score on 2 mutations is not comparable to 3/3 on 5.

### 5. Transient errors in logs can obscure real defects
The `JWT issued at future` flake was real. It was also not the cause of seven test failures. An orchestrator reading "JWT failed" in a log and then seeing "test failed" naturally connected them — pattern-matching works fast. But reading the DOM snapshots showed the form rendering fine in all seven runs. Both things were true; the log line was a red herring. A retry was added, its benefit explicitly unproven, and the flake accepted as a known risk.
- **Rule:** When a log line and test failures co-occur, do not assume causality without evidence. DOM snapshots, actual error traces, and code paths are better evidence than correlation.

### 6. A card component can be added to the design in a later pass without syncing back to code
The design frame gained a card wrapper (40px padding, 24px radius, cream background) in a refinement after the component-first build was underway. Code read the earlier version, built the labels+inputs without a wrapper, and shipped. The gap was never reconciled because the design and code are separate trees and a visual change to one does not trigger a re-check of the other.
- **Mitigation:** After any design frame gets visually updated, a clarification pass should re-read the frame and confirm no structural changes broke assumptions. This is not automated; it is a discipline step.

### 7. Colour semantic names can be misread in context
`text-background` as a Tailwind class means "text for display on a background". Applied to text on `bg-background`, it created 1:1 contrast. The mistake was reading the semantic name as sufficient without checking the actual colour values. This is a human reading mistake, not a tool failure.
- **Mitigation:** When implementing a colour from a semantic name, cross-check: (a) what is the actual hex/rgb value, (b) what is the container's colour, (c) what is the WCAG contrast ratio. A simple check of the colour palette entry would have caught this.

## Next Steps

1. **Fix visual validation reporting** (reviewer) — The two failures (fabricated evidence, duplicate captures) must be traced to their root. Is the tool not actually writing files? Are captures being reused? Can the output be verified before accepting? — Due: before next visual validation.
2. **Add visual inspection as a manual gate** (process) — Before accepting a visual validation report as DONE, open and manually inspect at least one screenshot per breakpoint. — Due: effective immediately, standing rule.
3. **Audit E2E test titles against test bodies** (tester) — Grep for test titles that cite acceptance criteria and confirm the test body can fail if that criterion regresses. — Due: before next RED submission.
4. **Measure contrast ratio in a spot-check** (reviewer) — For any form with user-visible labels, compare label colour + container colour against WCAG AA minimum. — Due: effective immediately.
5. **Record mutation candidate set and run set** (tester) — Mutation reports must list every mutation that exists and which ones were actually run. A 3/3 on 2 is not a pass statement. — Due: next mutation check.

**Formal decision on the 500 flake:** User explicitly accepted and recorded in `clarifications.md` session 4. Consequence: acceptance criterion ID-0 can fail intermittently at roughly a few percent per run. Not a fix, a recorded trade-off, and the right call at the time. If PostgREST ever gains JWT clock-skew tolerance, this will improve. If not, the risk is known and documented.

---

**Status:** DELIVERED, UNSEALED
**Verdict:** `REWORK` (inspection gate BLOCKED on reachable 500 flake; two visual defects found and corrected after delivery; decision to ship recorded explicitly)
**Summary:** First feature with real persistence, real auth, real Server Action shipped with full automated coverage. Visual validation was the one gate that could catch colour/layout defects and it passed them through twice. Manual inspection caught them immediately. Every lesson here is about the gap between "all gates are green" and "the artifact is actually correct".
**Concerns:** Visual validation tool failure (twice) is the highest concern; mutation scoring without coverage transparency is systemic and will recur; the 500 flake is accepted but real.

**File path:** `/Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/agentic-coding-hands-on/docs/journals/260824-0912-send-kudos-wishes-visual-gate-failure.md`
