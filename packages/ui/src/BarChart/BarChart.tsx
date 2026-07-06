import { type CSSProperties, type RefObject, useEffect, useRef, useState } from "react";
import { useBar8Fill } from "../hooks/useBar8Fill";
import { useOnVisible } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface BarChartDatum {
  /** Row label shown on the left. */
  label: string;
  /** Fill fraction, 0..1. */
  value: number;
  /** Bar colour. Defaults to the accent CSS var. */
  color?: string;
}

export interface BarChartProps {
  /** Rows to plot. Defaults to the §23 "channel load" sample set. */
  data?: BarChartDatum[];
  /** Left-hand header caption. */
  title?: string;
  /** Right-hand header tag. */
  hint?: string;
  /** Milliseconds each successive bar's fill is delayed, for the staggered sweep. */
  stagger?: number;
  style?: CSSProperties;
}

const DEFAULT_DATA: BarChartDatum[] = [
  { label: "ALPHA", value: 0.84, color: "var(--bx-accent, #46c66d)" },
  { label: "BETA", value: 0.62, color: "#2bd9d9" },
  { label: "GAMMA", value: 0.71, color: "#f2c94c" },
  { label: "DELTA", value: 0.35, color: "#c061ff" },
  { label: "EPSILON", value: 0.52, color: "#ff6b6f" },
];

/**
 * Eases a percentage readout toward `target` (0..1) and writes it imperatively
 * into `ref` — the value counterpart to {@link useBar8Fill}, so the number and
 * the bar climb together. Reduced-motion snaps. Inert on the server.
 */
function usePercentReadout(ref: RefObject<HTMLElement | null>, target: number): void {
  const reduced = useReducedMotion();
  const fracRef = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => {
      el.textContent = `${Math.round(fracRef.current * 100)}%`;
    };
    if (reduced) {
      fracRef.current = target;
      set();
      return;
    }
    let raf = 0;
    const step = () => {
      fracRef.current += (target - fracRef.current) * 0.3;
      if (Math.abs(target - fracRef.current) < 0.004) {
        fracRef.current = target;
        set();
        raf = 0;
        return;
      }
      set();
      raf = requestAnimationFrame(step);
    };
    set();
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ref, target, reduced]);
}

function Bar({ datum, active, delay }: { datum: BarChartDatum; active: boolean; delay: number }) {
  const value = Math.max(0, Math.min(1, datum.value));
  const fillRef = useRef<HTMLPreElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(false);

  // Stagger each row's start so the bars sweep open one after another.
  useEffect(() => {
    if (!active) {
      setArmed(false);
      return;
    }
    const id = window.setTimeout(() => setArmed(true), delay);
    return () => window.clearTimeout(id);
  }, [active, delay]);

  const target = armed ? value : 0;
  useBar8Fill(fillRef, target, { rows: 1 });
  usePercentReadout(valRef, target);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 56, flex: "none", color: "var(--bx-text-4, #9aa0ad)", fontSize: 12 }}>
        {datum.label}
      </span>
      <pre
        ref={fillRef}
        aria-hidden="true"
        style={{
          flex: 1,
          margin: 0,
          fontSize: 14,
          lineHeight: 1,
          color: datum.color ?? "var(--bx-accent, #46c66d)",
          whiteSpace: "pre",
          overflow: "hidden",
          letterSpacing: 0,
          minWidth: 0,
        }}
      />
      <span ref={valRef} style={{ width: 36, flex: "none", textAlign: "right", color: "#5b616e", fontSize: 12 }}>
        0%
      </span>
    </div>
  );
}

/**
 * A horizontal bar chart drawn in the system's own medium: each bar is a `<pre>`
 * framebuffer filled in eighth-block (`bar8`) increments via the shared
 * {@link useBar8Fill} hook, with a percentage readout that climbs in step. The
 * whole chart holds empty until it scrolls into view (`useOnVisible`), then the
 * rows sweep open one after another. SSR emits static empty bars.
 */
export function BarChart({
  data = DEFAULT_DATA,
  title = "BAR · channel load",
  hint = "EIGHTH-BLOCK",
  stagger = 90,
  style,
}: BarChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useOnVisible(wrapRef, () => setActive(true));

  return (
    <div
      ref={wrapRef}
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
          marginBottom: 18,
        }}
      >
        <span>{title}</span>
        <span style={{ color: "#3f424d" }}>{hint}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map((d, i) => (
          <Bar key={`${d.label}-${i}`} datum={d} active={active} delay={i * stagger} />
        ))}
      </div>
    </div>
  );
}
