# HOWTO — các việc thường gặp nhất

> Đây là tài liệu "làm thế nào", không phải "vì sao" — xem `docs/HANDBOOK.md` cho lý do đằng sau
> mỗi quy tắc. File này chỉ liệt kê các bước thật, kèm ví dụ ngắn tham chiếu file thật đã verify
> trong chính repo này, cho 3 việc dev mới hay cần làm nhất (xem
> `engineering-standards-audit-2026-11-26.md` mục I/L.7 — gap "chỉ học qua ví dụ, chưa có HOWTO
> chung" là lý do file này tồn tại).

## 1. Tạo component UI mới

**Khi nào tạo ở `packages/shared/ui/`:** chỉ khi đã có **≥ 2 nơi** cần cùng 1 component (rule-of-2,
xem `docs/HANDBOOK.md` mục 2). Component chỉ dùng trong 1 module thì đặt ở
`modules/<module>/components/` (hoặc `app/components/` nếu chỉ dùng trong 1 app, không phải
module nghiệp vụ — xem `apps/shell/app/components/Nav.tsx`).

**Các bước** (ví dụ thật: `packages/shared/ui/page-header.tsx`, tạo khi `apps/shell/app/page.tsx`
và `apps/it-ticket/app/page.tsx` bị phát hiện trùng lặp markup y hệt nhau):

1. Tên file `lowercase.tsx` nếu ở `packages/shared/ui/` (quy ước shadcn/ui có chủ đích), hoặc
   `PascalCase.tsx` nếu ở `modules/<module>/components/` hay `app/components/` — không trộn 2 quy
   ước trong cùng 1 thư mục.
2. Export 1 function component + 1 `interface <Name>Props` riêng (không inline type trong tham
   số nếu prop > 1-2 field):

   ```tsx
   import { cn } from "./cn";

   export interface PageHeaderProps {
     title: string;
     action?: React.ReactNode;
     className?: string;
   }

   export function PageHeader({ title, action, className }: PageHeaderProps) {
     return (
       <div className={cn("flex items-center justify-between", className)}>
         <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">{title}</h1>
         {action}
       </div>
     );
   }
   ```

3. Thêm export vào file `index.ts` của package/module đó (public surface DUY NHẤT — named export,
   không `export *`, xem `docs/HANDBOOK.md` mục 1).
4. Nếu ở `packages/shared/ui/`: thêm `<name>.stories.tsx` cùng tên (xem
   `packages/shared/ui/page-header.stories.tsx` làm mẫu) — mọi component UI dùng chung đều có
   story đi kèm.
5. Styling CHỈ dùng token có sẵn trong `packages/tailwind-config/theme.css`
   (`--color-ag-*`, `--font-*`) — không hardcode hex/px tùy ý (xem `docs/HANDBOOK.md` mục 10).

## 2. Viết custom hook mới

**Khi nào viết:** chỉ khi logic đó thật sự cần tái sử dụng Reac state/effect (không phải logic
thuần — logic thuần không cần hook, đặt ở `domain/` như hàm thường, xem `docs/HANDBOOK.md` mục 3).
Nếu hook chỉ đọc 1 field từ Redux store qua nhiều app có `RootState` khác nhau, mô hình tham khảo
là `packages/core/auth/useAuth.ts` (lưu ý: hook này hiện CHƯA có test riêng — nếu bạn copy mẫu
này, hãy thêm test, đừng lặp lại gap đó):

```ts
import { useSelector } from "react-redux";
import type { AuthState } from "./authSlice";

/**
 * OPEN/CLOSED: hoạt động ở MỌI app bất kể RootState thật của app đó khác nhau thế nào -
 * chỉ cần state có field "auth" (luôn đúng vì StoreProvider luôn wire authReducer dưới "auth").
 */
export function useAuth(): AuthState {
  return useSelector((state: { auth: AuthState }) => state.auth);
}
```

Nếu hook gọi API (không phải đọc Redux state thuần), đó là RTK Query endpoint, không phải custom
hook tự viết — xem mục "2. Thêm API endpoint riêng" trong `packages/core/CLAUDE.md`, dùng
`baseApi.injectEndpoints()`, hook (`useGetXxxQuery`) tự sinh ra, không viết tay.

Tên file `camelCase.ts`, bắt đầu bằng `use` (vd `useAuth.ts`, `useMenu.ts`).

### Khi module của bạn thêm slice Redux ĐẦU TIÊN: thêm `store/hooks.ts`

Đừng dùng `useSelector((state: { yourSlice: YourState }) => ...)` tay ở từng component — dễ gõ
sai, không đồng bộ khi slice thay đổi. Thêm 1 file `modules/<module>/store/hooks.ts`:

```ts
import { useDispatch, useSelector } from "react-redux";
import type { InferRootState, AppDispatch } from "@archetype/core";
import type { yourReducer } from "./yourSlice";

type YourExtra = { yourKey: typeof yourReducer };
export type RootState = InferRootState<YourExtra>;
export type { AppDispatch };

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

`YourExtra` phải khớp CHÍNH XÁC với `extraReducers` bạn truyền vào `<StoreProvider>` trong
`app/providers.tsx` — TypeScript không tự bắt được lệch nhau giữa 2 file này (xem ví dụ thật:
`apps/it-ticket/modules/it-ticket/store/hooks.ts` + `apps/it-ticket/app/providers.tsx`). Dùng
`useAppSelector`/`useAppDispatch` thay cho `useSelector`/`useDispatch` trần ở mọi component trong
module từ đây trở đi.

## 3. Viết test component mới

Dùng Vitest + React Testing Library + MSW — **không mock Redux store** (RTK Query không hoạt
động với `redux-mock-store`, xem root `CLAUDE.md` rule 5). Ví dụ thật:
`apps/it-ticket/modules/it-ticket/components/TicketList.test.tsx`.

**Các bước:**

1. MSW handler luôn ở file riêng `mocks/handlers.ts`, **không** inline trong file test (kể cả
   test đơn giản chỉ có 1 handler) — xem `apps/shell/app/mocks/handlers.ts`.
2. Dùng `renderWithProviders` từ `@archetype/test-utils` (không phải RTL's `render` trần) — bọc
   sẵn Redux `Provider` thật với `baseApi` middleware.
3. Khung test tối thiểu:

   ```tsx
   import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
   import { setupServer } from "msw/node";
   import { screen, waitFor } from "@testing-library/react";
   import { renderWithProviders } from "@archetype/test-utils";
   import { handlers } from "../mocks/handlers";
   import { YourComponent } from "./YourComponent";

   const server = setupServer(...handlers);
   beforeAll(() => server.listen());
   afterEach(() => server.resetHandlers());
   afterAll(() => server.close());

   describe("YourComponent", () => {
     it("renders data after loading from the API (via MSW)", async () => {
       renderWithProviders(<YourComponent />);
       await waitFor(() => {
         expect(screen.getByText("...")).toBeInTheDocument();
       });
     });
   });
   ```

4. Dùng `isError`/`isLoading` (RTK Query flag) để assert trạng thái lỗi/loading, không dựa vào
   object `error` thô (xem `docs/HANDBOOK.md` mục 9).
5. RTL không auto-cleanup giữa các test trong repo này (`test.globals: true` không được bật) —
   `vitest.setup.ts` đã có `afterEach(() => cleanup())` sẵn cho mọi app, không cần tự thêm.

---

Thiếu HOWTO cho việc gì khác hay gặp? Thêm mục mới vào file này kèm ví dụ thật — đừng viết mẫu lý
thuyết chưa chạy qua `pnpm run test`/`pnpm run build` thật.
