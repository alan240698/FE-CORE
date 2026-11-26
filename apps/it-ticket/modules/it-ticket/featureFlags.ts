import { z } from "zod";

const BooleanFlag = z.enum(["true", "false"]).transform((v) => v === "true");

/**
 * Re-validated on every call (cheap - a single enum parse) instead of cached at module
 * load, so tests can flip NEXT_PUBLIC_FEATURE_TICKET_STATUS_FILTER between cases within
 * the same file via vi.stubEnv() - see TicketList.test.tsx.
 *
 * Default ("true") matches feature-flags.config.ts's default - see that file for why
 * this flag exists and why the default keeps today's behavior unchanged.
 */
export function isTicketStatusFilterEnabled(): boolean {
  return BooleanFlag.parse(process.env.NEXT_PUBLIC_FEATURE_TICKET_STATUS_FILTER ?? "true");
}
