"use client";

import { Button } from "./button";

export interface ErrorFallbackProps {
  /**
   * Next.js App Router's error.tsx passes this - re-renders the segment on retry.
   * Omitted when reused for not-found.tsx (app/not-found.tsx gets no `reset` - there is
   * no failed render to retry, just a route that doesn't exist) - the retry button is
   * skipped entirely in that case rather than wired to a no-op.
   */
  reset?: () => void;
  title: string;
  retryLabel?: string;
}

// Next.js App Router's error.tsx convention (app/error.tsx) needs a Client Component
// receiving {error, reset} - this is the shared UI for that boundary, extracted
// because BOTH apps needed the exact same markup at the same time (not speculative -
// see audit-deep-codebase-2026-11-27.md finding #2: 0 app had an error.tsx at all,
// a runtime exception fell through to Next.js's own unbranded default error UI).
export function ErrorFallback({ reset, title, retryLabel }: ErrorFallbackProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-16">
      <p className="text-ag-grey-700">{title}</p>
      {reset ? <Button onClick={reset}>{retryLabel}</Button> : null}
    </div>
  );
}
