import type { CSSProperties, ReactNode } from "react";

/** A single key/value row in a {@link SpecList}. */
export interface SpecItem {
  /** The row label, rendered on the left. */
  key: string;
  /** The row value, rendered right-aligned. */
  value: ReactNode;
  /** Render the value in the accent color instead of the default text color. */
  accent?: boolean;
}

export interface SpecListProps {
  /** The key/value rows to display. Defaults to the ANSI-braille glyph spec. */
  items?: readonly SpecItem[];
  /** Small caption shown above the rows. */
  label?: string;
  /** Number of columns the rows flow across. Defaults to 2. */
  columns?: number;
}

/** The reference spec sheet from §-glyph-block (source L842-849). */
const DEFAULT_ITEMS: readonly SpecItem[] = [
  { key: "GLYPH BLOCK", value: "U+1CD00", accent: true },
  { key: "SUB-PIXELS", value: "8 / cell" },
  { key: "STATES", value: "256" },
  { key: "GRID", value: "2 × 4" },
  { key: "PALETTE", value: "16 ANSI" },
  { key: "DITHER", value: "Bayer 4×4" },
  { key: "UNICODE", value: "16.0 / 2024" },
  { key: "CHANNEL", value: "density" },
];

const row: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  borderBottom: "1px dotted var(--bx-border, #1c1d24)",
  padding: "9px 0",
  gap: 14,
};

/**
 * A grid of SPEC key / value rows (source L840-852). Pure static markup: each
 * row is a dotted-underlined label/value pair, flowed across `columns` columns.
 * Values flagged `accent` render in the accent color, matching the reference.
 */
export function SpecList({ items = DEFAULT_ITEMS, label = "SPEC · key / value", columns = 2 }: SpecListProps) {
  return (
    <div
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 20,
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
      }}
    >
      <div style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em", marginBottom: 16 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "0 48px" }}>
        {items.map((item) => (
          <div key={item.key} style={row}>
            <span style={{ color: "#7b8290", fontSize: 13 }}>{item.key}</span>
            <span style={{ color: item.accent ? "var(--bx-accent, #46c66d)" : "#c8cdd6", fontSize: 13 }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
