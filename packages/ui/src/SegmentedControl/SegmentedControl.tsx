import { type CSSProperties, useRef } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useSlidingIndicator } from "../hooks/useSlidingIndicator";

export interface SegmentedControlProps {
  /** The selectable segment labels, rendered left-to-right. */
  options: string[];
  /** Controlled selected option. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  "aria-label"?: string;
  style?: CSSProperties;
}

/**
 * A row of terminal-style option buttons with a lit accent underline that slides
 * to the active segment. Selection is via `useControllableState`; the underline's
 * position is measured with `useSlidingIndicator` (offsetLeft/offsetWidth of the
 * active `[data-slide-item]`), so it renders empty on the server and eases into
 * place after mount once layout is known.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  "aria-label": ariaLabel,
  style,
}: SegmentedControlProps) {
  const [selected, setSelected] = useControllableState(value, defaultValue ?? options[0] ?? "", onChange);
  const ref = useRef<HTMLDivElement>(null);
  const active = Math.max(0, options.indexOf(selected));
  const indicator = useSlidingIndicator(ref, active);

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        position: "relative",
        display: "inline-flex",
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        ...style,
      }}
    >
      {options.map((opt, i) => {
        const on = i === active;
        return (
          <button
            key={opt}
            type="button"
            data-slide-item
            role="radio"
            aria-checked={on}
            onClick={() => setSelected(opt)}
            style={{
              fontFamily: "inherit",
              fontSize: 13,
              padding: "9px 18px",
              background: "transparent",
              border: 0,
              color: on ? "var(--bx-text-1, #f4f6fb)" : "#7b8290",
              cursor: "pointer",
              letterSpacing: "0.06em",
              transition: "color .26s cubic-bezier(.5,0,.2,1)",
            }}
          >
            {opt}
          </button>
        );
      })}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: indicator.left,
          width: indicator.width,
          height: 2,
          background: "var(--bx-accent, #46c66d)",
          boxShadow: "0 0 7px var(--bx-accent, #46c66d)",
          transition: "left .26s cubic-bezier(.5,0,.2,1), width .26s cubic-bezier(.5,0,.2,1)",
        }}
      />
    </div>
  );
}
