import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../auth/authApi";

/**
 * RTK Query API GOC RONG - moi module (vd modules/it-ticket/store/ticketApi.ts)
 * tu injectEndpoints() vao day, KHONG tao createApi() rieng. Xem
 * nghien-cuu-cong-cu-fe-chuyen-nghiep.md muc 4 va best-practice-structure.md.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: () => ({}),
});
