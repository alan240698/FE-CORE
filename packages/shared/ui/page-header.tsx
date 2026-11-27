import { cn } from "./cn";

// Extracted because apps/shell/app/page.tsx and apps/it-ticket/app/page.tsx both had the
// exact same title row (heading + one action slot) duplicated byte-for-byte - see
// engineering-standards-audit-2026-11-26.md, finding ES-9 completeness matrix.
export interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, action, className }: PageHeaderProps) {
  return (
    // Stacks on mobile, side-by-side from `sm:` up - confirmed via a real Chromium
    // screenshot at 375px width that the previous single-row `justify-between` (no
    // wrap behavior) squeezed both the heading AND the action into narrow columns,
    // wrapping "Archetype Group Intranet" into 3 lines and "Tao ticket moi" into 2 -
    // see audit-ui-ux-a11y-2026-11-27.md. This was the ONLY `sm:`/`md:`/... breakpoint
    // class anywhere in the codebase before this fix (confirmed by grep) - every other
    // layout is a single fixed arrangement, which was fine for them but not for a
    // title+action row competing for the same line on a narrow screen.
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">{title}</h1>
      {action}
    </div>
  );
}
