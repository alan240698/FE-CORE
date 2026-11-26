import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { setCredentials, clearCredentials } from "./authSlice";
import type { AuthState } from "./authSlice";

/**
 * The ONLY place in the entire FE that talks to the "act-jwt" guard on the Laravel
 * side - calls /auth/refresh. Other modules NEVER call the JWT endpoints directly,
 * they only reuse this through core (see best-practice-structure.md). This file does
 * NOT import from packages/core/store/index.ts to avoid a circular import - it only
 * uses the AuthState type from authSlice.ts itself.
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

// A single mutex shared by every query/mutation that runs through this baseQuery.
// Without it, N concurrent requests hitting 401 at the same time (e.g. a page that
// fires several RTK Query hooks at once right when the access token expires) would
// each independently call /auth/refresh - a real race condition, not a hypothetical
// one, and the exact in-app version of the cross-zone refresh race already flagged
// in audit-best-practice-structure.md §1.5. This is RTK Query's own official pattern
// for "automatic re-authorization", not a custom invention. Confirmed with a real
// red/green test in authApi.test.ts: without this mutex, 3 concurrent 401s triggered
// 3 separate refresh calls instead of 1.
const mutex = new Mutex();

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // If another request is already refreshing, wait for it instead of racing it.
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Re-check: another request may have already refreshed while we were
        // waiting to acquire the lock, in which case retrying with the already
        // up-to-date token might succeed without needing a second refresh call.
        result = await rawBaseQuery(args, api, extraOptions);
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
      } finally {
        release();
      }
    } else {
      // Someone else is already refreshing - wait for them to finish, then retry
      // with whatever token they ended up setting (or fail the same way they did).
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
