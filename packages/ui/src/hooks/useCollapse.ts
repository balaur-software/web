import { type RefObject, useEffect } from "react";

/**
 * Drives a max-height disclosure transition on an element: `open` sets
 * `max-height` to the scroll height, closed sets it to 0. Pair with a CSS
 * `transition: max-height …` on the element. Used by Accordion, Tree, Select/
 * Combobox lists, menu panels, chat tool/think cards, etc.
 */
export function useCollapse(ref: RefObject<HTMLElement | null>, open: boolean): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.overflow = "hidden";
    el.style.maxHeight = open ? `${el.scrollHeight}px` : "0px";
  }, [ref, open]);
}
