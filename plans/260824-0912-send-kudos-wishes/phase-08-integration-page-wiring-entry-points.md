# Phase 08 — Integration: page, wiring, entry points

**Track:** integration · **Owner agent:** `implementer` · **Priority:** P1 · **Status:** pending · **Effort:** 1.5h
**Depends on:** 05 (server action), 06 (form components) · **Unblocks:** 09

## Context Links

- [dom-contract.md](dom-contract.md) → **E1–E5**, D1, D16, and the port-3200 production-build note
- [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) → FR-001, FR-013, US009, SC-001, SC-009, `## Source Code References`
- [clarifications.md](clarifications.md) decisions 2, 8 · [screens.md](spec/send-kudos-wishes/screens.md) User Journey

## Overview

The only phase that crosses the Track A / Track B seam: create the route that assembles the
gate, the queries, the form and the action; carry the success toast to `/kudos`; and repoint the
two entry points. Nothing here re-implements logic — it wires modules that already exist.

## Key Insights

- **The success URL must be exactly `/kudos`** — `send-kudos-submission.spec.ts:43` asserts
  `toHaveURL(/\/kudos$/)`, anchored, so `?sent=1` fails. Hence E5: the action returns a result,
  the client sets a `sessionStorage` flag, then `router.push('/kudos')`. A server-side
  `redirect()` with a query param is the intuitive design and it is wrong here.
- The pill is the subtlest change in the feature. Existing specs **focus** the `readOnly <input>`
  and read `document.activeElement.getAttribute('placeholder')`
  (`kudos-board-layout.spec.ts:38-45,148-153`, `kudos-board-feed-interactions.spec.ts:194-200`),
  so the input, its verbatim placeholder and its focusability must all survive. The new spec
  needs a clickable `a[href="/kudos/send"]`. E3 satisfies both: an anchor **preceding** the input
  in DOM order, `absolute inset-0` over the pill. Order matters — the new spec's union locator
  takes `.first()` in document order, and an `<input>` nested inside an `<a>` is invalid HTML
  that swallows the click.
- `aria-haspopup="dialog"` comes off (E2). Verified safe: `grep haspopup e2e/` → zero hits, so no
  existing spec asserts it. This is the superseded contract from clarifications decision 2 being
  cleaned up, not left lying.
- The widget keeps **exactly two** menuitems in order — `homepage-widget-and-kudos.spec.ts:22-24`
  asserts `getByRole('menuitem').nth(1)` is `Về SAA 2025`. Change the href, do not add an item.
- Port 3200 is a production build, so this is the first moment the whole graph must compile.
  Expect the real integration errors here, not earlier.
- A kudos sent will **not** appear on the board (clarifications decision 1). The toast is the only
  user-visible confirmation. That is by design — do not "fix" it by reading the new tables.

## Requirements

**Functional:** FR-001 (gate on the real route), FR-013 (success → `/kudos` + toast), plus the entry points from clarifications decision 2.
**Non-functional:** every file <200 lines; no duplicated validation or query logic; existing `/kudos` and `/` behaviour preserved.

## Architecture

```text
app/kudos/send/page.tsx                      (server; ~20 lines)
  await requireSupabaseUser()                                   [phase-04]  -> 307 /login
  const [profiles, hashtags] = await Promise.all([listProfiles(), listHashtags()])
  <div><SiteHeader /><main><KudosSendPageClient profiles hashtags /></main><SiteFooter /></div>
        ^ same shell as app/kudos/page.tsx    ^ this phase

components/kudos/kudos-send-page-client.tsx  (client, new — THIS phase owns it)
  imports submitKudos [phase-05] and KudosSendForm [phase-06]
  handleSubmit = async (input) => {
    const result = await submitKudos(input);
    if (result.ok) { sessionStorage.setItem('saa.kudos-sent','1'); router.push('/kudos'); }
    return result;                       // form renders { ok:false } inline itself
  }
  renders <KudosSendForm profiles hashtags onSubmit={handleSubmit} />                  [E5]

components/kudos/kudos-sent-toast.tsx        (client, new; mounted by app/kudos/page.tsx)
  on mount: read + REMOVE 'saa.kudos-sent' -> <KudosToast message={t('sendKudos.successToast')} />
```

The wrapper exists **precisely to keep file ownership disjoint**: the navigation and
`sessionStorage` half of E5 must live in a client component, but `components/kudos/send/**`
belongs to phase-06. Do not edit `kudos-send-form.tsx` to add navigation — it already returns
control via `onSubmit`'s resolved result, which is all this wiring needs.

`/kudos/send` must **not** render `KudosActionBar` (D1 — its Sunner-search placeholder collides
with the recipient field's `Tìm kiếm`). Use `SiteHeader`/`SiteFooter` only.

Entry-point edits:

| File | Edit |
|------|------|
| `components/kudos/kudos-action-bar.tsx` | Wrap the pill in a `relative` container; add `<Link href="/kudos/send" aria-label=…className="absolute inset-0">` **before** the input; remove `aria-haspopup="dialog"`; keep `readOnly`, the placeholder string byte-for-byte, and focusability (E1–E3) |
| `components/layout/quick-action-widget.tsx` | Item 1 `href="/kudos"` → `href="/kudos/send"`. Nothing else (E4) |
| `app/kudos/page.tsx` | Mount `<KudosSentToast />` (E5) |

## Related Code Files

**Create (owned exclusively):** `app/kudos/send/page.tsx`, `components/kudos/kudos-send-page-client.tsx`, `components/kudos/kudos-sent-toast.tsx`
**Modify (owned exclusively):** `components/kudos/kudos-action-bar.tsx`, `components/layout/quick-action-widget.tsx`, `app/kudos/page.tsx`
**Read for context:** `app/kudos/page.tsx` (shell pattern), `app/login/page.tsx`, `components/kudos/kudos-toast.tsx`, `components/kudos/kudos-card-actions.tsx` (existing toast usage), `lib/kudos/send/*`
**Do not touch:** `components/kudos/send/**` and the i18n dictionaries (phase-06) · `lib/kudos/send/**` (phases 03–05) · `e2e/**`, `playwright.config.ts` (phase-07) · `proxy.ts`, `lib/prelaunch/**`.

## Implementation Steps

1. Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` before
   creating the route (AGENTS.md; Next 16 differs from training data).
2. Create `app/kudos/send/page.tsx` per the diagram — gate first, then the parallel reads, then
   the form. Keep it a thin server shell.
3. Create `kudos-send-page-client.tsx` and wire the success path there:
   `sessionStorage.setItem('saa.kudos-sent','1')` then `router.push('/kudos')`. No query param,
   no server `redirect()` (E5). **Do not edit `components/kudos/send/**`** — phase-06 owns it.
4. Create `kudos-sent-toast.tsx`: read **and remove** the flag on mount so a refresh does not
   re-show the toast, then render the existing `KudosToast` with the phase-06 copy key.
5. Mount it in `app/kudos/page.tsx`. Confirm it renders **nothing** when the flag is absent — it
   must not add a second `role="status"` to the board for the kudos-board suite (E5).
6. Apply the two entry-point edits exactly as tabulated. Diff the pill's placeholder string to
   prove it is byte-identical (1 leading + 3 trailing spaces).
7. `npx tsc --noEmit`, `npm run lint`, `npx next build`.
8. Re-run the two suites whose components you touched — see Success Criteria.

## Todo List

- [ ] Next 16 `page.md` read first
- [ ] `app/kudos/send/page.tsx`: gate before reads, thin shell, no `KudosActionBar`
- [ ] Success path lives in the new client wrapper — `components/kudos/send/**` untouched
- [ ] Success path uses sessionStorage + `router.push('/kudos')`; no query param anywhere
- [ ] `kudos-sent-toast.tsx` removes the flag on read; renders null without it
- [ ] Pill: anchor added **before** the input; `aria-haspopup="dialog"` removed; placeholder byte-identical; still focusable and enabled
- [ ] Widget: href repointed, still exactly two menuitems in the original order
- [ ] typecheck + lint + `next build` clean
- [ ] `--project=kudos-board` and `--project=homepage-with-open-gate` re-run green

## Success Criteria

- `npm run test:e2e -- --project=kudos-board` **green** — proves E1/E2 kept the pill's placeholder,
  focus and enabled state, and that no second `role="status"` appeared on `/kudos`.
- `npm run test:e2e -- --project=homepage-with-open-gate` **green** — proves E4 kept the widget's
  two menuitems and their order.
- `grep -rn "haspopup" components/kudos/kudos-action-bar.tsx` → no match; `grep -rn "haspopup" e2e/`
  → still no match.
- `grep -rn "sent=" app components` → no match (E5).
- `npx next build` succeeds; `/kudos/send` appears in the build's route list.
- Manual: unauthenticated `curl -I` of `/kudos/send` on :3200 → 307 to `/login` (FR-001, SC-001).

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Toast wired via `?sent=1` → `toHaveURL(/\/kudos$/)` fails | **High** × High | E5 + a grep success criterion; the mechanism is fixed in the plan, not left to taste |
| Pill converted to a link/button outright → 3 existing tests break on `document.activeElement` | **High** × High | E1/E3 keep the input; the two named suites are re-run as a success criterion |
| Anchor placed after the input → `.first()` resolves to the input and the click is intercepted | Med × High | E3 fixes DOM order explicitly |
| Third widget item added → `menuitem` `.nth(1)` assertion breaks | Med × Med | E4 says change the href only |
| New page-level toast becomes a permanent second `role="status"` on `/kudos` | Med × High | Renders null without the flag; kudos-board suite re-run proves it |
| Half-wired imports break the production build and thus all 23 tests | Med × High | This phase runs only after 05 and 06 report DONE; `next build` is a todo item |
| Board "fixed" to show the new kudos | Low × Med | Out of scope by clarifications decision 1; the seam is deliberate |

## Security Considerations

- The gate runs before any read or render, so an unauthenticated visitor sees no part of the form
  (US001 scenario 2).
- The client passes no `senderId`; identity stays server-side (FR-014).
- `sessionStorage` carries only a `'1'` flag — no kudos content, no identity. It is cleared on
  read, so the toast cannot be replayed.
- Removing `aria-haspopup="dialog"` is an accessibility **correction**: the control is now a real
  link and no longer claims to open a dialog.

## Next Steps

Hand to phase-09 for the GREEN run and full-suite regression. Report any D-rule that had to bend
during wiring, and confirm the two regression projects were green **before** claiming done.
</content>
