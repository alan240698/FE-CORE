"use client";

import { useSelector, useDispatch } from "react-redux";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@archetype/shared";
import { useGetTicketsQuery } from "../store/ticketApi";
import { setStatusFilter } from "../store/ticketSlice";
import type { TicketUiState } from "../store/ticketSlice";
import { isOverdue } from "../domain/ticketRules";

const STATUS_OPTIONS: Array<TicketUiState["statusFilter"]> = [
  "all",
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export function TicketList() {
  const { data, isLoading, error } = useGetTicketsQuery();
  const statusFilter = useSelector((state: { ticket: TicketUiState }) => state.ticket.statusFilter);
  const dispatch = useDispatch();

  if (isLoading) return <p role="status">Dang tai...</p>;
  if (error) return <p role="alert">Khong tai duoc danh sach ticket</p>;

  const tickets = (data ?? []).filter(
    (ticket) => statusFilter === "all" || ticket.status === statusFilter,
  );

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm">
        Loc theo trang thai:
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

      <Table>
        <TableHeader>
          <TableRow>
            {/* Table's own component API only exports TableCell (<td>) - no header-cell
                variant yet (missing foundation, not needed until a 2nd table exists -
                see audit-nextjs-core-principal-architect-2026-11-26.md, finding
                "Component foundation"). Native <th> here, styled to match. */}
            <th className="border-ag-grey-200 border-b px-4 py-2 text-left">Tieu de</th>
            <th className="border-ag-grey-200 border-b px-4 py-2 text-left">Trang thai</th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} data-overdue={isOverdue(ticket)}>
              <TableCell>
                {ticket.title}
                {isOverdue(ticket) ? " (qua han)" : ""}
              </TableCell>
              <TableCell>{ticket.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
