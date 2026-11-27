import { configureStore } from "@reduxjs/toolkit";
import type { Reducer, ReducersMapObject } from "@reduxjs/toolkit";
import { authReducer } from "../auth/authSlice";
import { baseApi } from "./baseApi";

/**
 * OPEN/CLOSED: makeStore() accepts "extraReducers" from the OUTSIDE (each app passes
 * its own module's local reducer, e.g. IT Ticket's ticketReducer) - NEVER edit this
 * file to add a new module. Core only ever owns 2 FIXED reducers: auth + baseApi
 * (RTK Query).
 *
 * CORRECTED NOTE (was stale): `makeStore()` is NOT called directly by an app's
 * providers.tsx - `StoreProvider` (./Provider.tsx) calls it internally (via `useRef`,
 * "new store per mount", the documented-correct pattern for Next.js App Router) and
 * the app only ever passes `extraReducers` as a prop. This means an app never holds a
 * real `store` instance to derive `RootState` from via `ReturnType<typeof
 * store.getState>` the way a typical non-Next.js Redux app would - use
 * `InferRootState<TExtra>` below instead (a manual reconstruction, NOT
 * `ReturnType<typeof makeStore<TExtra>>["getState"]>` - confirmed by a real type-check
 * failure that going through `configureStore`'s own generic inference with an
 * OPTIONAL, not-yet-invoked `extraReducers?: TExtra` loses TExtra's keys entirely).
 * `AppDispatch` below needs NO per-app variant - confirmed by a real type-check that
 * `extraReducers` does not change the store's `dispatch` type (only the middleware
 * array does, which is fixed). Pair `InferRootState`/`AppDispatch` with react-redux
 * v9.1's OWN built-in `useSelector.withTypes<T>()`/`useDispatch.withTypes<T>()` (no
 * custom wrapper needed - the officially documented pattern as of react-redux 9.1,
 * superseding the older manual `TypedUseSelectorHook` style). See
 * apps/it-ticket/modules/it-ticket/store/hooks.ts for the reference usage.
 *
 * RTK Query (baseApi) is already open/closed via injectEndpoints() - nothing needs to
 * be added here for that, each module calls baseApi.injectEndpoints() in its own file.
 */
export function makeStore<TExtra extends ReducersMapObject>(extraReducers?: TExtra) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
      ...extraReducers,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

// Convenience types for the NO-extraReducers case (e.g. shell/ has no state of its
// own). Any app WITH extraReducers (e.g. apps/it-ticket) MUST define its OWN
// AppStore/RootState/AppDispatch from the real result of its own makeStore(...) call,
// NOT reuse the fixed types here - core cannot know in advance what extraReducers a
// given app will pass in.
export type AppStore = ReturnType<typeof makeStore<Record<string, never>>>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// For an app WITH extraReducers: derive its real RootState by combining the FIXED
// RootState (auth + api) with each extra reducer's own state type - reconstructed
// manually, not via makeStore's generic return type (see the doc comment above for
// why that path loses TExtra's keys). Pass the exact extraReducers shape your app
// passes to <StoreProvider>. AppDispatch needs no equivalent - reuse the fixed one.
export type InferRootState<TExtra extends ReducersMapObject> = RootState & {
  [K in keyof TExtra]: TExtra[K] extends Reducer<infer TState> ? TState : never;
};

export { baseApi };
export type { Reducer, ReducersMapObject };
