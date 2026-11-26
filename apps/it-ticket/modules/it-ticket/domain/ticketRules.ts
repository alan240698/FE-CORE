import type { Ticket, TicketPriority, TicketStatus } from "../types/ticket";

/**
 * Business logic THUAN - KHONG import React/Next.js (ep bang ESLint boundaries,
 * xem packages/eslint-config/boundaries.js). Test duoc bang Vitest/Node thuan tuy,
 * khong can render component.
 */

const SLA_HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
  urgent: 4,
  high: 24,
  medium: 72,
  low: 168,
};

export function getSlaDeadline(ticket: Pick<Ticket, "priority" | "createdAt">): Date {
  const created = new Date(ticket.createdAt);
  const hours = SLA_HOURS_BY_PRIORITY[ticket.priority];
  return new Date(created.getTime() + hours * 60 * 60 * 1000);
}

export function isOverdue(
  ticket: Pick<Ticket, "priority" | "createdAt" | "status">,
  now = new Date(),
): boolean {
  if (ticket.status === "resolved" || ticket.status === "closed") return false;
  return getSlaDeadline(ticket) < now;
}

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress", "closed"],
  in_progress: ["resolved", "open"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

export function canTransitionTo(from: TicketStatus, to: TicketStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
