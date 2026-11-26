// THE ONLY public surface of @archetype/shared - named exports only, never "export *"
// (see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 2.1).
// renderWithProviders moved to @archetype/test-utils - this package is UI-only and
// must not depend on @archetype/core (state/business) just for a test helper.

export { Button } from "./ui/button";
export type { ButtonProps } from "./ui/button";
export { Table, TableHeader, TableBody, TableRow, TableCell } from "./ui/table";
export { cn } from "./ui/cn";
