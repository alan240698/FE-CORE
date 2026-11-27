import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Same rule as every app's own vitest.setup.ts: RTL's auto-cleanup only self-registers
// when test.globals: true is set (not set in this repo) - without this, DOM from one
// test leaks into the next test in the same file. packages/core only needed this once
// a file rendered 2+ tests through @testing-library/react (useMenu.test.tsx) - its
// earlier jsdom test (now-removed createTypedHooks.test.tsx) never hit this because it
// didn't need jest-dom matchers.
afterEach(() => {
  cleanup();
});
