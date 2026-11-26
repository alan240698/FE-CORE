// PUBLIC SURFACE DUY NHAT cua @archetype/core - moi app/module khac CHI import tu day,
// khong import sau vao packages/core/auth/*, packages/core/store/* ... (ESLint boundaries
// chan viec nay). Danh sach export duoi day la CHU Y, khong export * (xem
// nguyen-tac-code-fe-va-tai-lieu-cho-ai.md muc 2.1 - chi phi hieu nang that cua barrel file).

export { setCredentials, clearCredentials, authReducer } from "./auth";
export type { AuthState, AuthUser, SetCredentialsPayload } from "./auth";

export { makeStore, baseApi } from "./store";
export type { AppStore, RootState, AppDispatch } from "./store";
export { StoreProvider } from "./store/Provider";

export { httpClient } from "./api-client/httpClient";

export { useGetMenuQuery } from "./menu/useMenu";
export type { MenuItem } from "./menu/useMenu";
