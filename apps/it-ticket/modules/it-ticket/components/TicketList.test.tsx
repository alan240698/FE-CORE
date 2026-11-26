import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { handlers } from "../mocks/handlers";
import { TicketList } from "./TicketList";

// MSW chan request mang that - KHONG mock Redux store/RTK Query noi bo (xem
// nguyen-tac-code-fe-va-tai-lieu-cho-ai.md muc 3.3 - redux-mock-store khong dung duoc
// voi RTK Query vi khong co reducer that).
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("TicketList", () => {
  it("hien thi danh sach ticket sau khi tai xong tu API (qua MSW)", async () => {
    renderWithProviders(<TicketList />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/May in khong hoat dong/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Khong vao duoc VPN/)).toBeInTheDocument();
  });
});
