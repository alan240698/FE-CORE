# archetype-frontend — repo-wide conventions

> Turborepo monorepo for Archetype Group's intranet frontend (Next.js). Backend is a
> separate Laravel repo (`archetype-intranet-new`), not in this repo. Each business
> module (IT Ticket, HRM, ABI...) is its own Next.js app, deployed independently.
>
> **Read this file first.** Then read the nested `CLAUDE.md` inside whichever
> `apps/<name>/` or `packages/<name>/` you're about to work in — this root file covers
> repo-wide rules, the nested ones cover that specific package's own contract.

## Stack

- **Package manager: pnpm** (via corepack) — never use npm/yarn in this repo.
- **Monorepo: Turborepo** — tasks run via `turbo`, see `turbo.json` for the task graph.
- **Next.js 16, App Router, TypeScript strict + `noUncheckedIndexedAccess`.**
- **Tailwind CSS v4** (CSS-first config, `@theme static` for shared brand tokens).
- **Redux Toolkit + RTK Query** for state/data-fetching, organized as one slice/API per
  module (see `packages/core/CLAUDE.md` for the Open/Closed pattern this relies on).
- **Vitest + React Testing Library + MSW** for tests, **Storybook** for `packages/shared/ui`.

## Commands

```bash
pnpm install              # always run from repo root
pnpm run dev              # turbo run dev (all apps)
pnpm run build            # turbo run build
pnpm run lint             # turbo run lint
pnpm run type-check       # turbo run type-check
pnpm run test             # turbo run test

# Scope a command to one package:
pnpm --filter @archetype/it-ticket run build
pnpm --filter @archetype/core run test
```

## Repo structure

```
apps/<module>/        - one Next.js app PER business module, independently deployable
  modules/<module>/   - that module's own business logic (domain/, store/, components/)
  app/providers.tsx   - "use client" wrapper for StoreProvider (see note below)
packages/core/        - shared auth/store/API foundation - Open/Closed, read its CLAUDE.md
packages/shared/      - shared UI (shadcn-style, Storybook) + test-utils
packages/eslint-config/   - shared ESLint rules (architecture boundaries)
packages/tailwind-config/ - shared brand tokens (Archetype Group design system)
packages/next-config/     - shared next.config.js base (output: standalone, headers)
packages/env-schema/      - env var validation (@t3-oss/env-nextjs + Zod)
packages/tsconfig/        - shared tsconfig bases
```

## Rules that apply everywhere in this repo

1. **Every module's public surface is its `index.ts` — named exports only, never
   `export *`** (real performance cost with barrel files, confirmed in prior research).
   Never import deep into another package/module's internals; ESLint boundaries
   (`packages/eslint-config/boundaries.js`) enforce this.
2. **`domain/` folders are pure business logic — no React, no Next.js imports.**
   Enforced by the same ESLint config. Testable with plain Vitest, no rendering needed.
3. **Never hardcode internal paths** (`<a href="/...">`, `<img src="/...">`) — always use
   `<Link>`/`<Image>`/router APIs. Enforced by `no-hardcoded-paths.js`. This matters
   because `basePath` does not auto-apply to hand-written paths, and some modules may
   later be promoted to their own domain (no `basePath` at all) — see
   `module-noi-bo-vs-standalone-domain.md` in the Laravel repo's `docs/fe-modular/`.
4. **A Server Component (the default in `layout.tsx`) cannot pass a function
   (e.g. a reducer) as a prop to a Client Component.** Every app that needs its own
   Redux reducer MUST have a dedicated `app/providers.tsx` (`"use client"`) that
   imports and uses that reducer itself — never call `StoreProvider` with a reducer
   prop directly from `layout.tsx`. See `apps/it-ticket/app/providers.tsx` for the
   verified-working example, and the real build error this fixes in
   `setup-tu-zero-archetype-frontend.md` (Laravel repo) Step 17.
5. **RTK Query is tested with MSW (mocking the network), never by mocking the Redux
   store** — `redux-mock-store` does not work with RTK Query (no real reducer present).
6. **Any package/app that runs its own `tsc --noEmit` and imports code using
   `process.env` (directly or via a dependency like `@archetype/core`) must declare
   its own `@types/node` devDependency.** pnpm's strict mode means this cannot be
   borrowed through a dependency, even if that dependency already declares it itself.
7. **`cacheComponents`/`partialPrefetching` (Next.js 16 Cache Components / PPR) are
   intentionally disabled in every app's `next.config.ts`.** They conflict with Redux
   Toolkit's dev middleware (`immutableCheck` calls `Math.random()`, forbidden during
   static prerender) and provide little value for an internal, behind-auth dashboard.
8. **Any app using `packages/shared/ui` must add
   `@source "../../../packages/shared/**/*.{ts,tsx}";` to its `globals.css`** —
   Tailwind does not scan outside an app's own directory by default.
9. **Keep `packages/core` closed to per-module edits — extend it, don't modify it.**
   See `packages/core/CLAUDE.md` for the full Open/Closed contract (what's fixed, what's
   extensible, with verified working examples).

## Known pending item — not yet resolved, do not assume otherwise

The Laravel backend's refresh-token rotation (`RefreshTokenService`) does not yet have
a verified grace-period for concurrent refresh requests across different zones/origins
(cross-zone version of the race condition already fixed in-app via a mutex in
`packages/core/auth/authApi.ts`). Tracked at
`docs/tasks/IAM/001-refresh-token-rotation-race-condition.md` in the Laravel repo. Do
not assume this is fixed on the backend side without checking that ticket first.

## Where the deeper research/design docs live

This repo (`archetype-frontend`) is intentionally a separate git repo from the Laravel
backend (`archetype-intranet-new`), per an explicit decision — NOT the monorepo
structure an earlier ADR in the Laravel repo had proposed. All of the architecture
research, decisions, and the full real-command setup log live in
`archetype-intranet-new/docs/fe-modular/` — most relevantly:
`best-practice-structure.md`, `audit-best-practice-structure.md`,
`nguyen-tac-code-fe-va-tai-lieu-cho-ai.md`, `module-noi-bo-vs-standalone-domain.md`,
`nghien-cuu-docker-cho-fe-chuyen-sau.md`, `trien-khai-docker-swarm-cho-fe.md`,
`setup-tu-zero-archetype-frontend.md`.
