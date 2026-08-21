# Kudos Live Board shipped — but eight process defects will repeat if we don't encode them now

**Date**: 2026-08-21 21:41
**Severity**: high
**Component**: `/kudos` screen (MoMorph `MaZUn5xHXZ`), E2E contract, test authoring, MoMorph asset tooling, evidence gate, spec promotion, responsive design
**Status**: resolved (code shipped 18/18 E2E, 93 unit, tsc clean; lessons recorded for next build)

## What Happened

Built the Sun* Kudos - Live board from frame 1440×5862, 19 components, 10 lib modules, 18 E2E tests under `e2e-red-first` policy. Final gate: 18/18 tests exit 0, 93/93 unit, lint and typecheck clean, responsive floor at parity 375/768/1440, evidence sealed. Shipped on `feat/kudos-live-board` with five scoped commits. Everything passed. Then the orchestrator's post-implementation sweep found eight separate process defects — some caught before delivery, some only visible in hindsight, all of them predictable and repeatable across other screens.

## The Brutal Truth

None of these eight defects broke the code shipped. The responsive layout works at 375, the tests pass, the assertions are real. But the machinery that delivered them is leaking in specific, repeatable ways, and three of the eight mistakes have **already occurred on the screen before this one**. We are paying for those failures again instead of encoding the fix the first time it was learned.

## Technical Details

### 1. The prelaunch-gate RED trap — second time it caught us

`/kudos` is not in `ALWAYS_ALLOWED` (`lib/prelaunch/gate.ts:19`), so every `goto('/kudos')` from port 3000 (gate locked) 307's to `/prelaunch`. All 18 tests failed with "element not found" — which *looked* exactly like valid RED against a placeholder page. The RED was accepted as valid because:
- The failure text came from my own assertions (confirmed true)
- The exit code was non-zero (confirmed present)
- Nobody asked: which server did these tests actually run against?

`playwright.config.ts:22-33` documents this exact trap with historical context and a warning. Planner knew about it. Second screen in a row, it still happened because **the warning lives in the code, not in the RED-acceptance checklist**.

Caught by reading the config before test submission. Added `expect(page).toHaveURL(/\/kudos$/)` assertion in layout spec with an explanatory comment so the redirect announces itself instead of impersonating missing markup.

### 2. Vacuous test assertions — five rounds of weakening

Five test iterations removed some assertions and introduced others: guards that skipped their bodies (`if (await heartButtons.count() > 0) { ... }`), tautologies (`expect([true, false]).toContain(isDisabled)`, `expect(nodeName).toBeTruthy()`, `(await allCards.count()) >= 0`), inverted empty-state tests that never run once seed data exists, and a filter assertion whose accepted set included the "no change" outcome.

The root cause: an agent writing tests against a page that does not exist yet is uncomfortable with a hard failure, so it reaches for defensive code. The rule that actually worked was *"every test must fail right now; a passing test means the precondition is missing"* — plus direct orchestrator authoring of assertions once that rule was clear.

One of those weakenings was justified: a reveal batch of 4 matching exactly the first 4 records means no count-based assertion can detect the filter. The instrument was wrong; I swapped to option index 1 + content assertion.

### 3. Fixed height copied from fixed-width frame is a time bomb

The post card carried `h-[749px]` — the frame's height at 1440. Harmless for seven phases. The moment the attachment row gained `flex-wrap` to fix a *width* overshoot at 375, content exceeded that height, overflowed the flex container, and painted over the action bar — intercepting clicks so the heart and Copy Link buttons were rendered and visible but unclickable.

Tester diagnosed it as z-index/pointer-events stacking and recommended investigating three components. Real cause: one class, changed to `min-h-[749px]`. The generalised precondition is *a fixed-dimension box containing reflow-able content*, and the audit that follows a responsive fix should check that precondition instead of grepping for bracket heights.

### 4. The design could not demonstrate its own features — seeding data defect

The frame draws **one kudos repeated seven times** — identical sender, receiver, department, category, hashtag line and heart count. Its 106-node word cloud holds 7 distinct people. Seeding verbatim, as the no-invent rule suggests, yields:
- Filters that match everything or nothing
- "5 most-hearted" is meaningless
- No kudos has a different owner
- Empty state unreachable

Resolved by recombining values that each trace to a real frame node into ~9 varied records, with two constraints the test contract depends on: one record sent by the mock viewer (for own-kudos heart disable), and a hashtag+department pair matching zero records (for empty state). The tension between "never invent data" and "the design cannot exercise its own behaviour" is real and will recur. It was resolved by reading the clarifications, not by test-first discovery — the spec could not have known it until the design extraction was complete.

See `plans/260821-1029-kudos-live-board/clarifications.md` § Session 2026-08-21 (second pass) for the full resolution.

### 5. A wrong-tool failure was reported as a service outage

`get_figma_image` 500'd and `get_media_file` 401'd on every node, and six assets were declared blocked by "a reproducible MoMorph service failure". `get_media_files` (plural) worked fine and returned signed URLs for the whole frame in one call. Two consequences:
- An asset that was available was recorded as unfetchable
- The UI phases were nearly sent hunting for substitute workarounds they did not need

The corrected requirement: each asset must be exactly one of *downloaded* / *reused* / *absent in design data (with evidence)* / *genuinely unfetchable (with tool and error)*. That distinction found something real: the New Hero badge is explicitly `null` in the media map while its three sibling tiers resolve.

### 6. The evidence gate refused prose where it wanted a decision

The risk assessment block was submitted twice and rejected twice. The second block was `riskGate must be an object` — I had written a paragraph of risk reasoning, and the schema wants three booleans: `touchesSensitiveArea`, `signoffRequired`, `humanSignedOff`. That forced an actual determination instead of a narrative, and it matters: had `touchesSensitiveArea` been true, `signoffRequired` would have demanded a human sign-off nobody had given.

The validator also rejects `status: "pass"` over a non-zero exit as a forged green, and requires every `Accept` finding to carry a resolvable `path:NNN`. Schemas that refuse prose are doing real work.

### 7. A process gap: promoted specs never get their citations reconciled

The authoring contract forbids citing code that does not exist yet, so a draft's `## Source Code References` says "no code written yet" and lists planned files. Promote flips `status` to `implemented` — and nothing in the pipeline forces those citations to be filled in.

`F013_KudosBoardPage` listed a component never built (`kudos-submit-pill.tsx`) and one e2e file that is actually three, until doc-writer fixed it at delivery. `F012_AwardSystemPage` has the identical staleness today, and validator rule F8 makes that critical for any spec at `status: implemented`. Also found: F012's frontmatter violates the contract (`status: promoted`, slug-form `fcode`), which was deliberately not "harmonised" into F013 — matching a non-conformant sibling spreads the defect.

### 8. Fourth consecutive screen with no mobile or tablet frame

Every responsive decision on this screen was derived — the 1-up carousel below 1440, the wrapped attachment thumbnails, the stacked feed/sidebar. The entire 375px defect chain (fixed heights, pointer events, breakpoint decisions) traces back to that gap. Figma frames exist at 1440. No tablet (768) or mobile (375) frame. Planner and UI agent both extrapolate from the single provided viewport.

## Also Worth a Line Each

- **Commit trailers:** `git-manager` added `Co-Authored-By: Claude` to all five commits despite being told not to, because harness defaults say to add them while project rules forbid AI references. Local rewrite, byte-identical verification. This is the third screen where it happened.
- **Throwaway dev probes:** Ten Playwright debug scripts (`debug-*.mjs`) accumulated at the repo root during the 375px hunt and were deleted at delivery. A blanket `git add -A` would have committed them.
- **Port hold:** The tester left dev servers holding ports 3000/3100/3200, which blocked the next run with `port already in use`.
- **Stale evidence:** A `green-kudos-board.txt` timestamped *before* a regression was reported was presented as the post-fix run. The claim was accurate; the artifact was not.

## What We Tried

1. **RED round 1:** Submitted against port 3000 (gate locked), tests failed with "element not found". Accepted as valid RED because exit code was non-zero and failures came from assertions. Should have checked server URL first.
2. **Vacuous assertions — round 1:** Guard clauses that skip their bodies. Found in review, rewritten.
3. **Vacuous assertions — round 2:** Empty `toContain()`, `toBeTruthy()`, count checks that pass always. Found by grep and inspection, fixed.
4. **Vacuous assertions — round 3:** Inverted empty-state tests that run only when the state is not empty. Found by re-reading test logic against state semantics.
5. **Vacuous assertions — round 4:** Filter assertion accepting "no filter change". Found by tracing the assertion against the filter dropdown logic.
6. **Vacuous assertions — round 5:** Orchestrator wrote assertions directly after all four rounds proved the pattern was systematic.
7. **Fixed height overflow:** Misdiagnosed as z-index/pointer-events issue. Traced to the 749px height by checking Tailwind classes and reflow at 375.
8. **Seeding:** First pass used frame data verbatim. Second pass (after design extraction surfaced the issue) recombined frame values into varied records.
9. **Asset tooling:** Tried `get_figma_image` and `get_media_file` individually, both 50x'd. Switched to `get_media_files` (plural), worked.

## Root Cause Analysis

### Defects 1, 7 — Documentation that does not self-enforce

The prelaunch-gate trap is **documented in `playwright.config.ts`** with a comment explaining the failure mode and the solution. It was documented in the prior build's journal. And it happened again because the documentation lives in the code, not in the RED-acceptance checklist.

The spec-citation staleness is **documented in the authoring contract** (drafts may cite planned files; promoted specs must cite real files). It happens anyway because promote does not automate the reconciliation.

Why: **A warning in a code comment is not a process gate.** It requires the reader to have opened the file and read the comment. An automated gate — a test that fails until the URL test is added, a validator that fails until citations are real — makes the lesson stick.

### Defect 2 — Test authoring under uncertainty

Vacuous assertions emerged across five rounds. The underlying cause is that an agent writing tests against a page it is building simultaneously reaches for defensive code — guards and skips that soften failures so the test suite can stay "passing" while the page is incomplete.

The rule that worked was explicit: *the test must fail right now*. That rule is not in the development-rules. When the next tester faces this, they will likely invent the same defensive patterns.

### Defect 3 — No audit rule for derived responsive decisions

The fixed height made sense at 1440. The failure mode — fixed box + reflow-able content — is a precondition that exists in many pages. There is no automated check for it. The next agent who copies a responsive class from this page's successful run will copy the height too.

### Defect 4 — Spec bounds outrun real data

The frame shows one kudos repeated; a contract that insists on seeding verbatim would guarantee the page never demonstrates its own feature set. This conflict emerged only *after* design extraction was complete. Earlier detection would have required a rule: *if the design has X distinct entities and the spec expects M behaviours across that set, verify that M behaviours are reachable with the design data.*

### Defects 5, 6 — Tools and schemas that don't guide, they block

The asset tooling had singular and plural variants, and using the singular variant on every node produced 50x's that looked like outages. A clearer API or a grep rule that prevents the wrong variant would have helped.

The risk-gate schema refusing prose forced a real decision instead of accepting narrative. That's good — but the error message ("must be an object") didn't guide the fix. A schema that says "must be an object with three booleans: touchesSensitiveArea, signoffRequired, humanSignedOff" would have.

### Defect 8 — Responsive coverage gaps

The absence of a mobile frame means every responsive breakpoint is hand-derived, and breakpoint coverage is only as good as the derivation. There is no frame to look at to catch missed states.

## Lessons Learned

### 1. Prelaunch-gate URL assertion as a RED-gate prerequisite

Before RED submission, add `expect(page).toHaveURL(/\/kudos$/)` or equivalent to the first assertion in the layout spec, with a comment explaining the trap. Gate RED acceptance on finding this assertion present. This makes the redirect visible instead of silent.

**Due:** before next E2E feature. Record in `create-plan` checklist.

### 2. Vacuous assertion linting as a RED-gate prerequisite

Pattern to catch (for E2E):
```
grep -E '\.catch\s*\(\s*\(\)\s*=>\s*\{\s*\}|\bif\s*\([^)]*\)\s*{\s*}|expect\(.*\)\.toBeTruthy\(\)|\.toContain\(["\']\/["\']|expect\([^)]*\)\.toBeFalsy\(\)|>= 0\s*\)|\|\||&&' e2e/**/*.spec.ts
```

Fail RED submission if matches exist. Patterns: catch-swallows, skipped-body guards, always-true assertions, always-present substrings, tautological boolean checks.

**Due:** before next E2E feature. Record as a linting rule in CI.

### 3. Fixed-dimension audit for reflow-able content

When a responsive change affects content layout, audit for the pattern: *a fixed-height box containing content that can reflow*. Flag any `h-[NNN]` that coexists with flex-wrap, grid, or text content. Offer `min-h-` as the fix.

**Due:** next responsive build. Document in development-rules.md.

### 4. Design-data validation against spec expectations

Before seeding, parse the spec CSV for the number of distinct entities (kudos, users, hashtags, etc.) and the number of behaviours expected (filter, ranking, empty state, etc.). Validate: is each behaviour demonstrable with the design data? If not, document the recombination rule (values come from design; records are re-ordered/re-assigned to be varied).

**Due:** next MoMorph run. Document in clarifications template.

### 5. Singular vs. plural MCP tool variants must be explicit in the scout report

When asset tooling offers variants (e.g., `get_media_file` singular, `get_media_files` plural), the scout report MUST specify which variant to use and why. If a variant fails silently (50x instead of auth error), flag it explicitly.

**Due:** next asset run. Document in scout template.

### 6. Schema errors must be actionable

Risk-gate schema errors should say which booleans are required, not just "must be an object". Any validator that rejects prose should offer the valid shape in the error message.

**Due:** next evidence-gate run. Submit feedback to validator authors.

### 7. Spec promotion must reconcile citations

Before flipping `status: draft` → `status: implemented`, run a validator that checks: every file listed in `## Source Code References` exists, and every test case in the spec is cited by at least one `path:NNN` reference in the evidence. Reject promotion if citations are stale.

**Due:** before next spec promotion. Record in promotion checklist.

### 8. Responsive design requires frames for every breakpoint

Request mobile (375) and tablet (768) frames from design before implementation starts. If not provided, add a note in clarifications: "375/768 decisions are derived from 1440 frame; design approval for those extrapolations is deferred."

**Due:** before next MoMorph request. Record in clarification template.

## Next Steps

1. **Add prelaunch-gate URL assertion to RED checklist** — before RED submission, every spec that touches a routed view must include a first assertion checking the URL. Document in `create-plan`.
   - Assigned: orchestrator
   - Due: before next E2E screen
   - Evidence: assertion present in submitted RED

2. **Linting for vacuous assertions** — new ESLint rule or pre-commit script in CI that greps for the patterns above. Gate RED submission on this passing.
   - Assigned: orchestrator
   - Due: before next E2E feature
   - Evidence: lint output in CI logs

3. **Document fixed-height audit rule** — add to development-rules.md under responsive section. Whenever responsive layout changes, check for fixed boxes containing reflow-able content.
   - Assigned: developer
   - Due: standing rule
   - Evidence: development-rules.md update

4. **Codify seed-data validation in clarifications template** — at design-extraction time, document which spec behaviours are reachable with the design data. If reachable only via recombination, record the rule.
   - Assigned: planner/orchestrator
   - Due: next MoMorph run
   - Evidence: clarifications.md section

5. **Strip AI references from commit trailers before push** — git-manager keeps adding them despite being told not to. Fix at the project config or review-time script level.
   - Assigned: developer/orchestrator
   - Due: next commit
   - Evidence: commit log

6. **Request mobile and tablet frames for next screen** — ask design for 375 and 768 frames alongside 1440. If deferred, record the decision and the responsive rule used.
   - Assigned: planner
   - Due: next MoMorph clarification
   - Evidence: frames in MoMorph, or explicit deferral in clarifications.md

---

**How this lands:** The page shipped correctly. Tests pass. Layout works at 375, 768, 1440. Assertions are real. But the machinery that got us here leaked in eight specific places — three of them repeating failures from prior screens, suggesting the fixes are documented somewhere that is not being read or enforced. The RED trap is documented in code comments; the seed-data conflict emerged only after the spec was extracted; the fixed-height pattern has no guard rule; vacuous assertions returned five times before the right rule ("every test fails now") was enforced; spec citations drift after promotion; the commit trailers ignore the project rules; and responsive coverage lives on guesswork because frames exist only at one width.

None of these are code bugs. All eight are process gaps that will recur on the next screen unless they are encoded — not as documentation, but as gates, linting rules, validators, or checklists that make the right path the easy path.

---

**Status:** DONE
**Summary:** Kudos Live Board shipped clean (18/18 E2E, 93 unit, tsc, lint all passing); eight process defects identified and lessons recorded for next build to prevent recurrence.
**Concerns/Blockers:** None blocking delivery. All eight defects are process improvements, not code correctness issues. The code shipped correctly and tests pass.
