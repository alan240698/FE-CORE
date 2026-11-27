// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { render, screen, waitFor } from "@testing-library/react";
import { StoreProvider } from "../store/Provider";
import { useGetMenuQuery } from "./useMenu";

/**
 * Direct test for useMenu.ts's Zod validation (transformResponse) - same gap as
 * ticketApi.ts's own test file: this mechanism had 0 dedicated test proving it
 * actually REJECTS malformed data, only ever exercised indirectly via
 * apps/shell/app/components/Nav.test.tsx's happy-path + network-error cases (neither
 * of which is a schema-invalid JSON response) - see
 * audit-deep-codebase-2026-11-27.md finding #7.
 */
const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function MenuProbe() {
  const { data, isError } = useGetMenuQuery();
  if (isError) return <p role="alert">ERROR</p>;
  return <p>{data ? `OK:${data.length}` : "loading"}</p>;
}

describe("useMenu - getMenu Zod validation", () => {
  it("accepts a schema-valid response", async () => {
    server.use(
      http.get("*/me/menu", () => HttpResponse.json([{ label: "IT Ticket", path: "/it-ticket" }])),
    );

    render(
      <StoreProvider>
        <MenuProbe />
      </StoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("OK:1")).toBeInTheDocument();
    });
  });

  it("rejects a response missing a required field - surfaces as isError, not a silent pass-through", async () => {
    server.use(
      // Missing "path" - MenuItemSchema requires it.
      http.get("*/me/menu", () => HttpResponse.json([{ label: "IT Ticket" }])),
    );

    render(
      <StoreProvider>
        <MenuProbe />
      </StoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("ERROR");
    });
  });
});
