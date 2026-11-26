import { useSelector } from "react-redux";
import type { AuthState } from "./authSlice";

/**
 * OPEN/CLOSED: works in ANY app (shell, it-ticket, hrm...) regardless of that app's
 * actual RootState shape (each app has different extraReducers) - it only needs the
 * state to have an "auth" field (always true, since core's StoreProvider always wires
 * authReducer under "auth"), it never needs to know that app's full real RootState.
 */
export function useAuth(): AuthState {
  return useSelector((state: { auth: AuthState }) => state.auth);
}
