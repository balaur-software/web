import { scrambleFrame } from "@balaur/octant-core";
import { type RefObject, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Drives the decode/scramble text reveal (core `scrambleFrame`) over `dur` ms
 * whenever `active` or `text` changes. Reduced-motion sets the final text
 * immediately. Writes to `ref.textContent`.
 */
export function useScramble(
  ref: RefObject<HTMLElement | null>,
  text: string,
  opts: { dur?: number; delay?: number; active?: boolean } = {},
): void {
  const { dur = 560, delay = 0, active = true } = opts;
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    if (reduced) {
      el.textContent = text;
      return;
    }
    let raf = 0;
    let start = 0;
    let frame = 0;
    const run = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      frame++;
      el.textContent = scrambleFrame(text, p, undefined, frame);
      if (p < 1) raf = requestAnimationFrame(run);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(run);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [ref, text, dur, delay, active, reduced]);
}
