import { describe, it, expect } from "vitest";
import { authReducer, setCredentials, clearCredentials } from "./authSlice";
import type { AuthState } from "./authSlice";

const initialState: AuthState = {
  accessToken: null,
  user: null,
  permissions: [],
};

describe("authReducer", () => {
  it("starts with no token, no user, no permissions", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("setCredentials stores the access token", () => {
    const state = authReducer(initialState, setCredentials({ accessToken: "abc123" }));
    expect(state.accessToken).toBe("abc123");
  });

  it("setCredentials keeps the existing user/permissions when not provided", () => {
    const withUser: AuthState = {
      accessToken: "old-token",
      user: { id: 1, email: "a@b.com", name: "A" },
      permissions: ["it-ticket.read"],
    };
    const state = authReducer(withUser, setCredentials({ accessToken: "new-token" }));
    expect(state.accessToken).toBe("new-token");
    expect(state.user).toEqual(withUser.user);
    expect(state.permissions).toEqual(withUser.permissions);
  });

  it("setCredentials overwrites user/permissions when provided", () => {
    const withUser: AuthState = {
      accessToken: "old-token",
      user: { id: 1, email: "a@b.com", name: "A" },
      permissions: ["it-ticket.read"],
    };
    const state = authReducer(
      withUser,
      setCredentials({
        accessToken: "new-token",
        user: { id: 2, email: "c@d.com", name: "C" },
        permissions: ["hrm.read"],
      }),
    );
    expect(state.user?.id).toBe(2);
    expect(state.permissions).toEqual(["hrm.read"]);
  });

  it("clearCredentials resets everything back to initial state", () => {
    const loggedIn: AuthState = {
      accessToken: "abc123",
      user: { id: 1, email: "a@b.com", name: "A" },
      permissions: ["it-ticket.read"],
    };
    const state = authReducer(loggedIn, clearCredentials());
    expect(state).toEqual(initialState);
  });
});
