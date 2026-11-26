import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../auth/authApi";

/**
 * EMPTY root RTK Query API - every module (e.g. modules/it-ticket/store/ticketApi.ts)
 * injects its own endpoints into this via injectEndpoints(), never creates its own
 * createApi(). See nghien-cuu-cong-cu-fe-chuyen-nghiep.md section 4 and
 * best-practice-structure.md.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: () => ({}),
});
