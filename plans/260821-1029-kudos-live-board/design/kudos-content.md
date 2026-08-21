# Sun* Kudos — Live board · rendered content & layout extraction

Source of truth: MoMorph MCP design data for frame `2940:13431` ("Sun* Kudos - Live board"),
screenId `MaZUn5xHXZ`, fileKey `9ypp4enmFmdK3YAFJLIu6C`, frame 1440 × 5862.
URL: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ

**Every string below is a verbatim `character` value read off a node.** Where a value does not
exist in the design data it is written `NOT IN DESIGN`. Where the spec CSV (64 rows,
`download_specs`) disagrees with the frame, both are stated and the frame is marked as truth.

Coordinate convention: `absX/absY` are `position.startX/startY` from the MCP (frame-absolute,
frame origin 0,0). Trailing/leading spaces inside backticks are real — do not trim them.

Fonts on this frame: `Montserrat` (almost everything), `Montserrat Alternates` (footer
copyright only), `SVN-Gotham` (the KUDOS wordmark glyph text only).

---

## 1. Banner (A · `2940:13437`)

`A_KV Kudos` FRAME 1152 × 160 at (144, 184); column flex, `gap: 10px`, no background.
Parent `Frame 487` (`2940:13436`) is 1440 × 160 with `padding: 0 144px`.

| item | node | value / style |
|---|---|---|
| Title | `2940:13439` (TEXT, in GROUP `2940:13438` 559×44) | `Hệ thống ghi nhận và cảm ơn` — 36px / 700 / lh 44px / letter-spacing 0 / fill `rgba(255, 234, 158, 1)` (#FFEA9E) / align left / at (144, 184) |
| Wordmark group | `2940:13440` `MM_MEDIA_Kudos logo` GROUP 593 × 104 at (144, 238) | contains two children |
| — star/logo mark | `2940:13442` GROUP 120 × 94 at (144, 238) | vector group, no text, no `MM_MEDIA_` name of its own |
| — wordmark glyphs | `2940:13441` TEXT 550 × 98 at (186, 243) | `KUDOS` — font `SVN-Gotham`, 139.7805938720703px, weight 400, lh 34.94514846801758px, letter-spacing `-13%`, align center, fill `rgba(219, 209, 193, 1)` = **#DBD1C1** (new colour) |
| KV background | `I2940:13432;2167:5141` `MM_MEDIA_KV Background` RECTANGLE 1440 × 512 at (0, 0) | `background: url(<path-to-image>) lightgray -0.163px -909.862px / 101.245% 393.038% no-repeat`, `aspect-ratio: 45/16` |
| KV cover overlay | `I2940:13432;1210:12612` `Cover` RECTANGLE 1440 × 957 at (0, 445) | `background: linear-gradient(25deg, #00101A 14.74%, rgba(0, 19, 32, 0.00) 47.8%)` — note it extends **below** the 512px KV, down to y=1402 |

Spec CSV row `A` describes the title as `'Hệ thống ghi nhận lời cảm ơn'`. **The frame says
`Hệ thống ghi nhận và cảm ơn`** — frame is truth.

---

## 2. Submit pill + Sunner search

Both are instances of component `186:2757` (component set `186:1426`), inside
`Button chuc nang` (`2940:13448`, 1440 × 72 at (0, 408)).

### A.1 — submit pill · `2940:13449`

- 738 × 72 at (144, 408); `border: 1px solid var(--Details-Border, #998C5F)`;
  `background: var(--Details-SecondaryButton-Normal, rgba(255, 234, 158, 0.10))`;
  `border-radius: 68px`; `padding: 24px 16px`; flex row, `gap: 8px`.
- Inner row `I2940:13449;186:2758` 513 × 24 at (160, 432), `gap: 16px`.
- Icon `I2940:13449;186:2759` `MM_MEDIA_Pen` INSTANCE 24 × 24 at (160, 432) (componentId `214:3812`).
- Placeholder `I2940:13449;186:2760` TEXT 473 × 24 at (200, 432), 16px / 700 / lh 24px /
  letter-spacing 0.15px / align center / fill `rgba(255, 255, 255, 1)`:

```
 Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?   
```
(one leading space, three trailing spaces — verbatim)

### Sunner search (top) · `2940:13450`

- 381 × 72 at (914, 408); same border / background / `border-radius: 68px` / `padding: 24px 16px`.
- Inner row `I2940:13450;186:2758` 246 × 24 at (930, 432), `gap: 16px`.
- Icon `I2940:13450;186:2759` `MM_MEDIA_Search` INSTANCE 24 × 24 at (930, 432) (componentId `722:16051`).
- Placeholder `I2940:13450;186:2760` TEXT 206 × 24 at (970, 432), 16px / 700 / lh 24px /
  letter-spacing 0.15px / align center / fill `rgba(255, 255, 255, 1)`:

```
Tìm kiếm profile Sunner
```

There is **no spec CSV row for `2940:13450`** — the whole top search pill is undocumented in
the spec (only `A.1` exists).

---

## 3. HIGHLIGHT KUDOS section (B · `2940:13451`)

`B_Highlight` FRAME 1440 × 786 at (0, 544); column flex, `gap: 40px`.

### 3.1 Header (B.1 · `2940:13452`)

1440 × 129 at (0, 544), `padding: 0 144px`, `gap: 40px`.
Inner `Header Giải thưởng` (`2940:13453`) 1152 × 129 at (144, 544), column, `gap: 16px`.

| item | node | value / style |
|---|---|---|
| Subtitle | `2940:13454` | `Sun* Annual Awards 2025` — 24px / 700 / lh 32px / align left / fill `rgba(255, 255, 255, 1)` / 1152 × 32 at (144, 544) |
| Divider | `2940:13455` RECTANGLE | 1152 × 1 at (144, 592), fill `rgba(46, 57, 64, 1)` (= existing `--divider`) |
| Title | `2940:13457` | `HIGHLIGHT KUDOS` — 57px / 700 / lh 64px / letter-spacing `-0.25px` / align left / fill `rgba(255, 234, 158, 1)` / 564 × 64 at (144, 609) |

Row container `Frame 488` (`2940:13456`) 1152 × 64 at (144, 609), row flex,
`justify-content: space-between`, `gap: 32px`.

### 3.2 Filter buttons

Both instances of `186:2757`; both `border: 1px solid var(--Details-Border, #998C5F)`,
`background: var(--Details-SecondaryButton-Normal, rgba(255, 234, 158, 0.10))`,
`border-radius: 4px`, `padding: 16px`, `gap: 8px`. Parent `Buttons` (`2940:13458`)
302 × 56 at (994, 613), `gap: 8px`.

| node | label (verbatim) | box | label style | trailing icon |
|---|---|---|---|---|
| `2940:13459` `B.1.1_ButtonHashtag` | `Hashtag` | 136 × 56 at (994, 613) — text 72 × 24 at (1010, 629) | 16px / 700 / lh 24px / ls 0.15px / center / fill `rgba(255, 255, 255, 1)` | `I2940:13459;186:2761` `MM_MEDIA_Down` 24 × 24 at (1090, 629) |
| `2940:13460` `B.1.2_Button Phong ban` | `Phòng ban` | 158 × 56 at (1138, 613) — text 94 × 24 at (1154, 629) | same | `I2940:13460;186:2761` `MM_MEDIA_Down` 24 × 24 at (1256, 629) |

### 3.3 Carousel cards

Track `B.2.3_content HIghlight KUDO` (`2940:13463`) 1440 × 525 at (0, 713); row flex,
`gap: 24px`, `align-items: center`. Wrapper groups: `2940:13461` → `2940:13462`, both 1440 × 525.

**All three card instances share componentId `335:9620` and byte-identical styles:**

```
width: 528px; padding: 24px 24px 16px 24px; gap: 16px; flex-direction: column;
border: 4px solid var(--Details-Text-Primary-1, #FFEA9E);
background: var(--Details-PrimaryButton-Hover, #FFF8E1);
border-radius: 16px;
```

| card | node | x-range | layer name | note |
|---|---|---|---|---|
| left (inactive) | `2940:13464` | 0 → 528 | `KUDO - Highlight` | starts at x=0, so it is clipped on the left by the frame edge |
| **centre (active)** | `2940:13465` | 552 → 1080 | `B.3_KUDO - Highlight` | the spec'd card; the only one whose inner layers carry `B.3.*` / `B.4.*` names |
| right (inactive) | `2940:13466` | 1104 → 1632 | `KUDO - Highlight` | clipped at frame right edge x=1440 |

**Inactive treatment — read from real node properties:** there is **no** `opacity`, no
`transform/scale` and no `filter/blur` on any of the three card instances. The visual fade
comes from two sibling gradient overlay frames drawn on top:

| node | box | style | contains |
|---|---|---|---|
| `2940:13469` `Frame 528` | 400 × 525 at (0, 713) | `background: linear-gradient(90deg, var(--Details-Background, #00101A) 50%, rgba(255, 255, 255, 0.00) 100%)`; `padding: 186px 161px 186px 80px`; `align-items: center` | `2940:13470` |
| `2940:13467` `Frame 527` | 400 × 525 at (1040, 713) | `background: linear-gradient(270deg, var(--Details-Background, #00101A) 50%, rgba(255, 255, 255, 0.00) 100%)`; `padding: 186px 40px 186px 80px`; `align-items: center; justify-content: center` | `2940:13468` |

The spec CSV (`B.2`, `B.3`) says *"Slide hiện tại hiển thị nổi bật ở center, 2 bên để mờ"* —
consistent with the gradient-mask approach, but the design data carries **no numeric opacity or
scale value**, so any blur/scale/opacity number in the implementation is a choice, not extracted.

#### Card content — all three cards are byte-identical

Every text node on all three cards was fetched individually. The characters are the same on
each card; only positions differ. Card `2940:13466` is missing two of the twelve text nodes
because it is clipped at the frame edge: it has **no receiver badge text** and **no
"Xem chi tiết" button label** (those nodes do not exist in the frame data for that instance).

| slot | node suffix (prefix = `I2940:13465;`) | verbatim `character` | style |
|---|---|---|---|
| sender name | `335:9443;256:4735` | `Huỳnh Dương Xuân Nhật ` | 16px/700/lh 24px/ls 0.15px/center/fill `rgba(0, 16, 26, 1)`, box 235 × 24 |
| sender dept code | `335:9443;256:4751` | `CECV10` | 14px/700/lh 20px/ls 0.1px/left/fill `rgba(153, 153, 153, 1)`, box 56 × 20 |
| sender badge | `335:9443;3106:17694;3007:17511` | `Rising Hero` | 11.365px/700/lh 16.235px/ls 0.081px/`color: #FFF`/`text-shadow: 0 0.386px 1.543px #000` |
| sender badge pill | `335:9443;3106:17694` (INSTANCE `3007:17509`) | — | 109 × 19, `border: 0.5px solid var(--Details-Text-Primary-1, #FFEA9E)`, `border-radius: 48px`; artwork child `3007:17522` 117 × 30 `linear-gradient(0deg, rgba(9,36,50,0.50) 0%, rgba(9,36,50,0.50) 100%), url(<path-to-image>)` |
| arrow between | `335:9444` FRAME 32 × 123 / `335:9445` `IC` INSTANCE 32 × 32 (componentId `256:5140`) | NOT IN DESIGN (icon, no text) | |
| receiver name | `335:9446;256:4735` | `Huỳnh Dương Xuân Nhật ` | same as sender name |
| receiver dept code | `335:9446;256:4751` | `CECV10` | same as sender dept |
| receiver badge | `335:9446;3106:17694;3007:17519` | `Legend Hero` | 12.821px/700/lh 17px/ls 0.092px/`color: var(--Details-Text-Secondary-1, #FFF)`/`text-shadow: 0 0 1.3px #FFF` |
| receiver badge pill | `335:9446;3106:17694` (INSTANCE `3007:17516`) | — | 109 × 19, `border: 0.5px solid #FFEA9E`, `border-radius: 48px`; four artwork children (`3053:7682` / `3007:17517` / `3007:17518` / `3053:7672`), two of them `background-blend-mode: screen` |
| star dot | `335:9443;256:4754` / `335:9446;256:4754` ELLIPSE 4 × 4 | — | `opacity: 0.4`, fill `rgba(153, 153, 153, 1)` |
| timestamp | `335:9449` | `10:00 - 10/30/2025` | 16px/700/lh 24px/ls 0.5px/left/fill `rgba(153, 153, 153, 1)`, box 480 × 24 |
| category / hashtag heading | `1810:19718` | `IDOL GIỚI TRẺ` | 16px/700/lh 24px/ls 0.5px/**center**/fill `rgba(0, 16, 26, 1)`, box 480 × 24 |
| message body | `662:12223` | `Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất...` | 20px/700/lh 32px/ls 0/**justified**/fill `rgba(0, 16, 26, 1)`, box 432 × 88 |
| hashtag list | `335:9459` | `#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...` (note the **double space** before the last `#Inspring`) | 16px/700/lh 24px/ls 0.5px/left/fill `rgba(212, 39, 29, 1)` = #D4271D, box 480 × 24 |
| heart count | `335:9463` | `1.000` | 24px/700/lh 32px/ls 0/left/fill `rgba(0, 16, 26, 1)`, box 65 × 32 |
| heart icon | `335:9464` `IC` INSTANCE 32 × 32 (componentId `256:5162`) | NOT IN DESIGN (vector) | |
| action button 1 | `335:9465;186:1439` | `Copy Link` | 16px/700/lh 24px/ls 0.15px/center/fill `rgba(0, 16, 26, 1)`; button 144 × 56, `padding: 16px`, `border-radius: 4px`, no background; trailing `IC` `335:9465;186:1441` 24 × 24 (componentId `256:5195`) |
| action button 2 | `335:9663;186:1439` | `Xem chi tiết` | same text style; button 163 × 56, `padding: 16px`, `border-radius: 4px`, no background; trailing `IC` `335:9663;186:1441` 24 × 24 (componentId `186:2691`) |

Card internal structure of `2940:13465` (useful for layout):

- `335:9442` `Frame 482` 480 × 123 at (576, 737) — row, `space-between`, `gap: 24px`
  (sender block 235 × 123 / arrow 32 × 123 / receiver block 235 × 123)
- `335:9447` `Rectangle 14` 480 × 1 at (576, 876), fill `rgba(255, 234, 158, 1)`
- `335:9448` `B.4_Nội dung lời cảm ơn` 480 × 240 at (576, 893) — column, `gap: 16px`, `align-items: flex-end`
  - `662:12221` `Frame 425` (message box): `border: 1px solid var(--Details-Text-Primary-1, #FFEA9E)`,
    `background: var(--Details-ButtonSecondary-Hover, rgba(255, 234, 158, 0.40))`,
    `border-radius: 12px`, `padding: 16px 24px`
- `335:9460` `Rectangle 15` 480 × 1 at (576, 1149), fill `rgba(255, 234, 158, 1)`
- `335:9461` `B.4.4_Action` 480 × 56 at (576, 1166) — row, `space-between`, `gap: 24px`
  (hearts on the **left** at x=576, buttons group `335:9672` 315 × 56 on the **right** at x=741)

Spec CSV `B.3` / `B.4.4` quote the like count as `'10'`. **The frame node says `1.000`** —
frame is truth. Avatars: `335:9443;256:4734` `B.3.1_Avatar người gửi` and
`335:9446;256:4734` `B.3.5_Avatar người nhận`, both ELLIPSE 64 × 64,
`border: 1.869px solid var(--Details-Text-Secondary-1, #FFF)`, `border-radius: 64px`,
`background: url(<path-to-image>) lightgray 50% / cover no-repeat, #EEE`.

### 3.4 Pagination (B.5 · `2940:13471`)

`B.5_slide` 1440 × 52 at (0, 1278); row flex, `justify-content: center`, `gap: 32px`,
`padding: 0 144px`.

| node | role | size / position | icon child |
|---|---|---|---|
| `2940:13470` `B.2.1_Button lùi` | **80 px** — sits inside the LEFT gradient overlay `Frame 528`, vertically centred over the carousel | 80 × 80 at (80, 935), `padding: 10px`, `border-radius: 4px`, `background: rgba(0,0,0,0)` | `I2940:13470;186:1420` `MM_MEDIA_Left` 60 × 60 at (90, 945) |
| `2940:13468` `B.2.2_Button tiến` | **80 px** — inside the RIGHT gradient overlay `Frame 527` | 80 × 80 at (1220, 935), same styles | `I2940:13468;186:1420` `MM_MEDIA_Right` 60 × 60 at (1230, 945) |
| `2940:13472` `B.5.1_Button lùi` | **48 px** — in the pagination row below the carousel | 48 × 48 at (612, 1280), `padding: 10px`, `border-radius: 4px`, `background: rgba(0,0,0,0)` | `I2940:13472;186:1420` `MM_MEDIA_Left` 28 × 28 at (622, 1290) |
| `2940:13473` `B.5.2_số trang` | page indicator TEXT at (692, 1278), box 55 × 52 | `color: var(--Details-Text-Secondary-2, #999)`, `font-size: 28px`, weight 700, lh 36px | — |
| `2940:13474` `B.5.3_Button tiến` | **48 px** — pagination row | 48 × 48 at (779, 1280), same styles | `I2940:13474;186:1420` `MM_MEDIA_Right` 28 × 28 at (789, 1290) |

Page-indicator string, verbatim:

```
2/5
```

Confirmed: the 80 px pair is the overlay pair (`13470` left / `13468` right); the 48 px pair is
the below-carousel pagination pair (`13472` left / `13474` right). Note the spec CSV swaps the
names — `B.2.1` is described as "Nút tiến (Next)" while its layer name and icon are `lùi`/Left,
and `B.2.2` is described as "Nút lùi" while its icon is Right. **The icons are truth:**
`13470` = Left/previous, `13468` = Right/next.

---

## 4. SPOTLIGHT BOARD (B.6 `2940:13476` + B.7 `2940:14174`)

Section wrapper `Frame 552` (`2940:14170`) 1440 × 791 at (0, 1450), plus a full-bleed
background rectangle `2940:14169` `Rectangle 60` 1440 × 903 at (0, 1450),
fill `rgba(0, 16, 26, 1)` (= `--background`).

### 4.1 Header (B.6)

| item | node | value |
|---|---|---|
| Subtitle | `2940:13477` | `Sun* Annual Awards 2025` — 24px/700/lh 32px/left/fill `rgba(255,255,255,1)`, 1152 × 32 at (144, 1466) |
| Divider | `2940:13478` | 1152 × 1 at (144, 1497), fill `rgba(46, 57, 64, 1)` |
| Title | `2940:13480` | `SPOTLIGHT BOARD` — 57px/700/lh 64px/ls `-0.25px`/left/fill `rgba(255,234,158,1)`, 576 × 64 at (144, 1531) |

### 4.2 Board container (B.7 · `2940:14174`)

```
width: 1157px; height: 548px; position (142, 1658) → (1299, 2206);
border: 1px solid var(--Details-Border, #998C5F);
border-radius: 47.14px;
(no background fill on the container itself)
```

118 direct children: 113 TEXT + 3 RECTANGLE + 1 INSTANCE (search) + 1 FRAME (pan/zoom).

Background artwork layers (all direct children, drawn behind the text):

| node | name | box | style |
|---|---|---|---|
| `2940:14178` | `image 24` | 1098 × 617 at (192, 1602) | `borderRadius: 0px`, `mixBlendMode: pass-through` — **no image URL in the data** |
| `2940:14181` | `image 25` | 1100 × 618 at (107, 1623) | `background: url(<path-to-image>) lightgray 50% / cover no-repeat`, `aspect-ratio: 89/50`, `background-blend-mode: screen` |
| `2940:14173` | `Root further mo rong 1` | 1819 × 583 at (78, 1658) | `background: linear-gradient(0deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.70) 100%), url(<path-to-image>) lightgray 50% / cover no-repeat`, `aspect-ratio: 78/25` |

### 4.3 Total-count label (B.7.1 · `3007:17482`)

```
388 KUDOS
```
TEXT 217 × 44 at (612, 1672); `fontSize: 36px`, weight 700, lh 44px, letter-spacing 0,
align left, fill `rgba(255, 255, 255, 1)`.

### 4.4 Search box (B.7.3 · `2940:14833`)

Instance of `186:2757`. 219 × 39 at (167, 1684);
`border: 0.682px solid var(--Details-Border, #998C5F)`;
`background: var(--Details-SecondaryButton-Normal, rgba(255, 234, 158, 0.10))`;
`border-radius: 46.404px`; `padding: 16.378px 10.919px`; `gap: 5.459px`.
Inner row `I2940:14833;186:2758` 80 × 17 at (177, 1695), `gap: 10.918635368347168px`.
Icon `I2940:14833;186:2759` `MM_MEDIA_Search` 16 × 16 at (177, 1695).
Placeholder `I2940:14833;186:2760` TEXT 53 × 17 at (205, 1695), `fontSize: 10.918635368347168px`,
**weight 500** (the only 500-weight text on the frame), lh 16.377952575683594px,
ls 0.10236220806837082px, align center, fill `rgba(255, 255, 255, 1)`:

```
Tìm kiếm 
```
(one trailing space)

### 4.5 Pan/Zoom control (B.7.2 · `3007:17479`)

`B.7.2_Pan zoom` is an **empty FRAME**, 30 × 30 at (1231, 2129), `borderRadius: 0px`,
`mixBlendMode: pass-through`, **zero children**. No icon vector, no text, no fill, no
`MM_MEDIA_` node. Its rendered appearance is `NOT IN DESIGN`.

### 4.6 Ticker / activity log lines (bottom-left of the board)

Six identical TEXT nodes, all 565 × 23, all x = 191, `color: #FFF`, `font-size: 14px`,
weight 700, lh 20px, letter-spacing 0.1px. All six carry the same string:

```
08:30PM Nguyễn Bá Chức đã nhận được một Kudos mới
```

| node | absY | relY (board-relative) |
|---|---|---|
| `3004:15995` | 2144 | 486 |
| `3004:15996` | 2125 | 467 |
| `3004:15997` | 2106 | 448 |
| `3004:15998` | 2087 | 429 |
| `3004:15999` | 2068 | 410 |
| `2940:14230` | 2163 | 505 |

Row pitch is 19 px. `2940:14230` is the lowest line (y=2163) and is the only one with a
non-`3004:` id — it is the original layer, the five `3004:*` are duplicates stacked above it.
There is **no spec CSV row** for these ticker lines.

### 4.7 Word cloud — all 106 name TEXT nodes

Every name node: `fontFamily: Montserrat`, `fontWeight: 700`,
`lineHeight: 6.357580661773682px`, `letterSpacing: 0.20800277590751648px`,
`textAlign: center`, `mixBlendMode: pass-through`. Only fontSize, fill, width and position vary.

Distinct strings (7 people, note `Mai phương Thúy ` carries a trailing space):

| string | count |
|---|---|
| `Nguyễn Bá Chức` | 16 |
| `Đỗ hoàng Hiệp` | 15 |
| `Dương thúy An` | 15 |
| `Mai phương Thúy ` | 15 |
| `Lê Kiều Trang` | 15 |
| `Nguyễn Văn Quy` | 15 |
| `Nguyễn Hoàng Linh` | 15 |

Distinct font sizes: `6.656088829040527px` (97 nodes, the base size),
`7.937238693237305px` (3), `10.205020904541016px` (3), `11.338912010192871px` (3).

**Highlighted node — exactly one:** `2940:14198` = `Nguyễn Hoàng Linh` at (626, 1807),
fontSize `11.338912010192871px`, fill **`rgba(241, 118, 118, 1)`** = **#F17676**. Every other
name node is fill `rgba(255, 255, 255, 1)`.

Full table (sorted by relY then relX; `relX/relY` are relative to the board origin 142, 1658):

| # | node id | `character` | absX | absY | relX | relY | fontSize | fill | box w |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `2995:15926` | `Đỗ hoàng Hiệp` | 1087 | 1707 | 945 | 49 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 2 | `2995:15925` | `Đỗ hoàng Hiệp` | 983 | 1721 | 841 | 63 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 3 | `2940:14186` | `Đỗ hoàng Hiệp` | 381 | 1725 | 239 | 67 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 4 | `2995:15936` | `Dương thúy An` | 1130 | 1726 | 988 | 68 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 5 | `2940:14193` | `Đỗ hoàng Hiệp` | 520 | 1730 | 378 | 72 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 6 | `2995:15935` | `Dương thúy An` | 899 | 1732 | 757 | 74 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 7 | `2940:14195` | `Dương thúy An` | 656 | 1739 | 514 | 81 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 8 | `2995:15941` | `Mai phương Thúy ` | 1044 | 1743 | 902 | 85 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 9 | `2940:14188` | `Dương thúy An` | 425 | 1745 | 283 | 87 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 10 | `2995:15940` | `Mai phương Thúy ` | 812 | 1749 | 670 | 91 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 11 | `2940:14196` | `Mai phương Thúy ` | 570 | 1756 | 428 | 98 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 12 | `2995:15956` | `Lê Kiều Trang` | 1167 | 1757 | 1025 | 99 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 13 | `2940:14189` | `Mai phương Thúy ` | 338 | 1762 | 196 | 104 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 14 | `2995:15955` | `Lê Kiều Trang` | 935 | 1763 | 793 | 105 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 15 | `2995:15931` | `Nguyễn Văn Quy` | 1087 | 1763 | 945 | 105 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 16 | `2995:15930` | `Nguyễn Văn Quy` | 845 | 1766 | 703 | 108 | 10.205020904541016px | rgba(255, 255, 255, 1) | 94px |
| 17 | `2940:14199` | `Lê Kiều Trang` | 693 | 1770 | 551 | 112 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 18 | `2940:14192` | `Lê Kiều Trang` | 461 | 1776 | 319 | 118 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 19 | `2940:14194` | `Nguyễn Văn Quy` | 613 | 1776 | 471 | 118 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 20 | `2940:14187` | `Nguyễn Văn Quy` | 371 | 1779 | 229 | 121 | 10.205020904541016px | rgba(255, 255, 255, 1) | 94px |
| 21 | `2995:15946` | `Nguyễn Bá Chức` | 1006 | 1780 | 864 | 122 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 22 | `2995:15945` | `Nguyễn Bá Chức` | 774 | 1785 | 632 | 127 | 7.937238693237305px | rgba(255, 255, 255, 1) | 77px |
| 23 | `2940:14197` | `Nguyễn Bá Chức` | 532 | 1793 | 390 | 135 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 24 | `2995:15951` | `Nguyễn Hoàng Linh` | 1100 | 1794 | 958 | 136 | 11.338912010192871px | rgba(255, 255, 255, 1) | 122px |
| 25 | `2940:14190` | `Nguyễn Bá Chức` | 300 | 1798 | 158 | 140 | 7.937238693237305px | rgba(255, 255, 255, 1) | 77px |
| 26 | `2995:15950` | `Nguyễn Hoàng Linh` | 871 | 1801 | 729 | 143 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 27 | `2940:14198` | `Nguyễn Hoàng Linh` | 626 | 1807 | 484 | 149 | 11.338912010192871px | rgba(241, 118, 118, 1) | 122px |
| 28 | `2995:15927` | `Đỗ hoàng Hiệp` | 993 | 1812 | 851 | 154 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 29 | `2940:14191` | `Nguyễn Hoàng Linh` | 397 | 1814 | 255 | 156 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 30 | `2995:15929` | `Đỗ hoàng Hiệp` | 781 | 1819 | 639 | 161 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 31 | `2940:14200` | `Đỗ hoàng Hiệp` | 519 | 1825 | 377 | 167 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 32 | `2940:14214` | `Đỗ hoàng Hiệp` | 307 | 1832 | 165 | 174 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 33 | `2995:15937` | `Dương thúy An` | 1037 | 1832 | 895 | 174 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 34 | `2995:15954` | `Nguyễn Hoàng Linh` | 1133 | 1838 | 991 | 180 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 35 | `2995:15939` | `Dương thúy An` | 824 | 1839 | 682 | 181 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 36 | `2940:14202` | `Dương thúy An` | 563 | 1845 | 421 | 187 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 37 | `2995:15942` | `Mai phương Thúy ` | 950 | 1849 | 808 | 191 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 38 | `2940:14219` | `Nguyễn Hoàng Linh` | 659 | 1851 | 517 | 193 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 39 | `2940:14216` | `Dương thúy An` | 350 | 1852 | 208 | 194 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 40 | `2995:15944` | `Mai phương Thúy ` | 738 | 1856 | 596 | 198 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 41 | `2940:14203` | `Mai phương Thúy ` | 476 | 1862 | 334 | 204 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 42 | `2995:15957` | `Lê Kiều Trang` | 1074 | 1862 | 932 | 204 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 43 | `2995:15932` | `Nguyễn Văn Quy` | 993 | 1868 | 851 | 210 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 44 | `2995:15949` | `Nguyễn Bá Chức` | 1194 | 1868 | 1052 | 210 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 45 | `2940:14217` | `Mai phương Thúy ` | 264 | 1869 | 122 | 211 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 46 | `2995:15959` | `Lê Kiều Trang` | 861 | 1870 | 719 | 212 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 47 | `2940:14206` | `Lê Kiều Trang` | 600 | 1875 | 458 | 217 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 48 | `2940:14201` | `Nguyễn Văn Quy` | 519 | 1881 | 377 | 223 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 49 | `2940:14218` | `Nguyễn Bá Chức` | 720 | 1881 | 578 | 223 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 50 | `2995:15928` | `Đỗ hoàng Hiệp` | 1118 | 1882 | 976 | 224 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 51 | `2940:14220` | `Lê Kiều Trang` | 387 | 1883 | 245 | 225 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 52 | `2995:15947` | `Nguyễn Bá Chức` | 912 | 1885 | 770 | 227 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 53 | `2940:14215` | `Nguyễn Văn Quy` | 307 | 1888 | 165 | 230 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 54 | `2995:15934` | `Nguyễn Văn Quy` | 802 | 1891 | 660 | 233 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 55 | `2940:14207` | `Đỗ hoàng Hiệp` | 644 | 1895 | 502 | 237 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 56 | `2940:14204` | `Nguyễn Bá Chức` | 438 | 1898 | 296 | 240 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 57 | `2995:15952` | `Nguyễn Hoàng Linh` | 1010 | 1900 | 868 | 242 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 58 | `2995:15938` | `Dương thúy An` | 1162 | 1902 | 1020 | 244 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 59 | `2940:14205` | `Nguyễn Hoàng Linh` | 536 | 1913 | 394 | 255 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 60 | `2940:14209` | `Dương thúy An` | 688 | 1915 | 546 | 257 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 61 | `2995:15943` | `Mai phương Thúy ` | 1075 | 1919 | 933 | 261 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 62 | `2995:16030` | `Nguyễn Bá Chức` | 879 | 1927 | 737 | 269 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 63 | `2995:15984` | `Nguyễn Bá Chức` | 275 | 1930 | 133 | 272 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 64 | `2940:14210` | `Mai phương Thúy ` | 601 | 1932 | 459 | 274 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 65 | `2995:15958` | `Lê Kiều Trang` | 1198 | 1932 | 1056 | 274 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 66 | `2995:15979` | `Mai phương Thúy ` | 377 | 1937 | 235 | 279 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 67 | `2995:15933` | `Nguyễn Văn Quy` | 1118 | 1938 | 976 | 280 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 68 | `2940:14213` | `Lê Kiều Trang` | 724 | 1945 | 582 | 287 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 69 | `2940:14208` | `Nguyễn Văn Quy` | 644 | 1951 | 502 | 293 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 70 | `2995:15948` | `Nguyễn Bá Chức` | 1037 | 1955 | 895 | 297 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 71 | `2940:14211` | `Nguyễn Bá Chức` | 563 | 1968 | 421 | 310 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 72 | `2995:15994` | `Lê Kiều Trang` | 471 | 1970 | 329 | 312 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 73 | `2995:15953` | `Nguyễn Hoàng Linh` | 1134 | 1970 | 992 | 312 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 74 | `2940:14212` | `Nguyễn Hoàng Linh` | 660 | 1983 | 518 | 325 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 75 | `2995:15961` | `Đỗ hoàng Hiệp` | 1027 | 1988 | 885 | 330 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 76 | `2995:15960` | `Đỗ hoàng Hiệp` | 795 | 1993 | 653 | 335 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 77 | `2995:15982` | `Nguyễn Bá Chức` | 438 | 2005 | 296 | 347 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 78 | `2995:15971` | `Dương thúy An` | 1070 | 2007 | 928 | 349 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 79 | `2995:15970` | `Dương thúy An` | 839 | 2013 | 697 | 355 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 80 | `2995:15987` | `Nguyễn Hoàng Linh` | 535 | 2020 | 393 | 362 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 81 | `2995:15973` | `Dương thúy An` | 687 | 2021 | 545 | 363 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 82 | `2995:15976` | `Mai phương Thúy ` | 984 | 2024 | 842 | 366 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 83 | `2995:15975` | `Mai phương Thúy ` | 752 | 2030 | 610 | 372 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 84 | `2995:15978` | `Mai phương Thúy ` | 600 | 2038 | 458 | 380 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 85 | `2995:15991` | `Lê Kiều Trang` | 1107 | 2038 | 965 | 380 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 86 | `2995:15990` | `Lê Kiều Trang` | 875 | 2044 | 733 | 386 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 87 | `2995:15966` | `Nguyễn Văn Quy` | 1027 | 2044 | 885 | 386 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 88 | `2995:15965` | `Nguyễn Văn Quy` | 785 | 2047 | 643 | 389 | 10.205020904541016px | rgba(255, 255, 255, 1) | 94px |
| 89 | `2995:15981` | `Nguyễn Bá Chức` | 946 | 2061 | 804 | 403 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 90 | `2995:15980` | `Nguyễn Bá Chức` | 714 | 2066 | 572 | 408 | 7.937238693237305px | rgba(255, 255, 255, 1) | 77px |
| 91 | `2995:15986` | `Nguyễn Hoàng Linh` | 1040 | 2075 | 898 | 417 | 11.338912010192871px | rgba(255, 255, 255, 1) | 122px |
| 92 | `2995:15985` | `Nguyễn Hoàng Linh` | 811 | 2082 | 669 | 424 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 93 | `2995:15962` | `Đỗ hoàng Hiệp` | 933 | 2093 | 791 | 435 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 94 | `2995:15964` | `Đỗ hoàng Hiệp` | 721 | 2100 | 579 | 442 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 95 | `2995:15972` | `Dương thúy An` | 977 | 2113 | 835 | 455 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 96 | `2995:15989` | `Nguyễn Hoàng Linh` | 1073 | 2119 | 931 | 461 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 97 | `2995:15974` | `Dương thúy An` | 764 | 2120 | 622 | 462 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 98 | `2995:15977` | `Mai phương Thúy ` | 890 | 2130 | 748 | 472 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 99 | `2995:15992` | `Lê Kiều Trang` | 1014 | 2143 | 872 | 485 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 100 | `2995:15967` | `Nguyễn Văn Quy` | 933 | 2149 | 791 | 491 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 101 | `2995:15969` | `Nguyễn Văn Quy` | 721 | 2156 | 579 | 498 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 102 | `2995:15963` | `Đỗ hoàng Hiệp` | 1058 | 2163 | 916 | 505 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 103 | `2995:15993` | `Lê Kiều Trang` | 1138 | 2213 | 996 | 555 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |
| 104 | `2995:15968` | `Nguyễn Văn Quy` | 1058 | 2219 | 916 | 561 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 105 | `2995:15983` | `Nguyễn Bá Chức` | 977 | 2236 | 835 | 578 | 6.656088829040527px | rgba(255, 255, 255, 1) | 64px |
| 106 | `2995:15988` | `Nguyễn Hoàng Linh` | 1074 | 2251 | 932 | 593 | 6.656088829040527px | rgba(255, 255, 255, 1) | 74px |

---

## 5. ALL KUDOS section (C · `2940:13475`)

`C_All kudos` FRAME 1440 × 3237 at (0, 2321); column, `gap: 40px`.

### 5.1 Header (C.1 · `2940:14221`)

| item | node | value |
|---|---|---|
| Subtitle | `2940:14222` | `Sun* Annual Awards 2025` — 24px/700/lh 32px/left/fill `rgba(255,255,255,1)`, 1152 × 32 at (144, 2361) |
| Divider | `2940:14223` | 1152 × 1 at (144, 2392), fill `rgba(46, 57, 64, 1)` |
| Title | `2940:14225` | `ALL KUDOS` — 57px/700/lh 64px/ls `-0.25px`/left/fill `rgba(255,234,158,1)`, 345 × 64 at (144, 2426) |

### 5.2 Layout

- `Frame 502` (`2940:13481`) 1440 × 3068 at (0, 2530); row flex, `space-between`,
  `gap: 80px`, `padding: 0 144px`.
- Feed column `C.2_Danh sách lời cảm ơn` (`2940:13482`) 680 × 3068 at (144, 2530);
  column, `gap: 24px`, four card children.
- Sidebar `D_Thống menu phải` (`2940:13488`) 422 × 933 at (874, 2530).

### 5.3 Post cards — container styles (identical on all four)

All four are instances of componentId `256:5231`:

```
width: 680px; height: 749px; padding: 40px 40px 16px 40px; gap: 16px;
flex-direction: column; align-items: flex-start;
border-radius: 24px;
background-color: rgba(255, 248, 225, 1)   /* #FFF8E1 */
NO border
```

| card | node | layer name | y-range |
|---|---|---|---|
| C.3 | `3127:21871` | `C.3_KUDO Post` | 2530 → 3279 |
| C.5 | `3127:22053` | `C.5_KUDOpost` | 3303 → 4052 |
| C.6 | `3127:22375` | `C.6_KUDOpost` | 4076 → 4825 |
| C.7 | `3127:22439` | `C.7_KUDOpost` | 4849 → 5598 |

Internal geometry (C.3 numbers; the other three repeat at +773 px each):

| part | node suffix (prefix `I3127:21871;`) | box |
|---|---|---|
| `Info user` row | `256:4857` | 600 × 123 at (184, 2570), row `space-between`, `gap: 24px` |
| sender block | `256:4858` | 235 × 123 at (184, 2570) |
| send icon | `256:5161` frame / `256:5147` `MM_MEDIA_Send` 32 × 32 | frame 32 × 123 at (468, 2570), icon at (468, 2586) |
| receiver block | `256:4860` | 235 × 123 at (548, 2570) |
| divider top | `256:5192` `Rectangle 14` | 600 × 1 at (184, 2709), fill `rgba(255, 234, 158, 1)` |
| content column | `256:5645` | 600 × 448 at (184, 2726), column, `gap: 16px` |
| timestamp | `256:5229` | 600 × 24 at (184, 2726) |
| category row | `2234:33038` `D.4_hashtag` | 600 × 32 at (184, 2766), row; text `2234:33039` 600 × 24 at (184, 2770); trailing `2234:33040` `MM_MEDIA_Pen` 32 × 32 at (752, 2766) |
| message box | `662:11382` `Frame 425` | 600 × 192 at (184, 2814); `border: 1px solid var(--Details-Text-Primary-1, #FFEA9E)`; `background: var(--Details-ButtonSecondary-Hover, rgba(255, 234, 158, 0.40))`; `border-radius: 12px`; `padding: 16px 24px` |
| message text | `256:5156` | 552 × 128 at (208, 2846) |
| attached-image row | `256:5176` | 600 × 88 at (184, 3022), row, `gap: 16px`, **5 children** |
| — thumbnails | `256:5177` … `256:5181` | each 88 × 88, x = 184 / 288 / 392 / 496 / 600 at y 3022; `border: 1px solid var(--Details-Border, #998C5F)`; `background: #FFF`; `border-radius: 18px`; each holds one `MM_MEDIA_Sample Image` RECTANGLE 88 × 88 (`;513:8436`) |
| hashtag row | `256:5158` | 600 × 48 at (184, 3126); text `256:5159` 600 × 48 |
| divider bottom | `256:7496` `Rectangle 15` | 600 × 1 at (184, 3190), fill `rgba(255, 234, 158, 1)` |
| action row | `256:5194` `C.4_Button` | 600 × 56 at (184, 3207), row `space-between`, `gap: 24px` |
| hearts | `256:5175` | 101 × 32 at (184, 3219); text `256:5174` 65 × 32; `256:5171` `MM_MEDIA_Heart` 32 × 32 at (253, 3219) |
| copy-link button | `256:5216` | 144 × 56 at (640, 3207); `padding: 16px`, `border-radius: 4px`, no background; label `256:5216;186:1439` 84 × 24 at (656, 3223); `256:5216;186:1441` `MM_MEDIA_Link` 24 × 24 at (744, 3223) |

**All four post cards have exactly 5 attached-image slots and NO "Xem chi tiết" button** —
only `Copy Link`. (The Highlight card has both buttons but no image row; the post card has the
image row but only one button.)

### 5.4 Post card content — verbatim per card

Text styles are identical across the four cards:
sender/receiver name 16px/700/lh 24px/ls 0.15px/center/fill `rgba(0, 16, 26, 1)`;
dept 14px/700/lh 20px/ls 0.1px/left/fill `rgba(153, 153, 153, 1)`;
timestamp 16px/700/lh 24px/ls 0.5px/left/fill `rgba(153, 153, 153, 1)`;
category 16px/700/lh 24px/ls 0.5px/center/fill `rgba(0, 16, 26, 1)`;
body 20px/700/lh 32px/ls 0/justified/fill `rgba(0, 16, 26, 1)`;
hashtags 16px/700/lh 24px/ls 0.5px/left/fill `rgba(212, 39, 29, 1)`;
hearts 24px/700/lh 32px/ls 0/left/fill `rgba(0, 16, 26, 1)`;
`Copy Link` 16px/700/lh 24px/ls 0.15px/center/fill `rgba(0, 16, 26, 1)`.

| slot | C.3 `3127:21871` | C.5 `3127:22053` | C.6 `3127:22375` | C.7 `3127:22439` |
|---|---|---|---|---|
| sender name | `Huỳnh Dương Xuân Nhật ` | `Huỳnh Dương Xuân Nhật ` | `Huỳnh Dương Xuân Nhật ` | `Huỳnh Dương Xuân Nhật ` |
| sender dept | `CEVC10` | `CEVC10` | `CEVC10` | `CEVC10` |
| sender badge | `New Hero` | `Rising Hero` | `Super Hero` (+ a second overlapping TEXT `Super ` ) | `Super Hero` (+ `Super ` ) |
| receiver name | `Huỳnh Dương Xuân ` | `Huỳnh Dương Xuân ` | `Huỳnh Dương Xuân ` | `Huỳnh Dương Xuân ` |
| receiver dept | `CEVC10` | `CEVC10` | `CEVC10` | `CEVC10` |
| receiver badge | `Legend Hero` | `Legend Hero` | `Legend Hero` | `Legend Hero` |
| timestamp | `10:00 - 10/30/2025` | `10:00 - 10/30/2025` | `10:00 - 10/30/2025` | `10:00 - 10/30/2025` |
| category | `IDOL GIỚI TRẺ` | `IDOL GIỚI TRẺ` | `IDOL GIỚI TRẺ` | `IDOL GIỚI TRẺ` |
| hashtags | `#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...` | same | same | same |
| heart count | `1.000` | `1.000` | `1.000` | `1.000` |
| copy link | `Copy Link` | `Copy Link` | `Copy Link` | `Copy Link` |
| attached images | 5 | 5 | 5 | 5 |

Message body — identical on all four cards, verbatim:

```
Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...
```

(This is the **long** form. The Highlight-carousel cards use a shorter truncation of the same
sentence — see §3.3. The two are different strings; do not reuse one for the other.)

**Instance / name divergences worth noting (these are Figma INSTANCEs whose layer `name`
differs from the `character` override):**

- Sender/receiver name nodes are all named `Huỳnh Dương Xuân` but the sender's character is
  `Huỳnh Dương Xuân Nhật ` and the receiver's is `Huỳnh Dương Xuân ` — **different strings**.
- Dept nodes are all named `CECV2`; the character is `CEVC10` on all four post cards and
  `CECV10` on the three Highlight cards. **`CEVC` vs `CECV` — two different typos.** Both are
  verbatim frame values; the spec CSV (`C.3.3`) writes `CEVC10`.
- `C.3.4_Time` is a layer name; its character is `10:00 - 10/30/2025`. On C.5/C.6/C.7 the same
  node is *named* `10:00 - 10/30/2025`.
- Badge pill instances change component variant per card: `3007:17506` (New Hero),
  `3007:17509` (Rising Hero), `3007:17513`-family (Super Hero), `3007:17516` (Legend Hero).
  Their `MM_MEDIA_*` names differ accordingly.
- The New Hero pill (`I3127:21871;256:4858;3106:17694`) additionally has a solid backing
  rectangle `3007:17507` 117 × 30 fill **`rgba(255, 243, 198, 1)` = #FFF3C6** (new colour),
  plus artwork `3007:17528` with the `rgba(9,36,50,0.50)` overlay.
- The Super Hero pill carries **two** text layers that overlap: `3053:7594` = `Super `
  (43 × 20, `opacity: 0.66`, no font info in the data) and `3007:17514` = `Super Hero`
  (11.639px/700/lh 16.627px/`color: #FFF`/`text-shadow: 0 0.395px 1.58px #000`). Render only
  `Super Hero`; the `Super ` layer is a leftover.

---

## 6. Sidebar (D · `2940:13488`)

```
D_Thống menu phải : 422 × 933 at (874, 2530); column flex, gap: 24px
```

Two blocks, both with identical chrome:

```
border: 1px solid var(--Details-Border, #998C5F);
background: var(--Details-Container-2, #00070C);
border-radius: 17px;
```

| block | node | box | padding |
|---|---|---|---|
| D.1 stats | `2940:13489` | 422 × 405 at (874, 2530) | `24px` |
| D.3 leaderboard | `2940:13510` | 422 × 504 at (874, 2959) | `24px 16px 24px 24px` |

### 6.1 Stat rows (D.1 · inner `Nội dung` `2940:13490`, 374 × 357 at (898, 2554), column, `gap: 16px`)

Each row: 374 × 40, row flex, `justify-content: space-between`, `gap: 8px`.
Label style: 22px / 700 / lh 28px / letter-spacing 0 / **align right** / fill `rgba(255, 255, 255, 1)`.
Value style: 32px / 700 / lh 40px / letter-spacing 0 / align right / fill `rgba(255, 234, 158, 1)`.

| # | node | absY | label (verbatim) | value (verbatim) | notes |
|---|---|---|---|---|---|
| D.1.2 | `2940:13491` | 2554 | `Số Kudos bạn nhận được:` | `25` | label node `I…;256:6735` named `Số Kudos bạn nhận được:`, value node `I…;256:6753` named `Highlight Số` |
| D.1.3 | `2940:13492` | 2610 | `Số Kudos bạn đã gửi:` | `25` | label node is *named* `Số Kudos bạn nhận được:` — instance override |
| D.1.4 | `3241:14882` | 2666 | `Số tim bạn nhận được:` | `25` | **has the inline icon** — see below |
| D.1.5 | `2940:13494` | 2722 | (divider) | — | RECTANGLE 374 × 1, fill `rgba(46, 57, 64, 1)` |
| D.1.6 | `2940:13495` | 2739 | `Số Secret Box bạn đã mở:` | `25` | label node named `Số Kudos bạn nhận được:` |
| D.1.7 | `2940:13496` | 2795 | `Số Secret Box chưa mở:` | `25` | label node named `Số Kudos bạn nhận được:` |

All five values are `25` — spec CSV agrees.

**D.1.4 heart-row inline icon** — this row is a plain FRAME (not an instance of `256:6756`
like the other four) and inserts a `Group 435` (`3241:14931`) 34 × 40 at (1158, 2666)
*between* the label and the value:

- `3241:14932` `image 35` RECTANGLE 34 × 40 at (1158, 2666),
  `background: url(<path-to-image>) lightgray -2.757px 0px / 118.919% 100% no-repeat`,
  `aspect-ratio: 17/20` — the heart artwork; **no exported `MM_MEDIA_` name**.
- `3241:14933` TEXT `x2` at (1161, 2685), 27 × 17.654; `color: #FFF`,
  `font-size: 17.538px`, weight 700, lh 23.385px, `text-align: center`,
  `-webkit-text-stroke: 1.04px #000`.
- The value node for this row (`3241:14886`) is **80 px wide** (not 46 px like the others),
  at (1192, 2666).

### 6.2 "Mở quà" button (D.1.8 · `2940:13497`)

```
374 × 60 at (898, 2851); padding: 16px; gap: 8px; border-radius: 8px;
row flex, justify-content: center;
background-color: rgba(255, 234, 158, 1)   /* #FFEA9E */
```
Label `I2940:13497;186:1568` TEXT 166 × 28 at (986, 2867), 22px / 700 / lh 28px /
letter-spacing 0 / center / fill `rgba(0, 16, 26, 1)`:

```
Mở Secret Box
```

Trailing icon `I2940:13497;186:1766` `MM_MEDIA_Open Gift` INSTANCE 24 × 24 at (1160, 2869)
(componentId `256:6801`).

**Discrepancy:** the spec CSV rows `C`, `D`, `D.1` and `D.1.8` all call this button
`'Mở quà'`. **The frame node character is `Mở Secret Box`** — frame is truth.

### 6.3 Leaderboard (D.3 · `2940:13510`)

Chain: `2940:13510` → `Frame 544` `2940:13511` (382 × 456 at (898, 2983))
→ `Frame 517` `2940:13512` (382 × 456, column, `gap: 16px`).

Header `2940:13513` `D.3.1_title` TEXT 382 × 56 at (898, 2983); 22px / 700 / lh 28px /
letter-spacing 0 / **align center** / fill `rgba(255, 234, 158, 1)`. Verbatim (contains a
real newline):

```
10 SUNNER NHẬN QUÀ
MỚI NHẤT
```

List: `Frame 547` `2940:13514` 382 × 384 at (898, 3055), row flex, `gap: 16px`, containing
`Frame 548` `2940:13515` (364 × 384, column, `gap: 16px`, five entries) **plus a scrollbar**:

- `Frame 545` `2940:13521` — 2 × 245 at (1278, 3055), `border-radius: 8px`,
  `background-color: rgba(153, 153, 153, 1)`, `padding: 10px`. This is the independent-scroll
  affordance for the list (spec `D.3`: *"Scroll: cho phép cuộn khi vượt chiều cao khung"*;
  spec `D`: *"Sidebar có scroll độc lập"*).

Five entries, each an instance of `256:7474` (set `256:7475`), 364 × 64, row, `gap: 8px`:
avatar ELLIPSE `;256:7460` `MM_MEDIA_Avatar` 64 × 64 at x=898,
`border: 1.869px solid var(--Details-Text-Secondary-1, #FFF)`, `border-radius: 64px`;
text column `;256:7461` `Frame 520` 230 × 54 at x=970, `gap: 2px`.

Name style: 22px / 700 / lh 28px / letter-spacing 0 / **align left** / fill `rgba(255, 234, 158, 1)`.
Prize style: 16px / 700 / lh 24px / letter-spacing 0.15px / **align right** / fill `rgba(255, 255, 255, 1)`.

| # | node | absY | name (verbatim) | prize (verbatim) | name-layer name |
|---|---|---|---|---|---|
| D.3.2 | `2940:13516` | 3055 | `Huỳnh Dương Xuân ` | `Nhận được 1 áo phông SAA` | `Name` / `Thông báo content` |
| D.3.3 | `2940:13517` | 3135 | `Huỳnh Dương Xuân ` | `Nhận được 1 áo phông SAA` | `Huỳnh Dương Xuân` / `Nhận được 1 áo phông SAA` |
| D.3.4 | `2940:13518` | 3215 | `Huỳnh Dương Xuân ` | `Nhận được 1 áo phông SAA` | as above |
| D.3.5 | `2940:13519` | 3295 | `Huỳnh Dương Xuân ` | `Nhận được 1 áo phông SAA` | as above |
| D.3.6 | `2940:13520` | 3375 | `Huỳnh Dương Xuân ` | `Nhận được 1 áo phông SAA` | as above |

All five names carry a **trailing space**. `2940:13516` is the one whose layers still hold the
component's default names (`Name`, `Thông báo content`) while its characters are already
overridden — a clear instance-name/character divergence.

### 6.4 The two-list discrepancy — resolved

- Spec CSV row `D` states: *"Lists: '10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT' và
  '10 SUNNER NHẬN QUÀ MỚI NHẤT'"* — **two** lists.
- The spec CSV item numbering jumps `D.1.8` → `D.3`. There is **no `D.2` row at all**.
- In the frame, sidebar `2940:13488` has exactly **two children**: `2940:13489` (D.1 stats)
  and `2940:13510` (D.3 leaderboard). There is **no second leaderboard node**.
- The only list header node that exists is `2940:13513` = `10 SUNNER NHẬN QUÀ\nMỚI NHẤT`.
- `10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT` **does not exist as a node anywhere on this frame** —
  it appears only in the spec CSV prose.

**Frame is truth: one leaderboard list only.** Building the second list would mean inventing
its header, its rows and its data.

### 6.5 Sidebar scrolling

The design data carries no `overflow` property (Figma has no such concept in this export).
The only in-frame evidence of independent scrolling is the 2 × 245 scrollbar rect
`2940:13521` inside the D.3 list (list frame is 384 px tall, so the bar covers ~64%).
Spec `D` says *"Sidebar có scroll độc lập"* and `D.3` says the list scrolls. The D.1 stats
block has **no scrollbar node**.

---

## 7. Footer + header

Both are instances of the components already built in this project — same componentIds, same
strings, same styles. No new chrome is needed.

### Header · `2940:13433` (INSTANCE of `186:1602`)

1440 × 80 at (0, 0); row flex, `space-between`, `gap: 238px`, `padding: 12px 144px`,
`background-color: rgba(16, 20, 23, 0.800000011920929)` (= existing `--header-bg`).

| item | node | character | style |
|---|---|---|---|
| logo | `I2940:13433;178:1033;178:1030` `MM_MEDIA_Logo` | — | LOGO instance box 52 × 48 at (144, 16) |
| nav 1 | `I2940:13433;186:1579;186:1439` | `About SAA 2025` | 16px/700/lh 24px/ls 0.15px/center/fill `rgba(255,255,255,1)`, 137 × 24 at (276, 28) |
| nav 2 | `I2940:13433;186:1587;186:1439` | `Award Information` | **14px** / 700 / lh 20px / ls 0.1px / center / fill `rgba(255,255,255,1)`, 141 × 20 at (469, 30) |
| **nav 3 — ACTIVE** | `I2940:13433;186:1593;186:1502` | `Sun* Kudos` | `color: var(--Details-Text-Primary-1, #FFEA9E)`, 16px/700/lh 24px/ls 0.15px/center, `text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287`; button is the `186:1496`-family variant using `Frame 487` + text node `186:1502` |
| language | `I2940:13433;186:1696;186:1821;186:1439` | `VN` | 16px/700/lh 24px/ls 0.15px/center/fill `rgba(255,255,255,1)`, 25 × 24 at (1176, 28) |
| notification | `I2940:13433;186:2101` `Notification` 40 × 40 at (1076, 20) | — | contains an 8 × 8 dot, `border-radius: 100px` |
| account button | `I2940:13433;186:1597` 40 × 40 at (1256, 20) | — | `border: 1px solid var(--Details-Border, #998C5F)`, `background: var(--Details-TextButton-Normal, rgba(0, 0, 0, 0.00))`, `border-radius: 4px` |

**Active-state answer:** on this screen the active header nav item is **`Sun* Kudos`** — it is
the only one rendered through the active button variant (accent colour `#FFEA9E` + the
`0 0 6px #FAE287` glow). `About SAA 2025` and `Award Information` are both inactive/white.

`components/layout/site-header.tsx` currently marks `/` or `/awards` active via `usePathname()`
and gives `/kudos` `INACTIVE_NAV_CLASSES` unconditionally — so the `/kudos` route needs to be
added to the active-path logic. The existing `ACTIVE_NAV_CLASSES` string already matches this
frame's active style (`text-accent` + the same two-part text-shadow).

### Footer · `2940:13522` (INSTANCE of `342:1427`)

1440 wide at (0, 5718) → (1440, 5862); row flex, `space-between`, `align-items: center`,
`padding: 40px 90px`, `border-top: 1px solid var(--Details-Divider, #2E3940)`.
Left group `I2940:13522;342:1407` 971 × 64 at (90, 5758), `gap: 80px`; logo
`I2940:13522;342:1408` 69 × 64 at (90, 5758); nav `I2940:13522;342:1409` 822 × 64 at
(239, 5758), `gap: 48px`.

| item | node | character | style |
|---|---|---|---|
| nav 1 | `I2940:13522;342:1410;186:1439` | `About SAA 2025` | 16px/700/lh 24px/ls 0.15px/center/fill `rgba(255,255,255,1)`; button 169 × 56 at (239, 5762), `border-radius: 4px`, no bg |
| nav 2 | `I2940:13522;342:1411;186:1439` | `Award Information` | same text style; button 193 × 56 at (456, 5762), `border-radius: 0px`, **no background** |
| **nav 3 — highlighted** | `I2940:13522;342:1412;186:1497` | `Sun* Kudos` | `color: var(--Details-Text-Secondary-1, #FFF)`, 16px/700/lh 24px/ls 0.15px/center, `text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287`; button 130 × 56 at (697, 5762), `background-color: rgba(255, 234, 158, 0.10000000149011612)` |
| nav 4 | `I2940:13522;1161:9487;186:1439` | `Tiêu chuẩn chung` | same text style as nav 1; button 186 × 56 at (875, 5762), no bg |
| copyright | `I2940:13522;342:1413` | `Bản quyền thuộc về Sun* © 2025` | font `Montserrat Alternates`, 16px/700/lh 24px/ls `0%`/center/fill `rgba(255,255,255,1)`, 275 × 11 at (1075, 5784) |

All four footer strings match the existing `lib/i18n/dictionaries/vi.ts` entries
(`nav.about`, `nav.awards`, `nav.kudos`, `footer.generalStandards`, `footer.copyright`).

**One footer change is needed:** on this frame the tinted/glowing footer item is
`Sun* Kudos` (component variant `186:1496`, background `rgba(255,234,158,0.10)`).
`components/layout/site-footer.tsx` currently hard-codes that treatment onto the
`/awards` link and gives `/kudos` the plain style. On the Kudos page the highlight must move
to `/kudos`.

---

## 8. Design tokens actually used on this frame

Complete inventory pulled from `list_frame_styles` (338,601 chars, all nodes scanned).

### Already covered by `app/globals.css`

| frame value | existing token |
|---|---|
| `rgba(0, 16, 26, 1)` / `#00101A` | `--background` |
| `rgba(255, 255, 255, 1)` / `#FFF` | `--foreground` |
| `rgba(16, 20, 23, 0.800000011920929)` | `--header-bg` |
| `rgba(255, 234, 158, 1)` / `#FFEA9E` | `--accent` |
| `#FAE287` (text-shadow only) | `--accent-glow` |
| `#998C5F` | `--border-accent` |
| `rgba(46, 57, 64, 1)` / `#2E3940` | `--divider` |
| `rgba(212, 39, 29, 1)` / `#D4271D` | `--badge-danger` (used here for the **hashtag line**, not a badge) |
| `rgba(255, 234, 158, 0.10)` | `--secondary-button-bg` |

### NEW — not in the project token set

| value | hex | where it is used | suggested role |
|---|---|---|---|
| `rgba(255, 248, 225, 1)` | **#FFF8E1** | Highlight card background (`2940:13464/65/66`) and all four post-card backgrounds. Figma var name: `--Details-PrimaryButton-Hover` | the pale cream card ground |
| `rgba(255, 234, 158, 0.40)` | — | message-box fill inside both card types. Figma var: `--Details-ButtonSecondary-Hover` | message-box tint |
| `#00070C` | **#00070C** | both sidebar block backgrounds. Figma var: `--Details-Container-2` | sidebar container |
| `rgba(153, 153, 153, 1)` / `#999` | **#999999** | dept codes, timestamps, page indicator (`--Details-Text-Secondary-2`), the D.3 scrollbar, the 4 px star dot | muted text |
| `rgba(219, 209, 193, 1)` | **#DBD1C1** | the `KUDOS` wordmark glyph text (`2940:13441`) only | wordmark |
| `rgba(241, 118, 118, 1)` | **#F17676** | the single highlighted word-cloud name `2940:14198` | spotlight highlight |
| `rgba(255, 243, 198, 1)` | **#FFF3C6** | backing rect of the **New Hero** badge pill (`3007:17507`) | new-hero pill ground |
| `rgba(9, 36, 50, 0.50)` | — | overlay on the Rising/New Hero badge artwork | badge overlay |
| `#EEE` | **#EEEEEE** | avatar placeholder fill under the image (`, #EEE` in the avatar background) | avatar fallback |
| `rgba(0, 0, 0, 0.70)` ×2 | — | the darkening gradient on `2940:14173` (spotlight board artwork) | board scrim |
| `rgba(0, 19, 32, 0.00)` | — | transparent end-stop of the KV `Cover` gradient | — |
| `rgba(0, 0, 0, 0.25)` | — | `text-shadow` first layer on active nav / footer nav | — |
| `#000` | — | `-webkit-text-stroke` on the `x2` heart label, and `text-shadow` on Rising/Super Hero badge text | — |
| `rgba(0, 0, 0, 0)` / `rgba(0, 0, 0, 0.00)` | — | transparent button backgrounds (`--Details-TextButton-Normal`) | — |

**No red heart colour exists in the frame data.** The heart is `MM_MEDIA_Heart`
(componentId `256:5162`) — an icon instance whose vector fills are not exposed by the MCP.
The spec CSV (`C.4.1`, `B.4.4`) describes it as *grey when un-liked, red when liked*, but gives
no hex. Any red value used for it is `NOT IN DESIGN` and must be a decision, not an extraction.
Likewise, badges are **not** flat gold pills: each is a component instance with a raster
artwork background plus a 0.5px `#FFEA9E` border and 48px radius. Their gold appearance comes
from the bitmap, not a solid fill.

### Radii present on this frame

`0px`, `4px`, `8px`, `12px`, `16px`, `17px`, `18px`, `24px`, `46.404px`, `47.14px`, `48px`,
`64px`, `68px`, `100px`.
New vs the existing pages: `17px` (sidebar blocks), `18px` (image thumbnails), `24px` (post
card), `46.404px` (board search pill), `47.14px` (spotlight board), `48px` (badge pills),
`68px` (submit / search pills), `100px` (notification dot).

### Font sizes present on this frame

`6.656088829040527`, `7.937238693237305`, `10.205020904541016`, `10.918635368347168`,
`11.338912010192871`, `11.365`, `11.404`, `11.639`, `12.821`, `14`, `16`, `17.538`, `20`,
`22`, `24`, `28`, `32`, `36`, `57`, `139.7805938720703` px.

### Spacing / gap values present

`2`, `4`, `5.459`, `8`, `10`, `10.918635368347168`, `13`, `16`, `24`, `29.89944076538086`,
`32`, `40`, `48`, `64`, `80`, `238` px. Section paddings: `0 144px` (content columns),
`40px 90px` (footer), `12px 144px` (header), `40px 40px 16px 40px` (post card),
`24px 24px 16px 24px` (highlight card), `16px 24px` (message box).

---

## 9. Media assets to download (list only — nothing downloaded)

`list_media_nodes` reports **74** `MM_MEDIA_*` nodes on this frame. After collapsing repeats
and removing everything already in `public/saa/`, these are the **missing** assets:

### Already present — no action

| node name | existing file |
|---|---|
| `MM_MEDIA_Logo` (`I2940:13433;178:1033;178:1030` header 52×48, `I2940:13522;342:1408;178:1030` footer 69×64) | `public/saa/Logo.png` |
| `MM_MEDIA_Pen` (`I2940:13449;186:2759`, 24×24) | `public/saa/Pen.svg` |
| `MM_MEDIA_Down` (`I2940:13459;186:2761`, `I2940:13460;186:2761`, 24×24) | `public/saa/Down.svg` |
| `MM_MEDIA_KV Background` (`I2940:13432;2167:5141`, 1440×512) | `public/saa/Kudos_Background.png` — **verify**: this frame's KV uses background-position `-0.163px -909.862px / 101.245% 393.038%`, i.e. a crop of a much taller source. If the existing PNG is a different crop, re-export. |
| `MM_MEDIA_Kudos logo` (`2940:13440`, 593×104) | `public/saa/Kudos_Wordmark.svg` — **verify**: on this frame the group is a 120×94 vector mark **plus a live 550×98 SVN-Gotham TEXT node**, so the wordmark may need the mark and the text handled separately. |

### MISSING — need export

| # | node id | name | intended size | roleHint | notes |
|---|---|---|---|---|---|
| 1 | `I2940:13450;186:2759` | `MM_MEDIA_Search` | 24 × 24 | icon | top Sunner-search pill icon (componentId `722:16051`) |
| 2 | `I2940:14833;186:2759` | `MM_MEDIA_Search` | 16 × 16 | icon | spotlight-board search icon — same component, smaller render; one SVG serves both |
| 3 | `I2940:13470;186:1420` | `MM_MEDIA_Left` | 60 × 60 | small-icon | carousel overlay prev arrow (componentId `335:10893`) |
| 4 | `I2940:13472;186:1420` | `MM_MEDIA_Left` | 28 × 28 | small-icon | pagination prev arrow — same component |
| 5 | `I2940:13468;186:1420` | `MM_MEDIA_Right` | 60 × 60 | small-icon | carousel overlay next arrow (componentId `335:10890`) |
| 6 | `I2940:13474;186:1420` | `MM_MEDIA_Right` | 28 × 28 | small-icon | pagination next arrow — same component |
| 7 | `I3127:21871;256:5147` | `MM_MEDIA_Send` | 32 × 32 | small-icon | sender→receiver arrow on post cards (componentId `256:5140`). Same componentId as the Highlight card's `IC` node `I2940:13465;335:9445` (32 × 32), which is **not** `MM_MEDIA_`-named — one asset covers both. |
| 8 | `I3127:21871;256:5171` | `MM_MEDIA_Heart` | 32 × 32 | small-icon | heart icon, componentId `256:5162`. Also used un-named as `IC` `I2940:13465;335:9464` on the Highlight cards. Needs an active (red) and inactive (grey) state — **states are not in the design data**. |
| 9 | `I3127:21871;256:5216;186:1441` | `MM_MEDIA_Link` | 24 × 24 | icon | Copy-Link trailing icon, componentId `256:5195`. Also the un-named `IC` on the Highlight card's Copy Link button. |
| 10 | `I2940:13465;335:9663;186:1441` | (un-named `IC`) | 24 × 24 | icon | "Xem chi tiết" trailing icon, componentId `186:2691`. **Not** `MM_MEDIA_`-named, so `list_media_nodes` misses it — but it still has to be exported. |
| 11 | `I3127:21871;2234:33040` | `MM_MEDIA_Pen` | 32 × 32 | small-icon | pen at the right end of the post card's category row. Same componentId `214:3812` as the 24 px pill pen, so `public/saa/Pen.svg` should cover it — **verify the SVG scales cleanly to 32 px**. |
| 12 | `I2940:13497;186:1766` | `MM_MEDIA_Open Gift` | 24 × 24 | icon | "Mở Secret Box" trailing icon (componentId `256:6801`) |
| 13 | `I3127:21871;256:4858;3106:17694` | `MM_MEDIA_New Hero` | 109 × 19 (artwork 117 × 30) | text-label | badge pill artwork, variant `3007:17506`. Text is live; only the pill artwork is needed. |
| 14 | `I3127:22053;256:4858;3106:17694` | `MM_MEDIA_Rising Hero` | 109 × 19 | text-label | variant `3007:17509`; also used on all three Highlight cards (sender side) |
| 15 | `I3127:22375;256:4858;3106:17694` | `MM_MEDIA_Super Hero` | 109 × 19 | text-label | Super Hero variant; also on `3127:22439` |
| 16 | `I3127:21871;256:4860;3106:17694` | `MM_MEDIA_Legend Hero` | 109 × 19 | text-label | variant `3007:17516`; four raster children incl. two `background-blend-mode: screen` layers — a single flattened PNG per pill is the practical export |
| 17 | `I3127:21871;256:4858;256:4734` (+ 11 more) | `MM_MEDIA_Avatar` | 64 × 64 | small-icon | avatar placeholder. 12 `MM_MEDIA_Avatar` nodes total (2 per post card ×4, 1 per leaderboard row ×5) plus 3 more on the Highlight cards (`I2940:13464;335:9443;256:4734`, `I2940:13464;335:9446;256:4734`, `I2940:13466;335:9443;256:4734`). The centre Highlight card's two avatars are renamed `B.3.1_Avatar người gửi` / `B.3.5_Avatar người nhận` and therefore **absent from `list_media_nodes`**. One placeholder image serves all. |
| 18 | `I3127:21871;256:5177;513:8436` … `;256:5181;513:8436` | `MM_MEDIA_Sample Image` | 88 × 88 each | image | 20 nodes (5 per post card × 4). All reference the same sample thumbnail — one asset. |
| 19 | `2940:14181` | `image 25` | 1100 × 618 | (not `MM_MEDIA_`) | spotlight-board artwork layer, `background-blend-mode: screen` |
| 20 | `2940:14173` | `Root further mo rong 1` | 1819 × 583 | (not `MM_MEDIA_`) | spotlight-board base artwork under a `rgba(0,0,0,0.70)` scrim. Likely the same source as the existing `public/saa/Root_Further_Logo.png` — **verify before re-exporting**. |
| 21 | `3241:14932` | `image 35` | 34 × 40 | (not `MM_MEDIA_`) | the heart + `x2` artwork in sidebar row D.1.4 |
| 22 | `2940:14178` | `image 24` | 1098 × 617 | (not `MM_MEDIA_`) | spotlight-board layer with **no `background` URL in the data** — may be an empty/hidden placeholder; inspect before exporting |
| 23 | `2940:13442` | `Group` (inside `MM_MEDIA_Kudos logo`) | 120 × 94 | — | the star/asterisk mark left of the KUDOS wordmark |

Items 19–23 are **not** `MM_MEDIA_*`-named, so they will not appear in a
`list_media_nodes`-driven download pass — they must be pulled deliberately.

---

## Gaps / discrepancies

1. **Banner title.** Spec `A` says `'Hệ thống ghi nhận lời cảm ơn'`; frame node `2940:13439`
   says `Hệ thống ghi nhận và cảm ơn`. **Frame is truth.**
2. **"Mở quà" vs "Mở Secret Box".** Spec `C` / `D` / `D.1` / `D.1.8` all say `'Mở quà'`;
   frame node `I2940:13497;186:1568` says `Mở Secret Box`. **Frame is truth.**
3. **Second leaderboard list does not exist.** Spec `D` names two lists
   (`10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT` + `10 SUNNER NHẬN QUÀ MỚI NHẤT`); the spec numbering
   even skips `D.2`. The frame has exactly one list block (`2940:13510`) whose only header is
   `10 SUNNER NHẬN QUÀ\nMỚI NHẤT`. The "thăng hạng" string exists **nowhere** as a node.
   **Frame is truth — one list.**
4. **Stat-row count.** Spec `D.1` says *"6 dòng số liệu"*; the frame has **5** value rows
   (D.1.2, D.1.3, D.1.4, D.1.6, D.1.7) plus a divider (D.1.5). **Frame is truth.**
5. **Heart count.** Spec `B.3` / `B.4.4` / `C.4` quote `'10'`; every heart node on the frame
   reads `1.000`. **Frame is truth.**
6. **Carousel arrow naming is inverted in the spec.** Spec `B.2.1` (node `2940:13470`) is
   labelled "Nút tiến (Next)" but its layer name is `B.2.1_Button lùi` and its icon is
   `MM_MEDIA_Left`; `B.2.2` (`2940:13468`) is labelled "Nút lùi" with a `MM_MEDIA_Right` icon.
   Trust the icons and layer names, not the spec's `nameTrans`.
7. **Inactive-card treatment has no numeric value.** No `opacity`, `transform` or `filter`
   exists on `2940:13464` / `2940:13466`. The dimming is purely the two `#00101A → transparent`
   gradient overlays. Any opacity/scale/blur figure in the implementation is an invention.
8. **Pan/Zoom control is empty.** `3007:17479` is a 30 × 30 FRAME with zero children, no fill,
   no icon. Its appearance is `NOT IN DESIGN`, yet spec `B.7.2` requires a working toggle plus
   a `'Pan/Zoom'` tooltip.
9. **Heart red is not in the design.** `MM_MEDIA_Heart` is a vector instance; the MCP exposes
   no fill for it. Grey/red states come from spec prose only, with no hex.
10. **Badge pills are raster, not flat gold.** Each `danh hiệu` instance layers 1–4 image
    rectangles (some `background-blend-mode: screen`) behind live text, with a 0.5px `#FFEA9E`
    border and `border-radius: 48px`. There is no solid gold fill token to reuse; the New Hero
    variant does add a `#FFF3C6` backing rect.
11. **Super Hero pill has a duplicate text layer.** `Super ` (`;3053:7594`, `opacity: 0.66`)
    sits under `Super Hero` (`;3007:17514`). Render only the latter.
12. **Dept-code typo differs between sections.** Highlight cards say `CECV10`; ALL KUDOS post
    cards say `CEVC10`. Both are verbatim. The spec CSV writes `CEVC10`.
13. **Two different message-body strings.** Highlight cards truncate at
    `…tạo động lực rất...`; post cards run to `…<3 và cuộc sống...`. Do not substitute one for
    the other.
14. **Right-hand carousel card is content-incomplete.** `2940:13466` genuinely lacks a
    receiver-badge text node and a `Xem chi tiết` label node (clipped at the frame edge).
    A real implementation will render them; that is an addition, not an extraction.
15. **Undocumented nodes (no spec CSV row).** The top Sunner-search pill (`2940:13450`), the
    six spotlight ticker lines (`3004:15995`–`15999`, `2940:14230`), the D.3 scrollbar
    (`2940:13521`), and header/footer (`2940:13433` / `2940:13522`). Also spec `B.3.3` is
    missing from the CSV entirely (B.3.1, B.3.2, B.3.4, B.3.5, B.3.6 exist).
16. **Whitespace matters.** Trailing spaces are real on: `Huỳnh Dương Xuân Nhật `,
    `Huỳnh Dương Xuân `, `Mai phương Thúy `, `Tìm kiếm `, `Super `, and the leaderboard names.
    The submit-pill placeholder has one leading + three trailing spaces. The hashtag line has a
    **double space** before its final `#Inspring...`. The D.3 title contains a real `\n`.
17. **Header/footer active state must move.** On this frame both the header and footer
    highlight `Sun* Kudos`. `site-header.tsx` never marks `/kudos` active, and
    `site-footer.tsx` hard-codes the tinted treatment onto `/awards`. Both need the Kudos route
    wired in.
18. **`image 24` (`2940:14178`) carries no background URL** in the MCP data — it may be an
    empty or hidden placeholder on the spotlight board. Inspect before treating it as an asset.
