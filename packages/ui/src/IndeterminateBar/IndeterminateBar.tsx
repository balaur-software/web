import { type CSSProperties, useRef } from "react";
import { useRafLoop } from "../hooks/useRafLoop";
import { useReducedMotion } from "../hooks/useReducedMotion";

const HEAD = "█"; // █ full block
const TRAIL_1 = "▓"; // ▓ dark shade
const TRAIL_2 = "░"; // ░ light shade

/**
 * Renders one frame of the comet: a lit head sweeping across `cells`, trailing
 * ▓ then ░ then blanks. Distance to the head wraps around the track so the comet
 * loops seamlessly. Mirrors the reference `for` loop exactly.
 */
function cometFrame(cells: number, head: number): string {
  let out = "";
  for (let i = 0; i < cells; i++) {
    let d = i - head;
    if (d < -cells / 2) d += cells;
    if (d > cells / 2) d -= cells;
    d = Math.abs(d);
    out += d < 0.8 ? HEAD : d < 1.8 ? TRAIL_1 : d < 2.8 ? TRAIL_2 : " ";
  }
  return out;
}

export interface IndeterminateBarProps {
  /** Number of glyph cells in the track. */
  cells?: number;
  /** Comet colour. Defaults to the cyan stream hue from the reference. */
  color?: string;
  /** Font size of the glyph row in px. */
  size?: number;
  /** Sweep-speed multiplier (`head = (t * 9 * speed) % cells`). Matches the reference default of 1.2. */
  speed?: number;
  /** Optional caption rendered above the bar. */
  label?: string;
  style?: CSSProperties;
}

/**
 * An indeterminate progress bar: a comet head (█▓░) sweeps endlessly across a
 * row of glyph cells. The frame is written imperatively (ref + shared rAF loop)
 * so it is inert on the server — SSR emits the head-at-zero frame — and animates
 * after mount. Honours `prefers-reduced-motion` by freezing on that first frame.
 */
export function IndeterminateBar({
  cells = 22,
  color = "#2bd9d9",
  size = 15,
  speed = 1.2,
  label,
  style,
}: IndeterminateBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useRafLoop((t) => {
    const el = barRef.current;
    if (!el) return;
    const head = (t * 9 * speed) % cells;
    el.textContent = cometFrame(cells, head);
  }, !reduced);

  return (
    <div role="progressbar" aria-label={label ?? "loading"} aria-busy="true" style={style}>
      {label && (
        <div style={{ fontSize: 11, color: "#5b616e", marginBottom: 4 }}>{label}</div>
      )}
      <div
        ref={barRef}
        aria-hidden="true"
        style={{
          fontSize: size,
          color,
          whiteSpace: "pre",
          letterSpacing: 0,
          lineHeight: 1,
        }}
      >
        {cometFrame(cells, 0)}
      </div>
    </div>
  );
}
