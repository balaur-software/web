import { type RefObject, useEffect, useState } from "react";

export interface CellMetrics {
  /** Width of one monospace glyph cell, in CSS px. */
  cw: number;
  /** Height of one line, in CSS px. */
  ch: number;
}

/**
 * Measure the monospace cell size of an element's computed font via canvas
 * `measureText` (no DOM reflow, unlike the reference's hidden-span probe).
 */
export function measureCell(el: HTMLElement): CellMetrics {
  const cs = getComputedStyle(el);
  const fontSize = parseFloat(cs.fontSize) || 13;
  let cw = fontSize * 0.6;
  const ctx = document.createElement("canvas").getContext("2d");
  if (ctx) {
    ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
    cw = ctx.measureText("█").width || cw;
  }
  const ch = parseFloat(cs.lineHeight) || fontSize;
  return { cw, ch };
}

/** Reactive {@link measureCell}: re-measures on font load and element resize. */
export function useCellMetrics(ref: RefObject<HTMLElement | null>): CellMetrics {
  const [metrics, setMetrics] = useState<CellMetrics>({ cw: 8, ch: 13 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let alive = true;
    const update = () => {
      if (alive && ref.current) setMetrics(measureCell(ref.current));
    };
    update();
    document.fonts?.ready.then(update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [ref]);
  return metrics;
}
