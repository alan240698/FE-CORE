// A SECOND, SEPARATE public surface from index.ts - import this file ONLY from Server
// Components (import { serverFetch } from "@archetype/core/server").
//
// WHY THIS CAN'T LIVE IN index.ts: serverFetch.ts imports next/headers (Server
// Components / Node only). index.ts is imported by Client Components too (e.g.
// StoreProvider, useAuth - see apps/*/app/providers.tsx). Next.js's bundler statically
// analyzes every module reachable from a Client Component's import graph and REJECTS
// the build if next/headers is reachable from it, even if nothing in that graph
// actually calls serverFetch() at runtime - confirmed with a real build error:
// "You're importing a module that depends on 'next/headers'... Client Component
// Browser: .../index.ts". A single barrel re-exporting both server-only and
// client-usable code doesn't work once ANY export needs a server-only API - hence 2
// entry points instead of 1.
//
// @archetype/core/server is a DELIBERATE exception to the "no deep imports into
// @archetype/*/*" ESLint boundary (see packages/eslint-config/boundaries.js) - it is
// itself a named public surface, not an internal implementation file.
export { serverFetch } from "./api-client/serverFetch";
