import { type CSSProperties, useEffect, useRef } from "react";
import { useBar8Fill } from "../hooks/useBar8Fill";
import { useControllableState } from "../hooks/useControllableState";
import { useReducedMotion } from "../hooks/useReducedMotion";

const EASE = 0.34;

export interface CheckboxProps {
  /** Controlled checked state. Omit for uncontrolled (use `defaultChecked`). */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * A checkbox whose 20×20 box "fills" with an eighth-block (`bar8`) micro-octant
 * gradient as it turns on, with a tick glyph fading in over the last 30% of the
 * fill. Checked state is via `useControllableState`; the box fill is driven by
 * the shared `useBar8Fill` hook and the tick opacity by a parallel rAF eased on
 * the same curve, so both stay in sync. Static markup renders on the server; the
 * glyph fill starts empty and populates after mount (no hydration mismatch).
 */
export function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled,
  style,
}: CheckboxProps) {
  const [on, setOn] = useControllableState(checked, defaultChecked, onChange);
  const fillRef = useRef<HTMLPreElement>(null);
  const tickRef = useRef<HTMLSpanElement>(null);
  const fracRef = useRef(on ? 1 : 0);
  const reduced = useReducedMotion();

  // Box fill: eighth-block gradient easing 0..1 with the checked state.
  useBar8Fill(fillRef, on ? 1 : 0, { ease: EASE });

  // Tick opacity mirrors the same eased fraction: it fades in over the last 30%.
  useEffect(() => {
    const tick = tickRef.current;
    if (!tick) return;
    const target = on ? 1 : 0;
    const paint = () => {
      const f = fracRef.current;
      tick.style.opacity = f > 0.7 ? ((f - 0.7) / 0.3).toFixed(2) : "0";
    };

    if (reduced) {
      fracRef.current = target;
      paint();
      return;
    }

    let raf = 0;
    const anim = () => {
      fracRef.current += (target - fracRef.current) * EASE;
      if (Math.abs(target - fracRef.current) < 0.01) {
        fracRef.current = target;
        paint();
        raf = 0;
        return;
      }
      paint();
      raf = requestAnimationFrame(anim);
    };
    paint();
    raf = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(raf);
  }, [on, reduced]);

  const toggle = () => {
    if (!disabled) setOn(!on);
  };

  return (
    <div
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        userSelect: "none",
        outline: "none",
        fontSize: 13,
        color: "var(--bx-text-4, #9aa0ad)",
        ...style,
      }}
    >
      <span
        style={{
          position: "relative",
          width: 20,
          height: 20,
          flex: "none",
          border: "1px solid var(--bx-border-accent, #2a3320)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "var(--bx-surface-3, #0c0d11)",
        }}
      >
        <pre
          ref={fillRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            margin: 0,
            fontSize: 6,
            lineHeight: 1,
            color: "var(--bx-accent, #46c66d)",
            whiteSpace: "pre",
          }}
        />
        <span
          ref={tickRef}
          aria-hidden="true"
          style={{
            position: "relative",
            zIndex: 1,
            color: "var(--bx-bg, #08080a)",
            fontSize: 13,
            opacity: 0,
          }}
        >
          {"✓"}
        </span>
      </span>
      {label && <span>{label}</span>}
    </div>
  );
}
