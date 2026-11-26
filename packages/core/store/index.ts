import { configureStore } from "@reduxjs/toolkit";
import type { Reducer, ReducersMapObject } from "@reduxjs/toolkit";
import { authReducer } from "../auth/authSlice";
import { baseApi } from "./baseApi";

/**
 * OPEN/CLOSED: makeStore() nhan "extraReducers" tu BEN NGOAI (tung app tu truyen reducer
 * local cua module minh, vd ticketReducer cua IT Ticket) - KHONG BAO GIO sua file nay de
 * them 1 module moi. Core chi co dung 2 reducer CO DINH: auth + baseApi (RTK Query).
 *
 * Vi du goi tu apps/it-ticket/store/index.ts:
 *   export const store = makeStore({ ticket: ticketReducer });
 *   export type RootState = ReturnType<typeof store.getState>;  <- app TU suy ra type cua minh
 *
 * RTK Query (baseApi) da "open/closed" san co qua injectEndpoints() - KHONG can them gi
 * o day, moi module tu goi baseApi.injectEndpoints() trong file rieng cua minh.
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

// Type tien ich CHO TRUONG HOP KHONG co extraReducers (vd shell/ khong can state rieng).
// App NAO CO extraReducers (vd apps/it-ticket) PHAI tu dinh nghia lai AppStore/RootState/
// AppDispatch cua chinh minh tu ket qua makeStore(...) that, KHONG dung lai type co dinh
// o day - vi core khong biet truoc duoc app se truyen extraReducers gi.
export type AppStore = ReturnType<typeof makeStore<Record<string, never>>>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export { baseApi };
export type { Reducer, ReducersMapObject };
