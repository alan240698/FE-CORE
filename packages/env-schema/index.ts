import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validate environment variables AT BUILD TIME - fail fast on missing/invalid values
 * instead of discovering it only in production (see nghien-cuu-cong-cu-fe-chuyen-nghiep.md
 * audit section + best-practice-structure.md).
 *
 * Each app calls createArchetypeEnv({...}) in its own env.ts file, passing the list of
 * NEXT_PUBLIC_* variables that app actually uses.
 *
 * TYPE NOTE: @t3-oss/env-nextjs uses a "branded key type" to enforce keys starting
 * with "NEXT_PUBLIC_" at compile time - this wrapper CANNOT make the generic match
 * that type with full type-safety (confirmed by a real TS2322 error when trying
 * Record<string, ZodTypeAny> as the constraint). Accepting "as never" at the
 * createEnv() call site - still correct at runtime (t3-env validates the prefix
 * itself), only losing the wrong-variable-name warning AT THE TIME THIS WRAPPER IS
 * WRITTEN (still intact at every app's own createArchetypeEnv call).
 */
export function createArchetypeEnv<TClient extends Record<string, z.ZodTypeAny>>(
  clientSchema: TClient,
) {
  const runtimeEnv = Object.keys(clientSchema).reduce<Record<string, string | undefined>>(
    (acc, key) => {
      acc[key] = process.env[key];
      return acc;
    },
    {},
  );

  return createEnv({
    client: clientSchema as never,
    experimental__runtimeEnv: runtimeEnv,
  });
}

// Minimal schema shared by every app - each app extends it with its own extra variables.
export const baseClientEnvSchema = {
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
};
