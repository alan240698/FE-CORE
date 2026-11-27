import type { z } from "zod";

/**
 * Zod validation wrapper for RTK Query's `transformResponse` - logs WHY before
 * rethrowing, instead of letting `schema.parse()` throw silently.
 *
 * RTK Query already catches a `transformResponse` throw internally and marks the
 * resulting query error `isUnhandledError: true` (confirmed by reading
 * `@reduxjs/toolkit`'s own query type defs, not assumed) - so the app never crashes
 * either way. But without this, a real backend contract break (renamed/removed field,
 * wrong enum value) printed NOTHING anywhere, indistinguishable from an ordinary
 * network failure - see audit-deep-codebase-2026-11-27.md's Error Handling + Code
 * Quality findings (both independently flagged this).
 *
 * `context` is a short label (the endpoint name) for the log line, not a generic
 * message - so a real failure is actually findable in logs, not just "something
 * failed somewhere".
 */
export function parseApiResponse<T>(schema: z.ZodType<T>, raw: unknown, context: string): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error(`${context} response failed validation:`, parsed.error);
    throw parsed.error;
  }
  return parsed.data;
}
