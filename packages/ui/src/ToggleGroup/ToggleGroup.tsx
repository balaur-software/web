import { type CSSProperties, type ReactNode } from "react";
import { useControllableState } from "../hooks/useControllableState";

export interface ToggleGroupItem {
  /** Stable identity used in the selection value. */
  value: string;
  /** Rendered button content (text or glyphs). */
  label: ReactNode;
  /** Per-item style overrides (e.g. fixed width, bold/italic/underline). */
  style?: CSSProperties;
  /** Accessible label when `label` is glyph-only. */
  title?: string;
}

export interface ToggleGroupProps {
  items: ToggleGroupItem[];
  /**
   * Allow multiple simultaneous selections (mirrors `data-multi` in the
   * reference). Default is single-select where exactly one item stays lit.
   */
  multi?: boolean;
  /** Controlled selection. Omit for uncontrolled (use `defaultValue`). */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  style?: CSSProperties;
}

const AC = "var(--bx-accent, #46c66d)";

/**
 * A row of terminal-styled toggle buttons. In single mode clicking an item lights
 * it and clears the rest; in `multi` mode each item toggles independently. State
 * flows through `useControllableState`, so the lit styling is deterministic on the
 * server and needs no post-mount imperative fill.
 */
export function ToggleGroup({ items, multi = false, value, defaultValue, onChange, style }: ToggleGroupProps) {
  const [selected, setSelected] = useControllableState<string[]>(value, defaultValue ?? [], onChange);

  const isOn = (v: string) => selected.includes(v);

  const toggle = (v: string) => {
    if (multi) {
      setSelected(isOn(v) ? selected.filter((x) => x !== v) : [...selected, v]);
    } else {
      setSelected([v]);
    }
  };

  return (
    <div role="group" style={{ display: "inline-flex", gap: 6, ...style }}>
      {items.map((item) => {
        const on = isOn(item.value);
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={on}
            title={item.title}
            onClick={() => toggle(item.value)}
            style={{
              fontFamily: "inherit",
              fontSize: 13,
              lineHeight: 1,
              padding: "0 14px",
              height: 38,
              background: on ? "#15161e" : "transparent",
              border: `1px solid ${on ? AC : "var(--bx-border, #1c1d24)"}`,
              color: on ? "var(--bx-text-1, #f4f6fb)" : "#7b8290",
              cursor: "pointer",
              transition: "background .12s, border-color .12s, color .12s",
              ...item.style,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
