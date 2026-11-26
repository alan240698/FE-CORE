import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e"],
    // Vitest KHONG tu doc .env.local nhu Next.js runtime - phai set rieng o day,
    // can URL tuyet doi hop le de fetch() khong nem "Invalid URL" truoc khi toi duoc MSW.
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000",
    },
  },
});
