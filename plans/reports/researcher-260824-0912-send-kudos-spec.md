# Researcher report — Send Kudos Wishes spec fill

Filled the 4 pre-scaffolded draft files under
`plans/260824-0912-send-kudos-wishes/spec/send-kudos-wishes/` (technical-spec.md,
business-context.md, screens.md, edge-cases.md). Frontmatter untouched, no `fcode:` added, no
new files created.

## Preflight

`Skill(tkm:help)` invoked per persona preflight (loaded the help skill's own routing body — no
args passed, since the task already named its governing contract explicitly). Neither
`tkm:research` nor `tkm:search-docs` applied — this is spec authoring against an explicit
contract (`~/.claude/skills/rebuild-spec/references/spec-authoring-contract.md` +
`feature-spec-researcher-contract.md`), not open-ended technology/library research, so I read
those contracts directly instead of re-routing through intent-matching.

**MoMorph MCP was not available in this subagent's toolset** — no `mcp__momorph__*` function
was exposed to this session despite the task's MoMorph refs block. I relied on
`clarifications.md`, which states it already read `ihQ26W78P2` (26 specs/57 TCs) and `p9zO-c4a4x`
(hashtag vocabulary) via MCP and transcribed the field-level facts (row IDs, TC IDs, exact
copy strings) faithfully. This is a real gap against the "MCP design data is authoritative,
never guess" rule — I did not independently re-verify the MoMorph rows myself, I trusted a
second-hand but well-cited transcription. Flagging this as the report's main limitation.

## IDs allocated (all local to this draft, sequential, no hyphen)

- **FR-001 … FR-014** — one per behavior, placed under each US's `Requirements fulfilled`.
- **BR-001 … BR-008** — auth gate, Danh hiệu cap, message cap, hashtag min/max, image type/max,
  anonymous→nickname, submit-disabled, cancel-always-enabled.
- **DEC-001** — multi-predicate Gửi-button enablement (4 required fields AND'd together).
- **SM-001** — image attachment count (0..5), `kind: ui`.
- **ALG-001** — toolbar markdown-wrap-selection transform (6 buttons).
- **INT-001 / INT-002** — Supabase Storage upload (Storage as an external system, past the
  navigator.clipboard "not an integration" precedent set by F013) and the `kudos` insert
  itself (chose to treat the app's first real backend write as INT, unlike F013's client-side
  data reads).
- **SC-001 … SC-009** — one per US, referenced both under Cross-Cutting Logic > Verification and
  per-US `**Verification:**`.
- **US001 … US009** — Auth gate / recipient / title+message / toolbar / hashtag / image / anon /
  validate+submit-or-cancel / persist+redirect.

No `**Source:** path:N-M` citations to unwritten code anywhere in the file — every BR/DEC/SM/ALG/
INT block cites either a MoMorph frame+row/TC-ID or a `clarifications.md` decision number
instead, per the greenfield contract's blanket ban on fabricated code citations in any draft
spec (not just the `## Source Code References` section — I read that rule as applying file-wide
after re-reading `spec-authoring-contract.md` line 105-110).

## Design decisions made without an explicit source (flagged, not hidden)

1. **Two-identity-space schema**: `profiles` (recipients, seeded from `lib/kudos/`) is a
   separate table from `auth.users` (sender). Self-kudos isn't gated (matches clarifications
   Unresolved #3) but this also means the sender may not even *have* a `profiles` row unless
   their name happens to already be in `lib/kudos/kudos-records.ts` — recorded as an Assumption,
   not resolved.
2. `profiles.id`/`hashtags.id` reuse existing string slugs/values from `lib/kudos/` and the
   design's literal hashtag strings, rather than inventing synthetic UUIDs disconnected from the
   one real vocabulary that exists — DRY choice, not a design fact.
3. Hashtag min/max and Danh hiệu/message length caps are enforced app-side only, no DB
   constraint/trigger — YAGNI for the first-ever migration in this repo.
4. Storage bucket name and public/signed-URL policy are explicitly left `TBD` — clarifications.md
   commits to Storage but not to bucket shape.

## Gaps I could not resolve from the sources

- Storage bucket visibility (public vs private+signed URL) — not in clarifications.md, not
  guessable from `supabase/config.toml` (storage buckets section is fully commented out).
- Exact "Hủy" destination — inferred `/kudos` by symmetry with the success redirect; no spec row
  states it.
- Whether a forward-authored `docs/system/permissions.md` draft is warranted (contract's Trigger
  Mapping says yes — this feature adds a real auth/RBAC-adjacent gate) — out of scope of the 4
  requested files, not created; flagged under the feature's own Unresolved/Client-behavior-anchor
  note instead of silently skipped.

**Status:** DONE_WITH_CONCERNS
**Summary:** All 4 files filled in place with FR/BR/SM/DEC/ALG/INT/SC/US codes grounded in
`clarifications.md` + `study-context.json`; no fabricated code citations; no new files/fcode/
frontmatter changes.
**Concerns/Blockers:** MoMorph MCP tools were unavailable in this session — content is sourced
from `clarifications.md`'s transcription of MoMorph data, not a first-hand MCP fetch. A
forward-authored `permissions.md` system-doc delta (contract-recommended for auth-touching
features) was not produced — outside the 4-file scope given. Storage bucket shape and "Hủy"
destination remain open decisions for implementation.
