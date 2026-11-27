import { z } from "zod";
import { baseApi } from "@archetype/core";
import { TicketSchema } from "../types/ticket";
import type { Ticket } from "../types/ticket";

// SSOT for this module's "/tickets" resource path - also used by app/page.tsx's
// serverFetch() call for the SAME resource (initial server-rendered fetch vs. this
// file's client-side RTK Query endpoint). Was a literal "/tickets" duplicated in both
// places (see docs/fe-modular/audit-common-shared-constants-2026-11-27.md finding #1)
// before this change - 2 real call sites for the exact same backend resource is this
// project's own rule-of-2 threshold for extracting a constant.
export const TICKETS_PATH = "/tickets";

/**
 * OPEN/CLOSED in practice: injectEndpoints() into @archetype/core's baseApi - does NOT
 * create its own createApi(), does NOT modify any file in packages/core. This is RTK
 * Query's own official mechanism for code-splitting an API per module.
 */
const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => TICKETS_PATH,
      // Runtime-validate the Laravel response instead of trusting the `Ticket[]`
      // generic alone - a parse failure surfaces as this query's own `isError` state
      // (TicketList.tsx already handles it), same as any other fetch failure.
      transformResponse: (raw) => z.array(TicketSchema).parse(raw),
    }),
    getTicket: builder.query<Ticket, number>({
      query: (id) => `${TICKETS_PATH}/${id}`,
      transformResponse: (raw) => TicketSchema.parse(raw),
    }),
  }),
});

export const { useGetTicketsQuery, useGetTicketQuery } = ticketApi;
