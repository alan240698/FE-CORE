/**
 * Base Next.js config shared by EVERY app (shell and each module).
 * Each app calls withBaseConfig({...its own overrides}) in its own next.config.ts/js.
 *
 * NOTE: this is a simple shallow merge (spread "...config" comes after) - if an app
 * declares its own "headers()", it will COMPLETELY OVERWRITE headers() here, not merge
 * with it. Acceptable at the current scale (apps rarely need their own headers) -
 * documented here to avoid the false assumption that this is a deep-merge.
 *
 * "transpilePackages" SPECIFICALLY IS MERGED as an array (never overwritten) - the
 * internal @archetype/* packages ship raw TypeScript (not pre-built), so any app that
 * imports them must transpile them, so this list must always be present regardless of
 * what the app declares on top.
 *
 * @param {import('next').NextConfig} [config]
 * @returns {import('next').NextConfig}
 */
function withBaseConfig(config = {}) {
  const baseTranspilePackages = ["@archetype/env-schema", "@archetype/core", "@archetype/shared"];

  return {
    output: "standalone",
    images: {
      remotePatterns: [],
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          ],
        },
      ];
    },
    ...config,
    transpilePackages: [...baseTranspilePackages, ...(config.transpilePackages ?? [])],
  };
}

module.exports = { withBaseConfig };
