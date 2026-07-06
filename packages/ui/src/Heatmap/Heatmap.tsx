import { G, noise } from "@balaur/octant-core";
import { type CSSProperties, type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCellMetrics } from "../hooks/useCellMetrics";
import { useOnVisible } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

const DAY = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export interface HeatmapProps {
  /** Number of rows (days). Default 7. */
  rows?: number;
  /** Number of columns (weeks). Default 30. */
  cols?: number;
  /** Header caption shown top-left. Default "HEATMAP · activity". */
  label?: string;
  /** Row labels used in the hover readout, indexed by row. Default SUN..SAT. */
  dayLabels?: readonly string[];
  /** Fill colour of the density glyphs. Default the accent CSS var. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A calendar-style activity heatmap: a `rows × cols` grid of density glyphs drawn
 * from the shared `G` ramp (`· ░ ▒ ▓ █`), keyed off deterministic value-noise.
 * Columns wipe in left-to-right the first time the grid scrolls into view
 * (`useOnVisible`), and pointing at a cell reports its week / day / intensity in
 * the header readout. The `<pre>` renders empty on the server and populates its
 * glyphs imperatively after mount, so there is no hydration mismatch.
 */
export function Heatmap({
  rows = 7,
  cols = 30,
  label = "HEATMAP · activity",
  dayLabels = DAY,
  color = "var(--bx-accent, #46c66d)",
  className,
  style,
}: HeatmapProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const rafRef = useRef(0);
  const reduced = useReducedMotion();
  const metrics = useCellMetrics(preRef);
  const [readout, setReadout] = useState("hover a cell");

  // Deterministic density grid, in [0,1], gamma-shaped like the reference.
  const vals = useMemo(() => {
    const v: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) row.push(Math.pow(noise(c * 0.55, r * 0.9, 4.4), 1.35));
      v.push(row);
    }
    return v;
  }, [rows, cols]);

  // Paint the grid with the first `shown` columns revealed (rest blank).
  const render = useCallback(
    (shown: number) => {
      const el = preRef.current;
      if (!el) return;
      let s = "";
      for (let r = 0; r < rows; r++) {
        const row = vals[r]!;
        let line = "";
        for (let c = 0; c < cols; c++) {
          const glyph = c < shown ? (G[Math.max(0, Math.min(4, Math.round(row[c]! * 4)))] ?? " ") : " ";
          line += `${glyph} `;
        }
        s += line + (r < rows - 1 ? "\n" : "");
      }
      el.textContent = s;
    },
    [rows, cols, vals],
  );

  // Initial paint: full under reduced-motion, otherwise blank awaiting the wipe.
  useEffect(() => {
    render(reduced ? cols : 0);
  }, [render, reduced, cols]);

  // Wipe the columns in the first time the grid is scrolled into view.
  useOnVisible(preRef, () => {
    if (reduced) return;
    const t0 = performance.now();
    const tick = () => {
      const pp = Math.min(1, (performance.now() - t0) / 850);
      render(Math.round(pp * cols));
      if (pp < 1) rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  });

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const onPointerMove = (e: PointerEvent<HTMLPreElement>) => {
    const el = preRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const c = Math.max(0, Math.min(cols - 1, Math.floor((e.clientX - rect.left) / (metrics.cw * 2))));
    const r = Math.max(0, Math.min(rows - 1, Math.floor((e.clientY - rect.top) / metrics.ch)));
    const day = dayLabels[r] ?? `R${r + 1}`;
    setReadout(`WK ${String(c + 1).padStart(2, "0")} · ${day} · ${Math.round(vals[r]![c]! * 100)}%`);
  };

  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 20,
        minWidth: 0,
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#5b616e",
          fontSize: 11,
          letterSpacing: "0.1em",
          marginBottom: 16,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "var(--bx-text-4, #9aa0ad)" }}>{readout}</span>
      </div>
      <pre
        ref={preRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setReadout("hover a cell")}
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.35,
          color,
          whiteSpace: "pre",
          overflow: "hidden",
          letterSpacing: 0,
          cursor: "crosshair",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#3f424d",
          fontSize: 11,
          marginTop: 12,
        }}
      >
        <span>WK 01</span>
        <span>WK {String(cols).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
