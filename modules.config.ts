import { z } from "zod";

/**
 * SINGLE SOURCE OF TRUTH for which business modules exist and how each one is routed:
 *
 * - "internal": routed under the shell's own domain via a path prefix
 *   (domain.com/<name>/*). Same-origin as the shell, no cross-subdomain cookie/CORS
 *   concern.
 * - "standalone": routed on its own domain/subdomain (Next.js Multi-Zones, a true
 *   separate origin). Requires the cookie-domain/CORS/DNS/cert setup described in
 *   module-noi-bo-vs-standalone-domain.md (Laravel repo, docs/fe-modular/).
 *
 * This file does NOT decide whether a module gets its own Docker Swarm service -
 * EVERY module gets one regardless of zone (see best-practice-structure.md's
 * foundational principle: independent deploy/rollback for every module). This file
 * only decides the ROUTING RULE generated for that module's Swarm stack file and the
 * shell's rewrites - see scripts/generate-infra.ts.
 *
 * z.discriminatedUnion forces "standalone" modules to always have a domain, and
 * "internal" modules to never have one - a misconfiguration is caught here, at parse
 * time, not discovered later as a broken deploy.
 */
const ModuleSchema = z.discriminatedUnion("zone", [
  z.object({
    name: z.string(),
    zone: z.literal("internal"),
    team: z.string().optional(),
  }),
  z.object({
    name: z.string(),
    zone: z.literal("standalone"),
    domain: z.string(),
    team: z.string().optional(),
  }),
]);

export type ModuleConfig = z.infer<typeof ModuleSchema>;

const ModuleListSchema = z
  .array(ModuleSchema)
  // Catches 2 teams adding a same-named module in 2 separate PRs - without this,
  // generate-infra.ts would silently overwrite one module's infra/swarm/<name>.yml
  // and shell rewrite with the other's, only discovered at deploy time.
  .refine(
    (mods) => new Set(mods.map((m) => m.name)).size === mods.length,
    "modules.config.ts has a duplicate module name",
  );

export const modules: ModuleConfig[] = ModuleListSchema.parse([
  { name: "it-ticket", zone: "internal" },
  // Add new modules here as they're migrated - e.g.:
  // { name: "hrm", zone: "internal" },
  // { name: "dml", zone: "standalone", domain: "dml.archetype-group.com" },
]);
