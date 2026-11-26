import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { StoreProvider } from "@archetype/core";
import type { ReducersMapObject } from "@archetype/core";

/**
 * Shared test helper for every module's component tests - wraps the component under
 * test with the SAME StoreProvider used in production (real configureStore + real
 * reducers, not a mocked store), per the project's own testing convention: RTK Query
 * must be tested with MSW intercepting the network, never with a mocked Redux store
 * (see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 3.3).
 *
 * Lives in its OWN package (not packages/shared, which is pure UI) specifically so a
 * UI-only consumer of packages/shared never has to pull in @archetype/core - see
 * audit-nextjs-core-principal-architect-2026-11-26.md, finding CORE-5.
 *
 * Each module passes its OWN extraReducers - this file never hardcodes any module's
 * reducer, keeping it genuinely reusable across modules (open/closed, same principle
 * as packages/core/store/Provider.tsx).
 */
export function renderWithProviders<TExtra extends ReducersMapObject>(
  ui: ReactElement,
  extraReducers?: TExtra,
) {
  return render(<StoreProvider extraReducers={extraReducers}>{ui}</StoreProvider>);
}
