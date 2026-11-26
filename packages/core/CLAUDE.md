# `@archetype/core` — hợp đồng Open/Closed

> Package này là nền tảng dùng chung cho **mọi** app trong monorepo (`shell`, `it-ticket`, và các module sau này: `hrm`, `abi`, `dml`...). Nguyên tắc sống còn của package này: **đóng để sửa đổi, mở để mở rộng** (Open/Closed Principle). Đọc file này TRƯỚC khi định sửa bất kỳ file nào trong `packages/core/`.

## Quy tắc quan trọng nhất

**Không bao giờ sửa file trong `packages/core/` để thêm tính năng cho 1 module cụ thể.** Nếu bạn thấy mình cần sửa `packages/core/store/index.ts` hay bất kỳ file nào khác ở đây để module của bạn hoạt động — dừng lại, đó là dấu hiệu bạn đang làm sai cách. Đọc tiếp phần "Cách mở rộng đúng" bên dưới.

## Cái gì CỐ ĐỊNH (đóng, không được sửa)

| File                | Vai trò cố định                                                                                                                                                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth/authSlice.ts` | Duy nhất 1 state: `accessToken`, `user`, `permissions`. Không thêm field riêng cho module nào ở đây (field CHUNG cấp platform như `tenantId` thì khác — xem mục "Open/Closed sẽ tốn kém" bên dưới, vẫn chưa thêm vì chưa có consumer).                                       |
| `auth/authApi.ts`   | `createBaseQueryWithReauth(strategy)` — cơ chế mutex chống race điều kiện + chuỗi retry khi gặp 401 CỐ ĐỊNH, dùng chung cho MỌI `AuthStrategy` (xem `auth/authApi.test.ts` — có test red/green xác nhận bug thật nếu bỏ mutex). KHÔNG module nào được tự viết lại logic này. |
| `store/baseApi.ts`  | RTK Query API gốc, `endpoints: () => ({})` — luôn rỗng.                                                                                                                                                                                                                      |
| `store/index.ts`    | `makeStore()` chỉ có đúng 2 reducer cố định: `auth` + `baseApi`.                                                                                                                                                                                                             |

## Cái gì MỞ (mở rộng được từ bên ngoài, không đụng code ở đây)

### 1. Thêm state Redux riêng cho module của bạn

Dùng tham số `extraReducers` của `makeStore()`/`StoreProvider` — **không** sửa `store/index.ts`:

```ts
// apps/<module>/app/providers.tsx ("use client")
import { StoreProvider } from "@archetype/core";
import { yourReducer } from "../modules/<module>/store/yourSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  return <StoreProvider extraReducers={{ yourKey: yourReducer }}>{children}</StoreProvider>;
}
```

⚠️ **Bắt buộc**: `providers.tsx` phải có `"use client"` và nằm riêng, **không** gọi `StoreProvider` trực tiếp trong `layout.tsx` (Server Component) — một reducer (function) không serialize qua ranh giới RSC, Next.js sẽ build fail. Xem ví dụ thật đã verify tại `apps/it-ticket/app/providers.tsx`.

### 2. Thêm API endpoint riêng cho module của bạn

Dùng `baseApi.injectEndpoints()` — **không** tạo `createApi()` riêng:

```ts
// modules/<module>/store/yourApi.ts
import { baseApi } from "@archetype/core";

const yourApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSomething: builder.query<SomeType, void>({ query: () => "/something" }),
  }),
});

export const { useGetSomethingQuery } = yourApi;
```

### 3. Đọc trạng thái đăng nhập

Dùng `useAuth()` — hoạt động được ở MỌI app dù `RootState` khác nhau (không cần biết toàn bộ `RootState` thật của app đó):

```ts
import { useAuth } from "@archetype/core";
const { accessToken, user, permissions } = useAuth();
```

### 4. Thêm auth strategy khác (SSO/SAML, API-key...) cho 1 module cụ thể

Viết 1 `AuthStrategy` mới (xem `auth/authStrategy.ts`), gọi `createBaseQueryWithReauth(strategyMoi)`
cho `baseApi`/`createApi()` RIÊNG của module đó — **không** sửa `cookieJwtStrategy` hay mutex/retry
logic trong `authApi.ts` (2 cái đó dùng chung cho mọi strategy, kể cả strategy mới):

```ts
// modules/<module>/store/ssoAuthApi.ts
import { createBaseQueryWithReauth } from "@archetype/core";
import type { AuthStrategy } from "@archetype/core";

const ssoStrategy: AuthStrategy = {
  prepareHeaders(headers, state) {
    /* gắn credential SSO của bạn */ return headers;
  },
  async refresh(rawBaseQuery, api) {
    /* logic refresh SSO của bạn */ return true;
  },
};

export const baseQueryForSso = createBaseQueryWithReauth(ssoStrategy);
```

Hiện tại chỉ có đúng 1 implementation (`cookieJwtStrategy`, dùng cho `baseApi` chung) — chưa có
module nào cần strategy khác, viết phần này khi THẬT SỰ cần, không viết trước.

## Public surface — 2 entry point, không phải 1

- **`@archetype/core`** (`index.ts`) — surface CHO MỌI NƠI (Client lẫn Server Component).
- **`@archetype/core/server`** (`server.ts`) — surface RIÊNG cho Server Component, hiện chỉ có `serverFetch()`.

**Vì sao tách làm 2, không gộp chung `index.ts`:** `serverFetch()` import `next/headers` (chỉ dùng được trong Server Component). `index.ts` lại được import bởi Client Component (`StoreProvider`, `useAuth`... trong `apps/*/app/providers.tsx`, có `"use client"`). Next.js bundler phân tích TĨNH toàn bộ module graph của 1 Client Component — nếu `next/headers` có mặt BẤT KỲ ĐÂU trong graph đó (kể cả khi không ai thật sự gọi `serverFetch()`), build FAIL thật
(`You're importing a module that depends on "next/headers"... Client Component Browser`). Gộp chung 1 barrel export cả code server-only lẫn client-dùng-được chỉ hoạt động được khi KHÔNG CÓ export nào cần API server-only — một khi có, bắt buộc phải tách.

`@archetype/core/server` là ngoại lệ CÓ CHỦ ĐÍCH trong ESLint boundaries (`packages/eslint-config/boundaries.js`'s `noDeepImportArchetype`) — nó LÀ 1 public surface đặt tên rõ ràng, không phải import sâu vào file nội bộ. Không bao giờ import sâu kiểu khác (`@archetype/core/auth/authSlice`...) — rule vẫn chặn đúng mọi trường hợp đó.

## `api-client/apiBaseUrl.ts` — validate `NEXT_PUBLIC_API_BASE_URL` độc lập

`authApi.ts` đọc `NEXT_PUBLIC_API_BASE_URL` qua file này (tự validate bằng Zod `z.string().url()`,
KHÔNG đọc `process.env` thẳng) — `packages/core` không thể import `env.ts` đã validate của từng app
cụ thể (hướng phụ thuộc chỉ đi app → core, không ngược lại), nên tự validate lại đúng 1 biến này
bằng cùng 1 rule với `@archetype/env-schema`, thay vì tin `process.env` mù quáng.

> Trước đây có thêm `api-client/httpClient.ts` — fetch wrapper cho nơi RTK Query hook không dùng
> được (Server Component, script...). Đã XÓA (2026-11-26) vì 0 app nào dùng thật, và nó KHÔNG tương
> đương RTK Query (không retry 401, không gọi `/auth/refresh`) — giữ 1 abstraction không ai dùng,
> API shape chưa từng được chứng minh đúng, rủi ro hơn là lợi ích (xem
> `audit-nextjs-core-principal-architect-2026-11-26.md`, repo `archetype-intranet-new`, finding
> D-9). **Nếu thật sự cần fetch từ Server Component sau này**: thêm lại tương tự, nhưng viết CÙNG
> lúc với consumer thật đầu tiên — đừng xây trước khi có nhu cầu.

## Cạm bẫy thật đã gặp: `@types/node` phải tự khai ở TỪNG package, không mượn được

`packages/core` dùng `process.env.NEXT_PUBLIC_API_BASE_URL` (trong `api-client/apiBaseUrl.ts`). Đã xác nhận bằng lỗi thật: **dù `packages/core` tự khai `@types/node` trong `devDependencies` của chính nó, bất kỳ package nào khác import `@archetype/core` rồi tự chạy `tsc --noEmit` riêng (vd `packages/shared`) vẫn báo lỗi `TS2580: Cannot find name 'process'`** nếu package đó không tự khai `@types/node` của riêng mình.

**Lý do:** pnpm strict mode tạo `node_modules/@types` riêng biệt cho từng package. TypeScript resolve global ambient type (`types` field) bằng cách "đi lên" từ vị trí `tsconfig.json` CỦA PACKAGE ĐANG CHẠY `tsc`, không phải vị trí file nguồn đang được type-check — nên "mượn" `@types/node` qua dependency (`@archetype/core`) **không hoạt động**.

**Quy tắc áp dụng cho mọi module tương lai:** bất kỳ package/app nào tự chạy `tsc --noEmit` riêng (có script `type-check` trong `package.json`) VÀ import `@archetype/core` (hoặc bất kỳ package nào dùng `process.env`) đều phải tự thêm `"@types/node": "^20"` vào `devDependencies` của chính nó — kể cả khi chính package đó không trực tiếp dùng `process`.

## 1 điểm Open/Closed còn lại sẽ TỐN KÉM nếu phải sửa muộn — biết trước, đừng ngạc nhiên

> ✅ **Multi-auth-strategy đã xử lý (2026-11-26)**: `authApi.ts` giờ là `createBaseQueryWithReauth(strategy)`
> nhận `AuthStrategy` (xem mục "4. Thêm auth strategy khác" ở trên) — thêm strategy thứ 2 không
> còn cần sửa file này nữa. Refactor này 0 thay đổi hành vi (verify bằng test race-condition cũ
> vẫn pass nguyên vẹn + red/green lại 1 lần nữa để chắc chắn).

**Multi-tenant SaaS** vẫn CHƯA xử lý, cố ý: `auth/authSlice.ts` (CỐ ĐỊNH) không có field
`tenantId`/`organizationId`. Nếu cần, phải sửa thẳng file này. Hiện tại KHÔNG cần (Archetype Group
là 1 công ty, không phải SaaS đa khách hàng) — **không thêm field này trước khi có consumer thật**,
vì 1 field không ai đọc chính là dead code (đúng anti-pattern đã dọn nhiều lần trong dự án này:
`ticketSlice.statusFilter`, `httpClient`...). Khi thật sự cần: thêm `tenantId: string | null` vào
`AuthState` + `initialState`, CÙNG LÚC với consumer thật đầu tiên đọc field đó — không phải trước.

## Test hiện có — chạy trước khi đổi bất cứ gì

```bash
pnpm --filter @archetype/core run test         # 7 test: authSlice + authApi (kể cả race-condition)
pnpm --filter @archetype/core run type-check
```

Nếu sửa `authApi.ts`, bắt buộc phải giữ test "only calls /auth/refresh ONCE even when 3 requests hit 401 at the same time" pass — đây là test chống đúng bug concurrency đã xảy ra thật khi viết package này lần đầu (xem `setup-tu-zero-archetype-frontend.md`).

## Liên quan

- `audit-best-practice-structure.md` §1.5 — rủi ro race điều kiện xuyên-zone khi refresh token (vẫn cần kiểm tra `RefreshTokenService` phía Laravel, chưa xác nhận xong).
- `nguyen-tac-code-fe-va-tai-lieu-cho-ai.md` §1.1 — vì sao CLAUDE.md lồng theo từng package/module.
- `docs/adr/` (log tổng, chưa tạo) — ghi quyết định kiến trúc lớn liên quan tới package này khi có.
