import { describe, it, expect } from "vitest";
import { getSlaDeadline, isOverdue, canTransitionTo } from "./ticketRules";

describe("getSlaDeadline", () => {
  it("tinh dung han xu ly cho priority urgent (4 gio)", () => {
    const deadline = getSlaDeadline({ priority: "urgent", createdAt: "2026-01-01T00:00:00.000Z" });
    expect(deadline.toISOString()).toBe("2026-01-01T04:00:00.000Z");
  });

  it("tinh dung han xu ly cho priority low (168 gio)", () => {
    const deadline = getSlaDeadline({ priority: "low", createdAt: "2026-01-01T00:00:00.000Z" });
    expect(deadline.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });
});

describe("isOverdue", () => {
  it("tra ve false neu ticket da resolved du qua han", () => {
    const result = isOverdue(
      { priority: "urgent", createdAt: "2020-01-01T00:00:00.000Z", status: "resolved" },
      new Date("2026-01-01T00:00:00.000Z"),
    );
    expect(result).toBe(false);
  });

  it("tra ve true neu qua han va chua resolved/closed", () => {
    const result = isOverdue(
      { priority: "urgent", createdAt: "2026-01-01T00:00:00.000Z", status: "open" },
      new Date("2026-01-01T05:00:00.000Z"),
    );
    expect(result).toBe(true);
  });
});

describe("canTransitionTo", () => {
  it("cho phep open -> in_progress", () => {
    expect(canTransitionTo("open", "in_progress")).toBe(true);
  });

  it("KHONG cho phep closed -> bat ky trang thai nao", () => {
    expect(canTransitionTo("closed", "open")).toBe(false);
    expect(canTransitionTo("closed", "in_progress")).toBe(false);
  });
});
