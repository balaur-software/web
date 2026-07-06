import type { CSSProperties } from "react";

/** The filled-circle glyph (U+25CF) used as the status marker. */
const DOT = "●";

/** A single status entry: a colored dot plus its label. */
export interface StatusDot {
  /** Text shown after the dot. */
  label: string;
  /** Dot color — any CSS color. Defaults to the accent token. */
  color?: string;
}

export interface StatusDotsProps {
  /**
   * The status entries to render. Defaults to the reference
   * ONLINE / IDLE / BUSY / OFFLINE set.
   */
  dots?: readonly StatusDot[];
  /** Gap between entries, in px. */
  gap?: number;
}

/** The reference marker set from the nav section (§ markers). */
const DEFAULT_DOTS: readonly StatusDot[] = [
  { label: "ONLINE", color: "var(--bx-accent, #46c66d)" },
  { label: "IDLE", color: "#f2c94c" },
  { label: "BUSY", color: "#ff6b6f" },
  { label: "OFFLINE", color: "#5b616e" },
];

const rowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  fontSize: 12,
  color: "var(--bx-text-4, #9aa0ad)",
};

/**
 * A row of colored status dots with labels — the terminal-legend used to key
 * ONLINE / IDLE / BUSY / OFFLINE (or any custom set) states. Pure static markup.
 */
export function StatusDots({ dots = DEFAULT_DOTS, gap = 18 }: StatusDotsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap,
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
      }}
    >
      {dots.map((d) => (
        <span key={d.label} style={rowStyle}>
          <span style={{ color: d.color ?? "var(--bx-accent, #46c66d)" }}>{DOT}</span>
          {d.label}
        </span>
      ))}
    </div>
  );
}
