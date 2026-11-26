import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { apiBaseUrl } from "../api-client/apiBaseUrl";
import { setCredentials, clearCredentials } from "./authSlice";
import type { AuthState } from "./authSlice";
import type { AuthStrategy } from "./authStrategy";

/**
 * CLOSED - the mutex/401-retry sequence below is fixed for every auth strategy (see
 * authStrategy.ts). Do NOT inline a new auth mechanism here; write an AuthStrategy and
 * call createBaseQueryWithReauth(yourStrategy) instead.
 *
 * This file does NOT import from packages/core/store/index.ts to avoid a circular
 * import - it only uses the AuthState type from authSlice.ts itself.
 */
export function createBaseQueryWithReauth(
  strategy: AuthStrategy,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: apiBaseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) =>
      strategy.prepareHeaders(headers, getState() as { auth: AuthState }),
  });

  // A single mutex shared by every query/mutation that runs through this baseQuery.
  // Without it, N concurrent requests hitting 401 at the same time (e.g. a page that
  // fires several RTK Query hooks at once right when the access token expires) would
  // each independently trigger strategy.refresh() - a real race condition, not a
  // hypothetical one, and the exact in-app version of the cross-zone refresh race
  // already flagged in audit-best-practice-structure.md §1.5. This is RTK Query's own
  // official pattern for "automatic re-authorization", not a custom invention.
  // Confirmed with a real red/green test in authApi.test.ts: without this mutex, 3
  // concurrent 401s triggered 3 separate refresh calls instead of 1.
  const mutex = new Mutex();

  return async (args, api, extraOptions) => {
    // If another request is already refreshing, wait for it instead of racing it.
    await mutex.waitForUnlock();
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          // Re-check: another request may have already refreshed while we were
          // waiting to acquire the lock, in which case retrying with the already
          // up-to-date credential might succeed without needing a second refresh.
          result = await rawBaseQuery(args, api, extraOptions);
          if (result.error?.status === 401) {
            const refreshed = await strategy.refresh(rawBaseQuery, api, extraOptions);
            if (refreshed) {
              result = await rawBaseQuery(args, api, extraOptions);
            }
          }
        } finally {
          release();
        }
      } else {
        // Someone else is already refreshing - wait for them to finish, then retry
        // with whatever credential they ended up setting (or fail the same way they did).
        await mutex.waitForUnlock();
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }

    return result;
  };
}

/**
 * The ONLY auth strategy that exists today - cookie session + "act-jwt" Bearer token,
 * refreshed via POST /auth/refresh on the Laravel side. The ONLY place in the entire
 * FE that talks to that endpoint; other modules NEVER call it directly, they only
 * reuse this through core (see best-practice-structure.md).
 */
export const cookieJwtStrategy: AuthStrategy = {
  prepareHeaders(headers, state) {
    const token = state.auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },

  async refresh(rawBaseQuery, api) {
    const refreshResult = await rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, {});

    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data as { accessToken: string }));
      return true;
    }

    api.dispatch(clearCredentials());
    return false;
  },
};

export const baseQueryWithReauth = createBaseQueryWithReauth(cookieJwtStrategy);
