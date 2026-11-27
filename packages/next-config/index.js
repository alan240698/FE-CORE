/**
 * Base Next.js config shared by EVERY app (shell and each module).
 * Each app calls withBaseConfig({...its own overrides}) in its own next.config.ts/js.
 *
 * This is mostly a shallow merge (spread "...config" comes after), EXCEPT for 2 fields
 * that are deliberately merged instead of overwritten, because silently losing either
 * one is a real security/build footgun, not just a style preference:
 *   - "headers" - see mergeHeaders() below. An app defining its own headers() used to
 *     completely replace these 3 security headers + CSP/HSTS/Permissions-Policy with
 *     no warning.
 *   - "transpilePackages" - the internal @archetype/* packages ship raw TypeScript (not
 *     pre-built), so any app that imports them must transpile them; this list must
 *     always be present regardless of what the app declares on top.
 *
 * @param {import('next').NextConfig} [config]
 * @returns {import('next').NextConfig}
 */
function withBaseConfig(config = {}) {
  const baseTranspilePackages = ["@archetype/env-schema", "@archetype/core", "@archetype/shared"];
  // Pulled out of `config` so the later "...restConfig" spread can never put a raw,
  // unmerged "headers" function back into the returned object.
  const { headers: appHeaders, ...restConfig } = config;

  async function baseHeaders() {
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
        // "/:path*" (Next.js's named catch-all syntax), NOT "/(.*)" (raw regex) - with
        // a basePath set, Next.js auto-prefixes "source" with it, so "/(.*)" becomes
        // "/<basePath>/(.*)" which requires a literal "/" before the capture group.
        // A request for the basePath's own root (e.g. "/it-ticket", no trailing
        // segment) then does NOT match, so the static root page for every "internal"
        // module silently got NONE of these headers (confirmed for real: curl -I
        // showed every OTHER route under that basePath had them, only the root
        // didn't). "/:path*" handles the zero-segment case correctly.
        source: "/:path*",
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
  }

  /**
   * Merges the base security headers with an app's own headers() (if any), by
   * "source" path - an app adding headers for the SAME source gets them appended to
   * the base set (never replacing it); a different source is added as its own entry.
   */
  async function mergeHeaders() {
    const base = await baseHeaders();
    if (!appHeaders) return base;

    const merged = base.map((entry) => ({ ...entry, headers: [...entry.headers] }));
    for (const entry of await appHeaders()) {
      const existing = merged.find((e) => e.source === entry.source);
      if (existing) {
        existing.headers.push(...entry.headers);
      } else {
        merged.push(entry);
      }
    }
    return merged;
  }

  return {
    output: "standalone",
    images: {
      remotePatterns: [],
    },
    // Removes the "X-Powered-By: Next.js" response header - framework/version
    // fingerprinting, no functional purpose (see
    // audit-architecture-security-review-2026-11-27.md, Low finding).
    poweredByHeader: false,
    ...restConfig,
    headers: mergeHeaders,
    transpilePackages: [...baseTranspilePackages, ...(config.transpilePackages ?? [])],
  };
}

module.exports = { withBaseConfig };
