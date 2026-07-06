import { type CSSProperties, useState } from "react";
import { FloatingPanel } from "../primitives";
import { useControllableState } from "../hooks/useControllableState";
import { Calendar } from "../Calendar/Calendar";

const pad = (n: number): string => String(n).padStart(2, "0");
const isoDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export interface DatePickerProps {
  /** Controlled selected day. Omit for uncontrolled (use `defaultValue`). */
  value?: Date | null;
  defaultValue?: Date | null;
  /** Fired with the chosen day when a calendar cell is picked. */
  onChange?: (date: Date) => void;
  /** Empty-field placeholder. */
  placeholder?: string;
  /** Render the selected day into the field. Defaults to ISO `YYYY-MM-DD`. */
  format?: (date: Date) => string;
  disabled?: boolean;
  /** Field width. Defaults to 240. */
  width?: CSSProperties["width"];
  /** Which edge the popup anchors to. Default "start". */
  align?: "start" | "end";
  style?: CSSProperties;
}

/**
 * A read-only text field that unrolls a floating {@link Calendar}: click the
 * field, pick a day, and it fills the input (ISO by default) and closes. The
 * selected date is `useControllableState` (works controlled or uncontrolled);
 * the popup plus outside-click / Escape dismissal come from the shared
 * `FloatingPanel` primitive. The field renders on the server; the calendar's
 * "today" marker resolves after mount, so there is no hydration mismatch.
 */
export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  placeholder = "select a date…",
  format,
  disabled,
  width = 240,
  align = "start",
  style,
}: DatePickerProps) {
  const [selected, setSelected] = useControllableState<Date | null>(
    value,
    defaultValue,
    onChange ? (d) => d && onChange(d) : undefined,
  );
  const [open, setOpen] = useState(false);

  const fmt = format ?? isoDate;
  const display = selected ? fmt(selected) : "";

  const isOpen = open && !disabled;
  const toggle = () => {
    if (!disabled) setOpen((o) => !o);
  };

  return (
    <FloatingPanel
      open={isOpen}
      onOpenChange={setOpen}
      align={align}
      panelStyle={{
        background: "var(--bx-surface-3, #0c0d11)",
        border: "1px solid var(--bx-border-accent, #2a3320)",
        boxShadow: "0 18px 44px rgba(0,0,0,0.55)",
        padding: 16,
        maxWidth: "90vw",
      }}
      trigger={
        <input
          type="text"
          readOnly
          disabled={disabled}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          placeholder={placeholder}
          value={display}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
              e.preventDefault();
              if (e.key === "ArrowDown") setOpen(true);
              else toggle();
            }
          }}
          style={{
            width,
            maxWidth: "100%",
            boxSizing: "border-box",
            background: "#0a0b0e",
            border: `1px solid ${isOpen ? "var(--bx-border-accent, #2a3320)" : "var(--bx-border, #1c1d24)"}`,
            outline: 0,
            fontFamily: "inherit",
            fontSize: 13,
            color: disabled ? "var(--bx-text-dim-3, #4b505c)" : "var(--bx-text-1, #f4f6fb)",
            caretColor: "transparent",
            padding: "11px 12px",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "border-color .18s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
            ...style,
          }}
        />
      }
    >
      <Calendar
        value={selected}
        onSelect={(d) => {
          setSelected(d);
          setOpen(false);
        }}
        style={{ width: 254 }}
      />
    </FloatingPanel>
  );
}
