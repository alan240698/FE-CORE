"use client";

import { useGetTicketsQuery } from "../store/ticketApi";
import { isOverdue } from "../domain/ticketRules";

export function TicketList() {
  const { data, isLoading, error } = useGetTicketsQuery();

  if (isLoading) return <p role="status">Dang tai...</p>;
  if (error) return <p role="alert">Khong tai duoc danh sach ticket</p>;

  return (
    <ul>
      {data?.map((ticket) => (
        <li key={ticket.id} data-overdue={isOverdue(ticket)}>
          {ticket.title}
          {isOverdue(ticket) ? " (qua han)" : ""}
        </li>
      ))}
    </ul>
  );
}
