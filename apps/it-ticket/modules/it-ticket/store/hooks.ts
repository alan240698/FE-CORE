import { useDispatch, useSelector } from "react-redux";
import type { InferRootState, AppDispatch } from "@archetype/core";
import type { ticketReducer } from "./ticketSlice";

// This app's actual extraReducers shape, matching exactly what app/providers.tsx
// passes to <StoreProvider extraReducers={{ ticket: ticketReducer }}> - keep these in
// sync (TypeScript won't catch a drift between them, since providers.tsx's prop isn't
// typed against this file).
type ItTicketExtra = { ticket: typeof ticketReducer };

export type RootState = InferRootState<ItTicketExtra>;
export type { AppDispatch };

// react-redux v9.1's own built-in pattern (`useSelector.withTypes<T>()`) - no custom
// wrapper needed, see packages/core/store/index.ts's doc comment for why
// InferRootState/InferAppDispatch exist but a createTypedHooks()-style factory doesn't.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
