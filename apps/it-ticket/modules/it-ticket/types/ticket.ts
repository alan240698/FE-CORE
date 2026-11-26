import { z } from "zod";

// Schema is the SSOT, same pattern as environments.config.ts/feature-flags.config.ts -
// types are z.infer, not hand-written separately, so they can never drift from what is
// actually validated at runtime (see engineering-standards-audit-2026-11-26.md, finding
// TS-NEW-1: API responses from Laravel were only `as T` cast, never runtime-checked).
export const TicketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const TicketStatusSchema = z.enum(["open", "in_progress", "resolved", "closed"]);

export const TicketSchema = z.object({
  id: z.number(),
  title: z.string(),
  priority: TicketPrioritySchema,
  status: TicketStatusSchema,
  createdAt: z.string(), // ISO 8601
});

export type TicketPriority = z.infer<typeof TicketPrioritySchema>;
export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
