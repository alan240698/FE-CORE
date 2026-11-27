// THE ONLY public surface of the it-ticket module - named exports only, never
// "export *" (see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 2.1).

export { TicketList } from "./components/TicketList";
export type { TicketListProps } from "./components/TicketList";
export { ticketReducer, setStatusFilter } from "./store/ticketSlice";
export type { TicketUiState } from "./store/ticketSlice";
export { useGetTicketsQuery, useGetTicketQuery, TICKETS_PATH } from "./store/ticketApi";
export type { Ticket, TicketPriority, TicketStatus } from "./types/ticket";
export { TicketSchema } from "./types/ticket";
export { getSlaDeadline, isOverdue, canTransitionTo } from "./domain/ticketRules";
