import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreakpoint } from "./useBreakpoint";

/**
 * jsdom does not implement `window.matchMedia` at all - every test in this file
 * provides its own minimal, real `MediaQueryList`-shaped mock (addEventListener/
 * removeEventListener + a way to fire a "change" event), not a loose stub, so the
 * hook's actual event-wiring code path is exercised, not just its initial read.
 */
function mockMatchMedia(initiallyMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches: initiallyMatches,
    media: "",
    addEventListener: (_: "change", listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_: "change", listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
  };

  const fireChange = (matches: boolean) => {
    mql.matches = matches;
    listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
  };

  return { mql, fireChange, listenerCount: () => listeners.size };
}

describe("useBreakpoint", () => {
  let matchMediaSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaSpy = vi.fn();
    vi.stubGlobal("matchMedia", matchMediaSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // NOTE: `renderHook` (React Testing Library) wraps its initial render in `act()`,
  // which flushes effects SYNCHRONOUSLY before returning - unlike a real browser,
  // where React hydrates against the server-rendered HTML first and only runs effects
  // afterward. So this test harness cannot observe the pre-effect "false" tick the
  // way a real hydration pass would; that guarantee is structural instead (the
  // `useState(false)` initializer never reads `window`/`matchMedia` - see
  // useBreakpoint.ts's own doc comment) and is reviewed at the source, not asserted
  // here. What IS tested below is the part that both environments share: the value is
  // read via matchMedia inside an effect, with the correct query, and stays in sync.

  it("corrects to the real value right after mount (post-effect)", async () => {
    const { mql } = mockMatchMedia(true);
    matchMediaSpy.mockReturnValue(mql);

    const { result } = renderHook(() => useBreakpoint("md"));

    await act(async () => {});

    expect(matchMediaSpy).toHaveBeenCalledWith("(min-width: 768px)");
    expect(result.current).toBe(true);
  });

  it("updates when the viewport crosses the breakpoint (resize)", async () => {
    const { mql, fireChange } = mockMatchMedia(false);
    matchMediaSpy.mockReturnValue(mql);

    const { result } = renderHook(() => useBreakpoint("lg"));
    await act(async () => {});
    expect(result.current).toBe(false);

    act(() => {
      fireChange(true);
    });
    expect(result.current).toBe(true);
  });

  it("removes its listener on unmount (no leak)", async () => {
    const { mql, listenerCount } = mockMatchMedia(false);
    matchMediaSpy.mockReturnValue(mql);

    const { unmount } = renderHook(() => useBreakpoint("sm"));
    await act(async () => {});
    expect(listenerCount()).toBe(1);

    unmount();
    expect(listenerCount()).toBe(0);
  });
});
