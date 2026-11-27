// THE ONLY public surface of @archetype/core - every other app/module MUST import
// only from here, never import deep into packages/core/auth/*, packages/core/store/*
// ... (ESLint boundaries block this). The export list below is INTENTIONAL, never
// "export *" (see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 2.1 - the real
// performance cost of barrel files).

export { setCredentials, clearCredentials, authReducer, useAuth } from "./auth";
export type { AuthState, AuthUser, SetCredentialsPayload } from "./auth";
export { createBaseQueryWithReauth } from "./auth";
export type { AuthStrategy } from "./auth";

export { makeStore, baseApi } from "./store";
export type { AppStore, RootState, AppDispatch, ReducersMapObject, InferRootState } from "./store";
export { StoreProvider } from "./store/Provider";

export { useGetMenuQuery } from "./menu/useMenu";
export type { MenuItem } from "./menu/useMenu";

export { useQueryParam } from "./url/useQueryParam";

// serverFetch() is NOT exported here - see server.ts and its own doc comment for why
// it needs a SEPARATE entry point from this file.
