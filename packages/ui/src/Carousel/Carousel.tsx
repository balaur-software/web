import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface SlideSpec {
  glyph: string;
  title: string;
  caption: string;
  color: string;
}

const DEFAULT_SPECS: SlideSpec[] = [
  { glyph: "▛", title: "OCTANT CELL", caption: "8 sub-pixels · 256 states", color: "var(--bx-accent, #46c66d)" },
  { glyph: "▒", title: "SHADE RAMP", caption: "density as luminance", color: "#2bd9d9" },
  { glyph: "▞", title: "QUADRANT", caption: "2×2 legacy blocks", color: "#c061ff" },
  { glyph: "▙", title: "FRAMEBUFFER", caption: "text as a raster target", color: "#f2c94c" },
];

function DefaultSlide({ glyph, title, caption, color }: SlideSpec) {
  return (
    <div
      style={{
        height: 208,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <span style={{ fontSize: 64, lineHeight: 1, color }}>{glyph}</span>
      <span style={{ color: "var(--bx-text-1, #f4f6fb)", fontSize: 15, letterSpacing: "0.04em" }}>{title}</span>
      <span style={{ color: "#5b616e", fontSize: 12 }}>{caption}</span>
    </div>
  );
}

const DEFAULT_SLIDES: ReactNode[] = DEFAULT_SPECS.map((s) => <DefaultSlide key={s.title} {...s} />);

export interface CarouselProps {
  /** One node per slide; each fills 100% of the viewport width. Defaults to the OCTANT demo deck. */
  slides?: ReactNode[];
  /** Controlled active slide index. Omit for uncontrolled (use `defaultIndex`). */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Auto-advance while the pointer is not over the carousel. Disabled under reduced-motion. */
  autoplay?: boolean;
  /** Auto-advance interval in ms. */
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  style?: CSSProperties;
}

/**
 * A horizontal slide deck: a translated flex track with dot navigation, prev/next
 * arrows, hover-paused autoplay, and pointer swipe. Slide markup is static (SSR-safe);
 * the autoplay timer lives in an effect and is cleared on unmount / hover / index change,
 * mirroring the reference `initCarousel` teardown.
 */
export function Carousel({
  slides = DEFAULT_SLIDES,
  index,
  defaultIndex = 0,
  onIndexChange,
  autoplay = true,
  interval = 4200,
  showDots = true,
  showArrows = true,
  style,
}: CarouselProps) {
  const count = slides.length;
  const [active, setActive] = useControllableState(index, defaultIndex, onIndexChange);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const startX = useRef<number | null>(null);

  const current = count > 0 ? ((active % count) + count) % count : 0;

  const goTo = (i: number) => {
    if (count === 0) return;
    setActive(((i % count) + count) % count);
  };

  useEffect(() => {
    if (!autoplay || paused || reduced || count <= 1) return;
    const id = setInterval(() => goTo(current + 1), interval);
    return () => clearInterval(id);
    // goTo/current are captured from this render; re-running on `current` change resets the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, paused, reduced, count, current, interval]);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      style={{ position: "relative", ...style }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        style={{
          overflow: "hidden",
          border: "1px solid var(--bx-border, #1c1d24)",
          background: "#0a0b0e",
          touchAction: "pan-y",
        }}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
          startX.current = null;
        }}
      >
        <div
          style={{
            display: "flex",
            transform: `translateX(-${current * 100}%)`,
            transition: reduced ? "none" : "transform .42s cubic-bezier(.5,0,.2,1)",
          }}
        >
          {slides.map((slide, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: slides are positional, no stable id
              key={i}
              aria-hidden={i !== current}
              style={{ flex: "0 0 100%", minWidth: 0 }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(current - 1)}
            style={arrowStyle("left")}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(current + 1)}
            style={arrowStyle("right")}
          >
            ›
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 14 }}>
          {slides.map((_, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: slides are positional, no stable id
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
              onClick={() => goTo(i)}
              style={{
                width: 24,
                height: 4,
                background: i === current ? "var(--bx-accent, #46c66d)" : "#23252e",
                border: 0,
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function arrowStyle(side: "left" | "right"): CSSProperties {
  return {
    position: "absolute",
    [side]: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontFamily: "inherit",
    fontSize: 16,
    width: 34,
    height: 34,
    background: "rgba(8,8,10,0.7)",
    border: "1px solid #2a2c34",
    color: "#c8cdd6",
    cursor: "pointer",
  };
}
