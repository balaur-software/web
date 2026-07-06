import { type CSSProperties, type KeyboardEvent, useRef } from "react";
import { useBar8Fill } from "../hooks/useBar8Fill";
import { useControllableState } from "../hooks/useControllableState";

const EASE = 0.34;

export interface RadioOption {
  /** Stable value emitted through `onChange` and matched against `value`. */
  value: string;
  /** Human-readable label shown beside the octant box. */
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** The selectable options, rendered top-to-bottom. */
  options: RadioOption[];
  /** Controlled selected value. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Colour of the eighth-block selection fill. Defaults to the accent CSS var. */
  fillColor?: string;
  /** Disables the whole group. */
  disabled?: boolean;
  "aria-label"?: string;
  style?: CSSProperties;
}

/**
 * A vertical stack of radio options, each with an 18×18 octant box that "fills"
 * with an eighth-block (`bar8`) micro-gradient as it becomes selected. Selection
 * is via `useControllableState`; every option's box is driven by the shared
 * `useBar8Fill` hook, easing 0..1 in sync with the active value. Static markup
 * renders on the server; the glyph fills start empty and populate after mount
 * (no hydration mismatch). Roving tabindex + arrow keys move selection.
 */
export function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  fillColor = "var(--bx-accent, #46c66d)",
  disabled,
  "aria-label": ariaLabel,
  style,
}: RadioGroupProps) {
  const [selected, setSelected] = useControllableState(value, defaultValue ?? options[0]?.value ?? "", onChange);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndex = options.findIndex((o) => o.value === selected);

  const nextEnabled = (from: number, dir: number): number | null => {
    const n = options.length;
    if (n === 0 || disabled) return null;
    for (let step = 1; step <= n; step++) {
      const j = (((from + dir * step) % n) + n) % n;
      if (!options[j]?.disabled) return j;
    }
    return null;
  };

  const focusIndex = (i: number) => {
    containerRef.current?.querySelector<HTMLElement>(`[data-radio-index="${i}"]`)?.focus();
  };

  const select = (i: number) => {
    const opt = options[i];
    if (!opt || opt.disabled || disabled) return;
    setSelected(opt.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
      const next = nextEnabled(activeIndex, dir);
      if (next != null) {
        select(next);
        focusIndex(next);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onKeyDown={onKeyDown}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 13,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {options.map((opt, i) => (
        <RadioOption
          key={opt.value}
          index={i}
          label={opt.label}
          selected={opt.value === selected}
          disabled={!!(disabled || opt.disabled)}
          fillColor={fillColor}
          onSelect={() => select(i)}
        />
      ))}
    </div>
  );
}

interface RadioOptionProps {
  index: number;
  label: string;
  selected: boolean;
  disabled: boolean;
  fillColor: string;
  onSelect: () => void;
}

function RadioOption({ index, label, selected, disabled, fillColor, onSelect }: RadioOptionProps) {
  const fillRef = useRef<HTMLPreElement>(null);
  useBar8Fill(fillRef, selected ? 1 : 0, { ease: EASE });

  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      data-radio-index={index}
      tabIndex={disabled ? -1 : selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        outline: "none",
        fontSize: 13,
        color: selected ? "var(--bx-text-3, #c8cdd6)" : "var(--bx-text-4, #9aa0ad)",
      }}
    >
      <span
        style={{
          position: "relative",
          width: 18,
          height: 18,
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
            fontSize: 5,
            lineHeight: 1,
            color: fillColor,
            whiteSpace: "pre",
          }}
        />
      </span>
      <span>{label}</span>
    </div>
  );
}
