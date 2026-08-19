# Clarifications — Login page (`/login`) + Supabase local auth

**Screen:** Login
**MoMorph:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
**fileKey:** `9ypp4enmFmdK3YAFJLIu6C` · **screenId:** `GzbNeVGJHz` · **figma node:** `662:14387`
**Source data:** 8 spec items (`spec_status: done`), 17 test cases, 5 media nodes, frame 1440×1024
**testPolicy:** `e2e-red-first`
**Prior context:** builds on `plans/260818-0936-homepage-saa/` (homepage, screen `i87tDx10uM`) and
`plans/260819-0913-countdown-prelaunch/` (screen `8PJQswPZmU`). Their `clarifications.md` files remain
authoritative for everything they settled — those decisions are inherited, not re-asked.

---

## Session 2026-08-19

- Q: Supabase local is not set up in this repo — no `supabase` CLI on PATH, the Docker/colima daemon is
  down, there is no `supabase/` directory and no `@supabase/*` dependency. Google OAuth against a local
  Supabase stack additionally needs a real Google client ID/secret, which are user-owned secrets. How
  should this proceed? → A: **Full setup; the user supplies the Google credentials.** Install the
  Supabase CLI, scaffold `supabase/config.toml` with the Google provider reading
  `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `..._SECRET` from the environment, add
  `@supabase/supabase-js` + `@supabase/ssr`, and wire the real OAuth flow (`signInWithOAuth` →
  Supabase `/auth/v1/authorize` → Google → callback → `exchangeCodeForSession`). The user brings
  colima/Docker up and puts the credentials in `.env.local`. Real end-to-end login, no fake auth.
- Q: The spec's `transitionNote` on item 2.2.1 says a successful login redirects to `/todo`, but no such
  route exists in this app (`/`, `/awards`, `/kudos`, `/profile`, `/admin`, `/prelaunch`). → A:
  **Redirect to `/`.** `/todo` reads as a design placeholder; `/` is this app's main application page
  and matches the test cases' own wording, *"redirected to the main application page"*
  (`f62b0c97`, `e76aa170`). Logged as a design-owner note below rather than inventing a `/todo` screen.
- Q: How far does authentication reach in this run? The repo carries a **client-side mock session**
  (`lib/session/session-provider.tsx`, role `guest|user|admin` from `localStorage`) that its own header
  comment declares is not a security boundary. → A: **Login screen + session only.** `/login` renders
  and works, the Supabase session persists across reloads, and an already-authenticated visitor to
  `/login` is redirected to `/`. Every other route stays open and the mock session keeps driving
  role-based UI exactly as it does today. This is the slice this screen's spec actually describes;
  route protection and replacing the mock session are deliberately out of scope (see Next Steps).
- Q: `proxy.ts` currently redirects **every** route except `/prelaunch` to `/prelaunch` while the
  countdown is above zero — and `NEXT_PUBLIC_EVENT_START_AT` is `2026-12-19`, so the gate is live right
  now. Should `/login` be reachable during prelaunch? → A: **Exempt `/login` and the OAuth callback.**
  Add both to the gate's allowlist alongside `/prelaunch`. Without the exemption the login page is
  unreachable and unverifiable in a browser today, and the gate would swallow Supabase's redirect back
  from Google mid-flow. The exemption is a launch-timing decision, not an authorization one — it does
  not weaken the gate for any other route.
- Q: The spec for item 1.2 says the language selector persists to a `NEXT_LOCALE` cookie, but the repo
  already ships `components/ui/language-switcher.tsx`, which persists to `localStorage` under
  `saa.locale` and is used on every existing screen. → A: **Reuse the existing switcher as-is.** DRY —
  the same component and the same key, so a locale chosen on `/login` carries into the rest of the app.
  The spec's cookie choice was written screen-local, without knowledge of the existing implementation;
  it is recorded as a design note below rather than forking locale persistence into two competing
  sources of truth.

## Orchestrator Assumptions (stated, not asked)

Resolvable from the design data or from the inherited homepage/prelaunch decisions; recorded so the
implementation agents do not re-derive them.

- **Test policy is `e2e-red-first`.** The resolved design contains behavioural interaction, not just
  static mapping: an authenticated visitor is redirected away (`f62b0c97`), the button disables and
  shows a loader while authenticating (`37eae882`), a failed or cancelled Google auth surfaces an error
  string (spec item 2.2.1 `validationNote`), and success redirects to the main page (`e76aa170`).
  Per the test-policy resolution rule that selects strict E2E for state transitions. The runner exists
  and is real: `@playwright/test` ^1.62.1, `npm run test:e2e`, web target — no runner is installed or
  scaffolded for this run.
- **Login has its own header and footer, not the site chrome.** The frame's header is logo + language
  selector only; `components/layout/site-header.tsx` carries nav links, notification bell and account
  menu that the login frame does not have, and `site-footer.tsx` carries a logo and nav that the login
  footer does not have (login footer is the centred copyright line alone). New, smaller components
  rather than variant props on the existing ones earning nothing (YAGNI). The shared
  `LanguageSwitcher` and `DropdownMenu` primitives ARE reused unchanged.
- **The ROOT FURTHER title is the existing image asset.** Media node `2939:9548`
  (`MM_MEDIA_Root Further Logo`, 451×200) is the same artwork already shipped at
  `/saa/Root_Further_Logo.png` and used by `components/home/hero-keyvisual.tsx`. Reused, not
  re-downloaded.
- **The wave key visual is a new asset.** The login hero artwork (coloured wave bands on a dark ground)
  is not `Keyvisual_BG.png` — that is the homepage's. It is pulled from MoMorph and lands under
  `public/saa/`. No stock or placeholder imagery is substituted.
- **The Google mark is a new asset** from media node `I662:14426;186:1766` (24×24). Pulled from
  MoMorph; not redrawn.
- **Error surface.** The design shows no error region, but spec item 2.2.1 fixes the copy:
  *"Đăng nhập không thành công. Vui lòng thử lại."* Rendered as an inline `role="alert"` directly below
  the login button, so it is announced and assertable. Flagged to the design owner below.
- **i18n.** The login copy is added as new `login.*` keys in both dictionaries — title/subtitle/tagline,
  the button label, and the error string. `footer.copyright` already exists and is reused verbatim
  (the login footer string matches the site footer exactly).
- **Responsive behaviour is derived.** Only the 1440-wide desktop frame exists. Proportional scaling
  down to a 375px floor, hero text stacking above the button, following the precedent set for the
  prelaunch screen. Flagged to the design owner below.
- **Access-control test cases are about Supabase auth now, not the mock role.** `45278c06` step 2
  ("redirects to the Login Screen after logout") describes route protection, which this run does not
  build. The reachable half — an authenticated user on `/login` is redirected to `/` — is asserted;
  the logout-redirect half is deferred with route protection and recorded in Next Steps.

## Extracted design values (authoritative — do not re-derive or estimate)

Frame `662:14387`, 1440×1024. Full styles per node come from MCP at implementation time; these are the
structural facts settled during clarification.

| Element | Node | Notes |
|---|---|---|
| Header | `662:14391` | fixed/sticky, logo left + language selector right |
| Logo | `I662:14391;178:1033;178:1030` | 52×48, static, NOT interactive (TC `b9805e65` step 4) |
| Language selector | `I662:14391;186:1696;186:1821` | 108×56 button; VN flag `…;186:1709` + label + chevron `…;186:1441`; default `VN` |
| Main section | `662:14393` | absolute, 1440×845, y 88→933, padding `96px 144px`, column, gap 120px |
| Hero key visual | `662:14395` | 1152×200 frame holding the ROOT FURTHER logo; wave artwork is the section background |
| ROOT FURTHER logo | `2939:9548` | 451×200, aspect 115/51 → existing `/saa/Root_Further_Logo.png` |
| Intro block | `662:14755` | title + subtitle "Bắt đầu hành trình của bạn cùng SAA 2025." + tagline "Đăng nhập để khám phá!" + button |
| Login button | `662:14425` / `662:14426` | 305×60, `icon_text`, pale-yellow fill, label "LOGIN With Google", Google mark right |
| Google mark | `I662:14426;186:1766` | 24×24 |
| Footer | `662:14447` | centred "Bản quyền thuộc về Sun* © 2025" on dark ground, fixed at page bottom |

## Design defects to report back to the design owner

1. **`/todo` is not a real route.** Item 2.2.1's `transitionNote` sends a successful login to `/todo`,
   a screen that exists nowhere in this design file or this app. Shipped against `/` instead; the real
   post-login destination still needs naming.
2. **No error state is drawn.** Item 2.2.1 specifies the failure copy but the frame has no region to
   put it in. Placed below the button by implementation decision — worth confirming placement and
   styling.
3. **Language persistence is specified screen-local.** Item 1.2 mandates a `NEXT_LOCALE` cookie while
   the rest of the delivered app already persists locale to `localStorage`. The spec was written
   without visibility of the existing switcher; the app-wide mechanism won.
4. **The header is described as fixed/sticky, the footer as fixed** (item 1, TC `33a1dacf`), but the
   frame is a single 1024-tall viewport with nothing to scroll. Whether the footer is genuinely
   viewport-fixed or simply sits at the bottom of a full-height page is unspecified; implemented as the
   latter, which is indistinguishable at the designed size and does not cover content on small screens.
5. **"The Google authentication flow starts in a new tab or popup"** (TC `60bc5bbb`) contradicts the
   spec's own `transitionNote`, which describes a full-page redirect to Google sign-in. Implemented as
   a same-tab redirect — the Supabase `signInWithOAuth` default and the only flow that survives a
   browser blocking popups.
6. **The frame gives no responsive behaviour.** Only a 1440-wide desktop frame exists. Mobile scaling
   is derived rather than specified — same gap as the prelaunch screen.

## Unresolved Questions

1. **The Google OAuth client ID and secret have not been supplied yet.** The user has taken this on:
   the Supabase local stack and the app code are built to read
   `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `..._SECRET` from the environment. Until those land in
   `.env.local`, the OAuth round-trip cannot be exercised against a real Google account — the strict
   E2E asserts the flow up to the redirect to Supabase's `/auth/v1/authorize`, plus the
   session-and-redirect behaviour driven through a Supabase session the test establishes directly.
2. **Docker/colima must be running** for `supabase start`. Not something the implementation can do on
   the user's behalf; called out in the setup phase and in `docs/`.
3. **Route protection is deferred** (see the Auth-scope decision). Test case `45278c06` step 2 stays
   unasserted until it lands.

## Next Steps (out of scope for this run)

- Protect `/`, `/awards`, `/kudos`, `/profile`, `/admin` behind the Supabase session in `proxy.ts`.
- Replace `lib/session/session-provider.tsx` with the real Supabase session and derive `role` from the
  authenticated user, wiring `account.signOut` in `components/ui/account-menu.tsx` to a real sign-out.
