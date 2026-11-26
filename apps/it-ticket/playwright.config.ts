import { defineConfig, devices } from "@playwright/test";

const PORT = 3101;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    // Must match the real route - this app now serves everything under its
    // "/it-ticket" basePath (see base-path.generated.js), so the root "/" 404s.
    url: `http://localhost:${PORT}/it-ticket`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
