// Prefer `import type { Foo } from "..."` over a value import used only for its type -
// lets the TypeScript compiler strip it at build time (no dead runtime import left in the
// bundle) and makes "this is a type, not a runtime dependency" explicit at the call site.
// The rule itself belongs to @typescript-eslint/eslint-plugin, already registered under the
// "@typescript-eslint" plugin name by eslint-config-next/typescript in every app's
// eslint.config.mjs - this file only turns the rule on, no new dependency needed.
//
// (eslint-plugin-unused-imports was considered too - not added: @typescript-eslint/no-unused-vars
// is already "error" via eslint-config-next/typescript, so unused imports are already caught;
// the extra plugin would only add auto-removal, not new detection.)

const importPlugin = require("eslint-plugin-import");

// import/order: groups external packages (incl. "@archetype/*" workspace packages,
// resolved through node_modules like any other package) before path-alias ("@/*") and
// relative imports - this is already the de facto convention in every existing file
// (see e.g. apps/shell/app/components/Nav.tsx), so the rule only catches FUTURE drift,
// no existing file needed reordering. "alphabetize" is deliberately left off: existing
// files group relative imports by which local module they come from, not strict
// A-Z order, and forcing alphabetize would require a repo-wide reorder with no real
// benefit over the existing grouping.
//
// Registers "eslint-plugin-import" directly here (own package.json dependency) instead
// of relying on eslint-config-next already registering it - this config is also spread
// into packages/shared's and packages/test-utils's eslint.config.mjs, which do NOT use
// eslint-config-next and would otherwise fail with "could not find plugin import"
// (confirmed by actually running lint there before adding this).
/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { import: importPlugin },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          "newlines-between": "never",
        },
      ],
    },
  },
];
