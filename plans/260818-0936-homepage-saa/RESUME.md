# RESUME — trạng thái Stage 5 + 6 (ghi trước khi compact, 2026-08-18)

> **ĐÃ HOÀN TẤT 2026-08-18.** Mục "Việc còn lại" bên dưới đã làm xong hết: W9 promote (13 doc,
> `shasum -c` 13/13), W9.5/W9.6, `wave9-complete.flag`, doc-writer (system + ADR-001 + feature spec),
> evidence gate `SEALED` exit 0. Trạng thái chính thức nằm ở `plan.md` và
> `phase-05-integration-and-review.md` — file này giữ lại vì phần **"Sáu lần gate FAIL"** và
> **"Cảnh báo vận hành"** vẫn còn đúng và còn hữu ích cho lần sau.

Work context: `/Users/truong.thanh.hai/Desktop/Hai Work/Hai Study AIDD/my-app` (git root; thư mục cha KHÔNG phải repo).
Branch `feat/homepage-saa`. Mọi lệnh phải `cd` vào `my-app` trước.

## Đã xong

**Stage 5 — Inspection: DONE.**
- `reviewer` chạy xong → `reports/reviewer-260818-phase05-code-review.md`. **0 critical**, 4 warning.
- 4 warning tôi tự đọc code xác nhận là thật. Đã sửa 2 cái ảnh hưởng tiêu chí đã nêu; 2 cái còn lại là ngữ nghĩa ARIA gắn ý đồ thiết kế → chuyển design owner, **cố ý không sửa**.
- `delivery-tracker` chạy xong: `plan.md` + 5 phase file đã reconcile, branch sửa `main` → `feat/homepage-saa`.
- Design-defect report: `reports/design-defects-260818-homepage-saa.md` (mục A–E, 10 mục cần quyết định, 2 mục chặn public: B1 thông tin sự kiện, C1 copy 2 award card).

**Verification cuối (tôi tự chạy, không tin báo cáo agent):**
```
E2E 39/39 exit 0 · unit 16/16 · tsc 0 · npm run lint 0 · build OK (6 route static)
console production: 0 error 0 warning
0 assertion rỗng còn sót trong e2e/ (grep toBeTruthy|toBeDefined|.catch(|test.skip|waitForTimeout|networkidle)
không file source nào quá 200 dòng (dài nhất 152)
```

**Stage 6 — Delivery, đang ở giữa:**
- Bước 0 gen gate (6.a-pre): user chọn **Core**. Đang chạy `rebuild-spec --lang vi`, primary_lang = vi → `docs_root = docs/vi`.
- W0 → W7.5 **XONG HẾT**. Xem bảng dưới.
- `delivery-tracker` (bước 1) **XONG**.

## Việc còn lại — làm theo đúng thứ tự này

1. **W9 promote** (gate đã pass: validator PASS, `review-report.md` failed=0 missing=0):
   ```
   python3 .claude/skills/rebuild-spec/scripts/promote_drafts.py \
     --plan-dir plans/260818-0936-homepage-saa --docs-root docs/vi --scope core --mode full \
     --affected-artifacts all
   ```
   Trước khi promote: thay token `{POPULATED_BY_W6}` trong `artifacts/screen-flow.md` bằng
   `<!-- Feature Entry Points: run /tkm:rebuild-spec --feature-specs to populate -->`.
   Sau promote phải assert 13 file core tồn tại & non-empty (RT-M3): `docs/vi/system/{overview,architecture,permissions,business-rules}.md` + `docs/vi/generated/{route-list,api-map,permissions-matrix,entities,user-stories,feature-list,screen-list,screen-flow,behavior-logic}.md`.
2. **W9.5** `build_source_to_fcode.py --cursor core --mode full` → advance `last_rebuild_sha`.
3. **W9.6** `build_navigation.py --pass-complete`.
4. Ghi `artifacts/wave9-complete.flag` (format ở `pipeline-w7-w9.md` § Wave 9 completion flag format).
5. **`doc-writer`** (bước 2 của Delivery): hoà nội dung forward-draft `spec/system/{architecture,permissions}.md` vào bản as-built ở `docs/vi/system/`, promote `spec/homepage-saa/` sang `docs/vi/features/`, và **viết `docs/decisions/ADR-001-mock-session-and-hand-rolled-i18n.md`** (hai system draft đang trỏ `TBD (draft)` vào file này). `docs/decisions/` nằm ở root, không nằm trong `docs/vi/`.
6. `TaskUpdate` — N/A trong VSCode.
7. **Evidence gate:** `node .claude/skills/_shared/lib/evidence-gate.cjs --evidence-dir <abs plans/260818-0936-homepage-saa/evidence> --stage hard`. Thư mục `evidence/` **chưa tồn tại** — phải tạo 3 artifact trước, exit 2 = BLOCKED.
8. **Delivery Manifest** đọc nguyên văn (format ở `~/.claude/skills/takumi/SKILL.md`), rồi hỏi user về commit qua `git-manager`.
9. `/tkm:write-journal`.
10. Dọn nốt: `plan.md` đang `status: complete` nhưng phase 5 `in-progress` — sửa khi phase 5 đóng thật; `plan.md` 84 dòng > giới hạn 80.

## Bảng wave của gen gate

| Wave | Kết quả |
|---|---|
| W0 scout | 34 file; BL inventory `_(none found)_` 10/10 |
| W0.5 | `_session-context.md` (mode generate, lang vi) |
| W1 | system-overview, architecture, data-model, route-list |
| W1 gates | contiguity PASS, route-list validator PASS |
| W1.5 | data-model structural gate PASS |
| W2 combined | screen-list (5 SCR, 0 REG), screen-flow, behavior-logic (0 BL) |
| W2 gates | contiguity ×2 PASS, screen-list validator PASS |
| W2.9 | api-map — rỗng đúng nghĩa |
| W3 | permissions-matrix (3 PERM), permissions, business-rules |
| W4 | user-stories — 16 US |
| W4.5 | quality gate PASS |
| W5 | feature-list — 9 F###, phủ 16/16 US và 5/5 SCR |
| W5 post-step | `_canonical-fcodes.json` + 9 folder `.pending` (script ở scratchpad) |
| W5.5 / W5.6 | existence PASS / sanity PASS |
| W7a | **PASS**, 0 critical, 2 warning |
| W7-merge | `review-report.md` failed=0 warnings=0 |
| W7.5 | structural fixer: 0 block fixed |
| post-W8 | contiguity re-check 6 artifact — PASS |

## Sáu lần gate FAIL trong gen gate — đều là lỗi thật, không phải nhiễu

1. `data-model`: hai heading `### MODEL001_Award` trùng (dòng 40 và 145) — validator đếm heading nên đây là duplicate definition thật.
2. `data-model`: DISC-001/002/004 bị đếm cả cross-reference — validator chỉ đếm heading cho code CÓ heading; code định nghĩa trong bảng thì mọi lần xuất hiện tính là definition. Đã rút literal ở chỗ tham chiếu.
3. `route-list`: agent copy nguyên khối hướng dẫn "Completeness Contract" của template vào output; validator đọc chữ "approximation markers" trong đó thành marker thật.
4. W1.5: `isExpired`/`isInvalid` được gán DISC dù boolean thuần → theo quy tắc D6 của kit, boolean flag thuộc Business Rules. Đã rút 2 mã, `locale` DISC-004 → DISC-002.
5. W4.5: artifact ghi "4 US view-content" nhưng liệt kê 5 mã.
6. W7a: `route-list` Owner F### bỏ trống + checkbox "pending Wave 5" ở `screen-list`/`user-stories` chưa đóng.

## Ba phát hiện ngoài lề, đã kiểm chứng lại chứ không tin agent

- `components/home/hero-keyvisual.tsx` và `root-further-content.tsx` **là Server Component** — brief tôi đưa agent nói sai, agent grep ra và sửa. Kiểm lại: đúng, không có `'use client'`.
- **Bốn trang placeholder không có header/footer** — chúng nằm trong `app/page.tsx` (dòng 12, 20) chứ không phải `app/layout.tsx`. Vào `/awards` là không có đường quay lại ngoài nút Back. Không sửa ở bước bàn giao (chạm cấu trúc Track A + lệch locator E2E); đã ghi mục E của design-defect report.
- `validate_feature_api_link.py` **chỉ parse bảng `## Backend Routes`** — dự án này dùng `## Frontend Routes`, nên cái PASS của script không phủ gì cả. Đừng tin exit 0 của nó.

## Cảnh báo vận hành

- `playwright.config.ts` đã đổi `reuseExistingServer: false`. Nếu có `next dev` nào đang chiếm 3000/3100, suite báo lỗi to thay vì chạy sai — **kill port trước khi chạy E2E**, đừng đổi lại thành `true`.
- `npm run lint` là `eslint` trần; `eslint.config.mjs` đã thêm `.claude/**`, `plans/**`, `test-results/**`, `playwright-report/**` vào `globalIgnores`. Không có nó thì gate lint luôn đỏ vì ~983 problem của kit.
- Hai file untracked ở root **không thuộc feature này**, đừng gom vào commit: `release-manifest.json`, `.repomixignore`.
- Agent `tester` trong session này đã báo cáo sai 5 lần (số liệu test, Clock API, "missing implementation" ×3, và một report visual validation **bịa** citation `fixed bottom-4 right-4` trong khi code thật là `top-1/2`). Luôn tự chạy lệnh mà verify.
