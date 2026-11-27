import type { Metadata } from "next";
import { StoreProvider } from "@archetype/core";
import { env } from "../env";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archetype Group Intranet",
  description: "Shell - host zone for every Archetype Group intranet module",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${fontVariables}`}>
      <body className="min-h-full flex flex-col" data-api-base={env.NEXT_PUBLIC_API_BASE_URL}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
