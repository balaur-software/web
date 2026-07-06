import { type CSSProperties, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";

const AC = "var(--bx-accent,#46c66d)";

export interface SidebarItem {
  /** Sidebar rail label, e.g. "Dashboard". */
  label: string;
  /** Leading octant glyph shown before the label. */
  glyph: string;
  /** Content-pane heading shown when the item is active, e.g. "DASHBOARD". */
  title: string;
  /** Content-pane description shown when the item is active. */
  sub: string;
}

const DEFAULT_ITEMS: SidebarItem[] = [
  { label: "Dashboard", glyph: "▛", title: "DASHBOARD", sub: "System overview and live telemetry." },
  { label: "Render", glyph: "▞", title: "RENDER", sub: "Live 2x4 cell rasteriser." },
  { label: "Palette", glyph: "▙", title: "PALETTE", sub: "16 ANSI hues, base plus bright." },
  { label: "Glyphs", glyph: "▟", title: "GLYPHS", sub: "Octant primitives, 256 states." },
  { label: "Logs", glyph: "▚", title: "LOGS", sub: "Streaming event log, tail -f." },
];

export interface SidebarProps {
  /** Sections rendered in the rail; each drives the content pane when active. */
  items?: SidebarItem[];
  /** Brand mark shown in the header next to the accent block. */
  brand?: string;
  /** Operator label shown in the footer. */
  operator?: string;
  /** Controlled active index. Omit for uncontrolled (use `defaultActiveIndex`). */
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  /** Controlled collapsed state. Omit for uncontrolled (use `defaultCollapsed`). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  style?: CSSProperties;
}

/**
 * A collapsible rail of octant sections wired to a content pane. Selecting an
 * item swaps the pane's title/description; the `«` button eases the rail between
 * its full and icon-only widths (a CSS width transition, so it is inert on the
 * server). Active index and collapsed state are both driven by
 * `useControllableState`, so the component works controlled or uncontrolled.
 */
export function Sidebar({
  items = DEFAULT_ITEMS,
  brand = "OCTANT.OS",
  operator = "operator",
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  style,
}: SidebarProps) {
  const [active, setActive] = useControllableState(activeIndex, defaultActiveIndex, onActiveIndexChange);
  const [isCollapsed, setCollapsed] = useControllableState(collapsed, defaultCollapsed, onCollapsedChange);
  const [hover, setHover] = useState<number | null>(null);

  const activeItem = items[active] ?? items[0];

  const labelStyle: CSSProperties = { display: isCollapsed ? "none" : "inline" };

  return (
    <div
      style={{
        display: "flex",
        height: 316,
        border: "1px solid var(--bx-border,#1c1d24)",
        overflow: "hidden",
        background: "#0a0b0e",
        fontFamily: "var(--bx-font-mono, ui-monospace, monospace)",
        ...style,
      }}
    >
      <div
        style={{
          width: isCollapsed ? 58 : 212,
          flex: "none",
          borderRight: "1px solid var(--bx-border,#1c1d24)",
          display: "flex",
          flexDirection: "column",
          transition: "width .24s cubic-bezier(.5,0,.2,1)",
          overflow: "hidden",
          background: "#0a0b0e",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 14,
            borderBottom: "1px solid #15161e",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 9, whiteSpace: "nowrap" }}>
            <span style={{ color: AC }}>█</span>
            <span style={{ ...labelStyle, color: "var(--bx-text-1,#f4f6fb)", fontSize: 13, letterSpacing: "0.04em" }}>
              {brand}
            </span>
          </span>
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            onClick={() => setCollapsed(!isCollapsed)}
            style={{
              fontFamily: "inherit",
              fontSize: 13,
              background: "transparent",
              border: 0,
              color: "#5b616e",
              cursor: "pointer",
            }}
          >
            {isCollapsed ? "»" : "«"}
          </button>
        </div>

        <div
          style={{
            flex: 1,
            padding: "10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "hidden",
          }}
        >
          {items.map((it, i) => {
            const on = i === active;
            const bg = on ? "#15161e" : hover === i ? "#0f1014" : "transparent";
            return (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: items are a stable, ordered list
                key={i}
                type="button"
                aria-current={on ? "true" : undefined}
                onClick={() => setActive(i)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "inherit",
                  fontSize: 13,
                  padding: "10px 12px",
                  background: bg,
                  border: 0,
                  borderLeft: `2px solid ${on ? AC : "transparent"}`,
                  color: on ? "var(--bx-text-1,#f4f6fb)" : "#9aa0ad",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{ color: on ? AC : "#5b616e", fontSize: 14, flex: "none", width: 16, textAlign: "center" }}
                >
                  {it.glyph}
                </span>
                <span style={labelStyle}>{it.label}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            borderTop: "1px solid #15161e",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              flex: "none",
              border: "1px solid var(--bx-border,#1c1d24)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <pre style={{ margin: 0, fontSize: 9, lineHeight: 1, color: AC, whiteSpace: "pre", letterSpacing: 0 }}>
              {"▛▜\n▙▟"}
            </pre>
          </span>
          <span style={{ ...labelStyle, color: "#7b8290", fontSize: 12 }}>{operator}</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: 26, minWidth: 0 }}>
        <div style={{ color: "var(--bx-text-1,#f4f6fb)", fontSize: 20, letterSpacing: "0.02em" }}>
          {activeItem?.title ?? ""}
        </div>
        <div
          style={{
            color: "#7b8290",
            fontSize: 13,
            marginTop: 10,
            maxWidth: 360,
            lineHeight: 1.6,
          }}
        >
          {activeItem?.sub ?? ""}
        </div>
        <div style={{ marginTop: 24, color: "#3f424d", fontSize: 12 }}>← pick a section · collapse the rail with «</div>
      </div>
    </div>
  );
}
