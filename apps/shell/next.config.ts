import type { NextConfig } from "next";
import { withBaseConfig } from "@archetype/next-config";

// cacheComponents/partialPrefetching (Cache Components / PPR) CO CHU DICH KHONG bat -
// da xac nhan that: xung dot voi Redux Toolkit dev middleware (immutableCheck dung
// Math.random() de sample-check, bi cam trong prerender tinh). Ung dung dashboard noi
// bo sau-dang-nhap it duoc loi tu PPR (xem nguyen-tac-code-fe-va-tai-lieu-cho-ai.md muc 3.2),
// nen tat han thay vi tim cach lach qua tung loi phat sinh.
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
