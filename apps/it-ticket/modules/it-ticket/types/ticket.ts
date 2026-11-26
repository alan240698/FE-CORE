export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Ticket {
  id: number;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string; // ISO 8601
}
