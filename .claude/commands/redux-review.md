---
description: Review Redux implementation (a diff, a module's store/, or the whole repo) against this repo's confirmed Redux conventions
---

Invoke the `redux-development` skill's review checklist against:

$ARGUMENTS

(if no argument given: review every `**/store/**/*.ts` file changed on the current
branch versus `main`; if nothing changed, review all of `packages/core/{auth,store,
menu}` and every `apps/*/modules/*/store/*.ts`)

Check specifically, with file:line evidence for each finding:

1. Any value list duplicating a Zod schema's `.options` instead of deriving from it.
2. Any slice holding server data that belongs in RTK Query's cache instead.
3. Any `createAsyncThunk`, `createSelector`, or "common"/"shared" slice added without
   a concrete, current justification (not "might help later").
4. Any direct edit to `packages/core`'s fixed files (`store/index.ts`, `authSlice.ts`,
   `authApi.ts`, `baseApi.ts`) instead of using its documented extension points.
5. Any `useSelector`/`useDispatch` used bare instead of a module's typed
   `useAppSelector`/`useAppDispatch` (except `packages/core`'s cross-app `useAuth()`,
   which is correct as-is).
6. Action/reducer naming consistency (`set<Noun>`/`clear<Noun>`).

Classify each finding Critical/High/Medium/Low/Future, same scale as this repo's
existing audit reports in `archetype-intranet-new/docs/fe-modular/`. Don't propose a
restructure of working code without a concrete problem backing it — this repo's own
prior Redux audit found the architecture already sound; the bar for "needs to
change" is a real, demonstrated issue, not a stylistic preference.
