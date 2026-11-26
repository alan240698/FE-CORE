import { createArchetypeEnv, baseClientEnvSchema } from "@archetype/env-schema";

export const env = createArchetypeEnv({
  ...baseClientEnvSchema,
});
