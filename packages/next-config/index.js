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
      // CSP is intentionally permissive on 'unsafe-inline' for script/style - Next.js
      // App Router embeds inline hydration/flight-data scripts with no nonce wiring in
      // this codebase yet, so a strict CSP would break every page. This is still a real
      // second line of defense (blocks third-party script/iframe injection, restricts
      // connect-src to our own API), just not maximally strict - tightening to
      // nonce-based CSP is a separate, larger follow-up (see audit roadmap P2).
      // connect-src hardcodes the API origin the same way apps/*/.env.example does -
      // see the audit's CFG-1 finding about centralizing this into one config source.
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.archetype-group.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");

      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Content-Security-Policy", value: csp },
            // No "preload" - that requires submitting the domain to browsers' HSTS
            // preload list, which is effectively irreversible. includeSubDomains is
            // safe here since every known subdomain (api.archetype-group.com, any
            // "standalone" zone module) is HTTPS-only already.
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains",
            },
            {
              key: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=()",
            },
          ],
        },
      ];
    },
    ...config,
    transpilePackages: [...baseTranspilePackages, ...(config.transpilePackages ?? [])],
  };
}

module.exports = { withBaseConfig };
