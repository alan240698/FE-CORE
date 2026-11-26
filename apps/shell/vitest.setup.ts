import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library's auto-cleanup only self-registers when it detects test
// globals (test.globals: true in vitest.config.ts, which this repo does NOT set) -
// without this, the DOM from one test leaks into the next test in the SAME file,
// causing "multiple elements found" errors that only show up once a file has more
// than 1 test (confirmed for real in apps/it-ticket - see its vitest.setup.ts).
afterEach(() => {
  cleanup();
});
