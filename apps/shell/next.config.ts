import type { NextConfig } from "next";
import { withBaseConfig } from "@archetype/next-config";

// cacheComponents/partialPrefetching (Cache Components / PPR) are INTENTIONALLY left
// disabled - confirmed with a real build: they conflict with Redux Toolkit's dev
// middleware (immutableCheck calls Math.random() for its sampling check, which is
// forbidden during a static prerender). An internal, behind-auth dashboard app gets
// little benefit from PPR anyway (see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section
// 3.2), so it's turned off entirely instead of working around each error it causes.
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
