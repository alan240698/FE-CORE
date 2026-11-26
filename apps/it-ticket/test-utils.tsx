import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { StoreProvider } from "@archetype/core";
import { ticketReducer } from "./modules/it-ticket/store/ticketSlice";

// TEMPORARY location (local to apps/it-ticket only) - once packages/shared/test-utils
// exists, this will become a shared renderWithProviders() that takes extraReducers as
// a parameter instead of hardcoding ticketReducer here (see best-practice-structure.md
// - remaining backlog item).
export function renderWithProviders(ui: ReactElement) {
  return render(<StoreProvider extraReducers={{ ticket: ticketReducer }}>{ui}</StoreProvider>);
}

export * from "@testing-library/react";
