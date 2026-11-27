"use client";

import { ErrorFallback } from "@archetype/shared";
import { vi } from "./messages/vi";

// Next.js App Router's error boundary convention (app/error.tsx) - see
// apps/shell/app/error.tsx's doc comment for the full rationale (same finding, both
// apps fixed together since neither had one).
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback reset={reset} title={vi.errorTitle} retryLabel={vi.errorRetry} />;
}
