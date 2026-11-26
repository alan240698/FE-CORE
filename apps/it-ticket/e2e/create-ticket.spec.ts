import { test, expect } from "@playwright/test";

/**
 * Critical-path test (per the project's minimal-E2E policy - see
 * nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 4.5): exactly 1 smoke test for
 * cross-zone JWT login/redirect, plus 1 critical-path test per newly-migrated module's
 * core write/read action - not full coverage of every screen.
 *
 * NOTE: the cross-zone login smoke test is intentionally NOT implemented yet - there is
 * no real shell<->it-ticket navigation or cookie-based auth wired up in this repo so
 * far (see CLAUDE.md "Known pending item"). Add it once that flow actually exists;
 * writing a fake test against a flow that doesn't exist would be worse than no test.
 *
 * Mocks the backend API via page.route() (no real Laravel backend running in this
 * environment) - this is the Playwright-native equivalent of MSW used in the Vitest
 * component tests.
 */
test("loads and displays the ticket list from the API", async ({ page }) => {
  await page.route("**/tickets", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 1,
          title: "Printer not working",
          priority: "high",
          status: "open",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    }),
  );

  // basePath is "/it-ticket" (see base-path.generated.js) - the app has no route at "/".
  await page.goto("/it-ticket");

  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByText("Printer not working")).toBeVisible();
});
