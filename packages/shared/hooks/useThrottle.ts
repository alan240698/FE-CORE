"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Updates the returned value AT MOST once per `intervalMs`, unlike `useDebounce`
 * (which waits for the value to stop changing entirely). The companion of
 * `useDebounce` for the other half of the Performance problem: a value that changes
 * continuously (scroll position, live progress) and should still update periodically,
 * not just once at the end.
 *
 * `"use client"` for the same reason as `useDebounce.ts` - a barrel-reachability
 * build error, not a runtime one (see that file's doc comment).
 *
 * STATUS (2026-11-27): 0 real consumer in apps/ yet - only this file's own test. Built
 * ahead of a concrete UI need (see docs/fe-modular/audit-hooks-helpers-foundation-
 * 2026-11-27.md mục G.1). TRIGGER to wire up a real consumer: a real scroll-position,
 * resize, or other continuously-firing event handler appears (none exists today). If
 * no such handler appears within a reasonable time, consider removing this file rather
 * than letting it sit unconsumed indefinitely - see
 * audit-architecture-security-review-2026-11-27.md, finding A7.
 */
export function useThrottle<T>(value: T, intervalMs: number): T {
  const [throttled, setThrottled] = useState(value);
  const lastRanAt = useRef(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - lastRanAt.current;
    const remaining = intervalMs - elapsed;

    if (remaining <= 0) {
      lastRanAt.current = Date.now();
      setThrottled(value);
      return;
    }

    const timer = setTimeout(() => {
      lastRanAt.current = Date.now();
      setThrottled(value);
    }, remaining);

    return () => clearTimeout(timer);
  }, [value, intervalMs]);

  return throttled;
}
