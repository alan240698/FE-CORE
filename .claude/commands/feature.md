---
description: Analyze and implement a new feature following this repo's before/after coding workflow
---

Invoke the `feature-development` skill for the following feature request, in
`archetype-frontend`:

$ARGUMENTS

Follow its workflow exactly: understand → research (find the closest existing
pattern already in this repo, don't invent a new shape) → plan → validate the plan
against `docs/HANDBOOK.md` and the matching `.claude/rules/*.md` files → implement →
run the full verification checklist.

Scope limit: touch only the files genuinely required for this feature. If the
research step reveals the feature needs a change to `packages/core`'s fixed contract,
stop and report that instead of editing it directly — read `packages/core/CLAUDE.md`'s
Open/Closed section first and propose the correct extension point.

Report back: what you understood the scope to be, what you found when researching
(especially if something already does most of this), the plan, and the verification
checklist results — including anything you did NOT verify.
