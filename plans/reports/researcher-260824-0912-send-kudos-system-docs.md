# Researcher report — forward-drafted system docs for Gửi lời chúc Kudos (`/kudos/send`)

**Deliverables written** (plan-local drafts, NOT `docs/`):
- `plans/260824-0912-send-kudos-wishes/spec/system/architecture.md`
- `plans/260824-0912-send-kudos-wishes/spec/system/permissions.md`

Both carry the single-file draft frontmatter (`status: draft`, `authored_by: takumi`,
`created: 2026-08-24`, `lang: vi`) per `spec-authoring-contract.md` § Forward-Authored System
Docs — no `fcode:` (system docs aren't features).

## Sources read

- `~/.claude/skills/rebuild-spec/references/spec-authoring-contract.md` (governing contract)
- `plans/260824-0912-send-kudos-wishes/clarifications.md` (8 decisions, authoritative)
- `plans/260824-0912-send-kudos-wishes/evidence/study-context.json`
- `docs/vi/system/architecture.md`, `docs/vi/system/permissions.md`
- `docs/vi/generated/permissions-matrix.md`, `docs/vi/generated/entities.md`
- Code: `proxy.ts`, `lib/supabase/{server,client,proxy-session,env}.ts`,
  `lib/session/session-provider.tsx`, `supabase/config.toml`, `supabase/seed.sql`,
  `components/kudos/kudos-action-bar.tsx`, `lib/kudos/star-tiers.ts`

## Provisional / TBD markers used (why)

Per contract "NEVER fabricate codes," every new machine-allocated code is `TBD (draft)`,
never guessed:

- **MODEL### for `profiles`, `hashtags`, `kudos`** — architecture.md § 1. `entities.md` only
  has `MODEL001_Award`; real numbering happens at reconcile.
- **Bucket/route/migration/server-action file names** — architecture.md § 1, § 4. No code
  written yet, so no `**Source:** path:N-M` citation exists anywhere in the draft (a fabricated
  one would flip from warning to critical at promote).
- **PERM### for the new `/kudos/send` route guard** — permissions.md § 1, § "Cross-reference".
  `permissions-matrix.md` currently ends at PERM004; the new gate is the same `route-guard`
  type but is TBD (draft), not a guessed PERM005.
- **RLS/storage bucket policy specifics** — permissions.md § 2. Only the hard constraint
  (sender from `auth.uid()`, never client input) is a decided fact from clarifications.md;
  read-policy shape for `kudos`/`profiles`/`hashtags` and the bucket policy are marked TBD —
  clarifications.md doesn't settle these, only the sender-forgery constraint.

## One input-doc mismatch worth flagging

The task brief asked me to also read `docs/vi/generated/data-model.md` — that file does not
exist in this repo; `docs/vi/generated/entities.md` is the actual generated inventory covering
both the ERD and the non-entity data shapes (`SessionState`, `Supabase Session`, etc.). I read
`entities.md` in its place; no `data-model.md` was created or referenced.

## Judgment calls that stayed inside the contract

- Rationale ("why write-only," "why seeded tables instead of free text") is intentionally
  **absent** from both drafts — contract routes design rationale to an ADR, not the draft.
  No ADR exists yet for this feature; I noted that explicitly rather than inventing one or
  silently dropping the topic.
- Both drafts are framed as **deltas** (additive sections + explicit cross-references to the
  existing `docs/vi/system/*.md` line numbers/sections), matching how the live docs already
  layer "Cập nhật (lượt X, date)" blocks rather than rewriting prior content — this mirrors
  the existing document's own convention, not an invented format.
- Kept Vietnamese register and terminology consistent with the live docs (e.g. "screen-
  permission" vs "route-guard" typing, "TBD (draft)" phrasing already used in
  `permissions.md`'s own PERM-in-waiting section for the Kudos board's own-kudos heart rule).

## Unresolved / left uncovered

1. Real bucket name, migration file names, and the `/kudos/send` server-action/route file —
   deliberately not decided here; these are implementation-time choices, not system-design
   facts.
2. Read-policy shape for the three new tables and the storage bucket — only the "sender is
   never client-supplied" constraint is settled by clarifications.md; the rest is scoped TBD
   for implement-time RLS authoring.
3. No ADR exists yet for the write-only/seeded-table decisions; architecture.md notes this
   gap rather than fabricating a path.
4. Self-kudos permission question is recorded as genuinely unresolved (clarifications.md
   § Unresolved #3) — permissions.md states plainly that no gate is added, not that one was
   considered and rejected.

**Status:** DONE
**Summary:** Wrote both forward-draft system-doc deltas (architecture.md, permissions.md) under `plans/260824-0912-send-kudos-wishes/spec/system/`, matching the live `docs/vi/system/*` register and the spec-authoring-contract's draft-frontmatter/no-fabricated-codes rules; nothing was written to `docs/`.
**Concerns/Blockers:** `docs/vi/generated/data-model.md` named in the brief does not exist — `entities.md` is the actual generated inventory and was used instead; flagged above so it isn't silently assumed missing/broken.
