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

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
];
