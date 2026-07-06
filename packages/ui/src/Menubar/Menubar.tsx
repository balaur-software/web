import { type CSSProperties, useState } from "react";
import { FloatingPanel, useToast } from "../primitives";

/** A single actionable row, or a `{ divider: true }` separator. */
export type MenubarItem =
  | { divider: true }
  | {
      divider?: false;
      /** Row text. */
      label: string;
      /** Keyboard-shortcut hint shown on the right (e.g. "⌘N"). */
      shortcut?: string;
      /** Toast message fired on select. Defaults to `label`. */
      toast?: string;
      /** Custom handler; when omitted the item fires a toast. */
      onSelect?: () => void;
    };

/** One top-level menubar group: a trigger button and its pull-down items. */
export interface MenubarMenu {
  /** Trigger label (e.g. "FILE"). */
  label: string;
  items: MenubarItem[];
}

export interface MenubarProps {
  menus: MenubarMenu[];
  style?: CSSProperties;
}

const PANEL_STYLE: CSSProperties = {
  minWidth: 196,
  background: "var(--bx-surface-3, #0c0d11)",
  border: "1px solid var(--bx-border, #1c1d24)",
  padding: 5,
  boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
};

/**
 * An app-shell menu bar: a strip of top-level triggers (FILE / EDIT / VIEW …),
 * each unrolling a floating pull-down of items with optional shortcut hints.
 * Only one menu is open at a time (`openIdx`); hovering another trigger while a
 * menu is open switches to it, mirroring native menubars. Selecting an item
 * closes the bar and fires a toast (or a custom `onSelect`) via the shared
 * {@link useToast} service. Each pull-down is a `FloatingPanel`, so Escape /
 * outside-click dismissal comes for free. Triggers render statically on the
 * server; the menus stay inert until opened after mount.
 */
export function Menubar({ menus, style }: MenubarProps) {
  const [openIdx, setOpenIdx] = useState(-1);
  const [hovered, setHovered] = useState<string | null>(null);
  const toast = useToast();

  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "#0a0b0e",
        ...style,
      }}
    >
      {menus.map((menu, i) => {
        const on = openIdx === i;
        return (
          <FloatingPanel
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            open={on}
            onOpenChange={(o) => setOpenIdx(o ? i : -1)}
            panelStyle={PANEL_STYLE}
            trigger={
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={on}
                onClick={() => setOpenIdx(on ? -1 : i)}
                onPointerEnter={() => setOpenIdx((cur) => (cur !== -1 && cur !== i ? i : cur))}
                style={{
                  fontFamily: "inherit",
                  fontSize: 13,
                  padding: "9px 15px",
                  background: on ? "#15161e" : "transparent",
                  border: 0,
                  color: on ? "var(--bx-text-1, #f4f6fb)" : "var(--bx-text-4, #9aa0ad)",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "color .12s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
                }}
              >
                {menu.label}
              </button>
            }
          >
            {menu.items.map((item, j) => {
              if (item.divider) {
                return (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={j}
                    style={{ height: 1, background: "var(--bx-border, #1c1d24)", margin: "4px 0" }}
                  />
                );
              }
              const key = `${i}:${j}`;
              const isHovered = hovered === key;
              return (
                <button
                  // eslint-disable-next-line react/no-array-index-key
                  key={j}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpenIdx(-1);
                    if (item.onSelect) item.onSelect();
                    else toast({ kind: "ok", message: item.toast ?? item.label });
                  }}
                  onPointerEnter={() => setHovered(key)}
                  onPointerLeave={() => setHovered((h) => (h === key ? null : h))}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 18,
                    width: "100%",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: 13,
                    padding: "8px 11px",
                    background: isHovered ? "#15161e" : "transparent",
                    border: 0,
                    color: "var(--bx-text-3, #c8cdd6)",
                    cursor: "pointer",
                    transition: "background-color .12s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
                  }}
                >
                  {item.label}
                  {item.shortcut && <span style={{ color: "#3f424d" }}>{item.shortcut}</span>}
                </button>
              );
            })}
          </FloatingPanel>
        );
      })}
    </div>
  );
}
