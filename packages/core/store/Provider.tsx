"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import type { ReducersMapObject } from "./index";

/**
 * OPEN/CLOSED: nhan "extraReducers" qua props - app nao can state rieng (vd IT Ticket can
 * ticketReducer) truyen vao day, KHONG sua file nay. Theo pattern chinh thuc Redux Toolkit
 * khuyen nghi cho Next.js App Router: tao store MOI moi lan mount, giu on dinh qua useRef.
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
