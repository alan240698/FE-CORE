import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@archetype/core";
import { env } from "../env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Archetype Group Intranet",
  description: "Shell - host zone for every Archetype Group intranet module",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" data-api-base={env.NEXT_PUBLIC_API_BASE_URL}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
