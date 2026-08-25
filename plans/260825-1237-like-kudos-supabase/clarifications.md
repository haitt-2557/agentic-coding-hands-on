# Clarifications — Thả tim Kudos (like) trên Live board

**Screen:** Sun* Kudos - Live board
**MoMorph:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
**fileKey:** `9ypp4enmFmdK3YAFJLIu6C` · **screenId:** `MaZUn5xHXZ` · **figma node:** `2940:13431`
**testPolicy:** `e2e-red-first`

**Source data.** Frame `MaZUn5xHXZ` carries **64 spec items** (all `completed`) and **41 test
cases**. The authoritative behavioural source for this feature is spec row **C.4.1 `Hearts`**
(node `I3127:21871;256:5175`), reinforced by rows B.3 / B.4.4 / C.4 and by these test cases:

| TC_ID | Rule |
|-------|------|
| `63645b03` | Sender cannot like their own Kudos — heart button disabled |
| `91e102ba` | One like per user per Kudos |
| `31936b72` | Like on an admin-configured special day → +2 hearts |
| `7a7ec63e` | Like/unlike toggles colour (gray↔red) and increments/decrements the count |
| `71b3ef43` | Unauthenticated visitor may view the Kudos UI |

**Prior context.** Builds on `plans/260821-1029-kudos-live-board/` (F013, the board itself) and
`plans/260824-0912-send-kudos-wishes/` (F014, the first real Supabase tables + RLS). Their
`clarifications.md` files remain authoritative for everything they settled — inherited, not
re-asked. F014 deliberately recorded the seam **"a kudos you send will not appear on the
board"**; this run does **not** close that seam (see decision 1).

**Shipped state this run starts from.**
- The heart button in `components/kudos/kudos-card-actions.tsx` is `useState(false)` only — the
  count resets on every reload and nothing is persisted anywhere.
- `/kudos` renders 9 static records from `lib/kudos/kudos-records.ts`; viewer identity is the
  **client-side mock** in `lib/session/session-provider.tsx` (`nguyen-hoang-linh`), which that
  file's own header states is *not* an authorization boundary.
- Real auth exists and is used by `/kudos/send` via `requireSupabaseUser()` → `auth.uid()` uuid.
- **The identity spaces do not meet:** board records key on profile slugs, auth keys on uuid.

**Spec defect found (recorded, not silently resolved).** Row C.4.1 contradicts itself on which
account the heart accrues to: the grant sentence credits *"tài khoản gửi lời cảm ơn (tài khoản
gửi kudo tương ứng)"* (the **sender**), while the revoke sentence debits *"tài khoản **nhận**
kudos"* (the **receiver**). Resolved by decision 3 below.

---

## Session 2026-08-25

- Q: Board records carry slug `senderId`s while the real session is an `auth.uid()` uuid — how far
  should Supabase persistence reach for this feature? → A: **Likes table only; the board stays
  static.** A new `kudos_likes` table (with a `text` kudos key so it serves both today's static
  ids and tomorrow's real uuids) receives real rows. The 9 static records keep rendering and the
  displayed count is `static heartCount + real like delta`. Rewiring the board to read `kudos`
  from the database remains the separate, still-deferred feature F014 recorded. The seam is
  deliberate and is restated under Known Consequences.
- Q: Enforcing "sender cannot like own kudos" requires matching the authenticated user to a board
  profile. How should that bridge work? → A: **Add a nullable `auth_user_id uuid` column to
  `profiles`** and seed it so the e2e fixture user maps to one slug. The viewer's slug is resolved
  server-side from `auth.uid()`. Explicit, testable, and reusable by later features. Email
  local-part matching was rejected as brittle; leaving the disable rule on the mock session was
  rejected because it keeps BR-002 a DevTools-flippable illusion.
- Q: Spec C.4.1 credits the sender in one sentence and debits the receiver in the next — which
  account does a like actually credit? → A: **Credit the kudos sender.** The explicit grant
  sentence wins; the revoke sentence's *"nhận"* is treated as a spec typo and is recorded as a
  deviation rather than obeyed. Rationale: it rewards writing kudos that people appreciate, and
  the grant sentence is the one that defines the accrual.
- Q: C.4.1 grants +2 hearts on admin-configured special days and the QA note requires storing
  which kind each like was. Nothing in the repo has any admin config. In scope? → A: **Schema and
  logic yes, admin UI no.** A `special_days` table (date range, seeded empty) plus an `is_special`
  flag captured on the like row at insert time, so an unlike revokes exactly the amount that was
  granted. Configuring special days stays a seed/DB job until an admin screen is designed — no
  MoMorph frame covers such a screen, so building one would mean inventing UI.
- Q: `/kudos` is publicly viewable today. What should the heart do when nobody is signed in?
  → A: **Render it disabled; the board stays public.** Anyone may read the board and see real like
  counts; the heart is disabled with an explanatory `aria-label`. No auth gate is added to
  `/kudos`. TC `71b3ef43`'s redirect applies to profile/detail navigation, not to the heart.
- Q: With a real heart ledger, does the sidebar's "Số tim bạn nhận được: 25" (D.1.4) become real?
  → A: **Wire that one row only.** It reads the real ledger for the signed-in viewer; the other
  four rows (Kudos nhận / Kudos đã gửi / two Secret Box rows) stay the static `25` placeholders the
  frame draws. Only the number this feature actually owns becomes true.

---

## Known Consequences

1. **The board still does not show kudos you sent.** F014's seam is untouched. A like lands on a
   static record id (`kudos-1` … `kudos-9`), not on a row in the `kudos` table.
2. **Heart totals are per-sender-slug, not per-auth-user.** Because the board's senders are static
   profiles, the ledger credits a profile slug. The signed-in viewer sees their own total only
   when their `auth_user_id` bridge resolves to a slug that authored a static record.
3. **Special days are configured by SQL only.** `special_days` ships seeded empty, so every like
   grants +1 until a row is inserted by hand. The `is_special` flag is still written on every like
   so the +2 path is exercisable and revocable the moment a row exists.
4. **Four of the five sidebar stats remain placeholders** and will visibly disagree with reality
   once the board reads real data.

## Unresolved Questions

- No MoMorph frame defines an admin screen for special days; when one is designed, `special_days`
  is ready for it.
- The spec's "hoa thị" (star tier) counts still derive from static `kudosReceived`, not from the
  new ledger — out of scope here, flagged for whoever closes the board-rewire seam.
