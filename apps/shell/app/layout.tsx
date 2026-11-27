import type { Metadata } from "next";
import { StoreProvider } from "@archetype/core";
import { env } from "../env";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archetype Group Intranet",
  description: "Shell - host zone for every Archetype Group intranet module",
  // Internal, behind-auth dashboard - never meant to be search-indexed. This is
  // defense-in-depth (robots.txt below already disallows everything) in case a page
  // ever gets reached by a crawler through a misconfigured proxy/DNS, not a response to
  // any indexing incident that actually happened - see audit-seo-web-standards-2026-11-27.md.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`h-full antialiased ${fontVariables}`}>
      <body className="min-h-full flex flex-col" data-api-base={env.NEXT_PUBLIC_API_BASE_URL}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
