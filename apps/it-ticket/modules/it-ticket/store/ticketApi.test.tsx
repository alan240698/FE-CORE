import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@archetype/test-utils";
import { useGetTicketsQuery } from "./ticketApi";

/**
 * Direct test for ticketApi.ts's Zod validation (transformResponse) - this exact
 * mechanism is the single most-emphasized safety net in this codebase's own audit
 * history (TS-NEW-1), yet had 0 dedicated test proving it actually REJECTS malformed
 * data at runtime (only manually verified once via a throwaway script, never
 * committed - see audit-deep-codebase-2026-11-27.md finding #7).
 */
const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function TicketsProbe() {
  const { data, isError } = useGetTicketsQuery();
  if (isError) return <p role="alert">ERROR</p>;
  return <p>{data ? `OK:${data.length}` : "loading"}</p>;
}

describe("ticketApi - getTickets Zod validation", () => {
  it("accepts a schema-valid response", async () => {
    server.use(
      http.get("*/tickets", () =>
        HttpResponse.json([
          {
            id: 1,
            title: "Mot ticket hop le",
            priority: "high",
            status: "open",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ]),
      ),
    );

    renderWithProviders(<TicketsProbe />);

    await waitFor(() => {
      expect(screen.getByText("OK:1")).toBeInTheDocument();
    });
  });

  it("rejects a response with an invalid enum value - surfaces as isError, not a silent pass-through", async () => {
    server.use(
      http.get("*/tickets", () =>
        HttpResponse.json([
          {
            id: 1,
            title: "Priority sai",
            priority: "not-a-real-priority",
            status: "open",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ]),
      ),
    );

    renderWithProviders(<TicketsProbe />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("ERROR");
    });
  });

  it("rejects a response with a malformed createdAt (not real ISO 8601)", async () => {
    server.use(
      http.get("*/tickets", () =>
        HttpResponse.json([
          {
            id: 1,
            title: "Ngay sai dinh dang",
            priority: "high",
            status: "open",
            createdAt: "not-a-date",
          },
        ]),
      ),
    );

    renderWithProviders(<TicketsProbe />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("ERROR");
    });
  });
});
