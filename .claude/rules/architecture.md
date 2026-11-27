---
description: Module ownership, dependency direction, and boundary rules
paths: ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"]
---

# Architecture rules

1. **`modules/<name>/domain/` is pure business logic — no React, no Next.js imports.**
   Enforced by ESLint (`packages/eslint-config/boundaries.js`'s domain-specific block).
   Testable with plain Vitest, no rendering needed.
2. **`packages/core` is Open/Closed — extend it, never edit it for a module-specific
   need.** Read `packages/core/CLAUDE.md` before touching anything in there — it is
   mandatory reading for this package specifically, not optional background. The
   extension points are: `extraReducers` (via `StoreProvider`), `baseApi.injectEndpoints()`,
   a new `AuthStrategy` (if a different auth mechanism is ever needed), `useAuth()` (read
   login state from any app regardless of its `RootState` shape). If you think you
   need to edit a fixed file in `packages/core`, stop — that's the signal you're doing
   it wrong.
3. **`packages/core` has 2 public entry points, not 1**: `@archetype/core` (usable
   from Client AND Server Components) and `@archetype/core/server` (Server-Component-
   only — currently just `serverFetch()`). This is a deliberate split, not an
   accident to "clean up" by merging: `serverFetch()` imports `next/headers`, which
   cannot be anywhere in a Client Component's module graph without a real build
   failure (Next.js statically analyzes the whole graph). `@archetype/core/server`
   is the one explicitly-allowed exception in the no-deep-import ESLint rule — never
   add a second ad-hoc deep-import exception the same way.
4. **`packages/core` vs `packages/shared`**: `packages/core` holds anything that
   depends on Next.js/Redux (auth, store, API client) — usable by any app but NOT by
   Storybook in isolation. `packages/shared` is deliberately Next.js-free (pure UI +
   pure-React hooks) so `packages/shared/ui`'s Storybook build never needs the rest
   of the stack. Don't add a Next.js/Redux import to `packages/shared` to "simplify"
   something — that breaks the reason the split exists.
5. **Dependency direction is one-way: `apps/*` → `packages/*`, never the reverse.**
   `packages/core`/`packages/shared` must never import from `apps/`.
6. **`domain/` business logic stays with the module that owns it** — don't move it to
   `packages/core`/`packages/shared` just because it "could" be reused later. Move it
   only when a second module has the identical real need.
7. **Never hardcode an internal path** (`<a href="/...">`, `<img src="/...">`) — always
   `<Link>`/`<Image>`/router APIs. `basePath` does not auto-apply to a hand-written
   string, and ESLint (`no-hardcoded-paths.js`) blocks this.
8. **A Server Component (`layout.tsx` by default) cannot pass a function (a reducer)
   as a prop to a Client Component.** Every app with its own Redux state needs a
   dedicated `app/providers.tsx` ("use client") — never call `StoreProvider` with a
   reducer prop directly from `layout.tsx`.
9. **`cacheComponents`/`partialPrefetching` (Next.js Cache Components/PPR) stay
   disabled** in every `next.config.ts` — conflicts with Redux Toolkit's dev
   `immutableCheck` middleware, confirmed by a real build error.
10. Run `npx depcruise --config .dependency-cruiser.js apps packages` before
    considering an architectural change done — it catches circular dependencies and
    boundary violations the ESLint rules above don't reach (cross-package, not just
    deep-import).
