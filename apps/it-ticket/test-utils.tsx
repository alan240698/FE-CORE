import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { StoreProvider } from "@archetype/core";
import { ticketReducer } from "./modules/it-ticket/store/ticketSlice";

// TAM THOI dat o day (rieng app it-ticket) - khi dung packages/shared/test-utils se
// doi thanh renderWithProviders() dung chung, nhan them extraReducers tu tham so thay vi
// hardcode ticketReducer o day (xem best-practice-structure.md - viec con lai trong backlog).
export function renderWithProviders(ui: ReactElement) {
  return render(<StoreProvider extraReducers={{ ticket: ticketReducer }}>{ui}</StoreProvider>);
}

export * from "@testing-library/react";
