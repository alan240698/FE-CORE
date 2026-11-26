import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e"],
    // Vitest does NOT automatically read .env.local like the Next.js runtime does -
    // must set it here explicitly; needs a valid absolute URL so fetch() doesn't throw
    // "Invalid URL" before the request ever reaches MSW.
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000",
    },
  },
});
