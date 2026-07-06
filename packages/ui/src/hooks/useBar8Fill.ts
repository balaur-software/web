import { bar8 } from "@balaur/octant-core";
import { type RefObject, useEffect, useRef } from "react";
import { measureCell } from "./useCellMetrics";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Animates an element's text into an eighth-block (`bar8`) fill easing toward
 * `target` (0..1). Auto-sizes columns/rows from the element's cell metrics. The
 * shared "charge/fill" behavior behind FillButton, ProgressBar, Slider, Stepper,
 * Checkbox, token meters, etc. Reduced-motion snaps to `target`.
 */
export function useBar8Fill(
  ref: RefObject<HTMLElement | null>,
  target: number,
  opts: { rows?: number; ease?: number } = {},
): void {
  const { rows: fixedRows, ease = 0.3 } = opts;
  const reduced = useReducedMotion();
  const fracRef = useRef(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { cw, ch } = measureCell(el);
    const r = el.getBoundingClientRect();
    const cols = Math.max(2, Math.ceil(r.width / cw));
    const rows = fixedRows ?? Math.max(1, Math.ceil(r.height / ch) + 1);
    const render = () => {
      el.textContent = new Array(rows).fill(bar8(fracRef.current, cols)).join("\n");
    };

    if (reduced) {
      fracRef.current = target;
      render();
      return;
    }

    let raf = 0;
    const anim = () => {
      fracRef.current += (target - fracRef.current) * ease;
      if (Math.abs(target - fracRef.current) < 0.004) {
        fracRef.current = target;
        render();
        raf = 0;
        return;
      }
      render();
      raf = requestAnimationFrame(anim);
    };
    render();
    raf = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(raf);
  }, [ref, target, ease, fixedRows, reduced]);
}
