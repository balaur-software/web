import { type CSSProperties, useState } from "react";
import { FloatingPanel } from "../primitives";
import { useControllableState } from "../hooks/useControllableState";

export interface ComboboxProps {
  /** Full option list; filtered case-insensitively by the current input text. */
  options: string[];
  /** Controlled input text. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Trigger + panel width. Defaults to 250. */
  width?: CSSProperties["width"];
  style?: CSSProperties;
}

/**
 * A searchable combobox: a text input that filters `options` on the fly and
 * unrolls a floating list you can drive with the keyboard (↑/↓ to move the
 * highlight, ⏎ to pick, Esc to close). Input text is `useControllableState`;
 * the popup + outside-click/Escape dismissal come from the shared `FloatingPanel`
 * primitive. The static input renders on the server; the list is inert until
 * focused after mount.
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "search…",
  disabled,
  width = 250,
  style,
}: ComboboxProps) {
  const [text, setText] = useControllableState(value, defaultValue ?? "", onChange);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);

  const q = text.toLowerCase();
  const shown = options.filter((o) => o.toLowerCase().includes(q));

  const pick = (o: string) => {
    setText(o);
    setOpen(false);
  };

  return (
    <FloatingPanel
      open={open && !disabled}
      onOpenChange={setOpen}
      align="start"
      width={width}
      panelStyle={{
        background: "var(--bx-surface-3, #0c0d11)",
        border: "1px solid var(--bx-border, #1c1d24)",
        maxHeight: 210,
        overflowY: "auto",
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
      }}
      trigger={
        <input
          type="text"
          role="combobox"
          aria-expanded={open && !disabled}
          aria-autocomplete="list"
          disabled={disabled}
          placeholder={placeholder}
          value={text}
          onFocus={() => {
            if (disabled) return;
            setHi(-1);
            setOpen(true);
          }}
          onChange={(e) => {
            setText(e.target.value);
            setHi(-1);
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!open) setOpen(true);
              setHi((h) => Math.min(shown.length - 1, h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((h) => Math.max(0, h - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const sel = shown[hi];
              if (hi >= 0 && sel !== undefined) pick(sel);
            } else if (e.key === "Escape") {
              setOpen(false);
              e.currentTarget.blur();
            }
          }}
          style={{
            width,
            maxWidth: "100%",
            boxSizing: "border-box",
            background: "#0a0b0e",
            border: `1px solid ${open && !disabled ? "var(--bx-border-accent, #2a3320)" : "var(--bx-border, #1c1d24)"}`,
            outline: 0,
            fontFamily: "inherit",
            fontSize: 13,
            color: disabled ? "var(--bx-text-dim-3, #4b505c)" : "var(--bx-text-1, #f4f6fb)",
            caretColor: "var(--bx-accent, #46c66d)",
            padding: "11px 12px",
            cursor: disabled ? "not-allowed" : "text",
            transition: "border-color .16s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
            ...style,
          }}
        />
      }
    >
      <div role="listbox">
        {shown.map((o, i) => (
          <button
            key={o}
            type="button"
            role="option"
            aria-selected={o === text}
            onMouseDown={(e) => {
              e.preventDefault();
              pick(o);
            }}
            onPointerEnter={() => setHi(i)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              fontFamily: "inherit",
              fontSize: 13,
              padding: "9px 12px",
              background: i === hi ? "#15161e" : "transparent",
              border: 0,
              color: "#c8cdd6",
              cursor: "pointer",
              letterSpacing: "0.03em",
            }}
          >
            {o}
          </button>
        ))}
        {shown.length === 0 && (
          <div style={{ padding: "9px 12px", color: "var(--bx-text-dim-2, #3f424d)", fontSize: 12 }}>no match</div>
        )}
      </div>
    </FloatingPanel>
  );
}
