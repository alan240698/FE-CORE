import { ErrorFallback } from "@archetype/shared";
import { vi } from "./messages/vi";

// Next.js App Router's not-found convention (app/not-found.tsx) - before this file
// existed, a bad URL fell through to Next.js's own unbranded default 404 ("404: This
// page could not be found.", English, no retry affordance) even though a real error.tsx
// already handled runtime exceptions with this same ErrorFallback - see
// audit-seo-web-standards-2026-11-27.md finding #2. No `reset` passed - a missing route
// has nothing to retry.
export default function NotFound() {
  return <ErrorFallback title={vi.notFoundTitle} />;
}
