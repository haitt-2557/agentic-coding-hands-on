# Clarifications — Sun* Kudos Live board (`/kudos`)

**Screen:** Sun* Kudos - Live board
**MoMorph:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
**fileKey:** `9ypp4enmFmdK3YAFJLIu6C` · **screenId:** `MaZUn5xHXZ` · **figma node:** `2940:13431`
**Source data:** 64 spec items (`spec_status: done`, all rows `completed`), 41 test cases, 74 media nodes, frame 1440×5862
**testPolicy:** `e2e-red-first`
**Prior context:** builds on `plans/260818-0936-homepage-saa/` (screen `i87tDx10uM`),
`plans/260819-0913-countdown-prelaunch/` (screen `8PJQswPZmU`),
`plans/260819-1432-login-supabase-auth/` (screen `GzbNeVGJHz`) and
`plans/260820-1020-award-system-page/` (screen `zFYDgyj_pD`). Their `clarifications.md` files remain
authoritative for everything they settled — those decisions are inherited, not re-asked.

---

## Session 2026-08-21

- Q: The specs repeatedly say kudos, hashtags, departments and the "388 KUDOS" total are *"query từ
  DB"*, but this repo has no kudos tables at all — `supabase/seed.sql` only seeds an auth fixture user
  for the login suite, and every screen shipped so far (homepage, awards, prelaunch) runs on a static
  data module. Where does this page's data come from? → A: **Static module, client-side state.** A new
  `lib/kudos.ts` (plus split modules as it grows past the 200-line limit) holds the frame's real
  content — senders, receivers, badges, departments, messages, hashtags, heart counts, spotlight names,
  leaderboard rows. Filters, carousel position and like toggles are React state; nothing survives a
  reload. This matches every screen already delivered here and keeps the run to one screen. Real
  persistence (schema, RLS, like writes, the special-day heart multiplier) is a separate feature with
  its own contract — recorded under Next Steps.
- Q: Four destinations are referenced by this screen but are not in this frame — the "ghi nhận" input
  opens a kudos submit dialog (A.1), "Xem chi tiết" opens a kudos detail page (B.3/B.4.4), avatars and
  names open profile pages (B.3.1/B.3.2/B.3.5/B.3.6/C.3.1/C.3.3/D.3.2), and "Mở quà" opens a Secret Box
  dialog (D.1.8). How far does this run go? → A: **Triggers real, destinations deferred.** Every
  control renders, is keyboard-focusable and is asserted as *reachable*; none of the four destinations
  is built. This is the same pattern the homepage run used when it created the `/kudos` placeholder that
  this run now fills. None of the four has a Figma frame of its own, so building them would mean
  inventing layout — precisely what the MoMorph rules forbid.
- Q: The SPOTLIGHT BOARD (B.7) is an interactive word cloud — ~100 recipient names on a canvas, a
  "388 KUDOS" total, a search box, hover tooltips, click-to-detail and a Pan/Zoom toggle. It has zero
  media nodes: the names are individual Figma TEXT nodes, so no exported artwork exists to drop in.
  How faithful? → A: **Static cloud + hover + search.** Names are laid out from the frame's own node
  coordinates, hover shows the name/time tooltip, the search box filters and highlights matches, and a
  node click follows the deferred-detail decision above. The **Pan/Zoom button renders but its
  behaviour is deferred** — it needs a real viewport transform whose zoom bounds, step and reset
  behaviour no spec row or test case pins down. TC `cac4b7a3` (pan/zoom toggle) stays unasserted;
  TC `33ca8f8a` (hover tooltip) and `d035e3b8` (loading/empty/interactive states) are asserted.
- Q: The heart rules need to know who "you" are — a sender cannot like their own kudos (TC `63645b03`),
  one like per user per kudos (TC `91e102ba`), and the sidebar reads "Số Kudos bạn nhận được / đã gửi".
  But `lib/session/session-provider.tsx` is a client-side mock carrying only a role and an unread
  count, with no user identity, and its own header warns it is not an auth boundary. → A: **Extend the
  mock session with a mock user.** Add a mock user id and display name to the existing provider so
  own-kudos hearts disable and the sidebar stats belong to someone. The existing SECURITY NOTE is
  extended to cover the new fields — this remains explicitly non-authoritative and adds no new auth
  surface. Coupling the page to the real Supabase user was rejected: every route is still unprotected,
  so the guest path would become the default view of a page whose whole point is populated content.

## Session 2026-08-21 (second pass — after design extraction)

Design extraction (`design/kudos-content.md`, 106-node word cloud mapped, all 246 text nodes
accounted for) surfaced three gaps that the first pass could not have known about.

- Q: The frame's kudos content is **one card repeated seven times** — all four ALL KUDOS posts and
  all three carousel cards carry an identical sender (`Huỳnh Dương Xuân Nhật `), receiver
  (`Huỳnh Dương Xuân `), department (`CEVC10`), category (`IDOL GIỚI TRẺ`), hashtag line and heart
  count (`1.000`); the 106-node word cloud holds only 7 distinct people. Seeding verbatim therefore
  produces a dataset that cannot demonstrate filter selection, hashtag-click re-filtering,
  most-hearted ranking, heart-ownership, or the filtered empty state — most of what the
  `e2e-red-first` suite exists to assert. How is the seed data built? → A: **Recombine real frame
  values.** Every string still comes from a frame node — the 7 real names in the word cloud, the 4
  real badge tiers (`New Hero`, `Rising Hero`, `Super Hero`, `Legend Hero`), the real departments,
  hashtags and categories present — recombined into roughly 8–10 varied records with differing heart
  counts and senders. The frame remains the vocabulary; nothing is authored from thin air. This
  keeps "do not invent data" intact in the sense the rule means (visual values and copy are never
  guessed) while making the specified behaviour genuinely assertable. At least one record MUST be
  sent by the mock viewer so the own-kudos heart-disable rule (TC `63645b03`) is demonstrable, and
  the hashtag/department vocabularies MUST admit a combination matching zero records so the empty
  state (TC `926d92a5`) is reachable through the UI.
- Q: The heart has **no colour anywhere in the design** — `MM_MEDIA_Heart` is a vector instance and
  the MCP exposes no fill, so the specified grey/red states exist only as spec prose. Where does the
  red come from? → A: **Reuse the existing `--badge-danger` token, `#D4271D`.** The frame already
  renders hashtag text at `rgba(212, 39, 29, 1)`, which is exactly that value and already a project
  token in `app/globals.css`. So this red is the design's own red — reusing it invents no visual
  value and adds no token. The inactive state uses the frame's existing grey, `#999999`.
- Q: The Pan/Zoom control (`B.7.2`, node `3007:17479`) is a **30×30 frame with zero children, no
  fill and no icon** — its appearance is simply absent from the design, while spec `B.7.2` demands a
  visible toggle with a `Pan/Zoom` tooltip. Its behaviour was already deferred in the first pass.
  What ships? → A: **Omit the control entirely.** With the behaviour deferred and the appearance
  non-existent, there is nothing faithful to render; shipping a visible dead button would be worse
  than the honest gap. Recorded as deferred, and design defect #7 already asks for the ruling. TC
  `cac4b7a3` stays unasserted.

## Orchestrator Assumptions (stated, not asked)

Resolvable from the design data or from the inherited decisions; recorded so the implementation agents
do not re-derive them.

- **Test policy is `e2e-red-first`.** The resolved design is dense with state transitions, not static
  mapping: carousel next/prev with disabled ends (TC `81446f61`), filter dropdown open → select →
  clear (TC `0e56cacb`, `159fed13`), hashtag click re-filters both sections (TC `d01729d4`), heart
  toggle changes count and colour (TC `7a7ec63e`), Copy Link writes the clipboard and raises a toast
  (TC `0adfd7ce`), the Sunner search enforces a 100-character ceiling (TC `9e689933`), and both empty
  states have specified copy (TC `926d92a5`, `d662780b`). Per the test-policy resolution rule that
  selects strict E2E for state transitions. The runner exists and is real: `@playwright/test` ^1.62.1,
  `npm run test:e2e`, web target — nothing is installed or scaffolded for this run.
- **Route is `/kudos`, filling the existing placeholder.** `app/kudos/page.tsx` is a bare stub created
  by the homepage run precisely so header/footer/CTA/widget links to Sun* Kudos are real instead of
  404s. `SiteHeader`, `SiteFooter`, `KudosSection` and `QuickActionWidget` all already point at
  `/kudos`. No route is renamed and no redirect hop is introduced.
- **Header AND footer current-page state move.** On this frame both chrome components highlight
  "Sun* Kudos". `components/layout/site-header.tsx` currently hard-codes that item to the inactive
  classes while "About SAA 2025" and "Award Information" derive from `usePathname()`; this run brings
  the third item into the same derivation and adds `aria-current="page"`.
  `components/layout/site-footer.tsx` hard-codes its tinted treatment onto `/awards` and must gain
  the same route-derived behaviour. Both are listed as owned files to avoid a collision.
- **Inactive carousel cards are dimmed by the frame's own gradient overlays, not by an invented
  opacity.** No `opacity`, `transform` or `filter` exists on `2940:13464` / `2940:13466`. The fade
  is two `#00101A → transparent` gradient frames (`2940:13469`, `2940:13467`) which also host the
  80px arrows. Reproduced exactly as drawn — any opacity, scale or blur figure would be an invented
  visual value, which the rules forbid.
- **Verbatim strings are preserved down to whitespace.** Trailing spaces are real on
  `Huỳnh Dương Xuân Nhật `, `Huỳnh Dương Xuân `, `Mai phương Thúy `, `Tìm kiếm ` and the leaderboard
  names; the submit-pill placeholder carries one leading and three trailing spaces; the hashtag line
  contains a genuine double space; the `D.3` title contains a real newline. These are transcribed,
  not tidied — normalising them silently would be a copy change.
- **Header, footer and existing chrome are reused unchanged otherwise.** `SiteHeader`/`SiteFooter` are
  the same components the frame draws. `KudosSection` (the homepage/awards promo block) does **not**
  appear on this frame and is not added.
- **Card copy comes from the rendered frame, not the node names.** The four ALL KUDOS cards
  (`3127:21871`, `3127:22053`, `3127:22375`, `3127:22439`) and the three HIGHLIGHT cards
  (`2940:13464`, `2940:13465`, `2940:13466`) are Figma *instances* of one component each, so their node
  **names** all read alike while their `character` overrides differ. Copy is taken from each node's
  `character` value, never from `itemName` — the same instance-override trap the awards run hit and
  recorded as design defect #2 there. Where the spec CSV and the frame disagree, **the frame wins**
  (inherited "Frame wins on copy and layout" rule).
- **`lib/kudos.ts` is the single source of truth, split by concern.** Kudos records, spotlight nodes,
  leaderboard rows, filter vocabularies (hashtags, departments) and the viewer's stats each get one
  module under `lib/kudos/`, following the 200-line ceiling and the existing `lib/awards.ts` precedent
  of one data module per feature. No component holds inline literal content.
- **Filters drive both sections.** Spec rows B, B.1, B.1.1, B.1.2, B.4.3 and C.3.7 all state that a
  hashtag or department selection re-filters *both* HIGHLIGHT KUDOS and ALL KUDOS and resets carousel
  pagination to 1. That is one shared filter state owned above both sections, not two independent
  local states.
- **Infinite scroll over a finite static list.** Spec C says "infinity scroll". With a static module
  the honest implementation is progressive reveal of the seeded records as the sentinel enters view,
  stopping when the list is exhausted — no fabricated pages and no synthetic loading delay.
- **Route protection stays deferred.** TC `71b3ef43` (unauthenticated user redirected to login on
  profile/detail interaction) depends on the route gating the login run explicitly deferred. It stays
  unasserted alongside the rest of that work; every route remains open exactly as today.
- **Responsive behaviour is derived.** Only the 1440-wide desktop frame exists. The 3-up carousel
  reduces to a single card, the feed + sidebar two-column collapses to a stacked single column with the
  sidebar below the feed, and the spotlight board keeps its aspect with the name cloud scaled to the
  container; 375px floor, following the precedent set for the prelaunch, login and awards screens.
  Flagged to the design owner below — this is now the fourth screen with no mobile frame.
- **Toast copy is fixed.** `Link copied — ready to share!` verbatim, from spec rows B, B.2, B.2.3, B.3,
  B.4.4, C, C.4, C.4.2 and TC `0adfd7ce`. Clipboard writes go through
  `navigator.clipboard.writeText` with a guarded fallback — a rejected clipboard permission must not
  throw an unhandled rejection.
- **Empty-state copy is fixed.** `Hiện tại chưa có Kudos nào.` for both kudos lists (spec B.3, C.2;
  TC `926d92a5`) and `Chưa có dữ liệu` for the sidebar leaderboard (spec D; TC `d662780b`).
- **The hoa-thị (star) tooltip text is specified and shipped.** Spec rows B.3.2 and B.3.6 carry the
  full three-tier copy (10 / 20 / 50 Kudos). It is data, not prose invented at implementation time.
- **Assets are downloaded from MoMorph, not improvised.** Missing media (KV background, the KUDOS
  wordmark, Heart, Send, Link, Open Gift, Left/Right chevrons, the badge pills, sample avatars and the
  88×88 attachment thumbnails) come from the frame's `MM_MEDIA_*` nodes. Icons already in `public/saa/`
  (`Pen.svg`, `Down.svg`, `Search`, `Logo.png`) are reused as-is.

## Design defects to report back to the design owner

Confirmed against the design data, not guessed. Carried into the implementer reports for the record.

1. **The sidebar's second leaderboard is specified but not drawn.** Spec row `D` describes **two**
   lists — "10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT" and "10 SUNNER NHẬN QUÀ MỚI NHẤT" — but the frame
   contains only the latter (`D.3` / `2940:13510`), and only five entries rather than ten. Built as
   drawn; the ranking list needs either a frame or removal from the spec.
2. **`D.1.8`'s label disagrees with itself.** The spec CSV calls the button "Mở quà"; the frame renders
   "Mở Secret Box". Frame wins, per the inherited rule — but the spec text should be corrected.
3. **Every sidebar statistic is the placeholder `25`.** Five different metrics (Kudos received, Kudos
   sent, hearts received, Secret Boxes opened, Secret Boxes unopened) all read `25` in both the frame
   and the CSV. Reproduced as drawn, but it means the design never demonstrates digit-width or
   large-number formatting for this block.
4. **`B.2.1` and `B.2.2` have their names and descriptions swapped.** Node `2940:13470` is named
   "Button tiến" (next) with `itemName` `mms_B.2.1_Button lùi`, and its description reads *"Nút 'lùi'
   tròn (icon chevron-right)"* — three mutually contradictory signals in one row. `2940:13468` is the
   mirror image. Resolved from the media nodes, which are unambiguous: `2940:13470` contains
   `MM_MEDIA_Left`, `2940:13468` contains `MM_MEDIA_Right`.
5. **Two carousel navigation controls are specified for the same job.** `B.2.1`/`B.2.2` (80px round
   arrows flanking the carousel) and `B.5.1`/`B.5.3` (48px arrows beside the "2/5" indicator) both
   claim "chuyển carousel sang card trước/tiếp theo". Both are drawn, so both are built and wired to
   the same state — but the duplication looks unintentional.
6. **The carousel's slide count is stated as 5 while the frame draws 3 cards** and the indicator reads
   "2/5". Five is taken as the contract (spec B.2, B.2.3, and the disable-at-page-5 rule in B.2.2);
   the frame simply crops the 3 visible positions of a 5-item set.
7. **Pan/Zoom is named but never defined.** `B.7`/`B.7.2` and TC `cac4b7a3` say the control "toggles
   between pan and zoom", with no zoom range, step, reset, or statement of what pan mode does
   differently. Deferred by clarification; needs a real interaction spec.
8. **No mobile or tablet frame exists.** Only 1440. Fourth consecutive screen with this gap; the
   carousel, feed/sidebar and word-cloud collapses are all implementation-derived.
9. **The heart's special-day multiplier has no configuration surface.** Spec `C.4.1` and TC `31936b72`
   describe admin-configured special days granting +2 hearts instead of +1, with correct clawback on
   unlike — but no admin screen, no configuration entity and no date source is specified anywhere.
   Out of scope this run (static data), and it cannot be built at all until that surface exists. The
   spec's own `databaseNote` on `C.4.1` already flags the clawback bookkeeping this implies.
10. **Access control is specified but not buildable yet.** TC `71b3ef43`'s redirect-to-login depends on
    the route protection the login run deferred. Same standing gap as the awards run's ID-1.

### Added after design extraction

11. **The whole screen is one kudos, repeated.** Seven card instances share a single sender,
    receiver, department, category, hashtag line and heart count; the 106-node word cloud holds 7
    distinct people. A design intended to demonstrate filtering and ranking needs data that varies
    along the axes it filters and ranks by. Resolved by clarification (recombine real frame values),
    but the source file should carry realistic variety.
12. **The banner title in the spec CSV is not the title on the frame.** Spec `A` says
    `Hệ thống ghi nhận lời cảm ơn`; node `2940:13439` says `Hệ thống ghi nhận và cảm ơn`. Frame ships.
13. **The heart count in the spec CSV is not the count on the frame.** Spec `B.3`/`B.4.4`/`C.4` quote
    `10`; every heart node reads `1.000`. Frame ships.
14. **The sidebar has five statistic rows, not the six spec `D.1` claims.** Frame ships.
15. **The department code is misspelt two different ways.** Highlight cards render `CECV10`, post
    cards render `CEVC10` — both verbatim, and the spec CSV writes `CEVC10`. Neither reads like an
    intended value; one of them is a typo of the other and the design owner should say which.
16. **The `Super Hero` badge carries a duplicate leftover text layer.** `Super ` (`;3053:7594`,
    `opacity: 0.66`) sits beneath `Super Hero` (`;3007:17514`). Only the latter is rendered.
17. **The right-hand carousel card is genuinely content-incomplete.** `2940:13466` lacks a
    receiver-badge node and a `Xem chi tiết` label — clipped at the frame edge rather than authored.
    The implementation renders them; that is an addition the design does not show.
18. **Badge pills are raster artwork, not the flat gold pills they appear to be.** Each is 1–4 image
    rectangles (some `background-blend-mode: screen`) behind live text with a 0.5px `#FFEA9E` border.
    There is no solid fill token to reuse, so each tier needs its own exported asset — 23 assets are
    missing overall, and 5 of them are not `MM_MEDIA_*`-named and so are invisible to any
    `list_media_nodes`-driven download pass.

### Added during implementation

19. **The spotlight tooltip cannot show the time the spec asks for.** Spec `B.7` and TC `33ca8f8a`
    require the hover tooltip to carry *"tên và thời gian nhận Kudos"* — name **and** time. But the
    frame's 106 word-cloud nodes are plain TEXT nodes carrying only a name; no per-node timestamp
    exists anywhere in the design data. Shipped with the name alone. Inventing a time per node would
    be fabricating content, so the gap is recorded instead. The board's six ticker lines do carry
    times (`08:30 PM …`), but they are six copies of one identical string and are not keyed to any
    cloud node, so they cannot supply this either. Needs a design ruling: either drop "time" from the
    spec, or give the cloud nodes a real timestamp field.
20. **Six of the frame's 23 assets cannot be obtained.** Two are **absent from the design data
    itself**: the `New Hero` badge pill is explicitly `null` in the media map while its three sibling
    tiers (`Rising Hero`, `Super Hero`, `Legend Hero`) resolve normally, and `image 24`
    (`2940:14178`) carries no `background` property at all. Four more have real artwork but no working
    export path via any available tool: the `Xem chi tiết` arrow icon, and the three spotlight-board
    background layers (`image 25`, `Root further mo rong 1`, `image 35`). Resolutions taken, all
    recorded rather than papered over: `New Hero` renders via the `--new-hero-ground` token
    (`#FFF3C6`) plus live text; the `Xem chi tiết` arrow reuses the already-shipped `/saa/Up.svg`,
    which is the same diagonal-arrow CTA affordance used by `components/home/kudos-section.tsx`; the
    three board layers are omitted, so the board ships with its specified border and radius on the
    page ground and **no invented gradient or stand-in image**.

### Withdrawn

- **The planner's design defect #19 (heart count `1.000` incompatible with the test's count
  arithmetic) is withdrawn — it was a test-parsing bug, not a design conflict.** The proposed fix was
  to clamp seed heart counts to plain integers 10–999, which would have silently discarded the
  frame's thousands-separator formatting. Instead the e2e parser now strips non-digit characters
  before `parseInt` (verified at `e2e/kudos-board-feed-interactions.spec.ts:22`), so `1.000` reads as
  `1000` and the increment assertion holds against the frame's real format. Seed counts are stored as
  plain `number`, rendered through `formatHeartCount` with the `.` separator, and at least one record
  exceeds 1000 so the formatting is genuinely exercised. No design departure was needed.

## Unresolved Questions

1. **Route protection remains deferred** (login run's Next Steps). TC `71b3ef43` stays unasserted until
   `/`, `/awards`, `/kudos`, `/profile`, `/admin` are gated behind the Supabase session in `proxy.ts`.
2. **Pan/Zoom needs an interaction spec** before TC `cac4b7a3` can be honoured.
3. **The "thăng hạng" leaderboard needs a frame** or removal from spec row `D`.
4. **The special-day heart multiplier needs an admin configuration surface** before `C.4.1` is
   implementable in any form.

## Recorded at delivery (2026-08-21)

- **The `docs/vi/flows/` layer has never been generated for this repo.** The gen-gate at delivery
  found the code-derived **Core** layer present (`docs/vi/generated/`, 11 tracked doc shas) but the
  **Flow** layer entirely absent — no `docs/vi/flows/` directory and `last_flows_run_sha` empty in
  `docs/vi/.rebuild-state.json`. Bootstrapping it means a repo-wide `rebuild-spec` Flow pass covering
  all five features, not just this screen. **Decision: skipped, recorded as a standing gap** — a
  repo-wide doc generation is a deliberate operation in its own right, not something to bolt onto a
  single screen's delivery. It remains available whenever process-flow docs are actually wanted.
- **`F012_AwardSystemPage`'s spec frontmatter violates the authoring contract**, found while
  promoting F013. It carries `status: promoted` and `fcode: F012_AwardSystemPage` (slug form) plus a
  `promoted_from:` line; the contract permits `status` = `draft|implemented` only and `fcode` =
  `^F\d{3}$`. F013 was written to the contract, so the two siblings now differ. **Not "harmonised"** —
  bending F013 to match a non-conformant sibling would spread the defect. Needs a maintainer ruling on
  which shape is canonical, and F012 corrected accordingly.
- **Promoted specs in this repo have never had their `## Source Code References` reconciled after
  shipping.** F013's still read "no code written yet" with a list of *planned* files (including one
  component never built and a single e2e file that is actually three) until doc-writer fixed it at
  delivery. `F012` has the identical staleness today. This is a **process gap, not one stale file**:
  the authoring contract correctly forbids citing code that does not exist yet, but nothing in the
  pipeline currently forces the citations to be filled in once it does. Validator rule F8 makes this a
  critical failure for any spec at `status: implemented`.
- **Ten throwaway Playwright debug scripts** (`debug-*.mjs`, `capture-all-widths.mjs`,
  `verify-responsive.mjs`) were created at the repo root during the 375px investigation and deleted at
  delivery. Their measurements live in the phase reports and `evidence/`. Noted because they were
  untracked and a blanket `git add -A` would have committed them.

## Next Steps (out of scope for this run)

- Real persistence: schema for profiles/kudos/likes/hashtags/departments, RLS, and the like rules
  (one per user, sender-excluded, special-day multiplier with correct clawback).
- The four deferred destinations: kudos submit dialog, kudos detail page, profile page, Secret Box
  dialog — each needs its own frame.
- Route protection for the five app routes, closing TC `71b3ef43`.
- A mobile/tablet frame for this screen so the responsive collapse stops being derived.
