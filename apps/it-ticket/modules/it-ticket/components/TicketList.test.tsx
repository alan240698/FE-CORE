import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { handlers } from "../mocks/handlers";
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
    renderWithProviders(<TicketList />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/May in khong hoat dong/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Khong vao duoc VPN/)).toBeInTheDocument();
  });
});
