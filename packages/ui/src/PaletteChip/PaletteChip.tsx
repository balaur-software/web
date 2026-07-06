import { PALETTE, type PaletteColor } from "@balaur/tokens";

const FILL = "█████\n█████\n█████";

/**
 * A single ANSI palette swatch, filled with solid octant cells so the palette is
 * rendered in the system's own medium (section §01). Pure static markup.
 */
export function PaletteChip({ color }: { color: PaletteColor }) {
  return (
    <div style={{ border: "1px solid #1c1d24", background: "#0c0d11" }}>
      <div
        style={{
          padding: 9,
          color: color.hex,
          fontSize: 11,
          lineHeight: 0.96,
          whiteSpace: "pre",
          overflow: "hidden",
          letterSpacing: 0,
          fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
        }}
      >
        {FILL}
      </div>
      <div
        style={{
          padding: "7px 8px 2px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          borderTop: "1px solid #1c1d24",
        }}
      >
        <span style={{ color: "#aab0bd" }}>{color.name}</span>
        <span style={{ color: "#4b505c" }}>{color.idx}</span>
      </div>
      <div style={{ padding: "0 8px 8px", color: "#5b616e", fontSize: 11 }}>{color.hex.toUpperCase()}</div>
    </div>
  );
}

/** The full 16-color ANSI palette as an 8-column grid of {@link PaletteChip}s. */
export function Palette({ colors = PALETTE }: { colors?: readonly PaletteColor[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 9 }}>
      {colors.map((c) => (
        <PaletteChip key={c.idx} color={c} />
      ))}
    </div>
  );
}
