"use client";

import Link from "next/link";
import { useGetMenuQuery } from "@archetype/core";
import { vi } from "../messages/vi";

/**
 * Real navigation for the shell (host zone) - the actual entry point into each
 * business module's Multi-Zones path (e.g. /it-ticket). Reads the logged-in user's
 * menu from the Laravel backend ("/me/menu", already permission-filtered server-side)
 * rather than hardcoding a module list here, so a module hidden by permissions never
 * shows up - see packages/core/menu/useMenu.ts.
 */
export function Nav() {
  const { data: menu, isLoading, isError } = useGetMenuQuery();

  if (isLoading) return <p role="status">{vi.navLoading}</p>;
  if (isError || !menu) return <p role="alert">{vi.navError}</p>;
  if (menu.length === 0) return <p>{vi.navEmpty}</p>;

  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-col gap-2">
        {menu.map((item) => (
          <li key={item.path}>
            <Link href={item.path} className="text-ag-teal-700 underline">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
