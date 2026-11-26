import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TicketStatus } from "../types/ticket";

// State UI RIENG cua module nay (bo loc, trang thai form...) - KHAC voi du lieu
// server (ticket list) do RTK Query (ticketApi.ts) tu quan ly cache rieng.
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
