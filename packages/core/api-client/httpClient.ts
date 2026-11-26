/**
 * Simple fetch wrapper for places that CANNOT use an RTK Query hook (e.g. Server
 * Components, middleware, scripts). Most code should use RTK Query (injectEndpoints)
 * through packages/core/store/baseApi.ts instead - this is only for special cases.
 */
export async function httpClient<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}${path}`, {
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
