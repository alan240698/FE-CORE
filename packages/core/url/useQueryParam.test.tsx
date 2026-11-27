// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { z } from "zod";
import { useQueryParam } from "./useQueryParam";

const pushMock = vi.fn();
let searchParamsValue = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/tickets",
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParamsValue,
}));

const StatusSchema = z.enum(["all", "open"]);

describe("useQueryParam", () => {
  beforeEach(() => {
    pushMock.mockClear();
    searchParamsValue = new URLSearchParams();
  });

  it("returns the default value when the param is absent", () => {
    const { result } = renderHook(() => useQueryParam("status", StatusSchema, "all"));
    expect(result.current[0]).toBe("all");
  });

  it("parses a present, valid param", () => {
    searchParamsValue = new URLSearchParams("status=open");
    const { result } = renderHook(() => useQueryParam("status", StatusSchema, "all"));
    expect(result.current[0]).toBe("open");
  });

  it("falls back to the default when the param fails validation (user-tampered URL), instead of throwing", () => {
    searchParamsValue = new URLSearchParams("status=not-a-real-status");
    const { result } = renderHook(() => useQueryParam("status", StatusSchema, "all"));
    expect(result.current[0]).toBe("all");
  });

  it("pushes the new value into the URL WITHOUT basePath, preserving other params", () => {
    searchParamsValue = new URLSearchParams("foo=bar");
    const { result } = renderHook(() => useQueryParam("status", StatusSchema, "all"));

    act(() => result.current[1]("open"));

    expect(pushMock).toHaveBeenCalledWith("/tickets?foo=bar&status=open", { scroll: false });
  });

  it("removes the param from the URL when set to undefined", () => {
    searchParamsValue = new URLSearchParams("status=open&foo=bar");
    const { result } = renderHook(() => useQueryParam("status", StatusSchema, "all"));

    act(() => result.current[1](undefined));

    expect(pushMock).toHaveBeenCalledWith("/tickets?foo=bar", { scroll: false });
  });
});
