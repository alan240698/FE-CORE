/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment:
        "Circular dependency found - this is the kind of issue eslint-plugin-boundaries " +
        "(our ESLint architecture rules) cannot catch, since it only checks folder-level " +
        "import direction, not cycles across the full resolved module graph.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    // Relies on Node/pnpm module resolution (workspace symlinks), not a custom
    // tsConfig path-mapping setup - each package already resolves "@archetype/*"
    // via its own node_modules symlink, same as at runtime.
    doNotFollow: { path: "node_modules" },
    exclude: {
      // ".next/" matters here, not just cosmetically - without it, whether this scan
      // happens to run before or after a build changes the reported module count by
      // 3-4x (confirmed for real: 93 modules with no .next/ present vs 347 right after
      // a build, same source, same config) since Next.js's generated .next/types/*.ts
      // declaration files sit inside apps/<app>/ and get swept up as "source" otherwise.
      path: "(\\.test\\.|\\.stories\\.|\\.storybook/|e2e/|storybook-static/|\\.next/)",
    },
    tsPreCompilationDeps: true,
  },
};
