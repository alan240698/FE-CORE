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
 * Example call from apps/it-ticket/app/providers.tsx:
 *   const store = makeStore({ ticket: ticketReducer });
 *   type RootState = ReturnType<typeof store.getState>;  <- the app infers its OWN type
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

export { baseApi };
export type { Reducer, ReducersMapObject };
