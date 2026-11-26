import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";

/**
 * Scaffolds a new Next.js module app (apps/<name>/) with the same real, verified
 * structure as apps/it-ticket - the ~15-step manual process documented in
 * setup-tu-zero-archetype-frontend.md (Laravel repo) Step 17, now automated so it
 * can't be copy-pasted wrong between teams (see
 * audit-nextjs-core-principal-architect-2026-11-26.md, finding SCALE-6).
 *
 * Deliberately does NOT scaffold fake business logic (a placeholder Redux slice,
 * a placeholder domain file, a placeholder E2E test asserting nothing real) - that
 * exact pattern (apps/it-ticket's now-dead ticketSlice.statusFilter) was itself flagged
 * as dead code in the audit above (finding D-9). It scaffolds working INFRASTRUCTURE
 * (env validation, lint, build, basePath, test runner config) and leaves
 * modules/<name>/{domain,store,components,types,mocks}/ as documented empty
 * directories for the first real feature to fill in.
 *
 * Usage:
 *   pnpm exec tsx scripts/create-module.ts <name>
 *   pnpm exec tsx scripts/create-module.ts <name> --zone standalone --domain <domain>
 *
 * After running, finish by hand (deliberately NOT automated - see main()'s printed
 * next steps): add the module to modules.config.ts (this script does that part too,
 * but always re-check the diff), then `pnpm install && pnpm run generate-infra`.
 */

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

function parseArgs(): { name: string; zone: "internal" | "standalone"; domain?: string } {
  const args = process.argv.slice(2);
  const name = args[0];
  if (!name || name.startsWith("--")) {
    console.error(
      "Usage: pnpm exec tsx scripts/create-module.ts <name> [--zone standalone --domain <domain>]",
    );
    process.exit(1);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error(
      `Invalid module name "${name}" - must be lowercase kebab-case (e.g. "hrm", "abi-report").`,
    );
    process.exit(1);
  }
  if (existsSync(join(ROOT, "apps", name))) {
    console.error(`apps/${name} already exists - refusing to overwrite.`);
    process.exit(1);
  }

  const zoneIndex = args.indexOf("--zone");
  const zone = zoneIndex !== -1 ? args[zoneIndex + 1] : "internal";
  if (zone !== "internal" && zone !== "standalone") {
    console.error(`--zone must be "internal" or "standalone", got "${zone}"`);
    process.exit(1);
  }

  const domainIndex = args.indexOf("--domain");
  const domain = domainIndex !== -1 ? args[domainIndex + 1] : undefined;
  if (zone === "standalone" && !domain) {
    console.error("--zone standalone requires --domain <domain>");
    process.exit(1);
  }

  return { name, zone, domain };
}

function pascalCase(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Next free dev port, following the convention apps/it-ticket established (3101) -
 * one port per module, counted from the existing number of app directories. */
function nextDevPort(): number {
  const existingModuleApps = readdirSync(join(ROOT, "apps"), { withFileTypes: true }).filter(
    (entry) => entry.isDirectory() && entry.name !== "shell",
  ).length;
  return 3101 + existingModuleApps;
}

async function format(filePath: string, content: string): Promise<string> {
  const fileInfo = await prettier.getFileInfo(filePath);
  if (!fileInfo.inferredParser) return content;
  const config = await prettier.resolveConfig(filePath);
  return prettier.format(content, { ...config, filepath: filePath });
}

async function write(path: string, content: string): Promise<void> {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, await format(path, content));
  console.log(`  wrote ${path.replace(ROOT + "/", "")}`);
}

function packageJsonTemplate(name: string, zone: "internal" | "standalone"): string {
  return JSON.stringify(
    {
      name: `@archetype/${name}`,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "eslint",
        "type-check": "tsc --noEmit",
        test: "vitest run",
        e2e: "playwright test",
      },
      dependencies: {
        "@archetype/core": "workspace:*",
        "@archetype/env-schema": "workspace:*",
        "@archetype/next-config": "workspace:*",
        next: "16.4.6",
        react: "19.3.0",
        "react-dom": "19.3.0",
      },
      devDependencies: {
        "@archetype/eslint-config": "workspace:*",
        "@archetype/shared": "workspace:*",
        "@archetype/test-utils": "workspace:*",
        "@archetype/tailwind-config": "workspace:*",
        "@archetype/tsconfig": "workspace:*",
        "@tailwindcss/turbopack": "4.3.3",
        "@playwright/test": "^1.49.1",
        "@testing-library/jest-dom": "^6.6.3",
        "@testing-library/react": "^16.1.0",
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "@vitejs/plugin-react": "^4.3.4",
        eslint: "^9",
        "eslint-config-next": "16.4.6",
        jsdom: "^25.0.1",
        msw: "^2.7.0",
        tailwindcss: "4.3.3",
        typescript: "^5",
        vitest: "^3.0.4",
      },
    },
    null,
    2,
  );
}

function tsconfigTemplate(): string {
  return JSON.stringify(
    {
      extends: "@archetype/tsconfig/nextjs.json",
      compilerOptions: { paths: { "@/*": ["./*"] } },
      include: [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx",
        ".next/types/**/*.ts",
        ".next/dev/types/**/*.ts",
        "**/*.mts",
      ],
      exclude: ["node_modules"],
    },
    null,
    2,
  );
}

function eslintConfigTemplate(): string {
  return `import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import archetypeRules from "@archetype/eslint-config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...archetypeRules,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
`;
}

function nextConfigTemplate(zone: "internal" | "standalone"): string {
  if (zone === "internal") {
    return `import type { NextConfig } from "next";
import { withBaseConfig } from "@archetype/next-config";
// Generated from modules.config.ts by scripts/generate-infra.ts - run
// \`pnpm run generate-infra\` after changing which modules exist, never edit the
// generated file by hand. REQUIRED for Next.js Multi-Zones - see generate-infra.ts's
// module doc comment for why (shell's rewrite proxies this module's own basePath).
import generatedBasePath from "./base-path.generated.js";

// cacheComponents/partialPrefetching are INTENTIONALLY left disabled - conflicts with
// Redux Toolkit's dev middleware (see root CLAUDE.md rule 7).
const nextConfig: NextConfig = withBaseConfig({
  basePath: generatedBasePath,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
});

export default nextConfig;
`;
  }

  return `import type { NextConfig } from "next";
import { withBaseConfig } from "@archetype/next-config";

// "standalone" zone module - owns the root of its own domain, no basePath.
// cacheComponents/partialPrefetching are INTENTIONALLY left disabled - conflicts with
// Redux Toolkit's dev middleware (see root CLAUDE.md rule 7).
const nextConfig: NextConfig = withBaseConfig({
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
});

export default nextConfig;
`;
}

function envTsTemplate(): string {
  return `import { createArchetypeEnv, baseClientEnvSchema } from "@archetype/env-schema";

export const env = createArchetypeEnv({
  ...baseClientEnvSchema,
});
`;
}

function globalsCssTemplate(): string {
  return `@import "tailwindcss";
@import "@archetype/tailwind-config/theme.css";
@source "../../../packages/shared/**/*.{ts,tsx}";

body {
  background: var(--color-ag-paper);
  color: var(--color-ag-grey-700);
  font-family: var(--font-sans);
}
`;
}

function providersTemplate(): string {
  return `"use client";

import { StoreProvider } from "@archetype/core";

// No extraReducers yet - this module has no state of its own. When it gets its first
// real Redux slice, import the reducer HERE (never in layout.tsx - see root
// CLAUDE.md rule 4) and pass it as extraReducers={{ <key>: <reducer> }}.
export function Providers({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
`;
}

function layoutTemplate(name: string, pascalName: string): string {
  return `import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "${pascalName} | Archetype Group",
  description: "Module ${name}",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`;
}

function pageTemplate(pascalName: string): string {
  return `export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-16">
      <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">${pascalName}</h1>
      <p>Build the real UI for this module here.</p>
    </main>
  );
}
`;
}

function healthRouteTemplate(): string {
  return `// Health check for Docker Swarm - ONLY reports liveness, does NOT call any
// database/API (see trien-khai-docker-swarm-cho-fe.md section 3 - liveness should not
// depend on other systems).
export async function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
`;
}

function vitestConfigTemplate(): string {
  return `import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e"],
    // This module has no tests yet right after scaffolding - Vitest fails by default
    // with zero test files ("No test files found"), which would break the whole
    // monorepo's "turbo run test" the moment this module exists. Remove this once the
    // first real test is added (it's harmless to leave, but a module with real tests
    // doesn't need it).
    passWithNoTests: true,
    // Vitest does NOT automatically read .env.local like the Next.js runtime does.
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000",
    },
  },
});
`;
}

function playwrightConfigTemplate(port: number): string {
  return `import { defineConfig, devices } from "@playwright/test";

const PORT = ${port};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: \`http://localhost:\${PORT}\`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: \`pnpm exec next dev -p \${PORT}\`,
    url: \`http://localhost:\${PORT}\`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
`;
}

function gitignoreTemplate(): string {
  return `# dependencies
/node_modules

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*
!.env.example

# typescript
*.tsbuildinfo
next-env.d.ts
`;
}

function readmeTemplate(name: string, pascalName: string, zone: string): string {
  return `# ${name}

Scaffolded by \`scripts/create-module.ts\` - replace this file's content once the module
has a real purpose.

Routed as \`zone: "${zone}"\` in \`modules.config.ts\`.

## Commands

\`\`\`bash
pnpm --filter @archetype/${name} run dev
pnpm --filter @archetype/${name} run build
pnpm --filter @archetype/${name} run test
pnpm --filter @archetype/${name} run e2e        # add a spec under e2e/ first - an empty
                                                  # e2e/ directory is skipped by CI
pnpm --filter @archetype/${name} run type-check
pnpm --filter @archetype/${name} run lint
\`\`\`

## What's covered by tests, and what isn't yet

Nothing yet - \`modules/${name}/\` is empty. Add the module's real logic under
\`modules/${name}/{domain,store,components,types,mocks}/\`, following
\`apps/it-ticket/modules/it-ticket/\` as the reference structure (see its README and
\`packages/core/CLAUDE.md\` for the Open/Closed contract this relies on). ${pascalName}'s
own README should list what's tested and what deliberately isn't, the same way
it-ticket's README does.
`;
}

function moduleDirReadme(dir: string): string {
  const notes: Record<string, string> = {
    domain:
      "Pure business logic only - no React, no Next.js imports (enforced by ESLint boundaries.js). Testable with plain Vitest, no rendering needed.",
    store:
      "Redux slice(s) and RTK Query endpoints for this module (injectEndpoints into @archetype/core's baseApi - never createApi() directly). Wire a new slice's reducer into app/providers.tsx, never into packages/core.",
    components: "React components for this module's UI.",
    types: "Shared TypeScript types for this module's domain data.",
    mocks: "MSW request handlers for this module's component tests.",
  };
  return `# ${dir}/

${notes[dir] ?? ""}
`;
}

async function main() {
  const { name, zone, domain } = parseArgs();
  const pascalName = pascalCase(name);
  const port = nextDevPort();
  const appDir = join(ROOT, "apps", name);

  console.log(`Scaffolding apps/${name} (zone: ${zone}${domain ? `, domain: ${domain}` : ""})...`);

  await write(join(appDir, "package.json"), packageJsonTemplate(name, zone));
  await write(join(appDir, "tsconfig.json"), tsconfigTemplate());
  await write(join(appDir, "eslint.config.mjs"), eslintConfigTemplate());
  await write(join(appDir, "next.config.ts"), nextConfigTemplate(zone));
  await write(join(appDir, "env.ts"), envTsTemplate());
  await write(join(appDir, "vitest.config.ts"), vitestConfigTemplate());
  await write(join(appDir, "vitest.setup.ts"), 'import "@testing-library/jest-dom/vitest";\n');
  await write(join(appDir, "playwright.config.ts"), playwrightConfigTemplate(port));
  await write(join(appDir, ".gitignore"), gitignoreTemplate());
  await write(join(appDir, "README.md"), readmeTemplate(name, pascalName, zone));

  await write(join(appDir, "app/layout.tsx"), layoutTemplate(name, pascalName));
  await write(join(appDir, "app/page.tsx"), pageTemplate(pascalName));
  await write(join(appDir, "app/globals.css"), globalsCssTemplate());
  await write(join(appDir, "app/providers.tsx"), providersTemplate());
  await write(join(appDir, "app/api/health/route.ts"), healthRouteTemplate());

  for (const dir of ["domain", "store", "components", "types", "mocks"]) {
    await write(join(appDir, `modules/${name}/${dir}/README.md`), moduleDirReadme(dir));
  }

  // Anchored insert into modules.config.ts - fails loudly instead of silently
  // corrupting the file if the anchor comment ever changes or is missing.
  const configPath = join(ROOT, "modules.config.ts");
  const configSource = readFileSync(configPath, "utf8");
  const anchor = "  // Add new modules here as they're migrated - e.g.:";
  if (!configSource.includes(anchor)) {
    console.error(
      `\nCould not find the expected anchor comment in modules.config.ts - add this module's entry by hand:`,
    );
    console.error(
      zone === "internal"
        ? `  { name: "${name}", zone: "internal" },`
        : `  { name: "${name}", zone: "standalone", domain: "${domain}" },`,
    );
  } else {
    const entry =
      zone === "internal"
        ? `  { name: "${name}", zone: "internal" },\n`
        : `  { name: "${name}", zone: "standalone", domain: "${domain}" },\n`;
    const updated = configSource.replace(anchor, entry + anchor);
    writeFileSync(configPath, await format(configPath, updated));
    console.log(`  updated modules.config.ts`);
  }

  console.log(`\nDone. Next steps (not automated - review before running):`);
  console.log(`  1. Check the modules.config.ts diff is correct`);
  console.log(`  2. pnpm install`);
  console.log(`  3. pnpm run generate-infra`);
  console.log(`  4. pnpm --filter @archetype/${name} run build   # should pass immediately`);
}

main();
