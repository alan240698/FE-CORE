# Frontend Engineering Handbook — `archetype-frontend`

> Đây là quy ước kỹ thuật CHÍNH THỨC cho repo này. Dựa trên 11+ vòng audit thật (2026-11-26 →
> 2026-11-27, xem danh sách đầy đủ ở `archetype-intranet-new/docs/fe-modular/`: core architecture,
> verification, engineering standards, hooks/helpers foundation, architecture/security,
> common/shared/constants, deep codebase, UI/UX/a11y, dependency/build, production readiness,
> SEO/web-standards, Redux architecture) — mọi quy tắc ở đây đều bắt nguồn từ bằng chứng thật trong
> chính codebase này, không phải lý thuyết chung chung. Cập nhật lần cuối: 2026-11-27 (sau đợt
> "Build a Complete AI-Ready Development Convention & Engineering Rules System").
>
> Đọc file này TRƯỚC khi viết code mới. Đọc thêm `CLAUDE.md` (root) cho quy tắc cấp repo, và
> `packages/core/CLAUDE.md` cho hợp đồng Open/Closed của package nền tảng.
>
> Quy ước ngôn ngữ: **code + comment luôn tiếng Anh**, **UI text + tài liệu `.md` (bao gồm file
> này) luôn tiếng Việt**.

---

## 1. Cấu trúc dự án & quy ước đặt tên file

**Quy tắc:**

```
apps/<app>/
  app/                      - Next.js App Router (layout.tsx, page.tsx, providers.tsx)
  app/messages/vi.ts        - UI text cấp page của app này (qua @archetype/i18n)
  app/components/           - component chỉ dùng trong app này (không phải module nghiệp vụ)
  modules/<module>/
    domain/                 - pure business logic, KHÔNG React/Next.js
    store/                  - Redux slice + RTK Query injectEndpoints
    components/             - React component của module
    types/                  - TypeScript type cho domain data
    mocks/                  - MSW handler cho test
    messages/vi.ts          - UI text cấp module (qua @archetype/i18n)
    featureFlags.ts         - flag reader riêng của module (nếu có flag)
packages/<package>/
  index.ts                  - public surface DUY NHẤT, chỉ named export
```

- File component: `PascalCase.tsx` (vd `TicketList.tsx`), trừ `packages/shared/ui/*` dùng
  `lowercase.tsx` (vd `button.tsx`) — đây là quy ước **shadcn/ui có chủ đích** cho UI primitive, khác
  component cấp feature. Không trộn 2 quy ước trong cùng 1 thư mục.
- File hook: `camelCase.ts`, bắt đầu `use` (vd `useAuth.ts`).
- File logic không phải hook: `camelCase.ts` (vd `ticketSlice.ts`, `authApi.ts`).
- Test Vitest (unit/component): `<tên>.test.ts(x)`. Test Playwright (E2E): `<tên>.spec.ts`, luôn
  nằm trong thư mục `e2e/` riêng. **Không bao giờ trộn 2 hậu tố này.**

**Vì sao:** cấu trúc `modules/<name>/{domain,store,components,types,mocks,messages}` là convention
TỰ ĐỘNG được sinh ra bởi `scripts/create-module.ts` cho MỌI module mới — module nào lệch khỏi cấu
trúc này (như `it-ticket` hiện lệch 1 chỗ — xem Exception bên dưới) sẽ gây nhầm lẫn khi dev đọc
song song nhiều module.

**Ví dụ ĐÚNG:**

```
apps/it-ticket/modules/it-ticket/store/ticketSlice.ts
apps/it-ticket/modules/it-ticket/store/ticketApi.ts
```

**Ví dụ SAI:**

```
apps/it-ticket/modules/it-ticket/ticketStuff.ts   // trộn slice + api vào 1 file "tiện"
apps/it-ticket/TicketStore.ts                      // đặt ở app/ thay vì modules/<name>/store/
```

**Ngoại lệ đã biết:** `apps/it-ticket/modules/it-ticket/featureFlags.ts` hiện nằm ở GỐC thư mục
module, không khớp 6 thư mục con mà `create-module.ts` tự sinh (`engineering-standards-audit`
finding ES-2). Cho tới khi `create-module.ts` được cập nhật, module MỚI nên tự quyết định đặt
`featureFlags.ts` ở gốc (giống `it-ticket`) để nhất quán với tiền lệ thật duy nhất đang có, KHÔNG
tự chế vị trí khác.

---

## 2. Tiêu chuẩn implement Component

**Quy tắc:**

1. Component nghiệp vụ (trong `modules/<name>/components/`) LUÔN có `"use client"` nếu dùng hook
   (useState/useSelector/useGetXQuery...) — mặc định App Router là Server Component.
2. Early return cho loading/error TRƯỚC khi render nội dung chính — không lồng ternary sâu.
3. UI text LUÔN qua `@archetype/i18n`'s `createMessages()`, KHÔNG hardcode string tiếng Việt trực
   tiếp trong JSX.
4. Props tên: `variant`, `size`, `disabled` cho UI primitive (theo `packages/shared/ui/button.tsx`
   làm chuẩn) — không tự đặt tên khác (`type`, `kind`, `mode`) cho cùng khái niệm.
5. Component UI primitive mới trong `packages/shared/ui/` PHẢI dùng `forwardRef` nếu có khả năng cần
   compose với thư viện khác sau này (Dialog/Dropdown...).

**Vì sao:** pattern early-return + role="status"/"alert" đã verify đúng chuẩn accessibility (ARIA
live region ngầm định) qua audit thật — giữ nguyên để mọi component mới đều accessible ngay từ đầu
mà không cần nghĩ thêm.

**Ví dụ ĐÚNG** (`apps/it-ticket/modules/it-ticket/components/TicketList.tsx`):

```tsx
"use client";
import { vi } from "../messages/vi";

export function TicketList() {
  const { data, isLoading, isError } = useGetTicketsQuery();

  if (isLoading) return <p role="status">{vi.loading}</p>;
  if (isError) return <p role="alert">{vi.loadError}</p>;

  return <Table>{/* ... */}</Table>;
}
```

**Ví dụ SAI:**

```tsx
export function TicketList() {
  const { data, isLoading, error } = useGetTicketsQuery();
  return (
    <div>{isLoading ? <p>Dang tai...</p> : error ? <p>Loi</p> : <Table>{/* ... */}</Table>}</div>
  );
  // sai: string hardcode, ternary lồng, trộn `error` object với `isError` flag
}
```

**Ngoại lệ:** component DEMO/placeholder tạm (vd lúc scaffold module mới, trước khi có nghiệp vụ
thật) được phép có text hardcode tạm thời — PHẢI thay bằng `@archetype/i18n` trước khi merge vào
`main`.

---

## 3. Tiêu chuẩn implement Custom Hook

**Quy tắc:**

1. Chỉ viết hook thủ công khi có **use case thật, lặp lại ≥ 2 nơi** hoặc logic đủ phức tạp cần tách
   riêng để test độc lập. KHÔNG viết hook "phòng trước" (xem `packages/core/auth/useAuth.ts` —
   case DUY NHẤT hiện có, đúng chuẩn: single responsibility, SSR-safe vì chỉ `useSelector`).
2. Tên hook PHẢI khớp chính xác hành vi trả về — không đặt tên chung chung (`useData`, `useLogic`).
3. Hook dùng browser API (window, document, localStorage) PHẢI tự guard `typeof window !==
"undefined"` — codebase hiện tại CHƯA có hook nào cần việc này (0 hook dùng browser API), nhưng
   mọi hook tương lai phải tuân thủ nếu cần.
4. Hook có side-effect (subscription, event listener) PHẢI cleanup trong `useEffect`'s return
   function — codebase hiện tại 0 `useEffect` nào tồn tại (dấu hiệu kỷ luật tốt, không phải thiếu).

**Vì sao:** audit xác nhận 100% hook phổ biến (`useBoolean`, `useDebounce`, `useLocalStorage`...)
đều KHÔNG có use case thật trong repo này — viết trước sẽ là abstraction chết, đúng anti-pattern đã
nhiều lần bị xóa (`httpClient` v1, `ticketSlice.statusFilter` trước khi dogfood).

**Ví dụ ĐÚNG:**

```ts
// packages/core/auth/useAuth.ts
export function useAuth(): AuthState {
  return useSelector((state: { auth: AuthState }) => state.auth);
}
```

**Ví dụ SAI:**

```ts
// Viết hook "cho chắc" dù chưa ai cần
export function useDebounce<T>(value: T, delay: number): T {
  // ... 20 dòng logic, 0 component nào gọi hook này
}
```

**Ngoại lệ:** nếu PR thêm 1 component thật sự cần debounce (vd search box cho module thứ 2), viết
hook CÙNG LÚC với component đó, không viết trước.

---

## 4. Tiêu chuẩn TypeScript

**Quy tắc:**

1. `strict: true` + `noUncheckedIndexedAccess: true` bắt buộc cho MỌI package/app (đã cấu hình ở
   `packages/tsconfig/base.json`, kế thừa qua `extends`).
2. **Không `any`** trừ khi có comment giải thích rõ root cause (tiền lệ DUY NHẤT được chấp nhận:
   `packages/env-schema/index.ts`'s `as never` — giải thích branded-key-type của thư viện ngoài).
3. `import type { X }` riêng dòng cho type-only import — không trộn `import { type X, y }`.
4. **Dữ liệu từ API ngoài (Laravel) PHẢI validate bằng Zod runtime**, không chỉ ép kiểu tĩnh (`as
T`). _(Quy tắc từ `engineering-standards-audit` finding TS-NEW-1 — **đã áp dụng đầy đủ** ở cả 3
   điểm gọi API thật: `ticketApi.ts`/`useMenu.ts` qua `parseApiResponse()` dùng chung
   (`packages/core/api-client/parseApiResponse.ts`, log lỗi trước khi rethrow), `authApi.ts`'s
   refresh response qua `safeParse` + fallback `clearCredentials()`. `serverFetch()` cũng validate
   cùng cơ chế — xem `audit-deep-codebase-2026-11-27.md`, repo `archetype-intranet-new`.)_
5. `catch` block PHẢI bind biến lỗi và log lại (`catch (err) { console.error(err); ... }`) trừ khi
   có lý do rõ ràng để nuốt lỗi (và phải ghi comment giải thích).

**Vì sao:** mọi config/env trong repo (`environments.config.ts`, `feature-flags.config.ts`,
`modules.config.ts`) đều fail-fast bằng Zod — nguyên tắc này PHẢI áp dụng nhất quán tới ranh giới
rủi ro cao nhất (dữ liệu từ hệ thống ngoài), không chỉ dừng ở config nội bộ.

**Ví dụ ĐÚNG (đã áp dụng thật — xem mục 4.4):**

```ts
const TicketSchema = z.object({
  id: z.number(),
  title: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  createdAt: z.string(),
});

const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => "/tickets",
      transformResponse: (raw) => z.array(TicketSchema).parse(raw),
    }),
  }),
});
```

**Ví dụ SAI (không còn tồn tại trong codebase — giữ lại làm phản ví dụ):**

```ts
// cast thẳng, không parse — đây CHÍNH LÀ gap TS-NEW-1 đã tồn tại ở authApi.ts trước khi sửa
api.dispatch(setCredentials(refreshResult.data as { accessToken: string }));
```

**Ngoại lệ:** script build-time nội bộ (`scripts/generate-infra.ts`, `scripts/create-module.ts`)
không cần Zod cho output tự sinh của chính nó — rủi ro khác hẳn dữ liệu từ hệ thống ngoài.

---

## 5. Tiêu chuẩn implement Utility & Service

**Quy tắc:**

1. Chỉ tạo utility dùng chung khi có **≥ 2 nơi** cần cùng logic (rule-of-2 cho utility, chặt hơn
   component vì chi phí viết utility rất thấp — dễ bị lạm dụng).
2. Utility đặt ở `packages/shared/ui/` nếu LIÊN QUAN styling (như `cn.ts`); đặt ở package riêng nếu
   là logic thuần không liên quan UI (chưa có tiền lệ — tạo `packages/utils/` khi cần, đừng nhét vào
   `packages/shared`).
3. Service gọi API ngoài LUÔN qua `baseApi.injectEndpoints()` (client) hoặc
   `@archetype/core/server`'s `serverFetch()` (Server Component) — KHÔNG tự viết `fetch()` rải rác.

**Vì sao:** `cn()` (`clsx`+`tailwind-merge`) là utility DUY NHẤT hiện có, đúng chuẩn vì có ≥ 10 nơi
dùng (mọi component UI). `formatDate`/`isDefined`/`groupBy`... CHƯA tồn tại vì 0 use case thật — xem
`engineering-standards-audit` mục F.

**Ví dụ ĐÚNG:**

```ts
// packages/shared/ui/cn.ts — đúng vì ≥10 component cần merge class
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Ví dụ SAI:**

```ts
// Tạo formatDate() dù chưa component nào hiển thị ngày tháng cho user
export function formatDate(iso: string): string {
  /* ... */
}
```

**Ngoại lệ:** utility validate/parse (Zod schema) được tạo TRƯỚC khi có 2 consumer nếu đó là 1 phần
của fix an toàn bắt buộc (vd mục 4.4) — an toàn > rule-of-2 trong trường hợp này.

---

## 6. Tiêu chuẩn tích hợp API

**Quy tắc:**

1. MỌI gọi API tới Laravel backend đi qua `baseApi.injectEndpoints()` (RTK Query) — KHÔNG tạo
   `createApi()` riêng, KHÔNG tự `fetch()` trong component.
2. Server Component cần data ban đầu dùng `@archetype/core/server`'s `serverFetch(path, fallback)`
   — luôn truyền `fallback`, luôn coi kết quả là PLACEHOLDER cho client-side RTK Query, không phải
   nguồn sự thật duy nhất.
3. `baseUrl` LUÔN qua `apiBaseUrl` (`packages/core/api-client/apiBaseUrl.ts`, tự validate Zod) —
   KHÔNG đọc `process.env.NEXT_PUBLIC_API_BASE_URL` trực tiếp ở bất kỳ đâu khác.
4. Auth header/refresh LUÔN qua `baseQueryWithReauth`/`AuthStrategy` — KHÔNG module nào tự gọi
   `/auth/refresh`.

**Vì sao:** đây là cơ chế Open/Closed đã verify kỹ (mutex chống race condition, test red/green) —
tự viết lại sẽ mất cơ chế chống 401-race và dễ bug lặp lại y hệt bug đã fix trước đây.

**Ví dụ ĐÚNG:**

```ts
// modules/<module>/store/xApi.ts
import { baseApi } from "@archetype/core";
const xApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({ getX: builder.query<X, void>({ query: () => "/x" }) }),
});
export const { useGetXQuery } = xApi;
```

**Ví dụ SAI:**

```ts
// Tự fetch trong component, bỏ qua RTK Query/mutex
useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/x`).then(...);
}, []);
```

**Ngoại lệ:** không có — đây là quy tắc CỐ ĐỊNH (Closed), xem `packages/core/CLAUDE.md`.

---

## 7. Tiêu chuẩn quản lý State & Redux

> Đã audit chuyên sâu ở `audit-redux-architecture-2026-11-27.md` (repo `archetype-intranet-new`) —
> 0 Critical/High tìm được, 1 Medium (đã sửa, xem mục 7.6). Mục này mở rộng từ bản cũ để phản ánh
> đầy đủ kết luận đó.

### 7.1 Ownership — ai giữ state gì

1. State chung toàn app (auth) → `packages/core` (CỐ ĐỊNH, không sửa — xem
   `packages/core/CLAUDE.md`).
2. State riêng module → `extraReducers` của `makeStore()`/`StoreProvider`, wire qua
   `app/providers.tsx` ("use client" riêng) — KHÔNG gọi `StoreProvider` trực tiếp trong `layout.tsx`
   (Server Component không truyền được function qua ranh giới RSC — bug build THẬT đã xảy ra, không
   phải sở thích, 0 ngoại lệ).
3. Server state (data từ API) → RTK Query cache, KHÔNG đồng bộ thủ công vào Redux state riêng.
4. State chỉ cần cho 1 component → `useState` cục bộ, KHÔNG đẩy lên Redux "cho chắc".
5. Feature flag kiểm soát hiển thị → đọc qua hàm riêng module (`featureFlags.ts`), KHÔNG lưu trong
   Redux state.

**Ví dụ ĐÚNG:**

```tsx
// app/providers.tsx ("use client")
import { StoreProvider } from "@archetype/core";
import { yourReducer } from "../modules/<module>/store/yourSlice";
export function Providers({ children }: { children: React.ReactNode }) {
  return <StoreProvider extraReducers={{ yourKey: yourReducer }}>{children}</StoreProvider>;
}
```

**Ví dụ SAI:**

```tsx
// layout.tsx (Server Component) — build FAIL thật: function không serialize qua RSC
import { yourReducer } from "../modules/<module>/store/yourSlice";
export default function RootLayout({ children }) {
  return <StoreProvider extraReducers={{ yourKey: yourReducer }}>{children}</StoreProvider>;
}
```

### 7.2 Slices, Actions & Reducers

1. Luôn `createSlice` (KHÔNG `createReducer`/`createAction` rời rạc) — Immer tự bảo vệ khỏi
   mutation ngoài ý muốn.
2. Tên action: `set<Noun>`/`clear<Noun>`/`toggle<Noun>` — verb trước, PascalCase phần còn lại (vd
   `setCredentials`, `setStatusFilter`). KHÔNG hand-write action type string — để `createSlice` tự
   sinh (`"<sliceName>/<actionName>"`).
3. Mỗi slice đúng 1 trách nhiệm (vd `ticketSlice` chỉ giữ `statusFilter`, KHÔNG kiêm thêm state
   không liên quan "cho tiện").
4. KHÔNG tạo action riêng cho 1 giá trị đơn giản nếu reducer hiện tại đã đáp ứng — 1 field, 1
   action là đủ, không cần tách `setStatusFilterOpen()`/`setStatusFilterClosed()` riêng từng giá trị.
5. `createAsyncThunk`: KHÔNG dùng trong dự án này — RTK Query (`baseApi.injectEndpoints()`) đã phủ
   100% nhu cầu async. Thêm thunk sẽ là 2 cơ chế async song song không cần thiết.

### 7.3 Selectors

1. Selector đọc 1 field đơn giản → viết **inline** tại nơi dùng (`useAppSelector((s) =>
s.ticket.statusFilter)`), KHÔNG cần tách hàm riêng.
2. Selector dùng được ở MỌI app bất kể `RootState` khác nhau (như `useAuth()`) → viết thành 1 hook
   riêng ở `packages/core`, nhận type tối thiểu cần (`{ auth: AuthState }`), KHÔNG phụ thuộc
   `RootState` đầy đủ của app gọi nó.
3. `createSelector`/reselect: **CHƯA dùng, đúng vì chưa cần** — 0 selector nào tính toán tốn kém từ
   nhiều field/slice trong dự án hiện tại. Chỉ thêm khi có bằng chứng profiling thật (xem mục 14).
4. Mỗi module có slice Redux riêng PHẢI có `store/hooks.ts` xuất `useAppSelector`/`useAppDispatch`
   (qua react-redux v9.1's `useSelector.withTypes()`/`useDispatch.withTypes()`, **KHÔNG** tự viết
   `createTypedHooks()` factory) — xem `docs/HOWTO.md` mục 4 cho các bước đầy đủ.

### 7.4 Async & API Integration

1. MỌI async/server-state đi qua RTK Query (`baseApi.injectEndpoints()`) — slice KHÔNG BAO GIỜ tự
   gọi API hay giữ `isLoading`/`error` tay.
2. Response normalization qua Zod's `transformResponse` (dùng `parseApiResponse()` helper dùng
   chung) — KHÔNG qua `createEntityAdapter` trừ khi dữ liệu thật sự cần chuẩn hóa quan hệ cha-con
   (hiện chưa có use case nào).
3. Race condition giữa nhiều request đồng thời (vd 401-refresh) → mutex dùng chung
   (`createBaseQueryWithReauth`), KHÔNG tự viết cơ chế khóa riêng ở module.

### 7.5 Common & Shared Redux Logic

1. Chỉ đưa logic lên `packages/core` khi THẬT SỰ dùng chung ≥2 module (vd mutex 401-refresh).
   KHÔNG tạo `commonSlice` gom mọi state "không thuộc module cụ thể nào" — nếu chưa có ≥2 module
   cần, giữ state đó ở module sở hữu nó.
2. KHÔNG kéo business logic (vd `getSlaDeadline()`, `canTransitionTo()`) lên `packages/core`/shared
   chỉ vì "có thể dùng lại sau" — giữ ở `domain/` của module sở hữu, chuyển lên common CHỈ KHI có
   module thứ 2 thật sự cần y hệt logic đó.

### 7.6 Constants & Status Values — tránh duplicate source of truth

1. Giá trị status/enum đã có Zod schema làm SSOT (vd `TicketStatusSchema`) → MỌI nơi khác cần tập
   giá trị đó PHẢI derive từ schema (`TicketStatusSchema.options`), KHÔNG hand-type lại.
2. RTK Query đã cung cấp `isLoading`/`isSuccess`/`isError` dạng boolean — KHÔNG tự tạo constant
   `"loading"`/`"success"`/`"error"` string để so sánh tay.

**Ví dụ ĐÚNG** (sửa thật, xem `audit-redux-architecture-2026-11-27.md` finding #1):

```ts
// apps/it-ticket/modules/it-ticket/components/TicketList.tsx
import { TicketStatusSchema } from "../types/ticket";
const STATUS_OPTIONS = ["all", ...TicketStatusSchema.options];
```

**Ví dụ SAI** (đã tồn tại thật trước khi sửa — 2 nguồn định nghĩa cho cùng 1 tập giá trị):

```ts
const STATUS_OPTIONS = ["all", "open", "in_progress", "resolved", "closed"]; // hand-duplicate
```

### 7.7 Persistence

**Cố ý KHÔNG có `redux-persist` hay cơ chế persist nào** — access token chỉ sống trong Redux
memory, mất khi reload trang. KHÔNG tự thêm persistence cho `auth` slice (sẽ lưu credential ra
ngoài memory, vi phạm chuẩn bảo mật đã audit kỹ) hay bất kỳ slice nào khác mà chưa có yêu cầu rõ
ràng + đánh giá bảo mật riêng.

---

## 8. Tiêu chuẩn implement Form

**Quy tắc:**

1. Hiện CHƯA có form thật nào (chỉ có `<select>` filter, không phải "form" submit/validate) —
   KHÔNG cài `react-hook-form`/`formik` cho tới khi có form tạo/sửa dữ liệu đầu tiên.
2. Khi form đầu tiên xuất hiện: dùng `react-hook-form` + Zod resolver (nhất quán với toàn bộ
   validate pattern đã dùng ở config/env) — không chọn thư viện khác không có lý do.
3. Field đơn giản (filter, search) KHÔNG cần thư viện form — dùng controlled input + state/Redux
   trực tiếp, như `TicketList`'s `<select>` hiện tại.

**Vì sao:** tránh cài đặt hạ tầng form trước khi có nhu cầu thật — đúng tinh thần toàn bộ dự án.

**Ngoại lệ:** không áp dụng cho tới khi có PR đầu tiên thêm form thật.

---

## 9. Tiêu chuẩn xử lý lỗi (Error Handling)

**Quy tắc:**

1. RTK Query: kiểm tra lỗi bằng **`isError`** (boolean flag), KHÔNG dùng `error` truthy-check —
   thống nhất 1 chuẩn, đã áp dụng đúng ở MỌI consumer hiện có (`Nav.tsx`, `TicketList.tsx`).
2. `serverFetch()`/Server Component: lỗi bất kỳ → trả `fallback`, KHÔNG throw — để client-side RTK
   Query (có retry/refresh) xử lý tiếp.
3. `catch` PHẢI bind biến và log (`console.error`) — không `catch {}` im lặng (xem mục 4.5).
4. Error UI LUÔN dùng `role="alert"` + message qua `@archetype/i18n`.

**Ví dụ ĐÚNG:**

```tsx
const { data, isLoading, isError } = useGetXQuery();
if (isError) return <p role="alert">{vi.loadError}</p>;
```

**Ví dụ SAI:**

```tsx
const { data, error } = useGetXQuery();
if (error) return <p>Loi roi</p>; // sai: dùng `error` thay vì `isError`, hardcode text
```

---

## 10. Tiêu chuẩn Styling & Design System

**Quy tắc:**

1. Màu + font LUÔN qua token `packages/tailwind-config/theme.css` (`--color-ag-*`, `--font-sans`,
   `--font-heading`) — KHÔNG hardcode mã màu/tên font trực tiếp trong class.
2. Merge class LUÔN qua `cn()` — KHÔNG nối string thủ công (`className={base + " " + extra}`).
3. Spacing/shadow/border-radius: **CHƯA có token riêng** (gap đã biết) — tạm dùng giá trị Tailwind
   mặc định nhất quán (vd luôn `rounded` không đổi sang `rounded-lg` tùy ý) cho tới khi token được
   thêm.
4. App mới dùng `packages/shared/ui` PHẢI thêm `@source "../../../packages/shared/**/*.{ts,tsx}";`
   vào `globals.css` — thiếu dòng này Tailwind sẽ không quét ra class, bug đã gặp thật.
5. Dark mode: CỐ Ý CHƯA làm — không tự thêm `dark:` class nào cho tới khi có quyết định chính thức.

**Ví dụ ĐÚNG:**

```tsx
<h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">{vi.heading}</h1>
```

**Ví dụ SAI:**

```tsx
<h1 style={{ color: "#055e63", fontFamily: "Archivo" }}>...</h1>
```

---

## 11. Tiêu chuẩn Accessibility

**Quy tắc:**

1. Loading/error state LUÔN dùng `role="status"`/`role="alert"` (ARIA live region ngầm định) —
   KHÔNG cần thêm `aria-live` thủ công, pattern này đã đủ.
2. `<label>` bọc trực tiếp `<select>`/`<input>` (implicit label) là ĐỦ chuẩn HTML — KHÔNG bắt buộc
   `htmlFor`/`id` tường minh trừ khi label và input không nằm liền kề trong DOM.
3. KHÔNG dùng `<div onClick>` thay cho `<button>` — dùng semantic HTML element native bất cứ khi
   nào có thể (đã đúng 100% trong codebase hiện tại).
4. Link nội bộ LUÔN qua `<Link>` (next/link), ảnh LUÔN qua `<Image>` (next/image) — ESLint
   `no-hardcoded-paths.js` chặn `<a href="/...">`/`<img src="/...">` viết tay.

**Vì sao:** audit xác nhận pattern hiện tại ĐÃ đúng chuẩn accessibility thật sự (không phải may
mắn) — giữ nguyên, đừng "sửa" những gì đang đúng.

---

## 12. Tiêu chuẩn Testing

**Quy tắc:**

1. Unit/component test: Vitest + React Testing Library + MSW. MSW handler LUÔN đặt ở file riêng
   (`mocks/handlers.ts` cho module, hoặc file `*.mocks.ts` cạnh test cho component cấp app) — KHÔNG
   viết inline trong file test (vi phạm hiện tại: `apps/shell/app/components/Nav.test.tsx`, cần sửa
   khi chạm vào file).
2. E2E: Playwright, **1 test/module** cho đúng 1 critical-path (chính sách minimal-E2E) — không viết
   E2E cho mọi màn hình.
3. Test naming: `describe("TênComponent/Function", () => { it("mô tả hành vi bằng tiếng Anh", ...) })`
   — KHÔNG dùng `test()`, không bắt đầu bằng "should".
4. RTK Query LUÔN test qua MSW (mock network), KHÔNG mock Redux store — `redux-mock-store` không
   hoạt động đúng với RTK Query.
5. Test race-condition/concurrency PHẢI dùng **nhiều cache-key khác nhau** (không gọi cùng 1 query
   nhiều lần) — RTK Query tự dedupe request cùng cache-key, làm test giả pass dù logic sai.
6. Mọi fix bug quan trọng PHẢI verify **red/green** (tái tạo lỗi trước khi fix để xác nhận test thật
   sự bắt được bug, không chỉ viết test rồi tin là đủ).

**Ví dụ ĐÚNG:**

```ts
describe("TicketList", () => {
  it("filters the list by status when a status is selected", async () => {
    // ...
  });
});
```

**Ngoại lệ:** test demo/smoke tạm lúc scaffold module mới được phép đơn giản hơn, PHẢI thay bằng
test thật trước khi merge.

---

## 13. Quy tắc Import & Dependency

**Quy tắc:**

1. Import từ `@archetype/*` CHỈ qua public surface (`index.ts` hoặc entry point đặt tên như
   `@archetype/core/server`) — KHÔNG import sâu (`@archetype/core/auth/authSlice`). ESLint
   boundaries chặn tự động.
2. MỌI package import trực tiếp PHẢI tự khai trong `package.json` CỦA CHÍNH NÓ — không mượn qua
   dependency khác (pnpm strict mode không cho phép, bug "phantom dependency" đã gặp nhiều lần).
3. Package dùng `process.env` (trực tiếp hoặc gián tiếp qua dependency) PHẢI tự khai `@types/node`
   trong `devDependencies` CỦA CHÍNH NÓ — không mượn được qua dependency (xem
   `packages/core/CLAUDE.md`).
4. `import type { X }` riêng dòng khi chỉ dùng làm type.

**Ví dụ ĐÚNG:**

```ts
import { useAuth } from "@archetype/core";
import type { AuthState } from "@archetype/core";
```

**Ví dụ SAI:**

```ts
import { useAuth } from "@archetype/core/auth/useAuth"; // deep import, ESLint chặn
```

---

## 14. Tiêu chuẩn Performance

**Quy tắc:**

1. **KHÔNG** thêm `useMemo`/`useCallback`/`memo()` mà không có bằng chứng profiling thật cho thấy
   re-render đang là vấn đề — codebase hiện tại đã ĐO THẬT bằng React `<Profiler>` API (xem
   `PERFORMANCE_REGRESSION_REPORT.md`, repo `archetype-intranet-new`): 0 re-render thừa ở quy mô
   hiện tại. Đây là điểm mạnh đã kiểm chứng, không phải thiếu sót hay suy đoán.
2. Data tĩnh hiển thị ngay khi load trang → cân nhắc `serverFetch()` pattern (Server Component +
   fallback prop) thay vì 100% client-fetch, như đã áp dụng cho `TicketList`.
3. `cacheComponents`/`partialPrefetching` (Next.js Cache Components/PPR) LUÔN tắt trong mọi
   `next.config.ts` — xung đột thật với Redux Toolkit's `immutableCheck` middleware.
4. Route cần data theo từng user (dùng `cookies()`) sẽ tự động thành Dynamic (`ƒ`) — đây là đánh đổi
   ĐÚNG, không phải regression cần "sửa lại thành Static".
5. **Đòn bẩy performance lớn nhất của Next.js App Router: giữ `"use client"` CÀNG SÂU CÀNG TỐT
   trong cây component** — không đánh dấu cả `page.tsx`/`layout.tsx` là `"use client"` chỉ vì 1
   component con cần state. Component cha không cần `"use client"` nếu bản thân nó không gọi hook
   nào — ít JS gửi tới client hơn, nhiều phần cây hơn được server-render.
6. **`key` của mọi `.map()` PHẢI là ID ổn định, duy nhất từ dữ liệu thật** (`ticket.id`,
   `item.path`) — KHÔNG BAO GIỜ dùng index mảng (vỡ khi reorder/insert/delete, React gán nhầm
   state/DOM cho item sai). Cả 3 `.map()` hiện có trong repo đều đã đúng chuẩn này.
7. Component nặng, render có điều kiện (Modal, rich-text editor, thư viện chart...) → cân nhắc
   `next/dynamic` (kèm `ssr: false` nếu chỉ chạy client) thay vì gộp vào bundle JS ban đầu. **0
   component nào như vậy tồn tại hiện tại** — đây là NGƯỠNG áp dụng khi xuất hiện, không phải làm
   trước.
8. List hiển thị hàng trăm+ dòng → cần virtualization (vd `@tanstack/react-virtual`). Chưa cần ở
   quy mô hiện tại (vài ticket mock) — đây là ngưỡng cụ thể để quay lại `TicketList`'s `.map()`
   trần khi dữ liệu thật đủ lớn.

**Ngoại lệ:** nếu có bằng chứng profiling thật (React DevTools Profiler/`<Profiler>` API) cho thấy
re-render gây chậm thật, thêm memoization kèm comment trích dẫn bằng chứng đó.

---

## 15. Yêu cầu Tài liệu hóa (Documentation)

**Quy tắc:**

1. Mọi package/app mới PHẢI có `README.md` (dùng `scripts/create-module.ts` tự sinh làm điểm bắt
   đầu) — ghi rõ vai trò, lệnh chạy, "test nào đã cover, test nào chưa".
2. Quyết định kiến trúc LỚN (ảnh hưởng ≥ 2 module hoặc không thể đảo ngược rẻ) → viết ADR trong
   `docs/adr/` (xem `0001-khong-chia-se-bundle-giua-cac-zone.md` làm mẫu).
3. Package CỐ ĐỊNH (Open/Closed, như `packages/core`) PHẢI có `CLAUDE.md` riêng ghi rõ "cái gì cố
   định/cái gì mở", kèm ví dụ code THẬT đã verify.
4. Bug thật tìm thấy trong lúc build/sửa PHẢI ghi vào
   `archetype-intranet-new/docs/fe-modular/setup-tu-zero-archetype-frontend.md`'s Phụ lục (nguyên
   nhân + cách sửa), không chỉ sửa âm thầm.

**Ngoại lệ:** utility/hook nhỏ (< 20 dòng, API tự giải thích qua tên + type) không bắt buộc doc
riêng, comment đủ.

---

## 16. Quy ước Git Commit & Pull Request

**Quy tắc:**

1. Commit message theo Conventional Commits (`commitlint` chặn tự động): `feat:`, `fix:`,
   `refactor:`, `docs:`, `chore:`...
2. **Subject LUÔN chữ thường hoàn toàn**, kể cả viết tắt (`ci` không phải `CI`) — `subject-case`
   rule chặn chữ hoa.
3. Mỗi dòng body **≤ 100 ký tự** — `body-max-line-length` rule chặn.
4. Branch theo CODEOWNERS — mỗi module có team riêng (`apps/it-ticket/` → team riêng, xem
   `.github/CODEOWNERS`).
5. PR/commit sửa `authApi.ts` PHẢI chạy lại test race-condition (`authApi.test.ts`) và xác nhận vẫn
   pass trước khi merge.

**Ví dụ ĐÚNG:**

```
fix(core): validate NEXT_PUBLIC_API_BASE_URL

authApi.ts and httpClient.ts both read process.env raw, with zero
validation at that point of use.
```

**Ví dụ SAI:**

```
Fix CI bug  <!-- sai: "Fix" viết hoa, "CI" viết hoa -->
```

---

## 17. Checklist Review Code

Trước khi approve PR, kiểm tra:

- [ ] Không import sâu vào `@archetype/*` internals (ESLint tự chặn, nhưng xác nhận không bị tắt
      rule cục bộ bằng `eslint-disable`).
- [ ] Mọi `package.json` thay đổi dependency đều khai trực tiếp (không mượn transitive).
- [ ] UI text mới qua `@archetype/i18n`, không hardcode.
- [ ] Component/hook/utility mới có use case thật (≥ 2 nơi dùng, hoặc 1 nơi nhưng phức tạp đủ cần
      tách) — không phải "phòng trước".
- [ ] Data từ API ngoài có validate Zod (hoặc ghi rõ lý do tạm thời chưa, kèm issue theo dõi).
- [ ] Test mới dùng MSW cho network, không mock Redux store.
- [ ] Nếu sửa `authApi.ts`/`packages/core`: test race-condition vẫn pass, đã đọc
      `packages/core/CLAUDE.md`.
- [ ] `pnpm run generate-infra:check` sạch nếu có sửa `modules.config.ts`/`environments.config.ts`/
      `feature-flags.config.ts`.
- [ ] Commit message đúng Conventional Commits, chữ thường, body ≤ 100 ký tự/dòng.

---

## 18. Definition of Done cho tính năng mới

Một tính năng được coi là HOÀN THÀNH khi:

- [ ] Code pass `pnpm exec turbo run lint type-check test build` sạch toàn repo.
- [ ] `pnpm run depcruise` — 0 circular dependency mới.
- [ ] `pnpm exec prettier --check .` sạch.
- [ ] Có ít nhất 1 test thật cho nhánh thành công + 1 cho nhánh lỗi (nếu có xử lý lỗi).
- [ ] Nếu có UI mới: đã tự chạy app thật (`pnpm run dev`), kiểm tra bằng mắt, không chỉ tin test
      pass.
- [ ] Nếu có route mới dưới module `zone: internal`: đã verify `basePath` hoạt động đúng qua
      standalone server thật (`node .next/standalone/.../server.js`, KHÔNG dùng `next start` — đã
      xác nhận không đáng tin với `output: standalone`).
- [ ] README của module/app liên quan đã cập nhật đúng thực tế ("test nào đã cover, chưa cover").
- [ ] Nếu phát hiện bug thật trong lúc làm: đã ghi vào Phụ lục
      `setup-tu-zero-archetype-frontend.md` (repo `archetype-intranet-new`).
- [ ] CI thật trên GitHub Actions xanh (không chỉ local).

---

## 19. Tiêu chuẩn SEO & Web Standards cho module/app mới

> Đã audit ở `audit-seo-web-standards-2026-11-27.md` — app này 100% sau-auth, KHÔNG BAO GIỜ nên bị
> search engine index. Phần lớn checklist SEO cổ điển (OG tags, sitemap, structured data) KHÔNG áp
> dụng — mục này chỉ ghi những gì THẬT SỰ áp dụng.

**Quy tắc** (đã sinh sẵn qua `scripts/create-module.ts`, không cần tự thêm tay cho module mới):

1. `<html lang="vi">` — KHÔNG `"en"`, vì mọi UI text thật đều tiếng Việt (vi phạm WCAG 3.1.1 nếu sai).
2. `metadata.robots: { index: false, follow: false }` trong `layout.tsx` + 1 `public/robots.txt`
   (`Disallow: /`) — defense-in-depth, phòng trường hợp lỡ bị expose public qua misconfig proxy/DNS.
3. `app/not-found.tsx` dùng chung `ErrorFallback` (không `reset` prop — 404 không có gì để retry),
   KHÔNG để rơi vào 404 mặc định tiếng Anh của Next.js.

**Vì sao:** 3 mục này đã từng là gap thật (`lang="en"` sai ngôn ngữ, 0 robots.txt, 404 mặc định) tồn
tại từ đầu dự án tới 2026-11-27 — đã sửa ở cả `shell`/`it-ticket` và đồng bộ vào scaffold để module
mới không lặp lại cùng gap.

---

## Cơ chế thực thi — trạng thái thật (cập nhật 2026-11-27)

Bảng dưới đây TỪNG là danh sách "khuyến nghị, chưa implement" (từ
`engineering-standards-audit-2026-11-26.md` mục J/N) — hầu hết đã được triển khai qua các audit sau
đó. Cập nhật lại trạng thái thật, không giữ nguyên bảng cũ gây hiểu nhầm là vẫn còn thiếu:

| Cơ chế                                              | Trạng thái                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| ESLint `consistent-type-imports`                    | ✅ Đã có (`packages/eslint-config/typescript-style.js:34`)                                              |
| TruffleHog secret scanning trong CI                 | ✅ Đã có (`ci-frontend.yml`, hard gate, `--only-verified`)                                              |
| `docs/HOWTO.md`                                     | ✅ Đã có, đang đọc file này                                                                             |
| `CONTRIBUTING.md` + PR template                     | ✅ Đã có (`CONTRIBUTING.md`, `.github/pull_request_template.md`)                                        |
| `packages/shared/ui/page-header.tsx`                | ✅ Đã có, dùng ở cả 2 `page.tsx`                                                                        |
| Zod schema cho `Ticket`/`MenuItem`/refresh response | ✅ Đã có (mục 4.4)                                                                                      |
| `featureFlags.ts` vị trí trong scaffold             | ✅ Đã document rõ trong `create-module.ts` (không phải bug, là ngoại lệ có chủ đích — mục 1)            |
| `eslint-plugin-unused-imports`                      | ❌ Chưa thêm — chưa có bằng chứng import thừa thật nào trong repo (grep xác nhận sạch), độ ưu tiên thấp |
| CI workflow permissions tường minh                  | ✅ Đã có (`permissions: { contents: read }`)                                                            |
| `.github/CODEOWNERS` enforce thật                   | ❌ Vẫn placeholder — xem `Shared/011` (repo `archetype-intranet-new`), cần admin GitHub org xác nhận    |
