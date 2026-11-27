---
description: Review code before completing a task — runs this repo's real Definition of Done and code-review checklist
---

Invoke the `code-review` skill against the current working tree's uncommitted/staged
changes (or, if given, against: $ARGUMENTS — a branch name, commit range, or file
list).

Run every item in the skill's workflow and verification checklist for real (actually
run the commands — `turbo run lint type-check test build`, `depcruise`, `prettier
--check` — don't assume they'd pass). Report the findings grouped by severity
(blocking / suggestion / future), each with file:line and which specific rule in
`docs/HANDBOOK.md` or `.claude/rules/` it traces to. End with an explicit list of what
was NOT checked (e.g. not re-run against a real backend, E2E not re-run) — never
imply full coverage silently.
