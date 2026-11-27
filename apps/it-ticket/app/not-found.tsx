import { ErrorFallback } from "@archetype/shared";
import { vi } from "./messages/vi";

// Next.js App Router's not-found convention (app/not-found.tsx) - see
// apps/shell/app/not-found.tsx's doc comment for the full rationale (same finding,
// both apps fixed together since neither had one).
export default function NotFound() {
  return <ErrorFallback title={vi.notFoundTitle} />;
}
