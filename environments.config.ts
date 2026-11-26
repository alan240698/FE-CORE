import { z } from "zod";

/**
 * SINGLE SOURCE OF TRUTH for build-time NEXT_PUBLIC_* values shared by every app and
 * by CI - the companion of modules.config.ts (which is the SSOT for ROUTING only).
 * Generated into:
 *   - apps/<app>/.env.example (scripts/generate-infra.ts)
 *   - CI's env vars (scripts/print-env.ts, invoked from ci-frontend.yml)
 *
 * Before this file existed, the API base URL was hand-copied into 3 separate places
 * (2 apps' .env.example + the CI workflow) with nothing catching drift between them -
 * see audit-nextjs-core-principal-architect-2026-11-26.md, finding D-7.
 *
 * Every app currently needs the exact same values (one shared backend, no
 * staging/production split yet) - if that ever changes, extend this into a map keyed
 * by deployment stage (read from an env var like APP_ENV) rather than guessing ahead
 * of time what the split will look like.
 */
const EnvironmentSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

export type SharedEnvironment = z.infer<typeof EnvironmentSchema>;

export const sharedEnvironment: SharedEnvironment = EnvironmentSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: "https://api.archetype-group.com",
});
