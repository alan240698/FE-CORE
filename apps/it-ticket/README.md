# it-ticket

The IT Ticket module — first module migrated from the Laravel/Blade intranet, and the
reference implementation every later module (HRM, ABI...) should copy the structure of.
See `modules/it-ticket/CLAUDE.md` (if present) or `packages/core/CLAUDE.md` for the
Open/Closed contract this module relies on.

Routed as `zone: "internal"` in `modules.config.ts` — served under the shell's own
domain at `/it-ticket/*`, not its own subdomain.

## Commands

```bash
pnpm --filter @archetype/it-ticket run dev
pnpm --filter @archetype/it-ticket run build
pnpm --filter @archetype/it-ticket run test       # Vitest - domain logic + component tests
pnpm --filter @archetype/it-ticket run e2e        # Playwright - see e2e/ for what's covered and why
pnpm --filter @archetype/it-ticket run type-check
pnpm --filter @archetype/it-ticket run lint
```

## What's covered by tests, and what isn't yet

- `modules/it-ticket/domain/ticketRules.test.ts` — SLA deadline, overdue check, status
  transitions. Pure logic, no rendering.
- `modules/it-ticket/components/TicketList.test.tsx` — component test via MSW (mocks
  the network, not the Redux store).
- `e2e/create-ticket.spec.ts` — the one critical-path E2E test for this module (mocks
  the API via Playwright's `page.route()`).
- **Not yet covered**: a cross-zone login/auth smoke test. There's no real
  shell↔it-ticket navigation or cookie-based auth wired up yet — see the root
  `CLAUDE.md`'s "Known pending item". Add that test once the real flow exists, not
  before.
