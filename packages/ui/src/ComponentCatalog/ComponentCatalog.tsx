import { type CSSProperties, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";

export interface CatalogItem {
  /** Display name, shown in the entry and matched against the filter. */
  name: string;
  /** Section key handed to `onJump` when the entry is clicked. */
  to: string;
}

export interface CatalogGroup {
  /** Category heading, e.g. `"GENERATIVE"`. */
  cat: string;
  items: CatalogItem[];
}

/** The default catalogue — every primitive in the system, grouped by category. */
export const CATALOG_GROUPS: readonly CatalogGroup[] = [
  {
    cat: "GENERATIVE",
    items: [
      { name: "Palette", to: "palette" },
      { name: "Glyph Primitives", to: "glyphs" },
      { name: "Signal / Scope", to: "scope" },
      { name: "Image Render", to: "image" },
      { name: "Loaders & Meters", to: "loaders" },
      { name: "Typography FX", to: "type" },
      { name: "Draw Canvas", to: "draw" },
      { name: "Ripple Field", to: "ripple" },
      { name: "Automaton", to: "life" },
      { name: "Wireframe", to: "wire" },
    ],
  },
  {
    cat: "ATOMS",
    items: [
      { name: "Button", to: "atoms" },
      { name: "Switch", to: "atoms" },
      { name: "Checkbox", to: "atoms" },
      { name: "Segmented", to: "atoms" },
      { name: "Input", to: "atoms" },
      { name: "Slider", to: "atoms" },
    ],
  },
  {
    cat: "COMPOSITES",
    items: [
      { name: "Tabs", to: "forms" },
      { name: "Select", to: "forms" },
      { name: "Stepper", to: "forms" },
      { name: "Tags", to: "forms" },
      { name: "Radio Group", to: "forms" },
      { name: "Tooltip", to: "forms" },
    ],
  },
  {
    cat: "OVERLAYS",
    items: [
      { name: "Dialog", to: "overlay" },
      { name: "Toast", to: "overlay" },
      { name: "Accordion", to: "overlay" },
      { name: "Progress Ring", to: "overlay" },
      { name: "Popover", to: "panels" },
      { name: "Hover Card", to: "panels" },
      { name: "Command Palette", to: "panels" },
      { name: "Sheet", to: "panels" },
      { name: "Context Menu", to: "panels" },
    ],
  },
  {
    cat: "DATA",
    items: [
      { name: "List", to: "data" },
      { name: "Tree", to: "data" },
      { name: "Table", to: "data" },
      { name: "Spec / Key-Value", to: "data" },
      { name: "Console", to: "console" },
    ],
  },
  {
    cat: "NAVIGATION",
    items: [
      { name: "Breadcrumb", to: "nav" },
      { name: "Pagination", to: "nav" },
      { name: "Menubar", to: "layout" },
      { name: "Nav Menu", to: "layout" },
      { name: "Sidebar", to: "layout" },
      { name: "Resizable", to: "layout" },
    ],
  },
  {
    cat: "MARKERS",
    items: [
      { name: "Status Dots", to: "nav" },
      { name: "Badges", to: "nav" },
      { name: "Avatars", to: "nav" },
      { name: "Alerts", to: "nav" },
      { name: "Keycaps", to: "more" },
      { name: "Steps", to: "more" },
      { name: "Empty State", to: "more" },
      { name: "Skeleton", to: "more" },
    ],
  },
  {
    cat: "FORM",
    items: [
      { name: "Textarea", to: "entry" },
      { name: "Field Validation", to: "entry" },
      { name: "Input OTP", to: "entry" },
      { name: "Combobox", to: "entry" },
      { name: "Toggle Group", to: "entry" },
      { name: "Menu", to: "more" },
    ],
  },
  {
    cat: "DATE & MEDIA",
    items: [
      { name: "Calendar", to: "date" },
      { name: "Date Picker", to: "date" },
      { name: "Carousel", to: "date" },
    ],
  },
  {
    cat: "MOTION",
    items: [
      { name: "Number Ticker", to: "motion" },
      { name: "Marquee", to: "motion" },
      { name: "Boot Sequence", to: "motion" },
      { name: "Scroll Reveal", to: "motion" },
      { name: "Timeline", to: "time" },
      { name: "Banner Type", to: "banner" },
    ],
  },
  {
    cat: "CHARTS",
    items: [
      { name: "Bar Chart", to: "charts" },
      { name: "Line Chart", to: "charts" },
      { name: "Donut", to: "charts" },
      { name: "Heatmap", to: "charts" },
      { name: "Gauge", to: "gauge" },
      { name: "Dropzone", to: "drop" },
    ],
  },
];

export interface ComponentCatalogProps {
  /** Catalogue data. Defaults to the full system index. */
  groups?: readonly CatalogGroup[];
  /** Controlled filter query. Omit for uncontrolled (see `defaultFilter`). */
  filter?: string;
  defaultFilter?: string;
  onFilterChange?: (value: string) => void;
  /** Called with an item's `to` key when its entry is clicked. */
  onJump?: (to: string) => void;
  style?: CSSProperties;
}

/**
 * The filterable component index (section §00). A live text filter narrows the
 * grouped catalogue in place and updates the live count — `N COMPONENTS`, or
 * `M / N MATCH` while filtering. Filter state is via `useControllableState`;
 * empty groups collapse out. Clicking an entry fires `onJump` with its section
 * key. Pure render — no imperative glyph work, safe to render on the server.
 */
export function ComponentCatalog({
  groups = CATALOG_GROUPS,
  filter,
  defaultFilter = "",
  onFilterChange,
  onJump,
  style,
}: ComponentCatalogProps) {
  const [query, setQuery] = useControllableState(filter, defaultFilter, onFilterChange);
  const [hovered, setHovered] = useState<string | null>(null);

  const q = query.toLowerCase().trim();
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  let visible = 0;
  const rows = groups.map((g) => {
    const items = g.items.filter((it) => it.name.toLowerCase().includes(q));
    visible += items.length;
    return { group: g, items };
  });

  const count = q ? `${visible} / ${total} MATCH` : `${total} COMPONENTS`;

  return (
    <div style={{ fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)", ...style }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "0 0 22px" }}>
        <span style={{ color: "var(--bx-accent, #46c66d)", fontSize: 13 }}>§ 00</span>
        <h2
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: "normal",
            color: "var(--bx-text-1, #f4f6fb)",
            letterSpacing: "0.02em",
          }}
        >
          COMPONENT INDEX
        </h2>
        <span style={{ flex: 1, borderTop: "1px solid var(--bx-border, #1c1d24)", alignSelf: "center" }} />
        <span style={{ color: "#3f424d", fontSize: 13 }}>{count}</span>
      </div>

      <p style={{ margin: "0 0 18px", color: "#7b8290", maxWidth: 620, fontSize: 14 }}>
        Every primitive in the system, catalogued. Filter by name, or click any entry to jump to its live demo —
        the whole library on one surface, drawn in cells.
      </p>

      <div style={{ position: "relative", marginBottom: 26, maxWidth: 340 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filter components…"
          aria-label="Filter components"
          style={{
            width: "100%",
            background: "#0a0b0e",
            border: "1px solid var(--bx-border, #1c1d24)",
            outline: 0,
            fontFamily: "inherit",
            fontSize: 13,
            color: "var(--bx-text-1, #f4f6fb)",
            caretColor: "var(--bx-accent, #46c66d)",
            padding: "11px 12px 11px 32px",
            boxSizing: "border-box",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 11,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#3f424d",
            fontSize: 13,
            pointerEvents: "none",
          }}
        >
          {"⌕"}
        </span>
      </div>

      <div style={{ marginBottom: 8 }}>
        {rows.map(({ group, items }) => {
          if (items.length === 0) return null;
          return (
            <div key={group.cat} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.12em" }}>{group.cat}</span>
                <span style={{ flex: 1, borderTop: "1px solid #15161e" }} />
                <span style={{ color: "#3f424d", fontSize: 11 }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {items.map((it) => {
                  const key = `${group.cat}:${it.name}`;
                  const isHover = hovered === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onJump?.(it.to)}
                      onPointerEnter={() => setHovered(key)}
                      onPointerLeave={() => setHovered((h) => (h === key ? null : h))}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        fontFamily: "inherit",
                        fontSize: 12,
                        padding: "8px 12px",
                        background: "var(--bx-surface-3, #0c0d11)",
                        border: `1px solid ${isHover ? "var(--bx-border-accent, #2a3320)" : "var(--bx-border, #1c1d24)"}`,
                        color: isHover ? "var(--bx-text-1, #f4f6fb)" : "var(--bx-text-4, #9aa0ad)",
                        cursor: "pointer",
                        transition: "border-color .15s, color .15s",
                      }}
                    >
                      <span style={{ color: "var(--bx-accent, #46c66d)", fontSize: 10 }}>█</span>
                      {it.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
