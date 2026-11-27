---
name: feature-development
description: Use when implementing a new feature, component, module, or fixing a bug in archetype-frontend — the standard before/after coding workflow for this repo. Covers both new features and bug fixes (a bug fix skips most of planning but never skips reading the relevant rules).
---

# Feature Development (archetype-frontend)

Purpose: make sure every change — new feature or bug fix — goes through the same
research-then-verify discipline this repo has used across 11+ audits, instead of
reinventing a process each time.

## When to use

Any task that adds, changes, or fixes real application code in `apps/` or `packages/`.
Skip only for a pure documentation/typo fix with zero behavior change.

## Required context before starting

Read, in this order:

1. `CLAUDE.md` (root) — the task-based reading table tells you which doc(s) below actually apply.
2. `docs/HANDBOOK.md`'s relevant section(s) (don't read all 19 — pick by task, per the table in `CLAUDE.md`).
3. The nearest `.claude/rules/*.md` whose `paths` glob matches the file(s) you're about to touch.
4. If touching `packages/core`: its own `CLAUDE.md` (Open/Closed contract) — mandatory, not optional.

## Step-by-step workflow

### 1. Understand

- Restate the requirement in your own words. What's the acceptance criteria — what
  observable behavior proves this is done?
- Is this a new feature, a bug fix, or a refactor? (A bug fix needs a reproduction
  first, not just a guessed cause.)

### 2. Research

- Find the closest existing implementation of the same pattern already in the repo
  (e.g. adding a 2nd module's slice → read `apps/it-ticket/modules/it-ticket/store/`
  as the reference, don't invent a new shape).
- Check whether this already exists somewhere (grep before writing) — this repo has a
  strict rule-of-2 for new abstractions; don't create a 2nd thing that does what an
  existing thing already does.
- Identify every file this change will touch, and which package/module owns each one.

### 3. Plan

- List files to create/modify.
- Flag any architecture impact (new package boundary crossed? new Redux state?
  new API endpoint?).
- Flag security/performance risk explicitly, even if "none identified."
- List the test(s) this change needs (success path + error path minimum, per
  `docs/HANDBOOK.md` §12).

### 4. Validate the plan against this repo's anti-patterns

- Could this reuse something that already exists instead of adding new code?
- Does this duplicate logic/constants that already have a source of truth elsewhere
  (e.g. a Zod schema)?
- Does this need a new abstraction (hook/utility/constant), or does it fit inline
  because there's still only 1 consumer?
- Does this violate any rule in the matched `.claude/rules/*.md` file(s)?

### 5. Implement

Only start writing code once 1-4 are actually done — for a trivial one-line fix,
steps 1-4 can be seconds, not skipped.

## Constraints

- Never silently change `packages/core`'s fixed contract — extend via `extraReducers`/
  `injectEndpoints()`/`AuthStrategy`, per `packages/core/CLAUDE.md`.
- Never hardcode a path, a UI string, or a status-value list that already has a
  single source of truth elsewhere.
- Never add a dependency without checking `docs/HANDBOOK.md` §5's rule-of-2 for
  utilities and whether an existing dependency already covers the need.

## Verification checklist (after implementing, before calling the task done)

- [ ] `pnpm exec turbo run lint type-check test build` — clean, not just "passes with
      warnings."
- [ ] `pnpm run depcruise` — 0 new circular dependency / boundary violation.
- [ ] `pnpm exec prettier --check .` — clean.
- [ ] New code has ≥1 test for the success path, ≥1 for the error path if it has
      error handling.
- [ ] If UI changed: actually ran `pnpm run dev` and looked at it — don't rely on
      test-passing alone as proof the UI is correct.
- [ ] If a new route was added under a `zone: internal` module: verified `basePath`
      via a real standalone-server build + curl (`next start` is not reliable for
      `output: standalone` — see `CONTRIBUTING.md`).
- [ ] Any bug fix has a red/green verification recorded (reproduced the failure
      before fixing it).
- [ ] Report exactly what was checked and what was NOT checked — don't claim "done"
      if, say, E2E wasn't run for a change that touches a critical path.

## Expected output

A working change, passing the checklist above, with a clear statement of what was
verified vs. what a human reviewer should still check (e.g. "not re-run against a
real staging backend").
