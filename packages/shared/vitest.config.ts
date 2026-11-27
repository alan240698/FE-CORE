import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// First real logic (useDebounce has timer behavior that needs red/green assertions,
// unlike Button/Table which only need visual verification via Storybook) - jsdom only
// because @testing-library/react's renderHook needs a DOM, same as every app's own
// vitest.config.ts.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", "storybook-static"],
  },
});
