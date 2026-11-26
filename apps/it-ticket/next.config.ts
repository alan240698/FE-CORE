import type { NextConfig } from "next";
import { withBaseConfig } from "@archetype/next-config";

// cacheComponents/partialPrefetching CO CHU DICH khong bat - xung dot that voi Redux
// Toolkit dev middleware (xem apps/shell/next.config.ts va setup-tu-zero-archetype-frontend.md
// Buoc 15 de biet chi tiet loi da gap).
const nextConfig: NextConfig = withBaseConfig({
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
});

export default nextConfig;
