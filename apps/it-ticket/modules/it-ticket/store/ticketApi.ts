import { baseApi } from "@archetype/core";
import type { Ticket } from "../types/ticket";

/**
 * OPEN/CLOSED in practice: injectEndpoints() into @archetype/core's baseApi - does NOT
 * create its own createApi(), does NOT modify any file in packages/core. This is RTK
 * Query's own official mechanism for code-splitting an API per module.
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
