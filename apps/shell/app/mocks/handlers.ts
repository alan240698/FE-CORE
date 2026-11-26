import { http, HttpResponse } from "msw";

// Moved out of Nav.test.tsx into its own file, matching the established convention
// (see apps/it-ticket/modules/it-ticket/mocks/handlers.ts) - MSW handlers always live in
// a dedicated mocks/ file, never inline in a test, so they stay reusable and the test
// file itself only reads as test logic.
export const handlers = [
  http.get("*/me/menu", () =>
    HttpResponse.json([
      { label: "IT Ticket", path: "/it-ticket" },
      { label: "HRM", path: "/hrm" },
    ]),
  ),
];
