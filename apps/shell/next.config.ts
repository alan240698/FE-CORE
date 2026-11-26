import type { NextConfig } from "next";
import { withBaseConfig } from "@archetype/next-config";

const nextConfig: NextConfig = withBaseConfig({
  cacheComponents: true,
  partialPrefetching: true,
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
