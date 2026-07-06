import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

const CELLS = 7;

export interface SwitchProps {
  /** Controlled on/off. Omit for uncontrolled (use `defaultChecked`). */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * A toggle whose track is a row of octant cells that slides a lit "knob" cell
 * across an eighth-block rail. `aria-checked` + the ON/OFF state live in React;
 * the animated glyph track is written imperatively (refs + rAF) so it's inert
 * on the server and eases into place after hydration.
 */
export function Switch({ checked, defaultChecked = false, onChange, label, disabled, style }: SwitchProps) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;

  const trackRef = useRef<HTMLSpanElement>(null);
  const posRef = useRef(on ? CELLS - 1 : 0);
  const rafRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const target = on ? CELLS - 1 : 0;
    const fill = on ? "var(--bx-accent, #46c66d)" : "#5b616e";
    const dim = "#23252e";
    const knob = on ? "var(--bx-accent-bright, #74e692)" : "#9aa0ad";

    const render = () => {
      const k = Math.round(posRef.current);
      let html = "";
      if (k > 0) html += `<span style="color:${fill}">${"█".repeat(k)}</span>`;
      html += `<span style="color:${knob}">█</span>`;
      if (k < CELLS - 1) html += `<span style="color:${dim}">${"░".repeat(CELLS - 1 - k)}</span>`;
      track.innerHTML = html;
    };

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced) {
      posRef.current = target;
      render();
      return;
    }

    const anim = () => {
      posRef.current += (target - posRef.current) * 0.32;
      if (Math.abs(target - posRef.current) < 0.02) {
        posRef.current = target;
        render();
        rafRef.current = 0;
        return;
      }
      render();
      rafRef.current = requestAnimationFrame(anim);
    };
    render();
    rafRef.current = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(rafRef.current);
  }, [on]);

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !on;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }, [on, isControlled, onChange, disabled]);

  return (
    <div
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        gap: 14,
        userSelect: "none",
        outline: "none",
        ...style,
      }}
    >
      <span ref={trackRef} style={{ fontSize: 19, lineHeight: 1, letterSpacing: 1, whiteSpace: "pre" }} />
      {label && <span style={{ fontSize: 13, color: "#9aa0ad" }}>{label}</span>}
      <span style={{ marginLeft: "auto", fontSize: 12, color: on ? "var(--bx-accent, #46c66d)" : "#5b616e" }}>
        {on ? "ON" : "OFF"}
      </span>
    </div>
  );
}
