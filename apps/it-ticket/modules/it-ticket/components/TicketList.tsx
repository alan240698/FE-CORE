"use client";

import { Table, TableHeader, TableBody, TableRow, TableCell } from "@archetype/shared";
import { useGetTicketsQuery } from "../store/ticketApi";
import { setStatusFilter } from "../store/ticketSlice";
import type { TicketUiState } from "../store/ticketSlice";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { isOverdue } from "../domain/ticketRules";
import { isTicketStatusFilterEnabled } from "../featureFlags";
import { vi } from "../messages/vi";
import type { Ticket } from "../types/ticket";

const STATUS_OPTIONS: Array<TicketUiState["statusFilter"]> = [
  "all",
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export interface TicketListProps {
  /**
   * Server-fetched fallback (see app/page.tsx's use of @archetype/core's
   * serverFetch()) - rendered immediately instead of a loading spinner while
   * useGetTicketsQuery() fetches/revalidates in the background. Omit entirely (as
   * every existing test does) to get the original client-only loading/error states -
   * this prop only changes behavior when a caller actually passes it.
   */
  initialTickets?: Ticket[];
}

export function TicketList({ initialTickets }: TicketListProps = {}) {
  const { data, isLoading, isError } = useGetTicketsQuery();
  const statusFilter = useAppSelector((state) => state.ticket.statusFilter);
  const dispatch = useAppDispatch();

  if (isLoading && !initialTickets) return <p role="status">{vi.loading}</p>;
  if (isError && !initialTickets) return <p role="alert">{vi.loadError}</p>;

  const filterEnabled = isTicketStatusFilterEnabled();
  const tickets = (data ?? initialTickets ?? []).filter(
    (ticket) => !filterEnabled || statusFilter === "all" || ticket.status === statusFilter,
  );

  return (
    <div className="flex flex-col gap-3">
      {filterEnabled && (
        <label className="flex items-center gap-2 text-sm">
          {vi.filterLabel}
          <select
            value={statusFilter}
            onChange={(e) =>
              dispatch(setStatusFilter(e.target.value as TicketUiState["statusFilter"]))
            }
            className="border-ag-grey-200 rounded border px-2 py-1"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Distinct from loading/error (both already handled above) - previously a 0-row
          result (genuinely 0 tickets, or a filter matching none) silently rendered an
          empty table with no explanation, inconsistent with Nav.tsx's own
          already-existing empty-state branch - see
          audit-deep-codebase-2026-11-27.md finding #4/#8. */}
      {tickets.length === 0 ? (
        <p>{vi.emptyList}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {/* Table's own component API only exports TableCell (<td>) - no header-cell
                  variant yet (missing foundation, not needed until a 2nd table exists -
                  see audit-nextjs-core-principal-architect-2026-11-26.md, finding
                  "Component foundation"). Native <th> here, styled to match. */}
              <th className="border-ag-grey-200 border-b px-4 py-2 text-left">{vi.columnTitle}</th>
              <th className="border-ag-grey-200 border-b px-4 py-2 text-left">{vi.columnStatus}</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} data-overdue={isOverdue(ticket)}>
                <TableCell>
                  {ticket.title}
                  {isOverdue(ticket) ? vi.overdueSuffix : ""}
                </TableCell>
                <TableCell>{ticket.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
