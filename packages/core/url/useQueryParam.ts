"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { z } from "zod";

/**
 * Type-safe read/write for ONE URL query param.
 *
 * Query params are EXTERNAL input - a user can hand-edit, bookmark, or share the URL -
 * so they go through the same Zod-validation discipline as every other boundary in
 * this repo (environments.config.ts, feature-flags.config.ts, API responses - see
 * docs/HANDBOOK.md mục 4). Uses `safeParse` + fallback to `defaultValue`, NOT
 * `parse`/throw - unlike a backend contract violation, a malformed query param is
 * routine, recoverable user tampering (same precedent as authApi.ts's refresh-
 * response handling: a broken external value degrades gracefully, it doesn't crash
 * the page).
 *
 * basePath-safe BY CONSTRUCTION, not by caution: `usePathname()` returns the path
 * WITHOUT the module's own basePath - confirmed empirically against a real built
 * `output: "standalone"` server (not assumed from docs - see
 * docs/fe-modular/audit-hooks-helpers-foundation-2026-11-27.md for the verification),
 * and `router.push()` re-adds it automatically. This hook never needs to know or
 * touch the module's own basePath, unlike a hand-written `<a href>`/`window.location`
 * (exactly the mistake `packages/eslint-config/no-hardcoded-paths.js` exists to
 * block).
 *
 * Scoped to scalar values only (string/number/enum/boolean via Zod's `coerce`/`enum`)
 * - does not attempt generic object/array serialization into the query string; that's
 * a different, harder problem with no real use case yet in this repo - solve it when
 * it's real, not speculatively.
 */
export function useQueryParam<T>(
  key: string,
  schema: z.ZodType<T>,
  defaultValue: T,
): [T, (value: T | undefined) => void] {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const raw = searchParams.get(key);
  const parsed = raw === null ? undefined : schema.safeParse(raw);
  const value = parsed?.success ? parsed.data : defaultValue;

  const setValue = useCallback(
    (next: T | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(next));
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [key, pathname, router, searchParams],
  );

  return [value, setValue];
}
