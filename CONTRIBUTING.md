# Đóng góp vào `archetype-frontend`

> Quy ước ngôn ngữ: **code + comment luôn tiếng Anh**, **tài liệu `.md` (bao gồm file này) luôn
> tiếng Việt** — xem `docs/HANDBOOK.md` để biết lý do.

Đọc `CLAUDE.md` (root) TRƯỚC — đây là quy tắc cấp repo bắt buộc. Đọc `docs/HANDBOOK.md` để biết
convention chi tiết (component/hook/utility/testing/TypeScript), mỗi quy tắc đều có ví dụ
ĐÚNG/SAI lấy từ chính codebase này, không phải lý thuyết chung chung.

## Setup

```bash
corepack enable       # bật pnpm đúng version khai báo trong package.json
pnpm install
```

Sao chép `.env.example` (do `scripts/generate-infra.ts` sinh ra, KHÔNG sửa tay) của app bạn
đang chạy thành `.env.local` (đã gitignore, không commit).

## Quy trình thêm 1 module nghiệp vụ mới

KHÔNG tự tạo `apps/<module>/` bằng tay. Dùng:

```bash
pnpm exec tsx scripts/create-module.ts <ten-module>
# hoặc module đứng domain riêng (standalone zone):
pnpm exec tsx scripts/create-module.ts <ten-module> --zone standalone --domain <domain>
```

Script tự sinh toàn bộ hạ tầng (env validation, lint, test runner, basePath...) theo đúng cấu
trúc thật của `apps/it-ticket` — không sinh business logic giả (xem log của script để biết các
bước thủ công còn lại: review diff `modules.config.ts`, `pnpm install`, `pnpm run
generate-infra`).

## Trước khi mở Pull Request

Chạy pipeline đầy đủ như CI sẽ chạy (xem `.github/workflows/ci-frontend.yml`):

```bash
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build
pnpm run generate-infra:check   # báo lỗi nếu quên chạy generate-infra sau khi sửa modules.config.ts/environments.config.ts
pnpm run depcruise               # chặn circular dependency + vi phạm boundary
pnpm exec prettier --check .
```

**Git hook tự động (Husky) đã chặn một phần việc này:**

- `pre-commit`: `prettier --write` cho file đã stage (qua `lint-staged`).
- `commit-msg`: bắt buộc [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `chore:`...) — cấu hình ở `commitlint.config.js`. Commit message không đúng
  format sẽ bị từ chối ngay tại máy, không cần chờ CI.
- `pre-push`: chạy `lint && type-check && test` trước khi cho push — sửa lỗi tại đây rẻ hơn
  nhiều so với phát hiện ở CI.

**Riêng khi sửa `packages/next-config/` (headers, basePath) hoặc bất cứ gì liên quan Multi-Zones:**
`next start` KHÔNG đáng tin cho build `output: "standalone"` (chính Next.js cũng cảnh báo điều
này). Cách verify duy nhất đáng tin: build standalone server thật rồi `curl` trực tiếp —

```bash
pnpm --filter @archetype/<app> run build
cp -r apps/<app>/.next/static apps/<app>/.next/standalone/apps/<app>/.next/static
node apps/<app>/.next/standalone/apps/<app>/server.js
```

Đừng tin "nhìn có vẻ đúng" cho thay đổi loại này — đã có bug thật (security header không áp dụng
đúng cho static assets qua basePath) chỉ lộ ra khi test theo cách này, không lộ ra ở `next start`.

## Review

Required reviewer theo `.github/CODEOWNERS` — sửa `packages/core/`, `packages/shared/`,
`packages/eslint-config/` (và các package nền tảng khác) hoặc `.github/`/`infra/` cần review từ
`@archetype-group/frontend-platform`.

`packages/core` theo nguyên tắc Open/Closed (xem `packages/core/CLAUDE.md`) — PR **mở rộng**
package này (thêm `AuthStrategy` mới, `injectEndpoints()` từ module khác...) được khuyến khích;
PR **sửa trực tiếp** cơ chế đã có (mutex refresh, `baseApi` gốc...) cần giải thích rõ root cause
trong mô tả PR, không chỉ "fix bug".

## Những thứ CI sẽ chặn cứng (hard gate) vs. chỉ cảnh báo

- **Hard gate** (PR không merge được nếu fail): lint, type-check, test, build,
  `generate-infra:check`, E2E (Playwright), depcruise, `prettier --check`, secret scan
  (TruffleHog).
- **Chỉ cảnh báo, không chặn** (`continue-on-error: true`): `pnpm audit --audit-level=high` —
  hiện có 1 lý do cụ thể, đã ghi trong `CLAUDE.md`'s "Known pending item" (zod v3 bị pin do
  `@t3-oss/env-nextjs`'s peerDependency), không phải bị tắt tùy tiện. Nếu bạn thêm advisory mới
  vào danh sách exception này, PHẢI ghi rõ lý do y hệt cách đó, không im lặng bỏ qua.

## Không làm (anti-pattern đã từng bị xóa khỏi repo này)

- Không tạo component/hook/utility "phòng trường hợp sau này cần" — rule-of-2: chỉ tách khi đã có
  ≥ 2 nơi dùng thật (xem `docs/HANDBOOK.md` mục 2–5).
- Không thêm feature flag mà chưa có consumer thật + test cho cả 2 trạng thái (xem
  `feature-flags.config.ts`'s doc comment).
- Không tự viết `fetch()` rải rác gọi API ngoài — luôn qua `baseApi.injectEndpoints()` (client)
  hoặc `@archetype/core/server`'s `serverFetch()` (Server Component).
- Không ép kiểu tĩnh (`as T`) cho dữ liệu từ API ngoài (Laravel) — validate bằng Zod runtime
  (`transformResponse`), xem `apps/it-ticket/modules/it-ticket/store/ticketApi.ts` làm ví dụ.
