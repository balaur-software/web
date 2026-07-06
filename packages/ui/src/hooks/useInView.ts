import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Tracks whether the referenced element is in the viewport (IntersectionObserver).
 * The React replacement for the reference's throttled `vis()` gate that pauses
 * offscreen rAF loops. Pass `once: true` to latch on first intersection.
 */
export function useInView(
  ref: RefObject<Element | null>,
  opts: { rootMargin?: string; once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);
  const { rootMargin = "0px", once = false } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}

/** Fires `cb` once when the element first becomes visible (the `onSee` primitive). */
export function useOnVisible(ref: RefObject<Element | null>, cb: () => void): void {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        cbRef.current();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
