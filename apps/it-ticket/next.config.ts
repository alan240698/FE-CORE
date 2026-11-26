import type { NextConfig } from "next";
import { withBaseConfig } from "@archetype/next-config";
// Generated from modules.config.ts by scripts/generate-infra.ts - run
// `pnpm run generate-infra` after changing which modules exist, never edit the
// generated file by hand. REQUIRED for Next.js Multi-Zones - see generate-infra.ts's
// module doc comment for why (shell's rewrite proxies this module's own basePath).
import generatedBasePath from "./base-path.generated.js";

// cacheComponents/partialPrefetching are INTENTIONALLY left disabled - conflicts with
// Redux Toolkit's dev middleware (see apps/shell/next.config.ts and
// setup-tu-zero-archetype-frontend.md Step 15 for the full error details).
const nextConfig: NextConfig = withBaseConfig({
  basePath: generatedBasePath,
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
