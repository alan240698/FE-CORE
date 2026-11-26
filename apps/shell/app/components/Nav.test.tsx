import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@archetype/shared";
import { Nav } from "./Nav";

// Dogfooding useGetMenuQuery (packages/core/menu/useMenu.ts) with a real consumer -
// before this test, 0 app actually called it, so its request/response shape had never
// been exercised (see audit-nextjs-core-principal-architect-2026-11-26.md, finding D-9).
const handlers = [
  http.get("*/me/menu", () =>
    HttpResponse.json([
      { label: "IT Ticket", path: "/it-ticket" },
      { label: "HRM", path: "/hrm" },
    ]),
  ),
];
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Nav", () => {
  it("renders menu links after loading from the API (via MSW)", async () => {
    renderWithProviders(<Nav />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "IT Ticket" })).toHaveAttribute("href", "/it-ticket");
    });

    expect(screen.getByRole("link", { name: "HRM" })).toHaveAttribute("href", "/hrm");
  });

  it("shows an error message when the menu request fails", async () => {
    server.use(http.get("*/me/menu", () => HttpResponse.error()));

    renderWithProviders(<Nav />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Khong tai duoc menu");
    });
  });
});
