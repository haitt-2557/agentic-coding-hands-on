# Heart button silent revert on self-posted kudos — identity space mismatch

**Date**: 2026-08-28 18:40
**Severity**: high
**Component**: kudos-card-actions, board-feed-mapper, RLS
**Status**: resolved

## What Happened

MoMorph TC 63645b03 ("Sun* Kudos - Live board") flagged that the heart button stayed ENABLED when a user viewed their own posted kudos. Clicking it would flip optimistically, then silently revert when the server returned `SELF_LIKE_ERROR`. The button should have been DISABLED from the start — you cannot like your own kudos.

The defect only manifested in unbridged accounts (users registered via password but not yet linked to an external identity provider). For bridged accounts, the heart disablement worked correctly.

## The Brutal Truth

This stings because the knowledge existed in the codebase already — someone had even documented it as an accepted edge case. A comment in `lib/kudos/board-feed-mapper.ts` said the enabled heart on self-posts was fine, that "the RLS policy is the backstop" and would catch it server-side. That comment was a flag dropped in passing, admitting the UI layer didn't actually enforce the rule. The user experienced the lie for minutes before the server corrected it silently. No validation, no warning, just a false affordance that collapsed.

The galling part is that the identity-space doc already existed — it plainly said the slug space and the auth-uid space "do not otherwise meet." The UI code just ignored that and checked ownership in the slug space, assuming it covered the DB rows. It did not.

## Technical Details

Two identity spaces had drifted apart in the UI:

- **Slug space**: `record.senderId === viewerSlug` (where profile slug identifies the actor)
- **Auth-uid space**: DB row `sender_id` holds the auth UUID; RLS and mapper knew this

When the mapper wired anonymous/unbridged senders, it stored `senderId = "db:{id}"` (never equals a slug). An unbridged viewer had `viewerSlug = null`. The ownership check would fail silently.

Server side was never at risk — RLS policy `kudos_likes_insert_own` + `is_dynamic_kudos_author` (migration 20260828154500) rejected writes at the database level. But the UI was showing a false state for minutes.

**The fix:**
- Migration `supabase/migrations/20260828181500_board_feed_own_flag.sql`: added `is_own boolean` to `list_board_kudos()` — calculated as `coalesce(k.sender_id = auth.uid(), false)` at query time
- Mapper carries it as `KudosRecord.viewerIsSender`
- Card rule now unifies both spaces: `record.viewerIsSender === true || (viewerSlug !== null && record.senderId === viewerSlug)`

## What We Tried

No change was needed to `toggle-like.ts` or RLS (both already correct). E2E suite would not run because port 3000 was occupied and `playwright.config` pins `reuseExistingServer: false`. Verification happened at unit + SQL + live-browser level instead.

## Root Cause Analysis

Documentation stated the two identity spaces don't meet. Code comments even named the gap as an acceptable risk ("the RLS policy is the backstop"). But the UI rule was written as if the slug space entirely covered DB rows — it did not. The gap between "documented as separate" and "treated as unified" was the true fault. Someone knew the issue existed, noted it would be caught server-side, and left it.

## Lessons Learned

1. **A comment that says "this is risky, the backstop will catch it" is not a permission to ignore the risk.** It is a flag that should trigger a fix, not an exemption from one.

2. **When two identity spaces exist (auth-uid vs slug), make it impossible to mix them.** Do not rely on a fallback layer to catch the mistake. Make the rule express both paths explicitly, as this fix does.

3. **Live data in one space will not automatically conform to a rule written for another space.** Test with the actual data structure, not just the happy path.

4. **Unbridged accounts are not a marginal case.** If your DB can store them, your UI rules must handle them. The defect only surfaced because someone actually had an unbridged account and tried to like their own post.

## Next Steps

None. The fix is merged, tests pass (148/148 unit, tsc exit 0, lint clean), SQL verified (is_own false for anon, true for the authoring caller), and live browser testing confirmed all 3 self-posted kudos showed disabled with "Không thể like kudos của chính bạn" while others' posts remained enabled. The reviewer signed off with evidence gated and SEALED.

---

**Status:** DONE
**Summary:** Self-like defect in unbridged accounts fixed by unifying identity spaces in the mapper and card rule. Server-side RLS was never at risk; UI was showing a false state.
