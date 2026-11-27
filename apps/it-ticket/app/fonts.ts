import { Roboto, Archivo } from "next/font/google";

// Same fix, same reasoning as apps/shell/app/fonts.ts (not shared into a common
// package - packages/shared is deliberately kept Next.js-free so its Storybook build
// can run outside Next.js's compiler, and next/font's font files are self-hosted
// per-build anyway, never actually shared across Multi-Zones apps regardless of where
// the TS call site lives - see that file's doc comment for the full rationale).
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const fontVariables = `${roboto.variable} ${archivo.variable}`;
