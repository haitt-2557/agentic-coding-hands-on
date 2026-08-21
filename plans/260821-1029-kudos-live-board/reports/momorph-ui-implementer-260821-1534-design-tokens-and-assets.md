# Phase 2 — Design tokens and frame assets — report

**Mode:** section · **Test policy:** e2e-red-first (no tests written/run here; visual-contract-style checks only)
**Screen:** Sun* Kudos - Live board — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ

*Revised after coordinator correction: the original pass mis-diagnosed a wrong-tool problem as a
service outage and reported 6 assets as blocked when only 4 were genuinely unfetchable, 2 were
design-data gaps, and 1 (the wordmark/star-mark group) was actually available and should have been
downloaded. Corrected below; `get_media_files` was re-called and is the only tool used in this
revision (per coordinator instruction, `get_figma_image`/`get_media_file` singular are not used
again here).*

## Scope note — ownedFiles vs phase file (resolved, not a concern)

The job card's `app/globals.css` + `public/saa/**` ownership was a deliberate call, confirmed by
the coordinator: `public/saa/` is where every other SAA asset in this project already lives, so
keeping this frame's assets there instead of a new `public/images/kudos/` tree is correct, and the
phase file will be corrected to match. This report carries the asset-coverage table in place of a
separate `design/asset-coverage.md` file, for the same reason. No file outside `app/globals.css`
and `public/saa/` was created or modified.

## Deliverable A — tokens (`app/globals.css`)

Confirmed correct by the coordinator — no changes this revision. Added in the existing two-step
idiom, appended to the current `:root` / `@theme inline` blocks without reordering existing entries:

| Token | Value | Source (design/kudos-content.md §8) |
|---|---|---|
| `--kudos-card-ground` | `#FFF8E1` | verified |
| `--kudos-message-tint` | `rgba(255, 234, 158, 0.40)` | verified |
| `--kudos-sidebar-bg` | `#00070C` | verified |
| `--muted-text` | `#999999` | verified |
| `--kudos-wordmark` | `#DBD1C1` | verified |
| `--spotlight-highlight` | `#F17676` | verified |
| `--new-hero-ground` | `#FFF3C6` | verified |
| `--avatar-fallback` | `#EEEEEE` | verified |

No heart-red token was added — the active heart reuses `--badge-danger` (`#D4271D`) per
clarifications; inactive uses `--muted-text` (`#999999`). Every value above byte-matches its §8
row; none was invented. Also added `--radius-badge: 48px` and `--radius-pill: 68px` per the phase
file's explicit instruction — the only two repeating radii on the frame. `app/globals.css` is 78
lines (was 57); diff is 20 additive lines, no existing line changed.

## Deliverable B — assets (`public/saa/`)

23-item coverage against `design/kudos-content.md` §9, using exactly one tool this revision:
`mcp__momorph__get_media_files({ screenId: "MaZUn5xHXZ" })`, re-called fresh immediately before
each download batch so signed URLs (`X-Amz-Expires=600`) didn't go stale.

| # | item | disposition | evidence |
|---|---|---|---|
| 1 | `MM_MEDIA_Search` 24×24 | **downloaded** → `Search.svg` | `get_media_files` key `I2940:13450;186:2759` |
| 2 | `MM_MEDIA_Search` 16×16 (same component) | **downloaded** (shared file) → `Search.svg` | same URL as #1 |
| 3 | `MM_MEDIA_Left` 60×60 | **downloaded** → `Left.svg` | `get_media_files` key `I2940:13470;186:1420` |
| 4 | `MM_MEDIA_Left` 28×28 (same component) | **downloaded** (shared file) → `Left.svg` | same URL as #3 |
| 5 | `MM_MEDIA_Right` 60×60 | **downloaded** → `Right.svg` | `get_media_files` key `I2940:13468;186:1420` |
| 6 | `MM_MEDIA_Right` 28×28 (same component) | **downloaded** (shared file) → `Right.svg` | same URL as #5 |
| 7 | `MM_MEDIA_Send` 32×32 | **downloaded** → `Send.svg` | `get_media_files` key `I3127:21871;256:5147` |
| 8 | `MM_MEDIA_Heart` 32×32 | **downloaded** → `Heart.svg` (one asset; active/inactive is a CSS tint per clarification, not two files) | `get_media_files` key `I3127:21871;256:5171` |
| 9 | `MM_MEDIA_Link` 24×24 | **downloaded** → `Link.svg` | `get_media_files` key `I3127:21871;256:5216;186:1441` |
| 10 | un-named `IC` 24×24 ("Xem chi tiết" trailing icon, componentId `186:2691`) | **genuinely unfetchable** | not a key in `get_media_files` (only `MM_MEDIA_`-named nodes are tracked); `get_figma_image({nodeIds:["186:2691"]})` → HTTP 500; `get_media_file({nodeId:"I2940:13465;335:9663;186:1441"})` → HTTP 401. Node data (`get_node`) does show this is a real rendered icon, so the artwork exists — only the export path is unavailable with the tools this session has |
| 11 | `MM_MEDIA_Pen` 32×32 | **reused** → `public/saa/Pen.svg` (existing) | job card's explicit reuse instruction; scale-to-32px not independently re-verified |
| 12 | `MM_MEDIA_Open Gift` 24×24 | **downloaded** → `Open_Gift.svg` | `get_media_files` key `I2940:13497;186:1766` |
| 13 | `MM_MEDIA_New Hero` pill 109×19 | **absent in design data** | `get_media_files` key `I3127:21871;256:4858;3106:17694` → `null`, confirmed on two separate calls, while its three siblings resolve normally (`I3127:22053;...` Rising Hero, `I3127:22375;...` Super Hero, `I3127:21871;256:4860;...` Legend Hero all have real URLs). This is a data fact, not a fetch failure — see design-owner note below |
| 14 | `MM_MEDIA_Rising Hero` pill 109×19 | **downloaded** → `Badge_Rising_Hero.png` (110×20 actual) | `get_media_files` key `I3127:22053;256:4858;3106:17694` |
| 15 | `MM_MEDIA_Super Hero` pill 109×19 | **downloaded** → `Badge_Super_Hero.png` (109×19 actual) | `get_media_files` key `I3127:22375;256:4858;3106:17694` |
| 16 | `MM_MEDIA_Legend Hero` pill 109×19 | **downloaded** → `Badge_Legend_Hero.png` (110×20 actual) | `get_media_files` key `I3127:21871;256:4860;3106:17694` |
| 17 | `MM_MEDIA_Avatar` 64×64 (×12 nodes) | **downloaded** — 3 distinct source images, not one shared placeholder → `Avatar_Sender.png`, `Avatar_Receiver.png`, `Avatar_Leaderboard.png` (all 64×64) | 3 distinct URLs in `get_media_files` (sender-slot nodes share one hash, receiver-slot nodes share another, the 5 leaderboard nodes share a third) — correction to the design doc's "one placeholder serves all" note |
| 18 | `MM_MEDIA_Sample Image` 88×88 (×20 nodes) | **downloaded** → `Sample_Image.png` | all 20 nodes share one identical URL in `get_media_files` — genuinely one shared asset |
| 19 | `image 25` 1100×618, `background-blend-mode: screen` | **genuinely unfetchable** | not a key in `get_media_files` (not `MM_MEDIA_`-named); `get_node` confirms a real `background: url(...)` on this node, so the artwork exists; `get_figma_image({nodeIds:["2940:14181"]})` → HTTP 500, `get_media_file({nodeId:"2940:14181"})` → HTTP 401 |
| 20 | `Root further mo rong 1` 1819×583 | **genuinely unfetchable** | same as #19 — not a `get_media_files` key; `get_node` shows a real background gradient+image; `get_figma_image`/`get_media_file` both errored (500/401) on node `2940:14173`. Existing `Root_Further_Logo.png` (451×200) could not be confirmed or ruled out as a substitute — dimensions don't match the 1819×583 node, so likely wrong, but unverified |
| 21 | `image 35` 34×40 (sidebar D.1.4 heart+×2 artwork) | **genuinely unfetchable** | same pattern — not a `get_media_files` key; `get_node` shows a real background image on node `3241:14932`; `get_figma_image`/`get_media_file` both errored (500/401) |
| 22 | `image 24` 1098×617 | **absent in design data** | `get_node({nodeId:"2940:14178"})` returns a `styles` object with no `background` property at all (only `width/height/zIndex/position/borderRadius/mixBlendMode`) — confirmed empty, nothing to export, exactly as `design/kudos-content.md` flagged. Not fabricated |
| 23 | star/asterisk mark + KUDOS wordmark group, node `2940:13440` (`MM_MEDIA_Kudos logo`) | **downloaded** → `Kudos_Board_Wordmark.svg` (593×106) | `get_media_files` key `2940:13440` — this node is `MM_MEDIA_`-named and was resolvable the whole time; my first pass fetched it for comparison but wrongly withheld it from `public/saa/`. Corrected this revision (see note below) |

**Totals:** 16/23 downloaded, 1/23 reused per instruction, 2/23 confirmed absent in the design
data itself (not fetch failures), 4/23 genuinely unfetchable with the tools available this session
(artwork exists per `get_node`, but no working export path reached it — `get_figma_image` 500 and
`get_media_file` 401 on every one of these four specific untracked nodes).

### Correction note — the wordmark/star-mark group (item 23)

The coordinator caught this: node `2940:13440` (`MM_MEDIA_Kudos logo`, 593×106) resolves in
`get_media_files` and always did. In the first pass I fetched it only to *compare* against the
existing `public/saa/Kudos_Wordmark.svg` (364×74, a different asset from a different frame,
confirmed by dimension and path-data mismatch), concluded correctly that they're different assets,
but then wrongly withheld the download — reasoning that the combined 593×106 SVG "bundles the star
mark and a vectorized KUDOS text" in a way that might not match a live-text implementation. That
reasoning oversteps this phase's job: this phase supplies raw assets, not the component decision of
whether to render the wordmark as live text or as this image. Downloaded now as
`Kudos_Board_Wordmark.svg`. Phase 5 can use it directly as the banner lockup, or extract just the
left ~120×94 region for a standalone star mark if it wants the `KUDOS` glyphs as live SVN-Gotham
text instead — that choice belongs to phase 5, not here.

### Design-owner note — New Hero pill (item 13)

This is a genuine gap in the Figma file, not a tool problem: `I3127:21871;256:4858;3106:17694`
(the New Hero badge pill instance) has no exportable image anywhere in MoMorph's media data, while
its three siblings (Rising/Super/Legend Hero) all export fine. This lines up with
`design/kudos-content.md`'s own note that the New Hero pill is the only tier with a separate solid
backing rectangle (`3007:17507`, fill `#FFF3C6`) plus its own artwork layer, rather than a single
flattened image like the other three. The `--new-hero-ground` token added in Deliverable A
(`#FFF3C6`) may be exactly how this tier should render — a solid backing rect in that colour
instead of a raster pill — flagging this so the component phase doesn't go hunting for a missing
export that was never generated on the design side.

### Verification of the three "possibly already present" assets (Implementation Step 3)

- **KV Background** — `get_media_files` resolves this frame's own `MM_MEDIA_KV Background` node
  (`I2940:13432;2167:5141`) to a **1440×512px** PNG — this frame's exact rendered crop. The
  existing `public/saa/Kudos_Background.png` is **1120×500px**, a different crop — confirmed
  mismatched. Re-exported as a new file, `Kudos_Board_KV_Background.png` (1440×512, sourced
  directly from MoMorph). `Kudos_Background.png` itself was left untouched.
- **Kudos wordmark** — see the correction note above: downloaded as `Kudos_Board_Wordmark.svg`,
  a genuinely new, correctly-sized (593×106) asset for this frame. The existing
  `public/saa/Kudos_Wordmark.svg` (364×74) is confirmed to be a different asset for a different
  frame and was left untouched.
- **Root further mo rong 1** — still unresolved (item 20 above, genuinely unfetchable). Existing
  `Root_Further_Logo.png` is 451×200 against a needed 1819×583 node — dimensions clearly differ,
  so a mismatch is likely, but pixel data was not obtainable this session to confirm.

## Checks

- **`npx tsc --noEmit`** — exit 0, clean (re-verified; no code files touched this revision).
- **`npm run lint`** — exit 1, but the only findings are 2 pre-existing `prefer-const` errors in
  `e2e/kudos-board-feed-interactions.spec.ts` (tester-owned, untouched) plus 2 pre-existing
  unused-import warnings in unrelated login e2e specs. Zero findings in `app/globals.css` or any
  file under `public/saa/`.
- **Asset coverage:** 16/23 downloaded, 1/23 reused, 2/23 confirmed absent in design data, 4/23
  genuinely unfetchable (tool + error stated per item above).
- **Token provenance:** unchanged from first pass — all 8 colour tokens and the 2 radius tokens
  trace to `design/kudos-content.md` §8 / the phase file's `Requirements`; none invented.

## Files changed

- `app/globals.css` (modified — 20 additive lines)
- `public/saa/Search.svg`, `Left.svg`, `Right.svg`, `Send.svg`, `Heart.svg`, `Link.svg`,
  `Open_Gift.svg` (new)
- `public/saa/Avatar_Sender.png`, `Avatar_Receiver.png`, `Avatar_Leaderboard.png`,
  `Sample_Image.png`, `Badge_Rising_Hero.png`, `Badge_Super_Hero.png`, `Badge_Legend_Hero.png`,
  `Kudos_Board_KV_Background.png` (new)
- `public/saa/Kudos_Board_Wordmark.svg` (new, added this revision)

## MoMorph calls

First pass: `list_media_nodes` ×1, `get_media_files` ×2, `get_node` ×5, `get_frame` ×1,
`get_frame_image` ×1, `list_media_items` ×1, `list_design_items` ×1, `get_figma_image` ×9 (all
500), `get_media_file` ×5 (all 401). This revision: `get_media_files` ×1 (fresh URLs, used for the
final `curl` batch) — no further `get_figma_image`/`get_media_file` calls, per coordinator
instruction.

## Next-phase handoff

- **Item 10** (Xem-chi-tiết trailing icon, componentId `186:2691`) — genuinely unfetchable this
  session; a future retry of `get_figma_image`/`get_media_file` on this exact node, or a manual
  Figma export, is needed before phase 4 can use it as drawn.
- **Item 13** (New Hero badge pill) — no artwork exists in the design data at all (confirmed
  `null`); phase 4 should render this tier as `--new-hero-ground` (#FFF3C6) solid backing + live
  text rather than waiting on an export that will never appear.
- **Items 19–21** (spotlight board artwork ×2, sidebar D.1.4 heart+×2 artwork) — genuinely
  unfetchable this session; phase 6/7 cannot render these exactly as drawn without a retry once a
  working export path exists, or a manual Figma export.
- **Item 20** specifically — do not reuse `Root_Further_Logo.png` (451×200) without confirming it
  matches the 1819×583 node; dimensions suggest it doesn't.
- **Item 23** is now resolved — phase 5 has `Kudos_Board_Wordmark.svg` (593×106) for the banner
  lockup.

**Status:** DONE_WITH_CONCERNS
**Summary:** All 8 colour tokens and 2 radius tokens are in `app/globals.css`, verified against
`design/kudos-content.md` §8 (unchanged from first pass, confirmed correct by the coordinator).
Asset coverage corrected per the coordinator's feedback: 16/23 downloaded (up from 15, after
recovering the wordmark/star-mark group I'd wrongly withheld), 1/23 reused per instruction, 2/23
confirmed as genuine design-data gaps (New Hero pill, `image 24`) rather than fetch failures, and
4/23 remain genuinely unfetchable with a stated tool + error for each rather than a blanket
"outage" claim. `tsc --noEmit` and `lint` are clean with respect to this phase's files.
**Concerns/Blockers:** 4 assets (items #10, #19, #20, #21) have real artwork in the design data
(confirmed via `get_node`) that no available tool this session could export — `get_figma_image`
500s and `get_media_file` 401s on each of these specific untracked node ids. This is narrower and
more precisely stated than the first pass's blanket "service outage" framing, which the
coordinator correctly rejected. None of these was faked or substituted; each is named with its
node id for whoever retries the export next.
