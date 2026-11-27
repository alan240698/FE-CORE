"use client";

import { useEffect, useState } from "react";

/**
 * Delays reflecting a fast-changing value until it stops changing for `delayMs` - the
 * standard pattern for a search/filter input (debounce the VALUE, not the keystroke
 * handler), so a request/expensive computation only fires once the user pauses typing
 * instead of on every keystroke.
 *
 * SSR-safe: no `window`/`document` access, pure React state + effect, works the same
 * on server and client (the effect simply never fires during SSR, same as any other
 * `useEffect`).
 *
 * `"use client"` is REQUIRED on this file, confirmed by a real build error: Next.js's
 * bundler rejects `useState`/`useEffect` by REACHABILITY from `packages/shared/index.ts`
 * (the single barrel), not by whether a Server Component actually calls this hook -
 * same class of error documented on `packages/core/server.ts`, but the fix here is
 * just this directive (a client-only React hook, not a server-only Next.js API), not
 * a second entry point.
 *
 * STATUS (2026-11-27): 0 real consumer in apps/ yet - only this file's own test. Built
 * ahead of a concrete UI need (see docs/fe-modular/audit-hooks-helpers-foundation-
 * 2026-11-27.md mục G.1 in the archetype-intranet-new repo) because debounce is a
 * stable, industry-standard shape with near-zero risk of guessing the API wrong, and
 * is the single most likely NEXT real need (a text search input). TRIGGER to wire up a
 * real consumer: a search/filter TEXT input appears anywhere (the current status
 * filter is an instant `<select>`, not debounced). If a 2nd hook is added in this same
 * unconsumed state without a plan, stop and reconsider - this is the "dead
 * abstraction" pattern (D-9 finding) this repo has already had to clean up twice.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
