import { type CSSProperties, useState } from "react";
import { FillButton } from "../FillButton/FillButton.tsx";
import { useControllableState } from "../hooks/useControllableState";
import { FloatingPanel, useToast } from "../primitives";

export interface PopoverProps {
  /** Trigger button text. Default "CONFIGURE". */
  label?: string;
  /** Panel heading. Default "RENDER DENSITY". */
  title?: string;
  /** Panel sub-line under the heading. Default "Sub-pixel coverage per cell." */
  description?: string;
  /** Single-select toggle options. Default LOW / MED / HIGH. */
  options?: string[];
  /** Controlled selected option. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  /** Initial selected option when uncontrolled. Default "MED". */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Apply-button text. Default "APPLY". */
  applyLabel?: string;
  /** Toast message fired on apply. Default "Density applied". */
  toastMessage?: string;
  /** Panel width. Default 248. */
  width?: CSSProperties["width"];
  /** Which edge the panel anchors to. Default "start". */
  align?: "start" | "end";
  style?: CSSProperties;
}

/**
 * A trigger button that unrolls a floating panel of live controls — here a
 * single-select density toggle group and an APPLY action. Applying closes the
 * panel and fires an "ok" toast via the shared {@link useToast} service; the
 * caret flips (▾ / ▴) while open. Outside-click / Escape dismissal and the
 * anchored popup come from the `FloatingPanel` primitive, and the APPLY button
 * charges via the shared `FillButton`. The trigger renders statically on the
 * server; the panel is inert until opened after mount.
 */
export function Popover({
  label = "CONFIGURE",
  title = "RENDER DENSITY",
  description = "Sub-pixel coverage per cell.",
  options = ["LOW", "MED", "HIGH"],
  value,
  defaultValue = "MED",
  onChange,
  applyLabel = "APPLY",
  toastMessage = "Density applied",
  width = 248,
  align = "start",
  style,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
  const toast = useToast();

  const apply = () => {
    setOpen(false);
    toast({ kind: "ok", message: toastMessage });
  };

  return (
    <FloatingPanel
      open={open}
      onOpenChange={setOpen}
      align={align}
      width={width}
      panelStyle={{
        marginTop: 10,
        background: "var(--bx-surface-3, #0c0d11)",
        border: "1px solid var(--bx-border-accent, #2a3320)",
        boxShadow: "0 18px 44px rgba(0,0,0,0.55)",
        padding: 16,
      }}
      trigger={
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "inherit",
            fontSize: 13,
            padding: "11px 16px",
            background: "#15161e",
            border: `1px solid ${open ? "var(--bx-border-accent, #2a3320)" : "var(--bx-border, #1c1d24)"}`,
            color: "var(--bx-text-3, #c8cdd6)",
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "border-color .16s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
            ...style,
          }}
        >
          {label}{" "}
          <span aria-hidden="true" style={{ color: "var(--bx-accent, #46c66d)" }}>
            {open ? "▴" : "▾"}
          </span>
        </button>
      }
    >
      <div style={{ color: "var(--bx-text-1, #f4f6fb)", fontSize: 13, marginBottom: 4 }}>{title}</div>
      <div style={{ color: "#5b616e", fontSize: 11, marginBottom: 14, lineHeight: 1.5 }}>{description}</div>
      <div role="group" style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {options.map((opt) => {
          const on = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(opt)}
              style={{
                flex: 1,
                fontFamily: "inherit",
                fontSize: 12,
                height: 32,
                background: on ? "#15161e" : "transparent",
                border: `1px solid ${on ? "var(--bx-accent, #46c66d)" : "var(--bx-border, #1c1d24)"}`,
                color: on ? "var(--bx-text-1, #f4f6fb)" : "#7b8290",
                cursor: "pointer",
                transition:
                  "background-color .16s var(--bx-ease, cubic-bezier(.5,0,.2,1)), border-color .16s var(--bx-ease, cubic-bezier(.5,0,.2,1)), color .16s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <FillButton
        onClick={apply}
        style={{
          width: "100%",
          fontSize: 12,
          letterSpacing: "0.08em",
          padding: "9px 14px",
        }}
      >
        {applyLabel}
      </FillButton>
    </FloatingPanel>
  );
}
