import { defineConfig } from "vitest/config";

// No React rendering needed for core's own tests (reducers + RTK Query baseQuery
// logic) - plain "node" environment is enough, no jsdom required here.
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules"],
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000",
    },
  },
});
