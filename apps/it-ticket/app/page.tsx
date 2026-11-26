import { Button } from "@archetype/shared";
import { serverFetch } from "@archetype/core/server";
import { TicketList } from "@/modules/it-ticket";
import type { Ticket } from "@/modules/it-ticket";
import { vi } from "./messages/vi";

/**
 * Server Component - fetches the initial ticket list so the first HTML response
 * already has real data in it, instead of a blank shell that waits for
 * useGetTicketsQuery() to run client-side after hydration (see
 * audit-nextjs-core-principal-architect-2026-11-26.md, finding PERF-1).
 *
 * Calling serverFetch() (which reads cookies()) makes this route dynamic - the
 * correct trade-off for a per-user ticket list, not a regression; see
 * packages/core/api-client/serverFetch.ts's doc comment.
 */
export default async function Page() {
  const initialTickets = await serverFetch<Ticket[]>("/tickets", []);

  return (
    <main className="flex flex-1 flex-col gap-6 p-16">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">{vi.heading}</h1>
        <Button variant="primary" size="md">
          {vi.newTicketButton}
        </Button>
      </div>
      <TicketList initialTickets={initialTickets} />
    </main>
  );
}
