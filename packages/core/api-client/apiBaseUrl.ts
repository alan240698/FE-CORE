import { z } from "zod";

/**
 * Validates NEXT_PUBLIC_API_BASE_URL with the SAME rule as @archetype/env-schema's
 * baseClientEnvSchema (z.string().url()). packages/core cannot import a specific app's
 * validated env.ts instance - the dependency direction only goes apps -> core, never
 * the other way - so this re-validates its own copy of this one variable instead of
 * reading process.env raw and trusting it blindly (previously the case in both
 * authApi.ts and httpClient.ts - a missing/invalid value failed silently with a vague
 * fetch error instead of a clear message at the point of use).
 */
export const apiBaseUrl = z.string().url().parse(process.env.NEXT_PUBLIC_API_BASE_URL);
