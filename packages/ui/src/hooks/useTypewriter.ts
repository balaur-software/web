import { type RefObject, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Reveals `text` character-by-character into `ref.textContent`, with an optional
 * blinking block caret while typing. Reduced-motion sets the full text at once.
 */
export function useTypewriter(
  ref: RefObject<HTMLElement | null>,
  text: string,
  opts: { speed?: number; active?: boolean; caret?: boolean } = {},
): void {
  const { speed = 45, active = true, caret = true } = opts;
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    if (reduced) {
      el.textContent = text;
      return;
    }
    let i = 0;
    el.textContent = "";
    const iv = setInterval(() => {
      i++;
      el.textContent = text.slice(0, i) + (caret && i < text.length ? "▋" : "");
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [ref, text, speed, active, caret, reduced]);
}
