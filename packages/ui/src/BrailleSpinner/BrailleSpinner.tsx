import { GROW, ORBIT, PULSE, WAVE } from "@balaur/octant-core";
import { type CSSProperties, useRef } from "react";
import { useRafLoop } from "../hooks/useRafLoop";
import { useReducedMotion } from "../hooks/useReducedMotion";

const FRAMES = { wave: WAVE, pulse: PULSE, orbit: ORBIT, grow: GROW } as const;

const DEFAULT_COLOR: Record<BrailleSpinnerVariant, string> = {
  wave: "var(--bx-accent, #46c66d)",
  pulse: "#2bd9d9",
  orbit: "#c061ff",
  grow: "#f2c94c",
};

export type BrailleSpinnerVariant = keyof typeof FRAMES;

export interface BrailleSpinnerProps {
  /** Which frame ramp to cycle: rising `wave`, quadrant `pulse`, edge `orbit`, or eighth-block `grow`. */
  variant?: BrailleSpinnerVariant;
  /** Glyph colour. Defaults to a per-variant hue. */
  color?: string;
  /** Font size of the glyph in px. */
  size?: number;
  /** Frame-rate multiplier (`fi = floor(t * 9 * speed)`). Matches the reference default of 1.2. */
  speed?: number;
  /** Optional caption rendered beneath the glyph. */
  label?: string;
  style?: CSSProperties;
}

/**
 * A single-glyph loading spinner that cycles a block-frame ramp from
 * octant-core. The frame is written imperatively (ref + shared rAF loop) so it
 * is inert on the server — SSR emits the first frame — and animates after mount.
 * Honours `prefers-reduced-motion` by freezing on the first frame.
 */
export function BrailleSpinner({
  variant = "wave",
  color,
  size = 34,
  speed = 1.2,
  label,
  style,
}: BrailleSpinnerProps) {
  const glyphRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const frames = FRAMES[variant];
  const fill = color ?? DEFAULT_COLOR[variant];

  useRafLoop((t) => {
    const el = glyphRef.current;
    if (!el) return;
    const fi = Math.floor(t * 9 * speed);
    el.textContent = frames[fi % frames.length]!;
  }, !reduced);

  return (
    <div role="img" aria-label={label ? `${label} loading` : "loading"} style={{ textAlign: "center", ...style }}>
      <div
        ref={glyphRef}
        aria-hidden="true"
        style={{ fontSize: size, color: fill, lineHeight: 1, height: size + 2 }}
      >
        {frames[0]}
      </div>
      {label && <div style={{ color: "#5b616e", fontSize: 11, marginTop: 10 }}>{label}</div>}
    </div>
  );
}
