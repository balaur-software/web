import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useBar8Fill } from "../hooks/useBar8Fill";
import { useOnVisible } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Comma-group an integer, e.g. `14400 -> "14,400"`. */
const groupThousands = (value: number): string =>
  String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export interface TickerProps {
  /** Target value the counter spins up to on first scroll into view. */
  to: number;
  /** Small caption rendered above the number (e.g. `"CELL STATES"`). */
  label?: string;
  /** Colour of the eighth-block progress bar. Defaults to the accent CSS var. */
  barColor?: string;
  /** Count-up / bar-fill duration in ms. Defaults to 1400. */
  duration?: number;
  /** Format a numeric value into display text. Defaults to comma-grouped integers. */
  format?: (value: number) => string;
  style?: CSSProperties;
}

/**
 * A stat counter that spins up when it scrolls into view: the number eases from
 * 0 to `to` (cubic ease-out) while an eighth-block `bar8` bar charges in sync.
 * The card renders statically on the server (number shows "0", bar empty); the
 * count-up and fill are client-only and start once the element is first seen
 * (`useOnVisible`). Reduced-motion snaps straight to the final value.
 */
export function Ticker({
  to,
  label,
  barColor = "var(--bx-accent, #46c66d)",
  duration = 1400,
  format,
  style,
}: TickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLPreElement>(null);
  const [started, setStarted] = useState(false);
  const reduced = useReducedMotion();

  // Keep the latest formatter without restarting the count-up animation.
  const fmtRef = useRef(format ?? groupThousands);
  fmtRef.current = format ?? groupThousands;

  useOnVisible(rootRef, () => setStarted(true));
  useBar8Fill(barRef, started ? 1 : 0, { rows: 1 });

  useEffect(() => {
    if (!started) return;
    const el = numRef.current;
    if (!el) return;
    const fmt = fmtRef.current;

    if (reduced) {
      el.textContent = fmt(to);
      return;
    }

    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      let p = (performance.now() - t0) / duration;
      if (p > 1) p = 1;
      const e = 1 - (1 - p) ** 3;
      el.textContent = fmt(to * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration, reduced]);

  return (
    <div
      ref={rootRef}
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 20,
        minWidth: 0,
        fontFamily: "var(--bx-font-mono)",
        ...style,
      }}
    >
      {label && (
        <div style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em", marginBottom: 14 }}>{label}</div>
      )}
      <div ref={numRef} style={{ color: "var(--bx-text-1, #f4f6fb)", fontSize: 33, lineHeight: 1 }}>
        0
      </div>
      <pre
        ref={barRef}
        aria-hidden="true"
        style={{
          margin: "14px 0 0",
          fontSize: 11,
          lineHeight: 1,
          color: barColor,
          whiteSpace: "pre",
          overflow: "hidden",
          letterSpacing: 0,
        }}
      />
    </div>
  );
}
