---
name: redux-development
description: Use when adding or changing Redux state — a new slice, a new RTK Query endpoint, a new selector, or reviewing existing Redux code in archetype-frontend. Encodes the patterns confirmed by this repo's Redux architecture audit.
---

# Redux Development (archetype-frontend)

Purpose: apply the already-confirmed Redux patterns in this repo consistently, instead
of each change reinventing slice/selector/API shape slightly differently.

## When to use

Adding a new Redux slice, a new RTK Query endpoint, a new selector hook, or reviewing
existing state-management code for consistency with `docs/HANDBOOK.md` §7 and
`.claude/rules/redux.md`.

## Required context

- `docs/HANDBOOK.md` §7 (full rationale).
- `.claude/rules/redux.md` (terse checklist form).
- `docs/HOWTO.md` §4 (new slice steps) or §5 (new API endpoint steps).
- `packages/core/CLAUDE.md` if the change touches `packages/core` at all (it almost
  never should — see Constraints).

## Step-by-step workflow

### Adding a new slice (module's first local UI state)

1. Confirm this is genuinely UI state (filter, selected tab, draft) — not server data.
   Server data belongs in RTK Query's cache, never copied into a slice.
2. Write the slice with `createSlice`, one responsibility, `set<Noun>`/`clear<Noun>`
   action names.
3. If any field's value set already exists as a Zod schema elsewhere (e.g. an API
   contract enum), derive from `Schema.options` — never retype the literals.
4. Add/update `modules/<module>/store/hooks.ts` (`InferRootState`, `useAppSelector`,
   `useAppDispatch` via react-redux v9.1's native `withTypes()`).
5. Wire into `app/providers.tsx` (never directly in `layout.tsx` — RSC boundary).
6. Use `useAppSelector`/`useAppDispatch` in components, never bare `useSelector`/
   `useDispatch`, except for `useAuth()`-style cross-app selectors in `packages/core`.

### Adding a new API endpoint

1. `baseApi.injectEndpoints()` in `modules/<module>/store/<name>Api.ts` — never a new
   `createApi()`.
2. Zod schema is the SSOT for the response type (`z.infer`, not a hand-written
   interface).
3. `transformResponse` always through `parseApiResponse(schema, raw, "endpointName")`
   — never a bare `.parse()` or `as T`.
4. If this is the one call a Server Component needs before hydration, use
   `serverFetch(path, fallback, schema)` from `@archetype/core/server` — always pass
   a `fallback`, treat the result as a placeholder.

### Reviewing existing Redux code

Walk `.claude/rules/redux.md`'s 11 points against the diff. Specifically check for:

- A hand-duplicated value list that already has a schema (`.options`) source.
- A slice holding server data that should be in RTK Query's cache instead.
- A new `createAsyncThunk`, `createSelector`, or `commonSlice` — all three need a
  concrete justification tied to a real, current need, not "might help later."

## Constraints

- Never edit `packages/core/store/index.ts`, `authSlice.ts`, `authApi.ts`, or
  `baseApi.ts` to add a module-specific feature. Extend via the documented extension
  points only (`extraReducers`, `injectEndpoints()`, `AuthStrategy`).
- Never add `redux-persist` or any persistence without a dedicated security review —
  the access token is deliberately memory-only.
- Never add `createSelector`/reselect without a profiling result showing an actual
  expensive computation.

## Verification checklist

- [ ] `pnpm --filter <app> run test` — slice/API tests pass, including any new
      Zod-rejection test if the schema changed.
- [ ] `pnpm exec turbo run lint type-check build` — clean.
- [ ] If `authApi.ts` was touched: the 401-concurrency race-condition test still
      passes (`pnpm --filter @archetype/core run test`).
- [ ] No new value-list duplication introduced (grep for the literal values you just
      added — do they already exist as a Zod schema elsewhere?).

## Expected output

A slice/endpoint that matches the existing `ticketSlice`/`ticketApi` shape exactly in
spirit (even if the domain differs), with typed hooks wired correctly and tests
passing.
