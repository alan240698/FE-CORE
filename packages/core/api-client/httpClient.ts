import { apiBaseUrl } from "./apiBaseUrl";

/**
 * Simple fetch wrapper for places that CANNOT use an RTK Query hook (e.g. Server
 * Components, middleware, scripts). Most code should use RTK Query (injectEndpoints)
 * through packages/core/store/baseApi.ts instead - this is only for special cases.
 *
 * IMPORTANT - NOT equivalent to the RTK Query path: this does NOT retry on 401 and does
 * NOT call /auth/refresh (see authApi.ts's baseQueryWithReauth) - it only forwards
 * whatever cookies/token the request already has via "credentials: include". Only use
 * this for endpoints that don't depend on the access token being auto-refreshed (e.g.
 * public, unauthenticated endpoints); for anything behind the JWT guard, use RTK Query
 * instead so a request made right as the token expires doesn't just fail outright.
 */
export async function httpClient<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`httpClient: ${response.status} ${response.statusText} - ${path}`);
  }

  return (await response.json()) as T;
}
