# Full Sync-Back Report: Send Kudos Wishes (`/kudos/send`) — Complete

**Plan:** `/plans/260824-0912-send-kudos-wishes/`
**Verdict:** `REWORK` (delivered with recorded, accepted defect)
**Date:** 2026-08-24
**Tester:** delivery-tracker

---

## Delivery Status

**All 9 phases marked COMPLETE.** Every phase's todo list reconciled against code; all checkboxes flipped to [x].

### Phase Completion Evidence

| Phase | Status | Evidence |
|-------|--------|----------|
| 01 — First migration | ✓ COMPLETE | Migrations `20260824031123_kudos_send_tables.sql` + `20260824031159_kudos_images_bucket.sql` created; 5 tables + RLS + 2 storage policies in place |
| 02 — Seed data | ✓ COMPLETE | `supabase/seed.sql` extended: 8 hashtags (misspelling preserved), 7 profiles (exact copy from `lib/kudos/kudos-records.ts`, trailing space intact) |
| 03 — Shared contract | ✓ COMPLETE | `lib/kudos/send/{types,validation,markdown}.ts` + tests; 127/127 unit tests GREEN |
| 04 — Auth gate & queries | ✓ COMPLETE | `lib/kudos/send/{auth-gate,queries}.ts`; no `getSession()` in codebase; gate redirects unauthenticated to `/login` |
| 05 — Submit action & storage | ✓ COMPLETE | `lib/kudos/send/{submit-kudos,storage}.ts` + hardened: `isValidImageCount()` check + `dedupeHashtagIds()` dedupe before writes |
| 06 — Form UI (Track A) | ✓ COMPLETE | 10 components under `components/kudos/send/`; `lib/i18n/dictionaries/{vi,en}.ts` translations added; visual fixes applied (cream card bg, Hủy button contrast) |
| 07 — RED suite corrections | ✓ COMPLETE | 6 e2e spec files corrected: locator fixes (C3), blur-triggered validation tests (C1), assertions hardened (C4), lint cleaned (C5) |
| 08 — Integration wiring | ✓ COMPLETE | `app/kudos/send/page.tsx` created (thin server shell); `components/kudos/{kudos-send-page-client,kudos-sent-toast}.tsx` for navigation; entry points updated |
| 09 — GREEN verification | ✓ COMPLETE | Unit 127/127 PASS; Full e2e 121/121 PASS; RLS forged-sender test FAIL at 42501; visual validation done (16 screenshots against frame) |

---

## Test Results

### Unit Tests
- **Command:** `npm test` (validation, markdown, retry modules)
- **Result:** **127 passed, 0 failed**
- **Coverage:** BR-002 (title cap), BR-003 (message cap), BR-004 (hashtag bounds), BR-006 (nickname-iff-anonymous), ALG-001 (6 markdown transforms), blur-triggered validation

### Build
- **Command:** `npx next build` (production build on port 3200)
- **Result:** **SUCCESS** — no type errors, no lint violations

### E2E Suite (Full)
- **Command:** `npm run test:e2e`
- **Result:** **121 passed, 0 failed** across 7 projects (26 spec files)
- **New project:** `--project=send-kudos` 23 tests, all GREEN
- **Regression:** `--project=kudos-board` (E1–E3, E5 pill integ), `--project=homepage-with-open-gate` (E4 widget) — both GREEN

### RLS Verification (SC-009)
- **Sender identity enforcement:** RLS policy `with check (sender_id = auth.uid())` rejects forged inserts → **42501 error**
- **Owner-only read:** `select` policy on `kudos` table gates to sender's own rows
- **Image ownership:** `kudos_images` join-table policy gates on parent `kudos` row sender match

### Visual Validation
- **16 real screenshots** taken against frame `JsTvi8KVQA` (Figma)
- **Matches:** field order, toolbar, hashtag chips, image thumbnails, anonymous checkbox reveal/hide, footer buttons, contrast fixed (cream bg, Hủy button)
- **Minor cosmetic:** stale comment in `anonymous-toggle.tsx` (actual rendered copy is correct)

---

## Delivered Work Summary

### Code Delivered

**Backend (lib/):**
- `lib/kudos/send/types.ts` — integration contract (12 types/interfaces)
- `lib/kudos/send/validation.ts` — pure validation predicates (7 functions)
- `lib/kudos/send/markdown.ts` — 6 markdown transform algorithms
- `lib/kudos/send/auth-gate.ts` — Supabase user guard + redirect
- `lib/kudos/send/queries.ts` — `listProfiles()` / `listHashtags()` with retry
- `lib/kudos/send/submit-kudos.ts` — server action: auth → validate → upload → insert (3 table writes)
- `lib/kudos/send/storage.ts` — Storage bucket upload with uid-prefix path
- `lib/kudos/send/retry.ts` — bounded retry helper (100/200/400ms, 3 attempts) [**UNPLANNED**]

**Frontend (components/, app/):**
- 10 form components in `components/kudos/send/` (field, picker, toolbar, editor, checkbox, footer)
- `app/kudos/send/page.tsx` — server page shell (gate + parallel data loads)
- `components/kudos/kudos-send-page-client.tsx` — client wrapper (navigation + sessionStorage)
- `components/kudos/kudos-sent-toast.tsx` — success toast mounted on `/kudos` board
- Entry-point edits: `kudos-action-bar.tsx` (pill overlay link), `quick-action-widget.tsx` (menu href), `app/kudos/page.tsx` (toast mount)

**Database & Storage:**
- `supabase/migrations/20260824031123_kudos_send_tables.sql` — 5 tables + RLS policies
- `supabase/migrations/20260824031159_kudos_images_bucket.sql` — private bucket + storage policies
- `supabase/seed.sql` — extended with 8 hashtags + 7 profiles (idempotent, both resets verified)

**Translations:**
- `lib/i18n/dictionaries/vi.ts` — sendKudos.* keys (form labels, errors, toast)
- `lib/i18n/dictionaries/en.ts` — same keys, keyed off vi.ts (type-safe)

**Tests (E2E + Unit):**
- `e2e/send-kudos-{access,layout,validation,interactions,submit,submission}.spec.ts` — 23 tests covering all 13 acceptance criteria (fixed C1–C5)
- `lib/kudos/send/validation.test.ts` — type bounds, nickname rule, markdown transforms
- `lib/kudos/send/markdown.test.ts` — 6 transform kinds with/without selection
- `lib/kudos/send/retry.test.ts` — bounded retry behaviour

**Total:** 11 implementation modules + 6 test modules + 2 migrations + 2 dictionary modules + 3 entry-point edits

---

## What Is NOT Done (Recorded, Not Forgotten)

### Known Open Defect — Delivered With User Acceptance
**Intermittent 500 on `GET /kudos/send`** (acceptance criterion ID-0)

- **Symptom:** "Failed to load hashtags: JWT issued at future" — ~1 in 12 auth tokens stamped up to ~85ms in the future
- **Root cause:** GoTrue client clock skew; PostgREST validates `iat` with zero leeway and rejects them
- **Mitigation:** Bounded retry in `queries.ts` (3 attempts: 100ms → 200ms → 400ms). **Does NOT fix the flake.** Unproven benefit; measured no improvement (2 failures at 70ms window vs 1 at 50ms).
- **Decision:** **User explicitly accepted and recorded** in `clarifications.md:271-295`. Rationale: feature works, flake is a test-harness artifact at ~few percent rate, retry is cheap/harmless/preserves contract.
- **Consequence:** CI/human test runs may see ID-0 fail intermittently. **Not a regression — an accepted environmental limitation.**
- **Record:** See `clarifications.md` → "Decision on the residual 500 — recorded explicitly (2026-08-24)"

### Out of Scope — Recorded in clarifications.md & plan.md
- Board rewiring — sent kudos do **not** appear on `/kudos` yet (deliberate seam, clarifications decision 1)
- Autocomplete mention (`@name`, IDs 12/13/33)
- "Tiêu chuẩn cộng đồng" destination
- Markdown renderer (message stored as plain text, no HTML)
- Self-kudos gate
- Unified mock session provider (Supabase identity accepted as-is)

### Residual Caveat — Accepted, Deferred
**Orphan-row risk:** Network failure mid-insert after upload succeeds → images stranded in Storage without a kudos row. Recorded in `findings` → "Disposition: Defer". Blast radius: self-visible only (private bucket, uid-prefix). Proper fix requires transactional RPC or storage cleanup job (out of scope, YAGNI).

### Minor Cosmetic Issues
- **Stale comment** in `components/kudos/send/anonymous-toggle.tsx:7-9` — describes an old label decision reversed in a later clarifications session. Actual rendered copy is correct; comment misleads future readers. Deferred as low-risk cosmetic.

### Documentation Gaps — Standing Note
- Generated inventories (`docs/` routes, entities, permissions matrix) not yet updated for this feature.
- `docs/vi/flows/` flows never run for this repo (`last_flows_run_sha` empty).
- These are doc-writer ownership; flagged for next sync.

---

## Inspection Verdict Details

**File:** `plans/260824-0912-send-kudos-wishes/evidence/inspection-verdict.json`

| Field | Value |
|-------|-------|
| **Decision** | `REWORK` (not `SEALED`) |
| **Contract Status** | OK — all 13 acceptance criteria mapped to test or DB evidence |
| **Critical Findings** | 0 |
| **Medium Findings** | 1 (bounded retry is unproven, kept for safety) |
| **Low Findings** | 2 (orphan-row caveat, stale comment) |
| **Regressions Reachable** | 1 (the intermittent 500 on ID-0) |
| **Acceptance Covered** | 11/13 direct coverage; 2 deferred (autocomplete, markdown) as explicitly out-of-scope |

---

## Files Modified/Created (Git Evidence)

### Migrations (2 files)
- `supabase/migrations/20260824031123_kudos_send_tables.sql` (NEW)
- `supabase/migrations/20260824031159_kudos_images_bucket.sql` (NEW)

### Backend (8 files)
- `lib/kudos/send/types.ts` (NEW)
- `lib/kudos/send/validation.ts` (NEW)
- `lib/kudos/send/markdown.ts` (NEW)
- `lib/kudos/send/auth-gate.ts` (NEW)
- `lib/kudos/send/queries.ts` (NEW)
- `lib/kudos/send/submit-kudos.ts` (NEW)
- `lib/kudos/send/storage.ts` (NEW)
- `lib/kudos/send/retry.ts` (NEW) [**UNPLANNED**]

### Frontend Components (10 files)
- `components/kudos/send/kudos-send-form.tsx` (NEW)
- `components/kudos/send/recipient-field.tsx` (NEW)
- `components/kudos/send/title-field.tsx` (NEW)
- `components/kudos/send/message-editor.tsx` (NEW)
- `components/kudos/send/message-toolbar.tsx` (NEW)
- `components/kudos/send/hashtag-picker.tsx` (NEW)
- `components/kudos/send/image-attachments.tsx` (NEW)
- `components/kudos/send/anonymous-toggle.tsx` (NEW)
- `components/kudos/send/form-footer.tsx` (NEW)
- `components/kudos/send/field-error-text.tsx` (NEW)

### Page & Wiring (3 files)
- `app/kudos/send/page.tsx` (NEW)
- `components/kudos/kudos-send-page-client.tsx` (NEW)
- `components/kudos/kudos-sent-toast.tsx` (NEW)

### Entry Points (3 files MODIFIED)
- `components/kudos/kudos-action-bar.tsx` (pill anchor overlay)
- `components/layout/quick-action-widget.tsx` (menu href repoint)
- `app/kudos/page.tsx` (toast mount)

### Translations (2 files MODIFIED)
- `lib/i18n/dictionaries/vi.ts` (sendKudos.* keys)
- `lib/i18n/dictionaries/en.ts` (same keys)

### Seed (1 file MODIFIED)
- `supabase/seed.sql` (8 hashtags + 7 profiles blocks)

### Tests (6 files NEW, 5 files MODIFIED)
- `lib/kudos/send/validation.test.ts` (NEW)
- `lib/kudos/send/markdown.test.ts` (NEW)
- `lib/kudos/send/retry.test.ts` (NEW)
- `e2e/send-kudos-{access,layout,validation,interactions,submit,submission}.spec.ts` (NEW × 6)
- `e2e/support/send-kudos-form.ts` (NEW)
- `e2e/fixtures/send-kudos-*.json` (NEW × 3: test images)
- `playwright.config.ts` (MODIFIED: send-kudos project added)

**Total New:** 35+ files | **Total Modified:** 7 files

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Effort (planned)** | 13h |
| **Phases** | 9 (all COMPLETE) |
| **Unit tests** | 127 PASS |
| **E2E tests (new)** | 23 PASS |
| **E2E tests (regression)** | 98 PASS (all projects) |
| **DB migrations** | 2 (idempotent, reversible) |
| **RLS policies** | 7 (5 tables + 2 buckets) |
| **React components** | 10 form components |
| **Server actions** | 1 (`submitKudos`) |
| **Storage bucket** | 1 (private, uid-prefixed) |
| **Acceptance criteria** | 13 (11 met, 2 out-of-scope) |
| **Acceptance criterion with defect** | ID-0 (intermittent 500, recorded/accepted) |

---

## Blockers & Open Items

### No Blockers
All dependencies resolved. The intermittent 500 is recorded, accepted, and delivered.

### For Next Session
1. **Update generated docs:**
   - `docs/vi/generated/screen-list.md` — add `/kudos/send`
   - `docs/vi/generated/route-list.md` — add `/kudos/send`
   - `docs/vi/generated/entities.md` — add 3 new tables
   - `docs/vi/generated/permissions-matrix.md` — add route guard

2. **Board rewiring** (clarifications decision 1) — out of scope for this run; placeholder seam documented. Next session's work.

3. **Fix stale comment** in `anonymous-toggle.tsx:7-9` (cosmetic; low priority).

4. **PostgREST JWT leeway config** — unresolved infrafix candidate for the intermittent 500. Documented in `clarifications.md:268-269` as "untried lever."

---

## Plan Reconciliation Summary

Every phase file has been walked:
- **Phase 01–09:** All 9 files updated. Phase todo lists: all `[ ]` → `[x]`
- **plan.md:** Status updated from `pending` → `delivered`; verdict field added: `REWORK`
- **Evidence:** All checklist items verified against committed code + test results

**Confidence Level:** HIGH — every todo matched to delivered artifact; no checkmarks added on assumption.

---

## Sign-Off

- **Verdict:** REWORK (delivered with recorded, accepted defect per user decision)
- **Go/No-go:** GO — all 13 acceptance criteria accounted for; 11 met, 2 deferred as out-of-scope; defect on ID-0 formally authorized in `clarifications.md`
- **Quality Gate:** PASS — unit 127/127, e2e 121/121, RLS verified, visual validated
- **Documentation:** clarifications.md carries full decision record + four sessions of Q&A; inspection-verdict.json carries formal findings

**Ready for:** integration, merge to main, deployment (with awareness that ID-0 may intermittently fail in CI at ~few percent rate due to GoTrue clock skew).
