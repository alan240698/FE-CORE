import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Default environment stays "node" (reducers + RTK Query baseQuery logic need no DOM) -
// url/useQueryParam.test.tsx opts into jsdom itself via a "// @vitest-environment
// jsdom" docblock, since it renders a hook with @testing-library/react. Vitest runs
// each test file in its own environment when a file overrides it this way.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules"],
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000",
    },
  },
});
