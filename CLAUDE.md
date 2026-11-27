# archetype-frontend — repo-wide conventions

> Turborepo monorepo for Archetype Group's intranet frontend (Next.js). Backend is a
> separate Laravel repo (`archetype-intranet-new`), not in this repo. Each business
> module (IT Ticket, HRM, ABI...) is its own Next.js app, deployed independently.
>
> **Read this file first.** Then read the nested `CLAUDE.md` inside whichever
> `apps/<name>/` or `packages/<name>/` you're about to work in — this root file covers
> repo-wide rules, the nested ones cover that specific package's own contract.
>
> For the full engineering handbook (component/hook/utility/testing/git conventions, each
> with a rule + why + correct/incorrect example) — `docs/HANDBOOK.md`. For step-by-step
> "how do I do X" (new component/hook/test) — `docs/HOWTO.md`.
>
> **Don't read everything for every task.** Pick the doc(s) that match the task's scope:
>
> | Task touches...                                  | Read                                                                                                                                                              |
> | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Any new code at all                              | `docs/HANDBOOK.md` §1 (structure/naming) first                                                                                                                    |
> | **Anything inside `packages/core/` at all**      | `packages/core/CLAUDE.md` FIRST, mandatory, not optional — its Open/Closed contract, 2-entry-point split, and `@types/node` gotcha aren't fully in any other file |
> | Redux (slice, RTK Query, selectors)              | `docs/HANDBOOK.md` §7, `.claude/rules/redux.md`, `packages/core/CLAUDE.md`                                                                                        |
> | A custom hook                                    | `docs/HANDBOOK.md` §3, `.claude/rules/components-and-hooks.md`                                                                                                    |
> | A component                                      | `docs/HANDBOOK.md` §2, `.claude/rules/components-and-hooks.md`                                                                                                    |
> | An API call / auth / anything security-sensitive | `docs/HANDBOOK.md` §6+§9, `.claude/rules/api-and-security.md`                                                                                                     |
> | Constants / shared values                        | `docs/HANDBOOK.md` §5                                                                                                                                             |
> | Tests                                            | `docs/HANDBOOK.md` §12, `.claude/rules/testing.md`                                                                                                                |
> | A brand-new module/app                           | `docs/HOWTO.md`, run `scripts/create-module.ts` — never hand-create `apps/<name>/`                                                                                |
>
> `.claude/rules/*.md` hold the same rules in short, path-scoped form Claude Code loads
> automatically by file glob — they summarize, not replace, the handbook. `.claude/skills/`
> has step-by-step workflows (`feature-development`, `redux-development`, `code-review`)
> for the repeatable tasks below. `.claude/commands/` has `/feature`, `/redux-review`,
> `/review` for the same workflows invoked directly. **No `.claude/agents/`** — this repo
> (51 source files, 1 business module) is small enough that rules + skills cover every
> real need; adding specialized sub-agents now would be unused infrastructure (see the
> project's own repeated "don't build before there's a consumer" rule in §2-5 of the
> handbook). Revisit when ≥3 business modules exist.

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
10. **Shared `NEXT_PUBLIC_*` values live in ONE place: `environments.config.ts`** (Zod,
    same SSOT philosophy as `modules.config.ts`, but for env VALUES instead of
    routing). `scripts/generate-infra.ts` generates every app's `apps/<app>/.env.example`
    AND (`scripts/print-env.ts`) what CI loads from it — never hand-edit a generated
    `.env.example` or hardcode the value a 4th time somewhere else; change
    `environments.config.ts` and re-run `pnpm run generate-infra`.
    - Copy the generated `.env.example` to `.env.local` (never commit `.env.local`) to
      run locally — or `.env.development`/`.env.staging`/`.env.production` once builds
      are ever done per-environment instead of build-once-promote (see
      `nghien-cuu-cong-cu-fe-chuyen-nghiep.md` section 7 for why that's not done today).
    - A missing/invalid value fails the build IMMEDIATELY (Zod, via
      `packages/env-schema` and `packages/core/api-client/apiBaseUrl.ts`) — this is
      intentional fail-fast behavior, not a bug to work around.
11. **Feature flags: `feature-flags.config.ts`** (root, same SSOT role as
    `environments.config.ts` — generated into every app's `.env.example` the same way).
    Only add a flag TOGETHER with its first real consumer (a real conditional + a test
    covering both states) — see `apps/it-ticket/modules/it-ticket/featureFlags.ts` +
    `TicketList.test.tsx` for the reference pattern (re-validate the env var at the
    point it's read via Zod, same precedent as `apiBaseUrl.ts`, rather than trusting a
    cached value). A flag with no real consumer is dead code, not infrastructure.

## Known pending item — not yet resolved, do not assume otherwise

The Laravel backend's refresh-token rotation (`RefreshTokenService`) does not yet have
a verified grace-period for concurrent refresh requests across different zones/origins
(cross-zone version of the race condition already fixed in-app via a mutex in
`packages/core/auth/authApi.ts`). Tracked at
`docs/tasks/IAM/001-refresh-token-rotation-race-condition.md` in the Laravel repo. Do
not assume this is fixed on the backend side without checking that ticket first.

**Higher-severity, more recent (2026-11-27)**: `docs/tasks/IAM/002-cors-csrf-
confirmation-cho-fe-cookie-auth.md` (Laravel repo) — a real `php artisan route:list`
against the live backend confirmed `/auth/refresh` (called from `authApi.ts`) only
exists at `api/dml/auth/refresh` (DML-only, not shared across zones as assumed), and
`/me/menu` (called from `packages/core/menu/useMenu.ts`) has **zero matching route
anywhere**. Do not "fix" either path from the FE side by guessing — the backend needs
to confirm the intended shared route first; this ticket is the highest-priority open
item across the whole project right now. Also open and BE/Ops-owned:
`Shared/009` (Docker `IMAGE_TAG` uniqueness for rollback), `Shared/010` (SLA needed
before adding a timeout to `serverFetch.ts`), `Shared/011` (`.github/CODEOWNERS` team
handles are still placeholders — this one is FE/org-admin-owned, not BE).

`zod` is pinned to v3 (`<4.6.6` has a known HIGH-severity DoS advisory,
[GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)) because
`@t3-oss/env-nextjs` (used by `packages/env-schema`, which every app's `env.ts` depends
on) pins a hard `peerDependency` on `"zod": "^3.0.0"` - bumping zod to the patched v4
line would break env validation repo-wide. `ci-frontend.yml`'s "Dependency vulnerability
scan" step (`pnpm audit --audit-level=high`) is `continue-on-error: true` because of
this one, currently-unfixable finding - don't assume a red/non-blocking result there
means nothing to look at; check if `@t3-oss/env-nextjs` has added zod v4 support yet,
and if so, upgrade and flip that step back to blocking.

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

This repo's OWN `docs/adr/` holds architecture decisions specific to THIS codebase (as
opposed to the cross-repo research above) — e.g. `0001-khong-chia-se-bundle-giua-cac-zone.md`
(why Module Federation / CDN-shared bundles are rejected for now, and the concrete
threshold for revisiting that).
