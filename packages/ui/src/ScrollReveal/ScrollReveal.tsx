import { type CSSProperties, type ReactNode, useRef, useState } from "react";
import { useOnVisible, useReducedMotion, useScramble } from "../hooks";

export interface ScrollRevealProps {
  /** Content to fade/rise into view on first intersection. Ignored when {@link ScrollRevealProps.scramble} is set. */
  children?: ReactNode;
  /**
   * If provided, render this text and glyph-scramble-decode it on first view
   * (the reference's `onSee(sec, …) → scramble(h, …)` pass), on top of the fade.
   */
  scramble?: string;
  /** Distance (px) the content rises from as it fades in. Default 12. */
  y?: number;
  /** Fade / rise transition duration in ms. Default 520. */
  dur?: number;
  /** Delay before the reveal begins, in ms. Default 0. */
  delay?: number;
  style?: CSSProperties;
}

/**
 * A wrapper that reveals its children the first time they scroll into view:
 * they fade up from a small offset, and — when a `scramble` string is given —
 * the text decodes itself with a glyph scramble. Mirrors the reference's
 * `initReveal`, which watches each section and scrambles its heading on first
 * sight, gated by an IntersectionObserver instead of firing on load.
 *
 * SSR emits the content in its final, visible-but-untransitioned state so there
 * is no hydration mismatch; the reveal replays imperatively once
 * {@link useOnVisible} latches. Honours reduced-motion (content shows at once).
 */
export function ScrollReveal({ children, scramble, y = 12, dur = 520, delay = 0, style }: ScrollRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);

  useOnVisible(wrapRef, () => setActive(true));
  useScramble(textRef, scramble ?? "", { dur, delay, active: active && scramble !== undefined });

  const shown = reduced || active;

  return (
    <div
      ref={wrapRef}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: reduced ? "none" : `opacity ${dur}ms ease, transform ${dur}ms ease`,
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {scramble !== undefined ? <span ref={textRef}>{scramble}</span> : children}
    </div>
  );
}
