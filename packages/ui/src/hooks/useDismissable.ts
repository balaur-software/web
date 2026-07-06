import { type RefObject, useEffect } from "react";

/**
 * Calls `onDismiss` on Escape or a pointer-down outside `ref`. Active only while
 * `active` (usually the open state). Shared by every popover/menu/select/sheet.
 */
export function useDismissable(
  ref: RefObject<HTMLElement | null>,
  opts: { onDismiss: () => void; active?: boolean },
): void {
  const { onDismiss, active = true } = opts;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    const onDown = (e: PointerEvent) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) onDismiss();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [ref, onDismiss, active]);
}
