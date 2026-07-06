import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** The classic OCTANT ticker copy. */
const DEFAULT_ITEMS: ReactNode[] = [
  "OCTANT.OS",
  "256 STATES PER GLYPH",
  "DENSITY IS THE ONLY CHANNEL",
  "U+1CD00",
  "16 ANSI HUES",
  "BAYER 4×4",
  "NO IMAGES. JUST UNICODE.",
];

export interface MarqueeProps {
  /**
   * Items rendered inline, separated by {@link MarqueeProps.separator}. Ignored
   * when `children` is supplied. Defaults to the OCTANT system ticker.
   */
  items?: ReactNode[];
  /** Full custom copy content. Overrides `items`; it is duplicated for the loop. */
  children?: ReactNode;
  /** Accent glyph placed between (and after) each item. Default `▚` (U+259A). */
  separator?: ReactNode;
  /** Base scroll speed in px/s (the source's `58`). Default 58. */
  speed?: number;
  /** Motion intensity 0..1 (the source's `mot`). Default 0.8. Halts under reduced-motion. */
  ambient?: number;
  /** Pause the scroll while the pointer is over the strip. Default true. */
  pauseOnHover?: boolean;
  className?: string;
  style?: CSSProperties;
}

const copyStyle: CSSProperties = {
  color: "var(--bx-text-5, #7b8290)",
  fontSize: 13,
  letterSpacing: "0.1em",
  flex: "none",
};

/**
 * A horizontally scrolling ticker built from two identical copies of the same
 * content; the track translates left by exactly one copy width and wraps, so the
 * stream reads as seamless. The rAF loop is delta-timed and gated on visibility
 * (via `useInView`) and pointer hover, and it never runs under reduced motion.
 * Static markup renders on the server; the transform starts at 0 and begins
 * after mount (no hydration mismatch).
 */
export function Marquee({
  items = DEFAULT_ITEMS,
  children,
  separator = "▚",
  speed = 58,
  ambient = 0.8,
  pauseOnHover = true,
  className,
  style,
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const pausedRef = useRef(false);

  const inView = useInView(rootRef);
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    const copy = copyRef.current;
    if (!track || !copy) return;

    let x = 0;
    let w = 0;
    let last = performance.now();
    let raf = 0;
    let ensureRaf = 0;

    const measure = () => {
      const r = copy.getBoundingClientRect();
      if (r.width > 2) w = r.width;
    };
    measure();
    window.addEventListener("resize", measure);

    // Layout/fonts may settle a few frames late; retry the measure until width lands.
    let tries = 0;
    const ensure = () => {
      measure();
      if (tries++ < 90 && w < 2) ensureRaf = requestAnimationFrame(ensure);
    };
    ensureRaf = requestAnimationFrame(ensure);

    const mult = speed * (0.4 + ambient);
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (inViewRef.current && !pausedRef.current && w > 0) {
        x -= dt * mult;
        if (-x >= w) x += w;
        track.style.transform = `translateX(${x.toFixed(1)}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(ensureRaf);
      window.removeEventListener("resize", measure);
    };
  }, [reduced, ambient, speed]);

  const body: ReactNode =
    children ??
    items.map((item, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static ticker copy, order is stable
      <span key={i}>
        {item}
        <span aria-hidden="true" style={{ color: "var(--bx-accent, #46c66d)", margin: "0 14px" }}>
          {separator}
        </span>
      </span>
    ));

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerEnter={pauseOnHover ? () => (pausedRef.current = true) : undefined}
      onPointerLeave={pauseOnHover ? () => (pausedRef.current = false) : undefined}
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        overflow: "hidden",
        cursor: "default",
        ...style,
      }}
    >
      <div
        ref={trackRef}
        style={{ display: "flex", whiteSpace: "nowrap", willChange: "transform", padding: "13px 0" }}
      >
        <span ref={copyRef} style={copyStyle}>
          {body}
        </span>
        <span aria-hidden="true" style={copyStyle}>
          {body}
        </span>
      </div>
    </div>
  );
}
