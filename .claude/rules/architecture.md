---
description: Module ownership, dependency direction, and boundary rules
paths: ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"]
---

# Architecture rules

1. **`modules/<name>/domain/` is pure business logic — no React, no Next.js imports.**
   Enforced by ESLint (`packages/eslint-config/boundaries.js`'s domain-specific block).
   Testable with plain Vitest, no rendering needed.
2. **`packages/core` is Open/Closed — extend it, never edit it for a module-specific
   need.** Read `packages/core/CLAUDE.md` before touching anything in there. The
   extension points are: `extraReducers` (via `StoreProvider`), `baseApi.injectEndpoints()`,
   a new `AuthStrategy` (if a different auth mechanism is ever needed). If you think you
   need to edit a fixed file in `packages/core`, stop — that's the signal you're doing
   it wrong.
3. **Dependency direction is one-way: `apps/*` → `packages/*`, never the reverse.**
   `packages/core`/`packages/shared` must never import from `apps/`.
4. **`domain/` business logic stays with the module that owns it** — don't move it to
   `packages/core`/`packages/shared` just because it "could" be reused later. Move it
   only when a second module has the identical real need.
5. **Never hardcode an internal path** (`<a href="/...">`, `<img src="/...">`) — always
   `<Link>`/`<Image>`/router APIs. `basePath` does not auto-apply to a hand-written
   string, and ESLint (`no-hardcoded-paths.js`) blocks this.
6. **A Server Component (`layout.tsx` by default) cannot pass a function (a reducer)
   as a prop to a Client Component.** Every app with its own Redux state needs a
   dedicated `app/providers.tsx` ("use client") — never call `StoreProvider` with a
   reducer prop directly from `layout.tsx`.
7. **`cacheComponents`/`partialPrefetching` (Next.js Cache Components/PPR) stay
   disabled** in every `next.config.ts` — conflicts with Redux Toolkit's dev
   `immutableCheck` middleware, confirmed by a real build error.
8. Run `npx depcruise --config .dependency-cruiser.js apps packages` before considering
   an architectural change done — it catches circular dependencies and boundary
   violations the ESLint rules above don't reach (cross-package, not just
   deep-import).
