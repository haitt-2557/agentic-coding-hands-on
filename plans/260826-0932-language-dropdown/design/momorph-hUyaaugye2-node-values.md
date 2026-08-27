# MoMorph design values — `Dropdown-ngôn ngữ` (hUyaaugye2 / 721:4942)

File: `9ypp4enmFmdK3YAFJLIu6C` · frame revision `33b849680cdef15298c122effb920fd4`
design_status `done` · spec_status `done` · dev_status `none`

**Authoritative** — every value below came from `get_node`. Nothing here is guessed.
Test cases: **0 rows** (`download_test_cases` returned `status: empty`).
Media nodes: **0** (`list_media_nodes`) — the flags are vector GROUPs, not exported MM_MEDIA assets.

## A — `mms_A_Dropdown-List` (`525:11713`) — the open panel

| Property | Value |
|---|---|
| background | `#00070C` (`var(--Details-Container-2)`) |
| border | `1px solid #998C5F` (`var(--Details-Border)`) |
| border-radius | `8px` |
| padding | `6px` |
| layout | `flex` / `column` / `align-items: flex-start` |
| box | 122 × 124 px (x 47→169, y 90→214) |

## A.1 — `mms_A.1_tiếng Việt` (`I525:11713;362:6085`) — selected row

| Property | Value |
|---|---|
| size | 108 × 56 px |
| background | `rgba(255, 234, 158, 0.2)` — **selected** state |
| border-radius | `2px` |
| layout | `flex` / `row` / `align-items: center` |

## A.2 — `mms_A.2_tiếng Anh` (`I525:11713;362:6128`) — unselected row

| Property | Value |
|---|---|
| size | 110 × 56 px |
| background | none → panel `#00070C` shows through |
| border-radius | `0px` |
| layout | `flex` / `row` / `align-items: center` |

> The 108 vs 110 and `2px` vs `0px` deltas are Figma component-variant artifacts of the same
> `componentSetId: 186:1695`. Both rows are one row type: **110 × 56**, radius `2px`.

## Row content (`Frame 485` / `Content`, `…;186:1937`)

| Property | Value |
|---|---|
| layout | `flex` / `row` / `align-items: center` |
| gap | `4px` |
| content box | 52–53 × 24 px, **optically centred** in the 110 px row (≈28 px each side) |

## Icon slot (`IC`, `…;186:1709`)

| Property | Value |
|---|---|
| slot | 24 × 24 px |
| flag artwork | **20 × 15 px** — identical to the shipped `public/saa/Flag_VN.svg` |
| VN child | `VN - Vietnam` (`178:1010`) |
| EN child | `GB-NIR - Northern Ireland` (`178:946`) — the Union Flag |

## Label (`…;186:1439`, TEXT)

| Property | Value |
|---|---|
| characters | `VN` / `EN` |
| font-family | Montserrat |
| font-weight | `700` |
| font-size | `16px` |
| line-height | `24px` |
| letter-spacing | `0.15px` |
| color | `#FFFFFF` |
| text-align | center |

## Behaviour stated in the specs

- Click the trigger → open / close the menu.
- Click a row → set that locale, update the displayed value, close the menu.
- Hover → highlight background.
- Selected → distinct background (`rgba(255,234,158,0.2)`).
