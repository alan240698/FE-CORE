---
name: code-review
description: Use before calling any task in archetype-frontend done, or when explicitly asked to review a diff/PR. Runs the repo's real Definition of Done and code-review checklist (docs/HANDBOOK.md §17-18) against the actual changed files, not a generic review.
---

# Code Review (archetype-frontend)

Purpose: verify a change against this repo's actual, evidence-based conventions —
not a generic "looks fine" pass. Every item below traces to a real rule in
`docs/HANDBOOK.md`, not a personal preference.

## When to use

- Before reporting any coding task as complete.
- When explicitly asked to review a diff, branch, or PR.

## Required context

- `docs/HANDBOOK.md` §17 (review checklist) and §18 (Definition of Done) — this skill
  operationalizes both, don't skip reading them once per session.
- The `.claude/rules/*.md` file(s) matching the changed paths.

## Step-by-step workflow

1. **List every changed file** (`git diff --stat` or equivalent) — review scope is
   exactly this list, not the whole repo.
2. **Boundary check**: any new import crossing a package boundary? Run
   `pnpm run depcruise` for a real answer, don't eyeball it.
3. **Duplication check**: does any new constant/type/value list already exist
   elsewhere (especially a Zod schema's enum values, an API path, a UI string)?
4. **Abstraction check**: is every new component/hook/utility/constant backed by
   ≥2 real consumers, or 1 consumer with genuinely non-trivial logic? Flag anything
   that looks "built in case it's needed."
5. **API/security check**: any new network call bypasses `baseApi.injectEndpoints()`/
   `serverFetch()`? Any `as T` cast on external data instead of Zod validation? Any
   credential handling outside the existing `authSlice`/`baseQueryWithReauth`
   mechanism? Any `dangerouslySetInnerHTML`/`eval()` with unsanitized content? Any
   redirect built from unsanitized user/URL input? Any value newly prefixed
   `NEXT_PUBLIC_*` that shouldn't be public? See `.claude/rules/api-and-security.md`
   for the full list.
6. **Performance check**: does a new/changed component mark a whole page/layout
   `"use client"` when only a leaf needs it? Does every new `.map()` use a stable
   unique `key` (never the array index)? Is any new `useMemo`/`useCallback`/`memo()`
   backed by an actual profiling result, not a guess? See
   `.claude/rules/components-and-hooks.md`.
7. **Test check**: does the diff include a test for the success path? For the error
   path, if error handling was added/changed? Is a bug fix's test verified red/green
   (not just added after the fix with no red phase ever observed)?
8. **i18n check**: any hardcoded UI string that should go through
   `@archetype/i18n`'s `createMessages()`?
9. **Commit message check**: Conventional Commits, lowercase subject, body lines
   ≤100 chars.

## Constraints

- This is a review, not a rewrite — flag issues, don't silently "fix" someone else's
  in-progress work unless asked to.
- Distinguish a **blocking** issue (violates an enforced rule, a real bug, a security
  gap) from a **suggestion** (style preference, a Future-Improvements-level note) —
  don't present both with the same urgency.

## Verification checklist (the review's own output must include this)

- [ ] `pnpm exec turbo run lint type-check test build` result (not just "should pass")
- [ ] `pnpm run depcruise` result
- [ ] `pnpm exec prettier --check .` result
- [ ] Explicit list of what was NOT checked (e.g. "did not re-run E2E", "did not test
      against a real backend") — never imply full coverage silently.

## Expected output

A findings list grouped by severity (blocking vs. suggestion vs. future), each with
file:line, what the rule is, and why it applies here — not a generic "LGTM" or a wall
of unprioritized nitpicks.
