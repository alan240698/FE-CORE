import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useControllableState } from "./useControllableState";

describe("useControllableState", () => {
  describe("uncontrolled (no `value` passed)", () => {
    it("manages its own state, starting from defaultValue", () => {
      const { result } = renderHook(() => useControllableState({ defaultValue: "a" }));
      expect(result.current[0]).toBe("a");
    });

    it("updates its own state when setValue is called", () => {
      const { result } = renderHook(() => useControllableState({ defaultValue: "a" }));

      act(() => result.current[1]("b"));

      expect(result.current[0]).toBe("b");
    });

    it("still calls onChange even though state is self-managed", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useControllableState({ defaultValue: "a", onChange }));

      act(() => result.current[1]("b"));

      expect(onChange).toHaveBeenCalledWith("b");
    });
  });

  describe("controlled (`value` passed)", () => {
    it("always reflects the controlled `value`, ignoring defaultValue", () => {
      const { result } = renderHook(() =>
        useControllableState({ value: "controlled", defaultValue: "a" }),
      );
      expect(result.current[0]).toBe("controlled");
    });

    it("does NOT update its own state when setValue is called - the parent owns the value", () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        (props: { value: string }) =>
          useControllableState({ value: props.value, defaultValue: "a", onChange }),
        { initialProps: { value: "controlled" } },
      );

      act(() => result.current[1]("attempted-change"));

      // onChange fires (the parent is responsible for deciding whether to re-pass a
      // new `value`) ...
      expect(onChange).toHaveBeenCalledWith("attempted-change");
      // ... but without the parent re-rendering with a new `value`, the hook's own
      // output must NOT have silently changed - that would make it behave as
      // uncontrolled, defeating the entire point of this hook.
      expect(result.current[0]).toBe("controlled");

      rerender({ value: "controlled" });
      expect(result.current[0]).toBe("controlled");
    });
  });
});
