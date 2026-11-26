/**
 * Fetch wrapper don gian cho noi KHONG dung duoc RTK Query hook (vd Server Component,
 * middleware, script). Phan lon code nen dung RTK Query (injectEndpoints) qua
 * packages/core/store/baseApi.ts - file nay chi danh cho truong hop dac biet.
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
