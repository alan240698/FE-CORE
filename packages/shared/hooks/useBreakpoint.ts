"use client";

import { useEffect, useState } from "react";

// Matches Tailwind v4's own DEFAULT breakpoint scale exactly (packages/tailwind-config
// doesn't override these - see theme.css) - this is the SAME breakpoint set every
// `sm:`/`md:`/`lg:`/`xl:` class in this repo already uses, not an invented scale.
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Whether the viewport is AT LEAST `breakpoint` wide - for RENDER logic (mount/unmount
 * a different component entirely), not styling (Tailwind's own `sm:`/`md:`/... classes
 * already handle every purely-visual responsive case with zero JS, see
 * docs/HANDBOOK.md mục 10 - reach for this hook only when the decision is which
 * COMPONENT to render, not how to style one).
 *
 * SSR-safe BY DESIGN, not by accident: always starts `false` (matching what the
 * server rendered - there is no viewport yet) and only corrects itself in an effect,
 * AFTER mount. This means the very first client paint intentionally shows the "narrow"
 * result for one tick, even on a wide screen - the deliberate, standard trade-off
 * that avoids a hydration mismatch (see the original hooks-catalog brief's own
 * warning: "không tạo các browser hooks đọc window ngay trong quá trình render mà
 * không có chiến lược SSR" - reading `window.matchMedia` during the INITIAL render,
 * before mount, is exactly what this avoids).
 *
 * STATUS (2026-11-27): 0 real consumer in apps/ yet - only this file's own test.
 * TRIGGER to wire up a real consumer: a component needs to mount/unmount a genuinely
 * DIFFERENT subtree based on viewport width (not just restyle one) - e.g. a mobile
 * hamburger nav replacing `Nav.tsx`'s current always-visible link list. If no such
 * need appears within a reasonable time, consider removing this file rather than
 * letting it sit unconsumed indefinitely - see
 * audit-architecture-security-review-2026-11-27.md, finding A7.
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
