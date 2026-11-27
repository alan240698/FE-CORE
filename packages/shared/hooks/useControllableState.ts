"use client";

import { useCallback, useState } from "react";

export interface UseControllableStateOptions<T> {
  /** Controlled value - when provided (not `undefined`), this hook never manages its own state. */
  value?: T;
  /** Starting value for the UNCONTROLLED case. Ignored once `value` is provided. */
  defaultValue: T;
  /** Called on every change, in BOTH controlled and uncontrolled mode. */
  onChange?: (value: T) => void;
}

/**
 * The standard controlled/uncontrolled pattern for a composable UI primitive (a
 * `Dialog`'s `open`, an `Accordion`'s `value`...) - same shape as Radix UI's own
 * `useControllableState` (this project already follows Radix/shadcn-style "copy the
 * primitive, own it" for `Button`/`Table` - see their doc comments).
 *
 * Picked this exact, well-established shape specifically to avoid guessing a bespoke
 * API before a real composable component exists to validate it against - the first
 * component that actually needs controlled/uncontrolled support (a `Dialog`, most
 * likely) should use this as-is, not reinvent its own variant.
 *
 * STATUS (2026-11-27): 0 real consumer in apps/ yet - only this file's own test.
 * TRIGGER to wire up a real consumer: the first composable UI primitive (Dialog,
 * Dropdown, Accordion...) is actually built in `packages/shared/ui/`. If no such
 * primitive appears within a reasonable time, consider removing this file rather than
 * letting it sit unconsumed indefinitely - see
 * audit-architecture-security-review-2026-11-27.md, finding A7.
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [value, setValue];
}
