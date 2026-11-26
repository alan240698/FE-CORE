import { readdirSync, existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * Discovers every app under apps/ that has an e2e/ directory containing at least one
 * *.spec.ts file, and runs its Playwright suite - so a newly scaffolded module (see
 * scripts/create-module.ts) is picked up by CI automatically, instead of CI hardcoding
 * one app's name the way it originally hardcoded "it-ticket" (would have become the
 * same manual, easy-to-forget-per-module problem the scaffold tool itself exists to
 * avoid - see audit-nextjs-core-principal-architect-2026-11-26.md, finding SCALE-6).
 */
function appsWithE2E(): string[] {
  return readdirSync(join(ROOT, "apps"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((app) => {
      const e2eDir = join(ROOT, "apps", app, "e2e");
      if (!existsSync(e2eDir)) return false;
      return readdirSync(e2eDir).some((file) => file.endsWith(".spec.ts"));
    });
}

function packageNameOf(app: string): string {
  const raw = readFileSync(join(ROOT, "apps", app, "package.json"), "utf8");
  return (JSON.parse(raw) as { name: string }).name;
}

const apps = appsWithE2E();

if (apps.length === 0) {
  console.log("No app has an e2e/ suite yet - nothing to run.");
  process.exit(0);
}

for (const app of apps) {
  const pkgName = packageNameOf(app);

  console.log(`\n=== ${pkgName}: installing Playwright browsers ===`);
  execFileSync(
    "pnpm",
    ["--filter", pkgName, "exec", "playwright", "install", "--with-deps", "chromium"],
    { stdio: "inherit", cwd: ROOT },
  );

  console.log(`=== ${pkgName}: running e2e ===`);
  execFileSync("pnpm", ["--filter", pkgName, "run", "e2e"], { stdio: "inherit", cwd: ROOT });
}
