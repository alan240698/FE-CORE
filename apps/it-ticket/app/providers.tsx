"use client";

import { StoreProvider } from "@archetype/core";
import { ticketReducer } from "../modules/it-ticket/store/ticketSlice";

/**
 * This file MUST be a separate "use client" module instead of calling StoreProvider
 * directly in layout.tsx - confirmed with a real build: layout.tsx is a Server
 * Component by default, and passing ticketReducer (a FUNCTION) as a prop straight
 * down to StoreProvider (a Client Component) gets blocked by Next.js with "Functions
 * cannot be passed directly to Client Components" (a function cannot be serialized
 * across the RSC boundary). This file runs ENTIRELY on the client, so it imports and
 * uses ticketReducer within the same module - it is no longer "crossing a boundary".
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <StoreProvider extraReducers={{ ticket: ticketReducer }}>{children}</StoreProvider>;
}
