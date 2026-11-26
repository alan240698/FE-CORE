"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import type { ReducersMapObject } from "./index";

/**
 * OPEN/CLOSED: accepts "extraReducers" via props - any app that needs its own state
 * (e.g. IT Ticket's ticketReducer) passes it in here, never edit this file. Follows
 * the official Redux Toolkit pattern recommended for Next.js App Router: create a NEW
 * store on every mount, keep it stable across re-renders via useRef.
 *
 * MUST be called from a dedicated "use client" providers.tsx in each app, never
 * directly from layout.tsx - see the top-level comment in apps/it-ticket/app/providers.tsx
 * for why (a reducer function cannot be passed as a prop across the Server->Client
 * Component boundary).
 */
export function StoreProvider<TExtra extends ReducersMapObject>({
  extraReducers,
  children,
}: {
  extraReducers?: TExtra;
  children: React.ReactNode;
}) {
  const storeRef = useRef<ReturnType<typeof makeStore<TExtra>> | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore(extraReducers as TExtra);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
