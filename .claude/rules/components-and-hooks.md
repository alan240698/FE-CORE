---
description: Component and custom hook conventions
paths: ["**/components/**/*.tsx", "**/hooks/**/*.ts", "packages/shared/ui/**/*.tsx"]
---

# Components & Hooks rules

Full rationale: `docs/HANDBOOK.md` §2-3, `docs/HOWTO.md` §1-2.

## Components

1. `"use client"` on any business component using a hook (`useState`/`useSelector`/
   `useGetXQuery`...) — App Router defaults to Server Component. **Push the boundary
   as far down the tree as possible** — a parent doesn't need `"use client"` just
   because one of its children does; only the actual interactive leaf does. This is
   the single biggest performance lever Next.js App Router gives you (less client JS
   shipped, more of the tree stays server-rendered) — don't mark a whole page/layout
   `"use client"` to reach one stateful child deep inside it.
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
7. **Never `dangerouslySetInnerHTML` with unsanitized content** — 0 usage exists today;
   if ever genuinely needed, sanitize with a real library (e.g. DOMPurify) at the
   point of render and say so in a comment. See `.claude/rules/api-and-security.md`
   for the full security rule set — this file only duplicates the one rule most
   likely to come up while writing a component.
8. **Every list render (`.map()`) needs a stable, unique `key`** — a real ID from the
   data (`ticket.id`, `item.path`), never the array index (breaks on
   reorder/insert/delete: React misattributes state/DOM to the wrong item). Every
   `.map()` in this repo today already does this correctly (`key={item.path}`,
   `key={status}`, `key={ticket.id}`) — keep it that way for every new one.
9. **A component that's heavy and conditionally rendered** (a modal, a rich-text
   editor, a chart library, anything pulling in a large dependency only some users
   ever trigger) is a candidate for `next/dynamic` (with `ssr: false` if it's
   client-only) instead of bundling it into the initial page JS. 0 such component
   exists today (2 small apps, no heavy conditional UI) — this is the trigger
   condition to apply the pattern when one appears, not something to add
   speculatively now.
10. **A list rendering hundreds+ of rows** needs virtualization (e.g.
    `@tanstack/react-virtual`) — not needed today (max a handful of mock tickets), but
    is the concrete threshold for when `TicketList`'s plain `.map()` needs to change,
    per `audit-ui-ux-a11y-2026-11-27.md`.

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
