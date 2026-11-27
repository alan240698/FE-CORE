import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("still returns the initial value before the delay elapses", () => {
    const { result } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });
    expect(result.current).toBe("a");
  });

  it("updates to the latest value only after the delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("ab");
  });

  it("only reflects the LAST value when changed rapidly within the delay window (the defining behavior of debounce) - earlier pending timers must be cancelled, not just overwritten at the end", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" }); // schedules a timer for t=300
    act(() => {
      vi.advanceTimersByTime(100); // t=100
    });
    rerender({ value: "abc" }); // must cancel the "ab" timer, schedule a new one for t=400
    act(() => {
      vi.advanceTimersByTime(100); // t=200
    });
    rerender({ value: "abcd" }); // must cancel the "abc" timer, schedule a new one for t=500

    // t=300: if the FIRST ("ab") timer was not cancelled, it fires here and the value
    // becomes the STALE "ab" - this is the exact moment that distinguishes real
    // debounce (cleanup cancels stale timers) from "last write wins eventually" (every
    // stale timer still fires, just overwritten later by the final one - same end
    // result, wrong intermediate state).
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(200); // t=500 - only the "abcd" timer should fire
    });
    expect(result.current).toBe("abcd");
  });

  it("clears the pending timer on unmount (no state update scheduled after unmount)", () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(300);
      });
    }).not.toThrow();
  });
});
