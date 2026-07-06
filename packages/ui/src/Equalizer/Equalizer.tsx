import { EQC, noiseBars, VBLOCKS } from "@balaur/octant-core";
import { type CSSProperties, useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView";
import { useRafLoop } from "../hooks/useRafLoop";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface EqualizerProps {
  /** Number of vertical bands. Default 16. */
  bands?: number;
  /** Motion intensity 0..1 driving the noise sweep (`sp = 0.4 + motion`). Default 0.6. Ignored under reduced-motion. */
  motion?: number;
  /** Colours cycled across the bands. Defaults to the 16-colour EQC palette. */
  colors?: readonly string[];
  /** Bar-area height in px. Default 96. */
  height?: number;
  /** Glyph font-size in px. Default 40. */
  fontSize?: number;
  /** Header label above the bars. Defaults to `SPECTRUM · {bands} bands`. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A spectrum analyser: `bands` vertical eighth-block bars whose heights are
 * driven by shared curl-`noiseBars`, each band a different EQC hue. The animation
 * runs via the shared rAF loop, gated by `useInView` so the loop pauses while the
 * widget is offscreen (the reference's `vis()` gate) and by `useReducedMotion`
 * which pins a single static frame. Bars render statically (`▁`) on the server
 * and start sweeping after mount, so there's no hydration mismatch.
 */
export function Equalizer({
  bands = 16,
  motion = 0.6,
  colors = EQC,
  height = 96,
  fontSize = 40,
  label,
  className,
  style,
}: EqualizerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const inView = useInView(rootRef);
  const reduced = useReducedMotion();
  const sp = 0.4 + motion;

  const paint = (t: number) => {
    const levels = noiseBars(t, bands, sp);
    const spans = spansRef.current;
    for (let i = 0; i < bands; i++) {
      const span = spans[i];
      if (span) span.textContent = VBLOCKS[levels[i] ?? 0] ?? " ";
    }
  };

  useRafLoop((t) => paint(t), inView && !reduced);

  // Under reduced motion the rAF loop never runs; paint one resting frame.
  useEffect(() => {
    if (reduced) paint(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, bands, sp]);

  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 20,
        minWidth: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ color: "#5b616e", fontSize: 12, marginBottom: 18 }}>
        {label ?? `SPECTRUM · ${bands} bands`}
      </div>
      <div
        ref={rootRef}
        style={{ display: "flex", alignItems: "flex-end", gap: 4, height, fontSize, lineHeight: 0.8 }}
      >
        {Array.from({ length: bands }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length band list
            key={i}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            style={{
              color: colors[i % colors.length] ?? "var(--bx-accent, #46c66d)",
              flex: 1,
              textAlign: "center",
            }}
          >
            ▁
          </span>
        ))}
      </div>
    </div>
  );
}
