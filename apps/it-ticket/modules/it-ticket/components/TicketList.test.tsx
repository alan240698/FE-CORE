import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@archetype/test-utils";
import { handlers } from "../mocks/handlers";
import { ticketReducer } from "../store/ticketSlice";
import { TICKETS_PATH } from "../store/ticketApi";
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

  // Dogfoods the feature-flags.config.ts mechanism end-to-end (see
  // apps/it-ticket/modules/it-ticket/featureFlags.ts) - a flag with no real consumer
  // reading it would be the same dead-abstraction pattern this project keeps removing.
  it("hides the status filter entirely when its feature flag is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_TICKET_STATUS_FILTER", "false");

    renderWithProviders(<TicketList />, { ticket: ticketReducer });

    await waitFor(() => {
      expect(screen.getByText(/May in khong hoat dong/)).toBeInTheDocument();
    });

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    // Both tickets still show - the flag only hides the filter control, it never
    // changes what data is fetched.
    expect(screen.getByText(/Khong vao duoc VPN/)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  // Was previously untested here (asymmetric with Nav.test.tsx, which already has this
  // exact case for useGetMenuQuery) despite TicketList.tsx having the same isError
  // branch - see audit-deep-codebase-2026-11-27.md finding #8.
  it("shows an error message when the ticket request fails", async () => {
    server.use(http.get(`*${TICKETS_PATH}`, () => HttpResponse.error()));

    renderWithProviders(<TicketList />, { ticket: ticketReducer });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Khong tai duoc");
    });
  });

  // Distinct 4th state (loading/error/success/empty) - previously a 0-row result
  // silently rendered an empty table with no explanation (see
  // audit-deep-codebase-2026-11-27.md finding #4/#8).
  it("shows an empty-state message when the backend returns 0 tickets", async () => {
    server.use(http.get(`*${TICKETS_PATH}`, () => HttpResponse.json([])));

    renderWithProviders(<TicketList />, { ticket: ticketReducer });

    await waitFor(() => {
      expect(screen.getByText("Khong co ticket nao")).toBeInTheDocument();
    });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
