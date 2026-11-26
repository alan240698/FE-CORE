// PUBLIC SURFACE DUY NHAT cua module it-ticket - CHI named export, khong "export *"
// (xem nguyen-tac-code-fe-va-tai-lieu-cho-ai.md muc 2.1).

export { TicketList } from "./components/TicketList";
export { ticketReducer, setStatusFilter } from "./store/ticketSlice";
export type { TicketUiState } from "./store/ticketSlice";
export { useGetTicketsQuery, useGetTicketQuery } from "./store/ticketApi";
export type { Ticket, TicketPriority, TicketStatus } from "./types/ticket";
export { getSlaDeadline, isOverdue, canTransitionTo } from "./domain/ticketRules";
