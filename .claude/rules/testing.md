---
description: Testing conventions — unit, component, and E2E
paths: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/e2e/**/*.ts"]
---

# Testing rules

Full rationale: `docs/HANDBOOK.md` §12, `docs/HOWTO.md` §3.

1. **Unit/component tests: Vitest + React Testing Library + MSW.** Never mock the
   Redux store (`redux-mock-store` doesn't work with RTK Query's real middleware) —
   mock the network with MSW instead.
2. **MSW handlers live in their own file** (`mocks/handlers.ts` for a module, or a
   sibling `*.mocks.ts` for an app-level component) — never inline in the test file.
3. **E2E (Playwright): one test per module's critical write/read path** — this repo's
   deliberate minimal-E2E policy, not full screen coverage. Don't add an E2E test for
   every screen; add one for a genuinely critical flow.
4. **Test naming**: `describe("ComponentOrFunctionName", () => { it("describes the
behavior in English", ...) })` — never `test()`, never start an `it()` description
   with "should".
5. **Race-condition/concurrency tests must use distinct cache keys** per concurrent
   call — RTK Query dedupes identical cache-key requests, which would make a broken
   mutex pass a naive test anyway.
6. **Any bug fix needs red/green verification**: reproduce the failure with a test
   first (confirm it actually fails for the right reason), then fix, then confirm the
   same test passes. A test written only after the fix, with no red phase ever
   observed, has not actually been verified to catch the bug.
7. **Always use `renderWithProviders`** from `@archetype/test-utils`, not RTL's bare
   `render` — it wraps a real Redux `Provider` with `baseApi` middleware already
   wired.
8. Assert RTK Query state via the **`isError`/`isLoading` boolean flags**, not a
   truthy-check on the raw `error`/`data` object.
