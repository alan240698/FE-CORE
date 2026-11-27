---
description: Component and custom hook conventions
paths: ["**/components/**/*.tsx", "**/hooks/**/*.ts", "packages/shared/ui/**/*.tsx"]
---

# Components & Hooks rules

Full rationale: `docs/HANDBOOK.md` §2-3, `docs/HOWTO.md` §1-2.

## Components

1. `"use client"` on any business component using a hook (`useState`/`useSelector`/
   `useGetXQuery`...) — App Router defaults to Server Component.
2. Early-return for loading/error BEFORE the main render path — no deep nested
   ternaries.
3. Prop names: `variant`, `size`, `disabled` for UI primitives (match
   `packages/shared/ui/button.tsx`) — don't invent synonyms (`type`, `kind`, `mode`)
   for the same concept.
4. A `packages/shared/ui/` component is `lowercase.tsx` (shadcn/ui convention,
   deliberate); a feature component in `modules/<name>/components/` or
   `app/components/` is `PascalCase.tsx`. Never mix the two conventions in one
   directory.
5. Loading/error states use `role="status"`/`role="alert"` (implicit ARIA live
   region) — don't add `aria-live` manually on top of this.
6. Only create a `packages/shared/ui/` component when ≥2 real places need the exact
   same markup (rule-of-2). A single consumer stays local to its module/app.

## Hooks

1. Write a custom hook only for a real, ≥2-place need, or logic complex enough to
   need isolated testing. This repo deleted speculative hooks before
   (`ticketSlice.statusFilter`-era pattern) — don't reintroduce it. A hand-built hook
   whose JSDoc says "0 consumer yet, remove if X by date Y" is an accepted interim
   state (see `packages/shared/hooks/*`), not a pattern to copy without that note.
2. Hook name must exactly describe what it returns — no generic names (`useData`,
   `useLogic`).
3. A hook using a browser API (`window`, `document`, `localStorage`) must guard
   `typeof window !== "undefined"` — relevant the day the first such hook is written
   (none exist yet).
4. A hook with a side effect (subscription, listener) must clean up in its `useEffect`
   return function.
5. A hook that calls an API is wrong — that's an RTK Query endpoint
   (`baseApi.injectEndpoints()`), auto-generates its own hook. Don't hand-write a hook
   that wraps `fetch()`.
