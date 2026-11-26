"use client";

import { useAuth } from "@archetype/core";
import { vi } from "../messages/vi";

/**
 * Dogfoods useAuth() with a real consumer - previously 0 app called it anywhere (see
 * audit-nextjs-core-principal-architect-2026-11-26.md, finding D-9). Only the guest
 * fallback is exercised for real today - there is no login flow wired up yet (see root
 * CLAUDE.md's "Known pending item"), so accessToken/user stay empty until that exists.
 */
export function UserStatus() {
  const { user } = useAuth();
  return (
    <p className="text-ag-grey-600 text-sm">
      {vi.userGreetingPrefix}
      {user?.name ?? vi.userGuest}
    </p>
  );
}
