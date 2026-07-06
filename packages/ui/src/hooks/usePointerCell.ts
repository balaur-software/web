import { type MutableRefObject, type RefObject, useEffect, useRef } from "react";

export interface PointerCell {
  /** Normalized x in [0,1] across the element (multiply by dw for a cell coord). */
  u: number;
  /** Normalized y in [0,1] across the element (multiply by dh for a cell coord). */
  v: number;
  active: boolean;
}

/**
 * Tracks the pointer over an element (usually a canvas), normalized to [0,1] so
 * the value is independent of the canvas's internal cell resolution. Listens on
 * the element's parent so overlaid content doesn't block it.
 */
export function usePointerCell(ref: RefObject<HTMLElement | null>): MutableRefObject<PointerCell> {
  const ptr = useRef<PointerCell>({ u: -1, v: -1, active: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const host = el.parentElement ?? el;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ptr.current.u = (e.clientX - r.left) / r.width;
      ptr.current.v = (e.clientY - r.top) / r.height;
      ptr.current.active = true;
    };
    const leave = () => {
      ptr.current.active = false;
    };
    host.addEventListener("pointermove", move as EventListener);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move as EventListener);
      host.removeEventListener("pointerleave", leave);
    };
  }, [ref]);
  return ptr;
}
