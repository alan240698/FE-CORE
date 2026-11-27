---
description: API integration, authentication, and security-sensitive rules
paths: ["**/api-client/**/*.ts", "**/auth/**/*.ts", "**/store/*Api.ts", "**/*.config.ts"]
---

# API & Security rules

Full rationale: `docs/HANDBOOK.md` §6, §9, §10; `packages/core/CLAUDE.md`.

1. **Every call to the Laravel backend goes through `baseApi.injectEndpoints()`**
   (client) or `@archetype/core/server`'s `serverFetch()` (Server Component). Never a
   raw `fetch()` in a component or `useEffect`.
2. **`serverFetch(path, fallback, schema)` always takes a `schema`** (no default) —
   its result is a placeholder for the client-side RTK Query hook that mounts right
   after, never the sole source of truth. Never `throw` from it; on any failure,
   return `fallback`.
3. **`baseUrl` always through `apiBaseUrl` / `environments.config.ts`** — never read
   `process.env.NEXT_PUBLIC_API_BASE_URL` directly anywhere else. A missing/invalid
   value must fail the build immediately (Zod), not silently fall back.
4. **Auth header/refresh always through `baseQueryWithReauth`/`AuthStrategy`** — no
   module calls `/auth/refresh` directly. This mechanism has a mutex specifically
   preventing N concurrent 401s from triggering N refresh calls; reimplementing it
   risks reintroducing that exact race condition.
5. **Never guess-fix a backend route mismatch from the frontend.** If an endpoint the
   FE calls doesn't match what the backend actually serves (verified via
   `php artisan route:list`, not assumption), file a ticket for the backend to confirm
   intent — don't silently change the FE path to "whatever seems to work."
6. **Never treat a frontend-only check as real authorization.** Menu/route hiding is a
   UI convenience; actual permission enforcement must happen server-side. If a feature
   needs real access control and the backend hasn't confirmed server-side enforcement,
   that's a blocker to flag, not something the FE can compensate for.
7. **The access token lives only in Redux memory state** — never `localStorage`,
   `sessionStorage`, or a readable cookie. No persistence mechanism for `auth` state
   without a dedicated security review.
8. **0 secrets in the bundle.** Only `NEXT_PUBLIC_*` values that are genuinely public
   may exist client-side; anything else belongs server-side only.
9. **CSP/HSTS/Permissions-Policy/Referrer-Policy/`X-Powered-By: off`** are configured
   once in `packages/next-config` — don't add per-app header overrides without a
   documented reason.
10. A finding that needs the **backend or infrastructure team to confirm or act**
    (CORS config, cookie `SameSite`, rate limiting, route existence, deploy pipeline)
    gets a ticket in `archetype-intranet-new/docs/tasks/`, never a guess coded around
    it on the FE side.
11. **Never use `dangerouslySetInnerHTML`** with unsanitized content. 0 usage exists in
    this repo today (verified by grep) — if a real need ever appears (rendering HTML
    from a CMS/rich-text field), sanitize with a library built for it (e.g. DOMPurify)
    at the point of render, and say so in a comment next to the call; never trust that
    the source "should already be safe." Same bar for `eval()`/`new Function()` — 0
    usage today, 0 justified use case for either in a React app.
12. **Never build a redirect target from unsanitized user/URL input** (`router.push()`,
    `window.location`, a `Location`/`redirect` response). `useQueryParam`'s current
    only consumer pattern uses `usePathname()` (not user-controllable) — if a future
    feature needs to redirect based on a URL param or form input, validate it's a
    same-origin relative path before navigating, don't pass the raw value through.
13. **Known, currently-open gap — do not assume it's fixed**: this app sends **0 CSRF
    token** anywhere, while `/auth/refresh` uses `credentials: "include"` (cookie-
    reachable). Tracked in `IAM/002` (`archetype-intranet-new/docs/tasks/`), waiting on
    the backend to confirm `SameSite`/CSRF strategy. Don't silently add a CSRF
    workaround on the FE side before that ticket resolves — it needs to match whatever
    mechanism the backend actually implements, not a guess.
14. **`NEXT_PUBLIC_*` env vars are baked into the client bundle at build time** — this
    is a compile-time substitution, not a runtime secret boundary. Never name a
    genuinely sensitive value with that prefix on the assumption "it's fine, nobody
    will look"; treat the prefix itself as the one-way decision that it's public.
15. **Don't add a third-party script, font, or analytics tag** without checking it
    against the CSP (`packages/next-config`'s `script-src`/`connect-src`/`font-src`
    allowlist) first — a tag that needs a new origin requires a deliberate CSP change
    and a documented reason, not a silent addition that would otherwise just fail
    silently in the browser console.
