---
description: Repo-wide rules that apply to every file, regardless of path
paths: ["**/*"]
---

# General rules — applies everywhere in `archetype-frontend`

These are the terse, enforceable form of `docs/HANDBOOK.md`. If a rule here needs
justification, the handbook has the "why" + real example; don't duplicate that here.

1. **Rule-of-2**: don't create a component/hook/utility/constant "in case it's needed
   later." Wait for ≥2 real consumers, or 1 consumer with genuinely complex logic that
   needs isolated testing. This repo has deleted 2 speculative abstractions already
   (`ticketSlice.statusFilter`, `httpClient`) — don't reintroduce the pattern.
2. **Every `@archetype/*` package's public surface is its `index.ts`** (named exports
   only, never `export *`). Never import deep into another package's internals —
   ESLint blocks this (`packages/eslint-config/boundaries.js`), don't disable the rule
   locally to work around it.
3. **UI text always goes through `@archetype/i18n`'s `createMessages()`** — never
   hardcode a Vietnamese (or English) string directly in JSX.
4. **Data from the Laravel backend is validated with Zod at the boundary** — never a
   bare `as T` cast. Use `parseApiResponse()` (client-side `transformResponse`) or
   `serverFetch()`'s required `schema` param (Server Components).
5. **Don't add `useMemo`/`useCallback`/`memo()` without a real profiling result**
   showing a re-render cost. This repo already measured 0 unnecessary re-renders with
   React's `<Profiler>` API at its current scale — don't optimize on a hunch.
6. **New module/app: always `pnpm exec tsx scripts/create-module.ts <name>`.** Never
   hand-create `apps/<name>/` — the scaffold wires env validation, lint, test runner,
   basePath, `robots.txt`/`not-found.tsx`/`lang="vi"` correctly from the start.
7. **`catch` blocks must bind and log the error** (`catch (err) { console.error(err);
... }`) unless there's a documented reason to swallow it silently.
8. Commit messages: Conventional Commits, **subject fully lowercase** (commitlint
   blocks sentence-case/upper-case), body lines ≤100 chars.
9. **Before adding a new npm dependency**, check whether an existing dependency or a
   native Web/Node/React API already covers the need (see
   `audit-dependency-build-2026-11-27.md` — `clsx`+`tailwind-merge` were deliberately
   KEPT over a hand-written alternative because rewriting already-tested logic to save
   a small install was judged not worth the risk). Declare it directly in the
   consuming package's own `package.json` — never borrow a transitive dependency
   (pnpm strict mode blocks this; see `docs/HANDBOOK.md` §13's `@types/node` example
   of this exact failure mode).
