# `@archetype/core` — hợp đồng Open/Closed

> Package này là nền tảng dùng chung cho **mọi** app trong monorepo (`shell`, `it-ticket`, và các module sau này: `hrm`, `abi`, `dml`...). Nguyên tắc sống còn của package này: **đóng để sửa đổi, mở để mở rộng** (Open/Closed Principle). Đọc file này TRƯỚC khi định sửa bất kỳ file nào trong `packages/core/`.

## Quy tắc quan trọng nhất

**Không bao giờ sửa file trong `packages/core/` để thêm tính năng cho 1 module cụ thể.** Nếu bạn thấy mình cần sửa `packages/core/store/index.ts` hay bất kỳ file nào khác ở đây để module của bạn hoạt động — dừng lại, đó là dấu hiệu bạn đang làm sai cách. Đọc tiếp phần "Cách mở rộng đúng" bên dưới.

## Cái gì CỐ ĐỊNH (đóng, không được sửa)

| File                | Vai trò cố định                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auth/authSlice.ts` | Duy nhất 1 state: `accessToken`, `user`, `permissions`. Không thêm field riêng cho module nào ở đây.                                                                                                                                                                     |
| `auth/authApi.ts`   | `baseQueryWithReauth` — NƠI DUY NHẤT gọi `/auth/refresh`, có mutex chống race điều kiện khi nhiều request cùng lúc gặp 401 (xem `auth/authApi.test.ts` — có test red/green xác nhận bug thật nếu bỏ mutex). Không module nào được tự gọi `/auth/refresh` ngoài file này. |
| `store/baseApi.ts`  | RTK Query API gốc, `endpoints: () => ({})` — luôn rỗng.                                                                                                                                                                                                                  |
| `store/index.ts`    | `makeStore()` chỉ có đúng 2 reducer cố định: `auth` + `baseApi`.                                                                                                                                                                                                         |

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

## Public surface — chỉ import từ `@archetype/core`

Không bao giờ import sâu (`@archetype/core/auth/authSlice`...) — ESLint boundaries (`packages/eslint-config/boundaries.js`) sẽ chặn việc này. Toàn bộ API công khai nằm ở `packages/core/index.ts`, chỉ có named export (không `export *`).

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
