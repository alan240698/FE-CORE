# ADR 0002 — Thiết lập AI-Ready Engineering System (`.claude/`) + cập nhật docs hiện có

**Ngày:** 2026-11-27
**Trạng thái:** Chấp nhận (accepted) — xem lại khi có module nghiệp vụ thứ 3.

## Bối cảnh

Yêu cầu: xây dựng hệ thống Engineering Standards/Conventions/AI Coding Rules hoàn chỉnh, để bất kỳ
developer mới hoặc AI session mới đều làm việc theo cùng 1 chuẩn. Yêu cầu gốc đề xuất một bộ ~17
file `docs/*.md` + `.claude/{rules,skills,commands,agents}/` khá lớn.

**Phát hiện quan trọng nhất của Phase 1 (research)**: phần lớn hệ thống này **ĐÃ TỒN TẠI**, không
phải xây từ đầu — `CLAUDE.md` (root + `packages/core/CLAUDE.md`), `docs/HANDBOOK.md` (18 mục, đã
có rule+lý do+ví dụ ĐÚNG/SAI cho hầu hết 9 nhóm "Coding Rules" mà yêu cầu gốc liệt kê),
`docs/HOWTO.md`, `CONTRIBUTING.md`, PR template, `CODEOWNERS`, Husky (`commit-msg`/`pre-commit`/
`pre-push`), `commitlint`, CI với 8 hard gate (lint/type-check/test/build/E2E/depcruise/prettier/
secret-scan) + 1 soft gate có lý do ghi rõ (`pnpm audit`). Phần **thật sự chưa tồn tại**: toàn bộ
`.claude/`.

Một số nội dung trong hệ thống cũ đã **lỗi thời** (viết trước đợt 11 audit sâu 2026-11-27, một số
mục ghi "chưa sửa"/"cần sửa dần" dù đã sửa xong, 1 bảng "khuyến nghị, chưa implement" mà hầu hết
mục nay đã implement) — đã cập nhật lại, xem mục "Đã thay đổi" bên dưới.

## Quyết định

### 1. KHÔNG tạo 17 file `docs/*.md` riêng biệt — mở rộng 2 file đã có

`docs/HANDBOOK.md` đã đạt đúng mục tiêu "mỗi quy tắc có rule + lý do + ví dụ ĐÚNG/SAI + ngoại lệ"
mà yêu cầu gốc đòi hỏi, cho 16/18 mục đã trùng khớp 9 nhóm Coding Rules (Architecture, TypeScript,
Redux, Hooks, Components, Common & Constants, API & Security, Performance, Testing). Tách thành 17
file riêng sẽ fragment 1 nguồn thông tin đang nhất quán thành nhiều file nhỏ dễ lệch nhau — đúng
điều "Không tạo hàng chục files có nội dung trùng lặp" mà yêu cầu gốc tự cấm.

**Đã làm thay vì tạo file mới:**

- Mở rộng HANDBOOK.md §7 (State Management) thành Redux conventions đầy đủ (7.1–7.7: ownership,
  actions/reducers, selectors, async, common/shared, constants/status-values, persistence) — phủ
  đúng nhóm "Redux Rules" yêu cầu gốc muốn có `REDUX_CONVENTIONS.md` riêng.
- Thêm §19 (SEO & Web Standards cho module mới) — ngắn, vì phần lớn checklist SEO cổ điển không áp
  dụng cho app sau-auth 100% (đã audit riêng, xem `audit-seo-web-standards-2026-11-27.md`).
- Sửa mọi chỗ lỗi thời (mục 4.4, mục 9's ví dụ SAI, bảng "chưa implement" ở cuối file).
- Thêm vào `docs/HOWTO.md`: mục 4 (Redux slice từ A-Z) + mục 5 (API endpoint mới) — thực hành hóa
  phần lý thuyết mới thêm ở HANDBOOK §7.

### 2. `.claude/rules/` — 6 file, không phải 11

Yêu cầu gốc gợi ý 11 file (`general/architecture/typescript/redux/hooks/components/api/security/
performance/testing/constants`). Đã gộp còn 6, vì nhiều nhóm trong số đó ở quy mô dự án này (51
file source, 1 module nghiệp vụ) có nội dung MỎNG tới mức tách riêng sẽ chỉ còn vài dòng:

| Gộp                                                           | Lý do                                                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `hooks` + `components` → `components-and-hooks.md`            | Cả 2 đều ngắn, cùng chủ đề "khi nào nên tạo UI abstraction mới"                                                                                        |
| `api` + `security` → `api-and-security.md`                    | Ở dự án này, rule API VÀ rule security gần như là 1 (mọi API rule đều có lý do bảo mật đi kèm — Zod validate, mutex 401, không tự gọi `/auth/refresh`) |
| `typescript`/`performance`/`constants` → gộp vào `general.md` | Mỗi nhóm chỉ có 1-2 rule thật sự cụ thể ở quy mô này (vd performance = "không memoize không bằng chứng", 1 câu) — tách riêng sẽ là file gần như rỗng   |

Giữ riêng: `architecture.md` (đủ nội dung, path-scope rõ ràng khác `general`), `redux.md` (vừa được
audit sâu, nội dung nhiều nhất, đáng 1 file riêng theo đúng yêu cầu gốc), `testing.md` (path-scope
rất khác các rule còn lại — áp dụng cho `*.test.ts(x)`/`*.spec.ts`, không phải code ứng dụng).

### 3. `.claude/skills/` — 3 skill, không phải 9

Chỉ tạo skill có giá trị thật, theo đúng yêu cầu gốc "Chỉ tạo skills thực sự có giá trị":

| Đã tạo                | Gộp/bỏ gì                                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feature-development` | Gộp cả **bug-fix** vào đây (1 nhánh trong cùng workflow: "bug fix cần reproduction trước, bỏ qua phần lớn planning, không bỏ qua đọc rules") — tách riêng sẽ trùng lặp 80% nội dung |
| `redux-development`   | Yêu cầu gốc có, giữ riêng vì vừa audit sâu, nội dung đặc thù                                                                                                                        |
| `code-review`         | Gộp **testing**/**security-review** vào checklist của skill này (mục "API/security check", "Test check") thay vì 3 skill riêng kiểm tra chồng chéo nhau                             |

**Không tạo**: `refactor` (đã gộp vào `feature-development`'s bước "Research" — tìm implementation
tương tự, kiểm tra duplication), `api-integration` (đã gộp vào `redux-development`'s mục "Adding a
new API endpoint" vì ở dự án này, API luôn qua RTK Query), `dependency-review` (nội dung quá mỏng —
chỉ 1 quy tắc thật, `.claude/rules/general.md` mục 9 đã đủ, không cần cả 1 skill riêng cho 1 rule).

### 4. `.claude/commands/` — 3 lệnh, không phải 8

`/feature`, `/redux-review`, `/review` — map trực tiếp 1-1 với 3 skill ở trên. **Không tạo** `/bugfix`
(nằm trong `/feature`), `/refactor` (nằm trong `/feature`), `/test` (nằm trong `/review`),
`/security-check` (nằm trong `/review`'s API/security check) — tránh N lệnh gọi cùng 1 skill theo
cách khác nhau, dễ gây nhầm lẫn "dùng lệnh nào mới đúng".

### 5. `.claude/agents/` — KHÔNG tạo

Yêu cầu gốc tự dặn "Không tạo quá nhiều agents nếu skills và rules đã đáp ứng đủ." Ở quy mô dự án
này (1 module nghiệp vụ, không có nhiều luồng review song song cần tách trách nhiệm), rules + skills
đã đủ — thêm agent chuyên biệt (Architecture Reviewer, Security Reviewer...) lúc này sẽ là hạ tầng
không ai dùng, đúng anti-pattern "dead abstraction" mà chính dự án này đã phải dọn 2 lần
(`ticketSlice.statusFilter`, `httpClient`). **Khi nào xem lại**: khi có ≥3 module nghiệp vụ thật,
lúc đó review song song nhiều module khác nhau mới có giá trị thật để tách agent riêng.

## Phase 5 — Phân loại Automated Enforcement (trạng thái thật, không phải đề xuất)

| Rule                                                         | Enforce bằng gì                                                                        | Trạng thái                                                                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Không `any`, `strict`+`noUncheckedIndexedAccess`             | TypeScript compiler                                                                    | ✅ Tool                                                                                                                     |
| Không deep-import `@archetype/*`                             | ESLint `no-restricted-imports`                                                         | ✅ Tool                                                                                                                     |
| `domain/` không import React/Next                            | ESLint (cùng rule, block riêng)                                                        | ✅ Tool                                                                                                                     |
| Không hardcode path nội bộ                                   | ESLint `no-hardcoded-paths.js`                                                         | ✅ Tool                                                                                                                     |
| `consistent-type-imports`                                    | ESLint                                                                                 | ✅ Tool                                                                                                                     |
| Circular dependency                                          | `depcruise`                                                                            | ✅ Tool                                                                                                                     |
| Format                                                       | Prettier (`pre-commit` qua `lint-staged`)                                              | ✅ Tool                                                                                                                     |
| Commit message convention                                    | commitlint (`commit-msg` hook)                                                         | ✅ Tool                                                                                                                     |
| Secret trong code                                            | TruffleHog (CI)                                                                        | ✅ Tool                                                                                                                     |
| Lint/type-check/test/build sạch                              | `turbo run ...` (CI + `pre-push`)                                                      | ✅ Tool                                                                                                                     |
| Rule-of-2 cho component/hook/utility mới                     | —                                                                                      | ⚠️ Cần AI/code review — không thể enforce tự động (đòi hỏi đếm "số nơi dùng thật" theo ngữ nghĩa, không phải pattern match) |
| Không duplicate value-list có sẵn Zod schema                 | —                                                                                      | ⚠️ Cần AI/code review — ESLint không biết 2 mảng literal "có cùng ý nghĩa nghiệp vụ" hay không                              |
| Không đưa business logic lên `packages/core` không cần thiết | —                                                                                      | ⚠️ Cần code review/judgment                                                                                                 |
| Zod validate dữ liệu ngoài                                   | Một phần: không có ESLint rule chặn `as T` tổng quát (quá nhiều false-positive hợp lệ) | ⚠️ Cần code review, có checklist ở `code-review` skill                                                                      |
| Test red/green cho bug fix                                   | —                                                                                      | ⚠️ Cần developer/AI tự verify, không tool nào xác nhận được "test đã từng đỏ" sau khi đã xanh                               |

**Không cố biến mọi rule kiến trúc thành ESLint rule mới** (đúng yêu cầu gốc) — những rule đòi hỏi
hiểu ngữ nghĩa nghiệp vụ (rule-of-2, duplicate ý nghĩa, business logic đặt đúng chỗ) được ghi lại
thành checklist tường minh trong skill `code-review`/`redux-development` thay vì cố ép vào ESLint.

## Phase 9 — Validation (mô phỏng, tự phát hiện vấn đề và đã điều chỉnh)

Mô phỏng 8 tình huống yêu cầu gốc liệt kê, đánh giá trung thực:

| Tình huống              | Biết đọc file nào?                                                                                    | Vấn đề tìm được                                                                                           | Đã điều chỉnh                                                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tạo feature mới         | ✅ `CLAUDE.md`'s bảng điều hướng → `feature-development` skill                                        | —                                                                                                         | —                                                                                                                                                                                           |
| Tạo component mới       | ✅ `components-and-hooks.md` + HOWTO §1                                                               | —                                                                                                         | —                                                                                                                                                                                           |
| Tạo custom hook         | ✅ `components-and-hooks.md` + HOWTO §2                                                               | —                                                                                                         | —                                                                                                                                                                                           |
| Tạo Redux slice         | ✅ `redux.md` + `redux-development` skill + HOWTO §4 — tình huống được cover kỹ nhất                  | —                                                                                                         | —                                                                                                                                                                                           |
| Tích hợp API            | ✅ `api-and-security.md` + HOWTO §5                                                                   | —                                                                                                         | —                                                                                                                                                                                           |
| Refactor module hiện có | ✅ `feature-development` skill's bước Research                                                        | Không có skill RIÊNG cho refactor — đã quyết định có chủ đích (mục "Không tạo" ở trên), không phải bỏ sót | Không cần sửa — đã ghi rõ lý do                                                                                                                                                             |
| Fix bug                 | ⚠️ `feature-development` skill cover, nhưng gộp chung với feature nên phần "reproduce trước" hơi ngắn | Phát hiện: hướng dẫn bug-fix có thể rõ hơn nếu tách riêng 1 đoạn                                          | Chấp nhận giữ nguyên — tách thêm sẽ lặp 80% nội dung skill, đúng rủi ro "quá nhiều file nội dung trùng lặp" mà yêu cầu gốc cấm; `.claude/rules/testing.md` mục 6 (red/green) đã bù phần này |
| **Thêm dependency mới** | ❌ Ban đầu KHÔNG có rule nào cho tình huống này                                                       | **Gap thật tìm được qua chính bước self-validation này**                                                  | ✅ Đã thêm `.claude/rules/general.md` mục 9 ngay trong lượt này                                                                                                                             |

**Rules có trùng/mâu thuẫn không?** Không tìm thấy — mỗi rule file path-scope khác nhau (`general`
áp dụng mọi nơi làm nền, các file còn lại chỉ CỤ THỂ HÓA thêm cho phạm vi hẹp hơn, không rule nào
nói ngược lại rule khác).

**Instructions có quá dài không?** `docs/HANDBOOK.md` giờ ~700 dòng — DÀI nếu đọc hết 1 lượt, nhưng
đây là quyết định có chủ đích: đọc theo MỤC (qua bảng điều hướng ở `CLAUDE.md`), không đọc hết mỗi
lần — tổng số dòng THẬT SỰ cần đọc cho 1 task cụ thể (vd "thêm Redux slice") chỉ khoảng 60-80 dòng
(§7 + rules/redux.md + HOWTO §4), không phải 700.

**Yêu cầu không thể enforce?** Đã liệt kê rõ ở bảng Phase 5 trên — không giả vờ chúng enforce được
bằng tool.

**Unnecessary boilerplate?** Không — mọi file mới đều map 1-1 với 1 nhu cầu thật đã xác nhận qua
Phase 1 research, không có file "giữ chỗ" nào.

## Liên quan

- `docs/HANDBOOK.md`, `docs/HOWTO.md`, `CLAUDE.md`, `packages/core/CLAUDE.md` — đã cập nhật trong
  cùng đợt này.
- `.claude/rules/`, `.claude/skills/`, `.claude/commands/` — mới tạo trong đợt này.
- `archetype-intranet-new/docs/fe-modular/audit-redux-architecture-2026-11-27.md` — nguồn chính cho
  nội dung Redux mới thêm vào HANDBOOK §7.
- `archetype-intranet-new/docs/fe-modular/audit-seo-web-standards-2026-11-27.md` — nguồn cho
  HANDBOOK §19.

## Khi nào xem lại quyết định này

- Khi có **module nghiệp vụ thứ 3** — lúc đó đánh giá lại có cần `.claude/agents/` hay tách thêm
  rule/skill theo domain không, dựa trên bằng chứng thật (không phải ước lượng trước).
- Khi `docs/HANDBOOK.md` vượt quá mức "đọc theo mục vẫn tiện" (nếu 1 mục đơn lẻ tự nó dài quá 150
  dòng, tách mục đó thành file riêng — chưa xảy ra ở lần cập nhật này).
