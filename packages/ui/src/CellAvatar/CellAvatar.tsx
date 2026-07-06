import type { CSSProperties } from "react";

/** The four presence archetypes, each with its own 2×2 octant mosaic + colour. */
export type CellAvatarKind = "agent" | "user" | "tool" | "system";

interface Preset {
  /** Two lines of two quadrant glyphs forming the 2×2 mosaic. */
  mosaic: string;
  color: string;
  label: string;
  /** Whether the mosaic participates in the accent-recolour system. */
  accent?: boolean;
}

const PRESETS: Record<CellAvatarKind, Preset> = {
  agent: { mosaic: "▛▜\n▙▟", color: "var(--bx-accent,#46c66d)", label: "AGENT", accent: true },
  user: { mosaic: "▙▟\n▛▜", color: "var(--bx-text-4,#9aa0ad)", label: "USER" },
  tool: { mosaic: "▚▖\n▗▝", color: "#2bd9d9", label: "TOOL" },
  system: { mosaic: "██\n██", color: "#c061ff", label: "SYSTEM" },
};

export interface CellAvatarProps {
  /** Which presence archetype to render. Default `"agent"`. */
  kind?: CellAvatarKind;
  /** Override the label shown beneath the mosaic. */
  label?: string;
  /** Override the mosaic colour (defaults to the kind's colour). */
  color?: string;
  /** Glyph font-size in px. Default `15`. */
  size?: number;
}

/**
 * A `<pre>` octant-mosaic avatar (section §07): a 2×2 grid of quadrant glyphs
 * that reads as a distinct sigil per presence archetype (agent / user / tool /
 * system), with an archetype label beneath it. Pure static markup.
 */
export function CellAvatar({ kind = "agent", label, color, size = 15 }: CellAvatarProps) {
  const preset = PRESETS[kind];
  const preStyle: CSSProperties = {
    margin: "0 0 8px",
    fontSize: size,
    lineHeight: 0.9,
    color: color ?? preset.color,
    whiteSpace: "pre",
    letterSpacing: 0,
    fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
  };
  return (
    <div style={{ textAlign: "center" }}>
      <pre aria-hidden="true" {...(preset.accent ? { "data-accent": "1" } : {})} style={preStyle}>
        {preset.mosaic}
      </pre>
      <span style={{ color: "#7b8290", fontSize: 11 }}>{label ?? preset.label}</span>
    </div>
  );
}

const KINDS: readonly CellAvatarKind[] = ["agent", "user", "tool", "system"];

/** The full set of archetype avatars laid out in a row, as in the reference. */
export function CellAvatarRow() {
  return (
    <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
      {KINDS.map((k) => (
        <CellAvatar key={k} kind={k} />
      ))}
    </div>
  );
}
