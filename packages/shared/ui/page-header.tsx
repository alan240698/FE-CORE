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
    <div className={cn("flex items-center justify-between", className)}>
      <h1 className="font-heading text-ag-teal-700 text-3xl font-semibold">{title}</h1>
      {action}
    </div>
  );
}
