import type { Ticket, TicketPriority, TicketStatus } from "../types/ticket";

/**
 * PURE business logic - does NOT import React/Next.js (enforced by ESLint boundaries,
 * see packages/eslint-config/boundaries.js). Testable with plain Vitest/Node, no
 * component rendering needed.
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
