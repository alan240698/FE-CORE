"use client";

import { ErrorFallback } from "@archetype/shared";
import { vi } from "./messages/vi";

// Next.js App Router's error boundary convention (app/error.tsx) - catches a runtime
// exception from anywhere in this segment's tree. Before this file existed, 0 error
// boundary existed anywhere in this repo - a real runtime exception fell through to
// Next.js's own unbranded default error UI (English, no retry affordance matching this
// app's own design) - see audit-deep-codebase-2026-11-27.md finding #2.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback reset={reset} title={vi.errorTitle} retryLabel={vi.errorRetry} />;
}
