import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@archetype/test-utils";
import { UserStatus } from "./UserStatus";

describe("UserStatus", () => {
  it("shows the guest fallback when there is no logged-in user", () => {
    renderWithProviders(<UserStatus />);

    expect(screen.getByText(/Xin chao, Khach/)).toBeInTheDocument();
  });
});
