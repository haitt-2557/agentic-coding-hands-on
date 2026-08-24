// Phase 03 — frozen integration contract for `/kudos/send` (dom-contract.md D5-D14, C1;
// technical-spec.md BR-002..BR-007, DEC-001). Both Track A (UI) and Track B (auth/queries/
// submit) import these types verbatim — neither side may redeclare them locally, or the two
// tracks silently diverge (see phase-03's Risk Assessment).
//
// No `senderId` appears anywhere below. That omission is deliberate (FR-014): the sender is
// derived server-side from `auth.uid()` in `lib/kudos/send/auth-gate.ts`, never trusted from
// a client-supplied field. This file has no React and no Supabase import so it compiles from
// any context — client component, server action, or test.

/** A selectable recipient, sourced from the seeded `profiles` table (S2). */
export interface ProfileOption {
  id: string;
  displayName: string;
  department: string | null;
}

/** A selectable hashtag. `id` IS the hashtag string itself, e.g. `'#GO FAST'` (S1). */
export interface HashtagOption {
  id: string;
}

/** In-progress form state kept on the client before submit (DEC-001's four gating fields
 * plus the two additions the target frame introduces beyond the spec'd component). */
export interface KudosDraft {
  recipientId: string | null;
  title: string;
  message: string;
  hashtagIds: string[];
  isAnonymous: boolean;
  nickname: string;
}

/** The five draft fields that can carry a validation error. `isAnonymous` itself is never
 * required (BR-006), so it is intentionally absent from this union. */
export type KudosFieldName = 'recipientId' | 'title' | 'message' | 'hashtagIds' | 'nickname';

export type KudosFieldErrors = Partial<Record<KudosFieldName, string>>;

/** Props phase-06 (`KudosSendForm`) renders and phase-08 (`app/kudos/send/page.tsx`) supplies. */
export interface KudosSendFormProps {
  profiles: ProfileOption[];
  hashtags: HashtagOption[];
  onSubmit: (input: SubmitKudosInput) => Promise<SubmitKudosResult>;
}

/** What the client sends to the Server Action. No `senderId` — see file header. */
export interface SubmitKudosInput {
  recipientId: string;
  title: string;
  message: string;
  hashtagIds: string[];
  isAnonymous: boolean;
  nickname: string | null;
  images: File[];
}

export type SubmitKudosResult =
  | { ok: true; kudosId: string }
  | { ok: false; error: string; field?: KudosFieldName };
