import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui utility - merges Tailwind classes, letting later classes
// override earlier conflicting ones (e.g. cn("p-2", isLarge && "p-4") resolves
// correctly instead of both classes being applied).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
