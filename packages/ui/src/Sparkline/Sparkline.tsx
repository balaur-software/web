import { type CSSProperties, useCallback, useEffect, useRef } from "react";
import { noise, VBLOCKS } from "@balaur/octant-core";
import { useInView } from "../hooks/useInView";
import { useRafLoop } from "../hooks/useRafLoop";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** How often (seconds) a fresh sample is pushed onto the tail of the series. */
const PUSH_INTERVAL = 0.12;

export interface SparklineProps {
  /** Suffix shown after "SPARKLINE ·" in the header. */
  label?: string;
  /** Unit appended to the live value readout. */
  unit?: string;
  /** Number of eighth-block columns in the series. */
  samples?: number;
  /** Glyph + value colour. Defaults to the coral telemetry hue. */
  color?: string;
  /** Left footer caption (the window start). */
  spanLabel?: string;
  style?: CSSProperties;
}

/**
 * A scrolling eighth-block sparkline with a live value readout. The series is a
 * ring of noise-driven samples that shifts left every {@link PUSH_INTERVAL}s,
 * written imperatively (ref + rAF) so the panel renders empty on the server and
 * populates after mount. The loop pauses while offscreen (`useInView`) and, under
 * reduced-motion, paints a single static frame instead of animating.
 */
export function Sparkline({
  label = "throughput",
  unit = "MB/s",
  samples = 42,
  color = "#ff6b6f",
  spanLabel = "-60s",
  style,
}: SparklineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<HTMLDivElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);
  const dataRef = useRef<number[]>([]);
  const accRef = useRef(0);
  const lastRef = useRef(0);

  const inView = useInView(wrapRef);
  const reduced = useReducedMotion();
  const active = inView && !reduced;

  const render = useCallback(() => {
    const series = dataRef.current;
    let line = "";
    for (const v of series) {
      const idx = Math.max(0, Math.min(8, Math.round(v * 8)));
      line += VBLOCKS[idx]!;
    }
    if (glyphRef.current) glyphRef.current.textContent = line;
    if (valRef.current) {
      const last = series[series.length - 1] ?? 0;
      valRef.current.textContent = `${(last * 100) | 0} ${unit}`;
    }
  }, [unit]);

  // Seed the series client-side (empty on the server) and paint one frame. Under
  // reduced motion the rAF loop never starts, so this is the only frame drawn.
  useEffect(() => {
    dataRef.current = Array.from({ length: samples }, () => Math.random());
    accRef.current = 0;
    lastRef.current = 0;
    render();
  }, [samples, render]);

  useRafLoop((t) => {
    const dt = Math.min(0.1, Math.max(0, t - lastRef.current));
    lastRef.current = t;
    accRef.current += dt;
    if (accRef.current > PUSH_INTERVAL) {
      accRef.current = 0;
      const series = dataRef.current;
      series.push(0.2 + 0.8 * noise(t * 0.7, 3.1, 0) * (0.6 + 0.6 * Math.random()));
      if (series.length > samples) series.shift();
    }
    render();
  }, active);

  // Reset the frame clock when the loop is parked so it resumes without a jump.
  useEffect(() => {
    if (!active) lastRef.current = 0;
  }, [active]);

  return (
    <div
      ref={wrapRef}
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 20,
        minWidth: 0,
        overflow: "hidden",
        fontFamily: "var(--bx-font-mono, monospace)",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5b616e", marginBottom: 18 }}>
        <span>SPARKLINE · {label}</span>
        <span ref={valRef} style={{ color }}>
          --
        </span>
      </div>
      <div
        ref={glyphRef}
        aria-hidden="true"
        style={{
          fontSize: 30,
          color,
          lineHeight: 0.9,
          whiteSpace: "pre",
          letterSpacing: 1,
          height: 34,
          overflow: "hidden",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", color: "#3f424d", fontSize: 11, marginTop: 14 }}>
        <span>{spanLabel}</span>
        <span>now</span>
      </div>
    </div>
  );
}
