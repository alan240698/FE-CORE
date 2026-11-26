"use client";

import { StoreProvider } from "@archetype/core";
import { ticketReducer } from "../modules/it-ticket/store/ticketSlice";

/**
 * BAT BUOC tach rieng file nay ("use client") thay vi goi StoreProvider thang trong
 * layout.tsx - da xac nhan that bang build: layout.tsx mac dinh la Server Component,
 * truyen ticketReducer (1 FUNCTION) lam prop thang xuong StoreProvider (Client Component)
 * se bi Next.js chan voi loi "Functions cannot be passed directly to Client Components"
 * (function khong serialize qua ranh gioi RSC). File nay TU CHAY O CLIENT nen tu import
 * va dung ticketReducer o CUNG 1 module, khong con la "truyen qua boundary" nua.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <StoreProvider extraReducers={{ ticket: ticketReducer }}>{children}</StoreProvider>;
}
