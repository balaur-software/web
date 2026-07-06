import { type CSSProperties, useState } from "react";
import { FloatingPanel } from "../primitives";
import { useControllableState } from "../hooks/useControllableState";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  /** Controlled selected value. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shown on the button when nothing is selected. */
  placeholder?: string;
  disabled?: boolean;
  /** Trigger + panel width. Defaults to 230. */
  width?: CSSProperties["width"];
  style?: CSSProperties;
}

/**
 * A terminal-styled select: a button that unrolls a floating option menu with a
 * caret that flips (▾ / ▴) and an accent-tinted border while open. Selection is
 * via `useControllableState`; the popup + outside-click/Escape dismissal come
 * from the shared `FloatingPanel` primitive. Static button renders on the server;
 * the menu is inert until opened after mount.
 */
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "SELECT",
  disabled,
  width = 230,
  style,
}: SelectProps) {
  const [selected, setSelected] = useControllableState(value, defaultValue ?? "", onChange);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(-1);

  const current = options.find((o) => o.value === selected);

  return (
    <FloatingPanel
      open={open && !disabled}
      onOpenChange={setOpen}
      align="start"
      width={width}
      panelStyle={{
        background: "var(--bx-surface-3, #0c0d11)",
        border: "1px solid var(--bx-border, #1c1d24)",
        overflow: "hidden",
      }}
      trigger={
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open && !disabled}
          onClick={() => {
            if (!disabled) setOpen(!open);
          }}
          style={{
            width,
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            fontFamily: "inherit",
            fontSize: 13,
            padding: "11px 14px",
            background: "var(--bx-surface-3, #0c0d11)",
            border: `1px solid ${open && !disabled ? "var(--bx-border-accent, #2a3320)" : "var(--bx-border, #1c1d24)"}`,
            color: disabled ? "var(--bx-text-dim-3, #4b505c)" : "var(--bx-text-1, #f4f6fb)",
            cursor: disabled ? "not-allowed" : "pointer",
            letterSpacing: "0.04em",
            transition: "border-color .16s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
            ...style,
          }}
        >
          <span>{current ? current.label : placeholder}</span>
          <span aria-hidden="true" style={{ color: "var(--bx-accent, #46c66d)" }}>
            {open && !disabled ? "▴" : "▾"}
          </span>
        </button>
      }
    >
      <div role="listbox">
        {options.map((opt, i) => {
          const isSelected = opt.value === selected;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                setSelected(opt.value);
                setOpen(false);
              }}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered((h) => (h === i ? -1 : h))}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                fontFamily: "inherit",
                fontSize: 13,
                padding: "10px 14px",
                background: hovered === i ? "#15161e" : "transparent",
                border: 0,
                color: isSelected ? "var(--bx-accent, #46c66d)" : "var(--bx-text-4, #9aa0ad)",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </FloatingPanel>
  );
}
