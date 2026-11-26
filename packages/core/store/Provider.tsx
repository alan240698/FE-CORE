"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import type { AppStore } from "./index";

/**
 * Theo pattern chinh thuc Redux Toolkit khuyen nghi cho Next.js App Router: tao store
 * MOI cho moi lan mount (tranh leak state giua request/zone khac nhau), giu on dinh
 * qua cac lan render bang useRef - khong dung 1 store singleton toan cuc.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
