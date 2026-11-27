---
description: Redux slice, RTK Query, selector, and state-ownership rules
paths: ["**/store/**/*.ts", "**/*Slice.ts", "**/*Api.ts"]
---

# Redux rules

Full rationale and examples: `docs/HANDBOOK.md` §7, `docs/HOWTO.md` §4-5,
`archetype-intranet-new/docs/fe-modular/audit-redux-architecture-2026-11-27.md`.

1. **`createSlice` only** — never `createReducer`/`createAction` standalone, never
   `createAsyncThunk` (RTK Query already covers 100% of this repo's async needs; a
   thunk alongside it would be two async mechanisms competing).
2. **Action naming: `set<Noun>`/`clear<Noun>`/`toggle<Noun>`** — never hand-write an
   action type string, let `createSlice` generate it.
3. **One slice, one responsibility.** Don't let a slice accumulate unrelated state
   fields "for convenience."
4. **Don't create a dedicated action for a single simple value change** if the current
   reducer already handles it generically.
5. **Server data (API responses) lives in RTK Query's cache, never duplicated into a
   Redux slice by hand.** A slice only ever holds local UI state (a filter, a selected
   tab, a form draft).
6. **New module with its first slice → add `store/hooks.ts`** exporting
   `useAppSelector`/`useAppDispatch` via react-redux v9.1's native
   `useSelector.withTypes()`/`useDispatch.withTypes()`. Never write a custom
   `createTypedHooks()` factory — this architecture deliberately has no single fixed
   `RootState` across apps (each app's `extraReducers` differs), so a generic factory
   would be wrong, not just premature.
7. **Selectors**: inline for a single-field read; a reusable selector HOOK (like
   `useAuth()`) only when it must work across apps with different `RootState` shapes.
   **No `createSelector`/reselect** without a real profiling result showing an
   expensive derived computation — none exists in this repo today.
8. **Don't hand-duplicate a value set that already has a Zod schema as its source of
   truth.** If an enum/status list exists as a Zod schema, derive any UI-side list
   from `Schema.options`, don't retype the literals.
9. **No `commonSlice`.** State that doesn't belong to a specific module stays
   un-created until ≥2 modules need the identical thing — don't pre-build a shared
   bucket for "state that might not fit anywhere."
10. **No `redux-persist` or any persistence mechanism** without an explicit security
    review — the access token is deliberately memory-only today.
11. RTK Query test pattern: **MSW mocking the network, never a mocked Redux store**
    (`redux-mock-store` does not work with RTK Query's real middleware).
