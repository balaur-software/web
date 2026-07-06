import { type CSSProperties, type PointerEvent as ReactPointerEvent, useRef } from "react";
import { useBar8Fill } from "../hooks/useBar8Fill";
import { useControllableState } from "../hooks/useControllableState";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export interface SliderProps {
  /** Lower bound of the range. */
  min?: number;
  /** Upper bound of the range. */
  max?: number;
  /** Snap increment. Omit for continuous. */
  step?: number;
  /** Controlled value. Omit for uncontrolled (use `defaultValue`). */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Header caption above the fill track. */
  label?: string;
  /** Format the value readout. Receives the value and its 0..1 fraction. */
  formatValue?: (value: number, fraction: number) => string;
  /** Colour of the eighth-block fill and readout. Defaults to the accent var. */
  accentColor?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * A drag slider whose track is a single-line eighth-block (`bar8`) fill. The
 * glyph fill is written imperatively by the shared `useBar8Fill` hook — it eases
 * toward the current fraction and starts empty on the server, populating after
 * mount. Value is via `useControllableState`; pointer/keyboard both drive it.
 */
export function Slider({
  min = 0,
  max = 100,
  step,
  value,
  defaultValue = 50,
  onChange,
  label = "SLIDER · drag — eighth-block fill",
  formatValue = (_v, frac) => `${Math.round(frac * 100)}%`,
  accentColor = "var(--bx-accent, #46c66d)",
  disabled = false,
  style,
}: SliderProps) {
  const [val, setVal] = useControllableState(value, defaultValue, onChange);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLPreElement>(null);
  const draggingRef = useRef(false);

  const span = max - min || 1;
  const clamped = Math.max(min, Math.min(max, val));
  const fraction = clamp01((clamped - min) / span);
  useBar8Fill(fillRef, fraction, { rows: 1, ease: 0.4 });

  const snap = (raw: number) => {
    const v = min + raw * span;
    if (step && step > 0) return Math.round(v / step) * step;
    return v;
  };

  const setFromEvent = (e: ReactPointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = clamp01((e.clientX - r.left) / r.width);
    setVal(Math.max(min, Math.min(max, snap(frac))));
  };

  const nudge = (delta: number) => {
    const stepSize = step && step > 0 ? step : span / 100;
    setVal(Math.max(min, Math.min(max, clamped + delta * stepSize)));
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (disabled) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromEvent(e);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (draggingRef.current) setFromEvent(e);
  };
  const stopDrag = () => {
    draggingRef.current = false;
  };

  return (
    <div
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 22,
        minWidth: 0,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#5b616e",
          marginBottom: 16,
        }}
      >
        <span>{label}</span>
        <span style={{ color: accentColor }}>{formatValue(clamped, fraction)}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            nudge(-1);
          } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            nudge(1);
          } else if (e.key === "Home") {
            e.preventDefault();
            setVal(min);
          } else if (e.key === "End") {
            e.preventDefault();
            setVal(max);
          }
        }}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          touchAction: "none",
          outline: "none",
        }}
      >
        <pre
          ref={fillRef}
          aria-hidden="true"
          style={{
            margin: 0,
            fontSize: 17,
            lineHeight: 1,
            color: accentColor,
            whiteSpace: "pre",
            letterSpacing: 0,
            width: "100%",
            overflow: "hidden",
          }}
        />
      </div>
    </div>
  );
}
