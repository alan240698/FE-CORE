import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "./cn";

// Styled with Archetype Group brand tokens (--color-ag-teal-*, see
// packages/tailwind-config/theme.css) - shadcn/ui style: this file is the actual
// source, copied into the repo rather than installed from an npm package, so the
// team fully owns and can restyle it.
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-sans text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ag-teal-700 text-white hover:bg-ag-teal-900",
        secondary: "bg-ag-grey-100 text-ag-grey-700 hover:bg-ag-grey-200",
        danger: "bg-ag-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
