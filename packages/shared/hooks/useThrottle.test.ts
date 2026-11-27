import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThrottle } from "./useThrottle";

describe("useThrottle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("still returns the initial value right after a change, before the interval elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    expect(result.current).toBe("a");
  });

  it("updates once the interval elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("b");
  });

  it("never updates more than once per interval - by t=100 only the LAST value ('d') appears", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" }); // t=0, schedules an update for t=100
    act(() => {
      vi.advanceTimersByTime(30); // t=30
    });
    rerender({ value: "c" }); // re-targets ~t=100 with "c"
    act(() => {
      vi.advanceTimersByTime(30); // t=60
    });
    rerender({ value: "d" }); // re-targets ~t=100 with "d"

    act(() => {
      vi.advanceTimersByTime(40); // t=100
    });
    expect(result.current).toBe("d");
  });

  it("cancels the STALE pending timer on every re-render within the same window - exactly 1 timer is ever pending, not 1 per rerender", () => {
    // This is what the previous test's final-value check cannot prove on its own:
    // React 18 auto-batches every setState that fires within the same
    // vi.advanceTimersByTime() tick, so even WITHOUT clearTimeout, 3 stale timers all
    // targeting the same t=100 would still collapse to the same end result ("d") -
    // the bug clearTimeout prevents is 3 pending timers instead of 1, not a wrong
    // final value in this specific scenario. vi.getTimerCount() checks the thing that
    // actually distinguishes "cleaned up" from "not cleaned up".
    const { rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    expect(vi.getTimerCount()).toBe(1);

    rerender({ value: "c" });
    expect(vi.getTimerCount()).toBe(1);

    rerender({ value: "d" });
    expect(vi.getTimerCount()).toBe(1);
  });

  it("clears the pending timer on unmount", () => {
    const { rerender, unmount } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }).not.toThrow();
  });
});
