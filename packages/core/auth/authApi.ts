import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "./authSlice";
import type { AuthState } from "./authSlice";

/**
 * NOI DUY NHAT trong toan bo FE ket noi toi guard "act-jwt" phia Laravel - goi
 * /auth/refresh. Module khac KHONG tu goi JWT, chi dung lai qua core (xem
 * best-practice-structure.md). Khong import tu packages/core/store/index.ts o day
 * de tranh circular import - chi dung type AuthState tu chinh authSlice.ts.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data as { accessToken: string }));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};
