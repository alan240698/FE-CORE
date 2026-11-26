import { baseApi } from "@archetype/core";
import type { Ticket } from "../types/ticket";

/**
 * OPEN/CLOSED trong thuc te: injectEndpoints() vao baseApi cua @archetype/core -
 * KHONG tao createApi() rieng, KHONG sua bat ky file nao trong packages/core.
 * Day la co che chinh thuc cua RTK Query danh rieng cho code-splitting API theo module.
 */
const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => "/tickets",
    }),
    getTicket: builder.query<Ticket, number>({
      query: (id) => `/tickets/${id}`,
    }),
  }),
});

export const { useGetTicketsQuery, useGetTicketQuery } = ticketApi;
