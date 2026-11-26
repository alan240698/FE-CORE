import { describe, it, expect } from "vitest";
import { getSlaDeadline, isOverdue, canTransitionTo } from "./ticketRules";

describe("getSlaDeadline", () => {
  it("computes the correct SLA deadline for urgent priority (4 hours)", () => {
    const deadline = getSlaDeadline({ priority: "urgent", createdAt: "2026-01-01T00:00:00.000Z" });
    expect(deadline.toISOString()).toBe("2026-01-01T04:00:00.000Z");
  });

  it("computes the correct SLA deadline for low priority (168 hours)", () => {
    const deadline = getSlaDeadline({ priority: "low", createdAt: "2026-01-01T00:00:00.000Z" });
    expect(deadline.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });
});

describe("isOverdue", () => {
  it("returns false for an already-resolved ticket even if past its deadline", () => {
    const result = isOverdue(
      { priority: "urgent", createdAt: "2020-01-01T00:00:00.000Z", status: "resolved" },
      new Date("2026-01-01T00:00:00.000Z"),
    );
    expect(result).toBe(false);
  });

  it("returns true when past the deadline and not yet resolved/closed", () => {
    const result = isOverdue(
      { priority: "urgent", createdAt: "2026-01-01T00:00:00.000Z", status: "open" },
      new Date("2026-01-01T05:00:00.000Z"),
    );
    expect(result).toBe(true);
  });
});

describe("canTransitionTo", () => {
  it("allows open -> in_progress", () => {
    expect(canTransitionTo("open", "in_progress")).toBe(true);
  });

  it("does NOT allow closed -> any other status", () => {
    expect(canTransitionTo("closed", "open")).toBe(false);
    expect(canTransitionTo("closed", "in_progress")).toBe(false);
  });
});
