import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@archetype/test-utils";
import { handlers } from "../mocks/handlers";
import { ticketReducer } from "../store/ticketSlice";
import { TicketList } from "./TicketList";

// MSW intercepts real network requests - does NOT mock the Redux store/RTK Query
// internals (see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 3.3 -
// redux-mock-store doesn't work with RTK Query since there's no real reducer).
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("TicketList", () => {
  it("renders the ticket list after it finishes loading from the API (via MSW)", async () => {
    renderWithProviders(<TicketList />, { ticket: ticketReducer });

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/May in khong hoat dong/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Khong vao duoc VPN/)).toBeInTheDocument();
  });

  // Dogfoods ticketSlice's statusFilter with a real consumer - previously wired into
  // the store (proving the Open/Closed extraReducers mechanism works) but never read
  // or dispatched by any component (see
  // audit-nextjs-core-principal-architect-2026-11-26.md, finding D-9/TEST-3).
  it("filters the list by status when a status is selected", async () => {
    renderWithProviders(<TicketList />, { ticket: ticketReducer });

    await waitFor(() => {
      expect(screen.getByText(/May in khong hoat dong/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Khong vao duoc VPN/)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "open" } });

    expect(screen.getByText(/May in khong hoat dong/)).toBeInTheDocument();
    expect(screen.queryByText(/Khong vao duoc VPN/)).not.toBeInTheDocument();
  });
});
