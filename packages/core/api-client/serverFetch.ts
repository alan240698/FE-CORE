import { cookies } from "next/headers";
import type { z } from "zod";
import { apiBaseUrl } from "./apiBaseUrl";

/**
 * Fetch helper for Server Components - the one case RTK Query genuinely cannot cover,
 * since no React context/hooks exist during server rendering (confirmed: Redux
 * Toolkit's own official Next.js App Router guidance says RSCs must not read or write
 * the store - see redux.js.org/usage/nextjs). Forwards the incoming request's cookies
 * manually - Next.js's fetch() does NOT do this automatically inside a Server
 * Component.
 *
 * Calling next/headers's cookies() makes the calling route dynamic (opts out of static
 * generation) - this is the CORRECT trade-off for data that varies per logged-in user,
 * not a regression to work around: shipping real, personalized data in the initial
 * HTML on every request is still faster to first content than a static empty shell
 * that waits for a client-side fetch after hydration.
 *
 * Deliberately does NOT retry on 401 or call /auth/refresh - there is no client-side
 * mutex/session to coordinate with mid-request on the server (see
 * packages/core/auth/authApi.ts's createBaseQueryWithReauth, which only runs in the
 * browser). On ANY failure, returns `fallback` - every consumer MUST treat this
 * function's result as a fallback/placeholder for the client-side RTK Query hook that
 * mounts right after (which DOES retry/refresh), never as the sole source of truth.
 *
 * This fills the exact gap httpClient.ts was removed for in this same session (zero
 * real consumer, unverified shape) - this time with a real consumer from the start
 * (apps/it-ticket/app/page.tsx), per packages/core/CLAUDE.md's own documented rule for
 * when it's OK to re-add this kind of helper.
 *
 * `schema` is REQUIRED, not optional - every other API boundary in this repo validates
 * via Zod (ticketApi.ts, useMenu.ts, authApi.ts's refresh); this function used to be
 * the one exception (a bare `as T` cast), found independently by 3 separate audit
 * passes in the same review (see audit-deep-codebase-2026-11-27.md). `safeParse`, not
 * `parse` - a malformed SSR response degrades to `fallback` (the client-side RTK Query
 * hook that mounts right after takes over regardless, per the doc comment above),
 * it must never crash the whole page render.
 */
export async function serverFetch<T>(path: string, fallback: T, schema: z.ZodType<T>): Promise<T> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!response.ok) return fallback;

    const raw: unknown = await response.json();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      console.error(`serverFetch(${path}) response failed validation:`, parsed.error);
      return fallback;
    }
    return parsed.data;
  } catch (err) {
    // Swallowing is intentional (see doc comment above - the client-side RTK Query
    // hook takes over regardless), but silently swallowing is NOT the same as hiding
    // the failure from logs - log it so a real backend outage is still visible.
    console.error(`serverFetch(${path}) failed:`, err);
    return fallback;
  }
}
