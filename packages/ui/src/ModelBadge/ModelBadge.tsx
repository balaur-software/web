import type { CSSProperties } from "react";

const row: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
};

const pill: CSSProperties = {
  fontSize: 11,
  padding: "4px 9px",
  whiteSpace: "nowrap",
};

export interface ModelBadgeProps {
  /** Active model identifier shown in the accent pill (e.g. `OCTANT-4`). */
  model?: string;
  /**
   * Leading octant glyph rendered before the model name. Defaults to the
   * quadrant glyph `▚` (U+259A) used in the reference.
   */
  glyph?: string;
  /**
   * Secondary neutral meta tags trailing the model pill — context window,
   * temperature, etc. (e.g. `CTX 128K`, `TEMP 0.7`).
   */
  meta?: readonly string[];
}

/**
 * The model-name badge from the usage/model panel: an accent-bordered pill
 * carrying an octant glyph + the active model id, trailed by neutral meta pills
 * for the context window, temperature, and any other run parameters. Pure static
 * markup.
 */
export function ModelBadge({
  model = "OCTANT-4",
  glyph = "▚",
  meta = ["CTX 128K", "TEMP 0.7"],
}: ModelBadgeProps) {
  return (
    <div style={row}>
      <span
        data-accent="1"
        style={{
          ...pill,
          border: "1px solid var(--bx-border-accent, #2a3320)",
          color: "var(--bx-accent, #46c66d)",
        }}
      >
        {glyph} {model}
      </span>
      {meta.map((m) => (
        <span
          key={m}
          style={{
            ...pill,
            border: "1px solid #23252e",
            color: "var(--bx-text-4, #9aa0ad)",
          }}
        >
          {m}
        </span>
      ))}
    </div>
  );
}
