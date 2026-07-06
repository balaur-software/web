import { type CSSProperties, useRef } from "react";
import { useBar8Fill } from "../hooks/useBar8Fill";
import { useControllableState } from "../hooks/useControllableState";

export interface StepperProps {
  /** Controlled value. Omit for uncontrolled (use `defaultValue`). */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Lower bound (inclusive). Default 0. */
  min?: number;
  /** Upper bound (inclusive). Default 16. */
  max?: number;
  /** Increment per +/- press. Default 1. */
  step?: number;
  /** Caption shown above the bar. */
  label?: string;
  /** Colour of the eighth-block fill and value readout. */
  fillColor?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

const btnStyle = (disabled: boolean): CSSProperties => ({
  fontFamily: "inherit",
  fontSize: 16,
  lineHeight: 1,
  width: 34,
  height: 34,
  flex: "none",
  background: "transparent",
  border: "1px solid var(--bx-border, #1c1d24)",
  color: disabled ? "var(--bx-text-dim-3, #4b505c)" : "var(--bx-text-4, #9aa0ad)",
  cursor: disabled ? "not-allowed" : "pointer",
});

/**
 * A numeric stepper whose value is visualised as an eighth-block (`bar8`) fill.
 * The `-`/`+` buttons clamp the value between `min`..`max`; the bar eases toward
 * the new fraction via the shared `useBar8Fill` hook. Value state runs through
 * `useControllableState`, and the glyph bar is written imperatively after mount
 * (empty on the server, so no hydration mismatch).
 */
export function Stepper({
  value,
  defaultValue = 6,
  onChange,
  min = 0,
  max = 16,
  step = 1,
  label = "STEPPER · brush radius",
  fillColor = "#f2c94c",
  disabled = false,
  style,
}: StepperProps) {
  const [val, setVal] = useControllableState(value, defaultValue, onChange);
  const barRef = useRef<HTMLPreElement>(null);

  const span = max - min || 1;
  const target = Math.max(0, Math.min(1, (val - min) / span));
  useBar8Fill(barRef, disabled ? 0 : target, { rows: 1 });

  const pad = Math.max(2, String(max).length);
  const atMin = disabled || val <= min;
  const atMax = disabled || val >= max;

  const dec = () => {
    if (!atMin) setVal(Math.max(min, val - step));
  };
  const inc = () => {
    if (!atMax) setVal(Math.min(max, val + step));
  };

  return (
    <div
      role="group"
      aria-label={label}
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 22,
        minWidth: 0,
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          color: "#5b616e",
          fontSize: 12,
          marginBottom: 18,
        }}
      >
        <span>{label}</span>
        <span aria-live="polite" style={{ color: fillColor, fontSize: 15 }}>
          {String(val).padStart(pad, "0")}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          aria-label="Decrease"
          disabled={atMin}
          onClick={dec}
          style={btnStyle(atMin)}
        >
          {"−"}
        </button>
        <pre
          ref={barRef}
          aria-hidden="true"
          style={{
            margin: 0,
            flex: 1,
            fontSize: 16,
            lineHeight: 1,
            color: fillColor,
            whiteSpace: "pre",
            overflow: "hidden",
            letterSpacing: 0,
          }}
        />
        <button
          type="button"
          aria-label="Increase"
          disabled={atMax}
          onClick={inc}
          style={btnStyle(atMax)}
        >
          +
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#3f424d",
          fontSize: 11,
          marginTop: 14,
        }}
      >
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
