import { sharedEnvironment } from "../environments.config";
import { featureFlagDefaults } from "../feature-flags.config";

/**
 * Prints environments.config.ts's shared values AND feature-flags.config.ts's defaults
 * as KEY=VALUE lines, one per line - ci-frontend.yml appends this script's output
 * straight into $GITHUB_ENV so CI reads the exact same single source of truth as
 * every app's generated .env.example file, instead of a 3rd hand-copied value that
 * could drift from the other two - see
 * audit-nextjs-core-principal-architect-2026-11-26.md, finding D-7.
 */
for (const [key, value] of Object.entries({ ...sharedEnvironment, ...featureFlagDefaults })) {
  console.log(`${key}=${value}`);
}
