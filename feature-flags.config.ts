import { z } from "zod";

/**
 * SINGLE SOURCE OF TRUTH for the DEFAULT value of every feature flag - same SSOT role
 * as environments.config.ts (generated into every app's .env.example by
 * scripts/generate-infra.ts), but for on/off switches instead of config values.
 *
 * Each flag's env var is independently re-validated at the point where it's actually
 * read (same precedent as packages/core/api-client/apiBaseUrl.ts re-validating
 * NEXT_PUBLIC_API_BASE_URL rather than trusting a value computed elsewhere) - this
 * file only owns the DEFAULT, not the runtime read.
 *
 * Add a flag here ONLY together with its first real consumer (a real `if`/conditional
 * render gated on it, with a test covering both states) - a flag nobody reads is the
 * exact dead-code pattern this project has repeatedly removed elsewhere
 * (ticketSlice.statusFilter, httpClient before they were dogfooded or deleted).
 */
const FeatureFlagsSchema = z.object({
  // Demonstrates the mechanism end-to-end (see
  // apps/it-ticket/modules/it-ticket/featureFlags.ts for the runtime reader, and
  // TicketList.test.tsx for the test covering both states) - default "true" keeps
  // today's behavior unchanged.
  NEXT_PUBLIC_FEATURE_TICKET_STATUS_FILTER: z.enum(["true", "false"]),
});

export type FeatureFlagDefaults = z.infer<typeof FeatureFlagsSchema>;

export const featureFlagDefaults: FeatureFlagDefaults = FeatureFlagsSchema.parse({
  NEXT_PUBLIC_FEATURE_TICKET_STATUS_FILTER: "true",
});
