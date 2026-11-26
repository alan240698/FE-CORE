// Enforce architectural boundaries with tooling, not self-discipline.
// Implemented with core ESLint "no-restricted-imports" (no extra plugin needed) -
// simpler than eslint-plugin-boundaries but enough for the 2 boundaries that matter
// most in this project (see best-practice-structure.md + nguyen-tac-code-fe-va-tai-lieu-cho-ai.md
// section 2.6):
//
// 1) modules/<module>/domain/** (pure business logic) must NOT import React/Next.js.
// 2) Nobody may import deep into an @archetype/* package internals - only through its
//    public surface (index.ts).
//
// IMPORTANT NOTE: in ESLint flat config, if 2 config objects both set the same rule
// for the same file, the LATER one COMPLETELY OVERWRITES (does not merge arrays) the
// earlier one for that rule - so domain/ uses a SINGLE combined block for both pattern
// groups, instead of two separate "no-restricted-imports" blocks both applying to the
// same file.

const noDeepImportArchetype = {
  group: ["@archetype/*/*"],
  message:
    "Only import from a package's public surface (e.g. '@archetype/core', not '@archetype/core/auth/authSlice').",
};

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Applies to EVERY .ts/.tsx file - only 1 boundary: no deep import into @archetype/*
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [noDeepImportArchetype] }],
    },
  },
  // domain/ specifically - adds the "no React/Next" boundary into the SAME rule,
  // not a separate block.
  {
    files: ["**/modules/*/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message:
                "domain/ is pure business logic and must not import React - see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 2.6.",
            },
          ],
          patterns: [
            noDeepImportArchetype,
            {
              group: ["next", "next/*", "react-dom", "react-dom/*"],
              message:
                "domain/ is pure business logic and must not import Next.js/React-DOM - see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 2.6.",
            },
          ],
        },
      ],
    },
  },
];
