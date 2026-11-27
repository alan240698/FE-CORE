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
