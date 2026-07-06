import { useCallback, useState } from "react";

/**
 * Controlled/uncontrolled state. When `controlled` is defined the component is
 * controlled and `set` only calls `onChange`; otherwise internal state is used.
 */
export function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const isControlled = controlled !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const value = isControlled ? controlled : internal;
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [value, set];
}
