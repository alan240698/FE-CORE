import type { NextConfig } from "next";
import { withBaseConfig } from "@archetype/next-config";

// cacheComponents/partialPrefetching are INTENTIONALLY left disabled - conflicts with
// Redux Toolkit's dev middleware (see apps/shell/next.config.ts and
// setup-tu-zero-archetype-frontend.md Step 15 for the full error details).
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
