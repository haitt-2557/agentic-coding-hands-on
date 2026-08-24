# Phase 05 — Submit server action and Storage upload

**Track:** B · **Owner agent:** `implementer` · **Priority:** P1 · **Status:** pending · **Effort:** 1.5h
**Depends on:** 01 (tables + bucket), 03 (contract), 04 (auth gate) · **Unblocks:** 08

## Context Links

- [dom-contract.md](dom-contract.md) → **E5** (no query param), D13, and the "no `'use server'` in the repo yet" note
- [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) → FR-013, FR-014, INT-001, INT-002, SC-009, US009, `## DB Impact per Event`
- [spec/system/architecture.md](spec/system/architecture.md) §4 · [edge-cases.md](spec/send-kudos-wishes/edge-cases.md) rows 12–14

## Overview

The write path: validate server-side, upload images to Storage, insert `kudos` +
`kudos_hashtags` + `kudos_images`, return the new id. **The repo's first Server Action** —
`grep -rn "use server"` currently returns nothing.

## Key Insights

- **The action must not redirect.** `send-kudos-submission.spec.ts:43` asserts
  `toHaveURL(/\/kudos$/)` — anchored, so `?sent=1` fails — and a toast must appear on `/kudos`.
  The only clean mechanism is: action returns `{ ok: true, kudosId }`, the client writes a
  `sessionStorage` flag, then `router.push('/kudos')` (E5). So **no `redirect()` in this file**,
  and no query string. Phase-08 owns the client half.
- `sender_id` is taken from `requireSupabaseUser()` (phase-04), never from the payload
  (FR-014). Phase-01's RLS `with check (sender_id = auth.uid())` is the backstop, not the
  primary control.
- Re-validate everything with phase-03's pure functions. Client validation is defeated with
  DevTools (architecture.md §4) — a passing client check authorises nothing.
- Images upload **at submit only** — there is no draft-upload flow, so there is never an
  "uploaded but unsubmitted" orphan (architecture.md §4).
- Ordering matters for cleanup: upload first, then insert. If the insert fails after uploads
  succeed, the objects are orphaned — accept it and log it (see Risk), do not build a
  transactional saga for the first write path (YAGNI).
- `is_anonymous` false must store `nickname = null` regardless of what the client sent (BR-006).

## Requirements

**Functional:** FR-013 (write row + upload + hand back success), FR-014 (RLS-safe sender), INT-001, INT-002.
**Non-functional:** every file <200 lines; no secrets; errors returned as typed results, never thrown to the user as a stack; upload is sequential-safe for ≤5 small files.

## Architecture

```text
lib/kudos/send/submit-kudos.ts        'use server'
  submitKudos(input: SubmitKudosInput): Promise<SubmitKudosResult>
    1. user = await requireSupabaseUser()                       // phase-04, identity
    2. errors = validateDraft(draftFrom(input))                 // phase-03, server-side re-check
       -> if any: return { ok:false, error, field }
    3. reject any image failing isAcceptedImage()               // BR-005, type + 5 MiB
    4. paths = await uploadKudosImages(user.id, files)          // storage.ts
    5. insert kudos row (sender_id: user.id, nickname: isAnonymous ? nickname : null)
    6. insert kudos_hashtags (1..5 rows), kudos_images (0..5 rows)
    7. return { ok:true, kudosId }

lib/kudos/send/storage.ts
  uploadKudosImages(userId, files): Promise<{ path: string; originalFilename: string }[]>
    -> bucket 'kudos-images', path `${userId}/${crypto.randomUUID()}-${safeName}`
       (first segment MUST be the uid — phase-01's storage policy requires it)
```

Data flow:

```text
client (phase-06 form)  --SubmitKudosInput (no senderId)-->  submitKudos [server]
                                                               |-- auth.uid()  --> sender_id
                                                               |-- Storage  --> paths
                                                               '-- Postgres --> 1 + 1..5 + 0..5 rows
client <-- { ok:true, kudosId } -- then sessionStorage flag + router.push('/kudos')  [phase-08]
```

## Related Code Files

**Create (owned exclusively):** `lib/kudos/send/submit-kudos.ts`, `lib/kudos/send/storage.ts`
**Read for context:** `lib/kudos/send/types.ts`, `validation.ts`, `auth-gate.ts`, `queries.ts`, `lib/supabase/server.ts`, `supabase/migrations/*` (bucket id + path rule)
**Do not touch:** `app/**` (phase-08), `components/**` (phase-06), `supabase/**` (phases 01/02), `e2e/**`.

## Implementation Steps

1. **Read the Next 16 Server Actions / `page.md` docs under `node_modules/next/dist/docs/` before
   writing.** First `'use server'` in the repo — no local precedent to copy, and AGENTS.md
   requires it.
2. Write `storage.ts`: upload with `contentType` from the file, `upsert: false`, path prefixed by
   `userId`. Return both the stored path and the original filename.
3. Write `submit-kudos.ts` with `'use server'` at the top. Follow the numbered order above
   exactly — identity, then validation, then upload, then inserts.
4. Force `nickname = null` when `!isAnonymous`; never persist a stale nickname (BR-006).
5. On any Supabase error return `{ ok: false, error }` with a message safe to show a user; log
   the underlying error server-side. Wrap the upload/insert sequence in try/catch per
   development-rules ("wrap risky paths").
6. Prove FR-014 by hand: call the insert with a forged `sender_id` via psql/REST as the fixture
   user and confirm RLS rejects it (SC-009, edge-cases row 12).
7. `npx tsc --noEmit`, `npm run lint`, `npx next build`.

## Todo List

- [x] Next 16 Server Action docs read first
- [x] `'use server'` present; no `redirect()` and no query-string anywhere in this file (E5)
- [x] `sender_id` sourced from `requireSupabaseUser()` only; absent from `SubmitKudosInput`
- [x] Server-side re-validation via phase-03 functions (not a reimplementation)
- [x] Image type + 5 MiB cap enforced server-side
- [x] Upload path's first segment is the uid, matching phase-01's storage policy
- [x] `nickname` nulled when not anonymous
- [x] 1 `kudos` + 1..5 `kudos_hashtags` + 0..5 `kudos_images` rows per success
- [x] Forged-`sender_id` insert proven rejected
- [x] typecheck + lint + `next build` clean

## Success Criteria

- A valid call inserts **exactly one** `kudos` row with `sender_id = auth.uid()` and the right
  number of join/image rows — verified in psql (SC-009, US009 scenarios 1–2).
- A forged `sender_id` insert is rejected by RLS (SC-009 scenario 4, edge-cases row 12).
- `grep -n "redirect\|?sent" lib/kudos/send/submit-kudos.ts` → no matches (E5).
- Submitting with zero images succeeds and writes zero `kudos_images` rows
  (`send-kudos-submission.spec.ts:53-95`).
- A `.pdf` reaching the action is rejected even though the client would have blocked it.
- `npx next build` succeeds.

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Action calls `redirect('/kudos?sent=1')` — the obvious implementation — breaking `toHaveURL(/\/kudos$/)` | **High** × High | E5 states the mechanism; a grep is a success criterion; the client half is phase-08's |
| `sender_id` accepted from the payload for convenience | Med × **High** | Contract type omits it; RLS rejects it; hand-proof required |
| Insert fails after uploads succeed → orphaned Storage objects | Med × Low | Accepted and logged; bucket is private and unreferenced. A cleanup job is out of scope (YAGNI) — record it in the completion message |
| Client-only validation trusted, letting a `.mp4` or 40 MB file through | Med × High | Step 2 re-validates server-side; success criterion tests a `.pdf` |
| Storage path missing the uid prefix → policy denies every upload | Med × Med | Path rule fixed in phase-01 and restated here |
| First `'use server'` written from stale training knowledge | Med × High | Docs read is step 1 and a todo item |

## Security Considerations

- Sender identity is server-derived; the client cannot attribute a kudos to anyone else
  (FR-014, permissions.md §2). RLS is defence in depth behind that, not instead of it.
- Server-side MIME and size validation — client checks are UX only.
- Private bucket, uid-prefixed paths; no public URL is minted (unresolved #6 resolved as private
  because nothing renders these images this run).
- `is_anonymous` hides the sender in the UI only. `sender_id` is always stored; do not read this
  as anonymity from the database's point of view.
- Message is stored as plain markdown text — no HTML generated, no sanitisation surface.

## Next Steps

Phase-08 wires this to the form and owns the `sessionStorage` + `router.push('/kudos')` half of
E5. Report the exact `submitKudos` signature and the orphan-object caveat on completion.
</content>
