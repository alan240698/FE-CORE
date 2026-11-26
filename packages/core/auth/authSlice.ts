import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  permissions: string[];
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  permissions: [],
};

export interface SetCredentialsPayload {
  accessToken: string;
  user?: AuthUser;
  permissions?: string[];
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<SetCredentialsPayload>) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.user) state.user = action.payload.user;
      if (action.payload.permissions) state.permissions = action.payload.permissions;
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.user = null;
      state.permissions = [];
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
