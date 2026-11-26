# shell

The "host" zone — serves `domain.com`, owns the top-level navigation/menu, and routes
requests for each business module to that module's own zone via Next.js Multi-Zones
`rewrites()` (generated from `modules.config.ts` by `scripts/generate-infra.ts`, see
`apps/shell/rewrites.generated.js` — do not edit that file by hand).

This app intentionally has no business logic of its own — only `core/menu` (nav data)
and whatever cross-module chrome (header, sidebar) every module shares.

## Commands

```bash
pnpm --filter @archetype/shell run dev
pnpm --filter @archetype/shell run build
pnpm --filter @archetype/shell run test
```
