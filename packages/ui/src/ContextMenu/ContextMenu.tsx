import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { useDismissable } from "../hooks";
import { useToast } from "../primitives";

/** A single actionable row, or a `{ divider: true }` separator. */
export type ContextMenuItem =
  | { divider: true }
  | {
      divider?: false;
      /** Row text. */
      label: string;
      /** Leading glyph (defaults to a quadrant block). */
      glyph?: string;
      /** Danger styling (red) + an error toast on select. */
      danger?: boolean;
      /** Toast message fired on select. Defaults to `label`. */
      toast?: string;
      /** Custom handler; when omitted the item fires a toast. */
      onSelect?: () => void;
    };

export interface ContextMenuProps {
  /** Menu rows. Defaults to the reference cell-inspector actions. */
  items?: ContextMenuItem[];
  /** Content of the right-click surface. Defaults to the reference hint text. */
  children?: ReactNode;
  /** Extra styles merged onto the trigger surface. */
  style?: CSSProperties;
}

const DEFAULT_ITEMS: ContextMenuItem[] = [
  { label: "Inspect cell", glyph: "▛", toast: "Inspected cell" },
  { label: "Copy glyph", glyph: "▞", toast: "Copied glyph" },
  { label: "Pin region", glyph: "▙", toast: "Pinned region" },
  { divider: true },
  { label: "Clear cell", glyph: "▓", danger: true, toast: "Cleared cell" },
];

const MARGIN = 8;

/**
 * A right-click context menu: right-clicking the trigger surface pops a floating
 * list at the cursor, clamped to stay inside the viewport. Each row carries a
 * glyph + label; selecting one closes the menu and fires a toast (green for
 * normal rows, red for `danger` rows) via the shared {@link useToast} service.
 * Escape, an outside pointer-down, scroll or resize dismiss it (via
 * {@link useDismissable} plus scroll/resize listeners). The surface renders
 * statically on the server — the menu only mounts after a right-click, and its
 * first frame is hidden until measured so it never flashes at the wrong spot.
 */
export function ContextMenu({ items = DEFAULT_ITEMS, children, style }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [rawPos, setRawPos] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const close = () => setOpen(false);
  useDismissable(menuRef, { onDismiss: close, active: open });

  // Measure the freshly-mounted menu and clamp its cursor position to the
  // viewport before revealing it (mirrors the reference offsetWidth/Height clamp).
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;
    const mw = menu.offsetWidth || 190;
    const mh = menu.offsetHeight || 200;
    let x = rawPos.x;
    let y = rawPos.y;
    if (x + mw > window.innerWidth - MARGIN) x = window.innerWidth - mw - MARGIN;
    if (y + mh > window.innerHeight - MARGIN) y = window.innerHeight - mh - MARGIN;
    setPos({ x: Math.max(MARGIN, x), y: Math.max(MARGIN, y) });
    setReady(true);
  }, [open, rawPos]);

  // Scroll / resize dismiss the menu, as the reference does.
  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setRawPos({ x: e.clientX, y: e.clientY });
          setReady(false);
          setHovered(-1);
          setOpen(true);
        }}
        style={{
          border: "1px dashed var(--bx-border-mid, #2a2c34)",
          background: "#0a0b0e",
          padding: 38,
          textAlign: "center",
          color: "#3f424d",
          fontSize: 13,
          cursor: "context-menu",
          userSelect: "none",
          ...style,
        }}
      >
        {children ?? "▛ right-click anywhere in this panel for a context menu"}
      </div>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            zIndex: 310,
            minWidth: 190,
            visibility: ready ? "visible" : "hidden",
            fontFamily: "inherit",
            background: "var(--bx-surface-3, #0c0d11)",
            border: "1px solid var(--bx-border, #1c1d24)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
            padding: 5,
          }}
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
                  padding: "9px 12px",
                  background: isHovered ? (danger ? "#1f1416" : "#15161e") : "transparent",
                  border: 0,
                  color: danger ? "#ff6b6f" : "#c8cdd6",
                  cursor: "pointer",
                  transition: "background-color .12s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
                }}
              >
                <span style={danger ? undefined : { color: "var(--bx-accent, #46c66d)" }}>{item.glyph ?? "▛"}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
