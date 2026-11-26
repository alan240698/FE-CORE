import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TicketStatus } from "../types/ticket";

// This module's OWN UI state (filters, form state...) - DIFFERENT from server data
// (the ticket list), which RTK Query (ticketApi.ts) manages in its own cache.
export interface TicketUiState {
  statusFilter: TicketStatus | "all";
}

const initialState: TicketUiState = {
  statusFilter: "all",
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<TicketUiState["statusFilter"]>) {
      state.statusFilter = action.payload;
    },
  },
});

export const { setStatusFilter } = ticketSlice.actions;
export const ticketReducer = ticketSlice.reducer;
