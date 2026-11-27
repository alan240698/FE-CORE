import { Roboto, Archivo } from "next/font/google";

// `theme.css`'s `--font-sans`/`--font-heading` only ever declared the font NAME as a
// plain CSS font-stack ("Roboto", Arial, sans-serif) - confirmed empirically (real
// browser build + `document.fonts.size === 0`) that this never actually loaded the
// real Google Font anywhere: with 0 `next/font`/Google Fonts `<link>`/`@font-face`
// existing, every page silently rendered the Arial/system fallback the whole time -
// see audit-dependency-build-2026-11-27.md. `next/font/google` is part of `next`
// itself (already a dependency here) - no new package needed, self-hosts the font
// files at build time (no runtime request to Google's CDN, no layout-shift-prone
// external `<link>`).
//
// `variable` is set to the SAME name theme.css already uses, so this correctly
// overrides that value wherever `fontVariables` is applied (narrower CSS scope wins),
// without needing to touch theme.css - Storybook/non-Next.js contexts still fall back
// to the plain CSS font-stack there, this is additive, not a replacement.
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
