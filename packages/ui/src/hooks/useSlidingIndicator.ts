import { type RefObject, useEffect, useState } from "react";

export interface Indicator {
  left: number;
  width: number;
}

/**
 * Measures the active item's `offsetLeft`/`offsetWidth` inside a container so a
 * bar can slide under it. Re-measures on font load and resize. Shared by Tabs and
 * SegmentedControl. Items are matched by `itemSelector` (default `[data-slide-item]`).
 */
export function useSlidingIndicator(
  containerRef: RefObject<HTMLElement | null>,
  activeIndex: number,
  itemSelector = "[data-slide-item]",
): Indicator {
  const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const items = el.querySelectorAll<HTMLElement>(itemSelector);
      const active = items[activeIndex];
      if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, activeIndex, itemSelector]);
  return indicator;
}
