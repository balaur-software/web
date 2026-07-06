import { type CSSProperties, useState } from "react";
import { FloatingPanel, useToast } from "../primitives";

/** A single actionable row, or a `{ divider: true }` separator. */
export type DropdownMenuItem =
  | { divider: true }
  | {
      divider?: false;
      /** Row text. */
      label: string;
      /** Leading glyph (defaults to a quadrant block). */
      glyph?: string;
      /** Keyboard-shortcut hint shown on the right (e.g. "⌘D"). */
      shortcut?: string;
      /** Danger styling (red) + an error toast on select. */
      danger?: boolean;
      /** Toast message fired on select. Defaults to `label`. */
      toast?: string;
      /** Custom handler; when omitted the item fires a toast. */
      onSelect?: () => void;
    };

export interface DropdownMenuProps {
  /** Trigger button text. Default "ACTIONS". */
  label?: string;
  items: DropdownMenuItem[];
  /** Panel width. Default 212. */
  width?: CSSProperties["width"];
  /** Which edge the panel anchors to. Default "start". */
  align?: "start" | "end";
  style?: CSSProperties;
}

/**
 * An action menu: a button that unrolls a floating list of items, each with a
 * glyph, label and optional shortcut keycap. Selecting an item closes the menu
 * and fires a toast (green for normal rows, red for `danger` rows) via the
 * shared {@link useToast} service. Outside-click / Escape dismissal and the
 * anchored popup come from the `FloatingPanel` primitive; the caret flips
 * (▾ / ▴) while open. The button renders statically on the server — the list is
 * inert until opened after mount.
 */
export function DropdownMenu({ label = "ACTIONS", items, width = 212, align = "start", style }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(-1);
  const toast = useToast();

  return (
    <FloatingPanel
      open={open}
      onOpenChange={setOpen}
      align={align}
      width={width}
      panelStyle={{
        background: "var(--bx-surface-3, #0c0d11)",
        border: "1px solid var(--bx-border, #1c1d24)",
        overflow: "hidden",
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
      }}
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
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
      {items.map((item, i) => {
        if (item.divider) {
          // eslint-disable-next-line react/no-array-index-key
          return <div key={i} style={{ height: 1, background: "var(--bx-border, #1c1d24)", margin: "4px 0" }} />;
        }
        const danger = item.danger ?? false;
        const isHovered = hovered === i;
        return (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              if (item.onSelect) item.onSelect();
              else toast({ kind: danger ? "err" : "ok", message: item.toast ?? item.label });
            }}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered((h) => (h === i ? -1 : h))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              width: "100%",
              textAlign: "left",
              fontFamily: "inherit",
              fontSize: 13,
              padding: "10px 14px",
              background: isHovered ? (danger ? "#1f1416" : "#15161e") : "transparent",
              border: 0,
              color: danger ? "#ff6b6f" : "var(--bx-text-3, #c8cdd6)",
              cursor: "pointer",
              transition: "background-color .12s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
            }}
          >
            <span style={danger ? undefined : { color: "var(--bx-accent, #46c66d)" }}>{item.glyph ?? "▛"}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span
                style={{
                  fontSize: 11,
                  padding: "0 5px",
                  color: danger ? "#5b3030" : "#3f424d",
                  border: `1px solid ${danger ? "var(--bx-border-red, #3a2020)" : "var(--bx-border-mid, #2a2c34)"}`,
                }}
              >
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </FloatingPanel>
  );
}
