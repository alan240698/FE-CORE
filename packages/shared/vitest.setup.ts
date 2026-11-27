import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Same rule as every app's own vitest.setup.ts: RTL's auto-cleanup only self-registers
// when test.globals: true is set (not set in this repo) - without this, DOM from one
// test leaks into the next test in the same file.
afterEach(() => {
  cleanup();
});
