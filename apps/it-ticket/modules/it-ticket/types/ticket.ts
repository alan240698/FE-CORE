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
  // `.datetime()` (not bare `z.string()`) actually enforces ISO 8601 - the comment used
  // to just assert it without the schema checking it (see
  // audit-deep-codebase-2026-11-27.md's Code Quality + Type Safety findings). A
  // malformed value now fails validation instead of silently producing an
  // `Invalid Date` that `getSlaDeadline()`/`isOverdue()` would otherwise misread as
  // "not overdue" (Invalid Date comparisons are always `false`).
  createdAt: z.string().datetime(),
});

export type TicketPriority = z.infer<typeof TicketPrioritySchema>;
export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
