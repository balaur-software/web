import type { CSSProperties } from "react";

const card: CSSProperties = {
  border: "1px solid #1c1d24",
  background: "#0c0d11",
  padding: 18,
};
const cardLabel: CSSProperties = { color: "#5b616e", fontSize: 12, marginBottom: 14 };

const BIT_LABELS = ["1", "2", "4", "8", "16", "32", "64", "128"];

/**
 * The glyph-primitives reference (section §02): explains the 2×4 octant cell and
 * its `char = 0x1CD00 + Σ lit bits` encoding, the density→luminance fill ramp,
 * and the legacy block/quadrant glyphs the encoder reuses. Pure static markup.
 */
export function GlyphReference() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 14,
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
      }}
    >
      <div style={card}>
        <div style={{ ...cardLabel, marginBottom: 16 }}>THE OCTANT CELL — 8 cells, 2×4</div>
        <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 38px)",
              gridTemplateRows: "repeat(4, 24px)",
            }}
          >
            {BIT_LABELS.map((b) => (
              <div
                key={b}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ width: 22, height: 13, background: "var(--bx-accent, #46c66d)" }} />
                <span style={{ color: "#4b505c", fontSize: 10, marginTop: 2 }}>{b}</span>
              </div>
            ))}
          </div>
          <div style={{ color: "#7b8290", fontSize: 13, lineHeight: 1.7 }}>
            char =<br />
            <span style={{ color: "#2bd9d9" }}>0x1CD00</span> +<br />∑ lit&nbsp;bits
            <br />
            <span style={{ color: "#4b505c" }}>= 256 states</span>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardLabel}>FILL RAMP — density → luminance</div>
        <div style={{ fontSize: 34, lineHeight: 1, color: "#f2c94c", letterSpacing: 4 }}>&nbsp;▁▂▃▄▅▆▇█</div>
        <div style={{ color: "#5b616e", fontSize: 11, marginTop: 14, lineHeight: 1.7 }}>
          Treat sub-pixel coverage as luminance. Mapping a grayscale value onto the 2×4 cell turns text into a
          framebuffer — the basis for every plot and image in the system.
        </div>
      </div>

      <div style={card}>
        <div style={cardLabel}>LEGACY BLOCKS — quadrants & shades</div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.25,
            color: "#7aa9ff",
            letterSpacing: 2,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.25, color: "#c061ff", letterSpacing: 6 }}>&nbsp;░▒▓█</div>
        <div style={{ color: "#5b616e", fontSize: 11, marginTop: 12, lineHeight: 1.7 }}>
          2×2 quadrants give crisp 4-subpixel imagery; the four shade blocks give cheap tonal fills. Half-size
          by design.
        </div>
      </div>
    </div>
  );
}
