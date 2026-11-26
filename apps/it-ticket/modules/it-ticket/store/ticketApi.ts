import { z } from "zod";
import { baseApi } from "@archetype/core";
import { TicketSchema } from "../types/ticket";
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
      // Runtime-validate the Laravel response instead of trusting the `Ticket[]`
      // generic alone - a parse failure surfaces as this query's own `isError` state
      // (TicketList.tsx already handles it), same as any other fetch failure.
      transformResponse: (raw) => z.array(TicketSchema).parse(raw),
    }),
    getTicket: builder.query<Ticket, number>({
      query: (id) => `/tickets/${id}`,
      transformResponse: (raw) => TicketSchema.parse(raw),
    }),
  }),
});

export const { useGetTicketsQuery, useGetTicketQuery } = ticketApi;
