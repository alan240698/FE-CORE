import type { Metadata } from "next";
import { Providers } from "./providers";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Ticket | Archetype Group",
  description: "Module IT Ticket",
  // See apps/shell/app/layout.tsx's doc comment - same reasoning, both apps are
  // behind-auth and never meant to be search-indexed.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`h-full antialiased ${fontVariables}`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
