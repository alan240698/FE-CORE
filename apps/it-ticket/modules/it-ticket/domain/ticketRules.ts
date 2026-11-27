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

// STATUS (2026-11-27): 0 real UI consumer - exported + tested (ticketRules.test.ts),
// but no component reads it yet (the status `<select>` in TicketList.tsx is a FILTER,
// not a transition action - it doesn't call this). See
// audit-deep-codebase-2026-11-27.md's Code Quality finding. TRIGGER to wire up a real
// consumer: a status-change action (button/dropdown restricted to valid next states)
// is actually built on a ticket detail view. If that never happens, remove this
// function rather than letting it sit unconsumed indefinitely.
export function canTransitionTo(from: TicketStatus, to: TicketStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
