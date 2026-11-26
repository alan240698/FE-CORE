import { useSelector } from "react-redux";
import type { AuthState } from "./authSlice";

/**
 * OPEN/CLOSED: dung duoc o BAT KY app nao (shell, it-ticket, hrm...) du moi app co
 * RootState khac nhau (vi co extraReducers khac nhau) - vi chi can biet state co field
 * "auth" (luon dung vi StoreProvider cua core luon gan authReducer vao "auth"), khong can
 * biet toan bo RootState that cua app do.
 */
export function useAuth(): AuthState {
  return useSelector((state: { auth: AuthState }) => state.auth);
}
