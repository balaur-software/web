import type { CSSProperties, ReactNode } from "react";

/**
 * The tinted-border color families a {@link Badge} can take. Each maps to a
 * per-hue accent-tinted border token (parallels `--bx-border-accent`) paired
 * with a matching text hue, per the nav/markers section of the reference.
 */
export type BadgeTone = "accent" | "cyan" | "magenta" | "yellow" | "red" | "neutral";

interface ToneStyle {
  /** Tinted hairline border. */
  border: string;
  /** Label text hue. */
  color: string;
  /** Trailing-count hue (a brighter text ramp value than the label). */
  count: string;
}

const TONES: Record<BadgeTone, ToneStyle> = {
  accent: {
    border: "var(--bx-border-accent, #2a3320)",
    color: "var(--bx-accent, #46c66d)",
    count: "var(--bx-text-1, #f4f6fb)",
  },
  cyan: {
    border: "var(--bx-border-cyan, #1d3540)",
    color: "#2bd9d9",
    count: "var(--bx-text-1, #f4f6fb)",
  },
  magenta: {
    border: "var(--bx-border-magenta, #3a2540)",
    color: "#c061ff",
    count: "var(--bx-text-1, #f4f6fb)",
  },
  yellow: {
    border: "var(--bx-border-yellow, #3a3520)",
    color: "#f2c94c",
    count: "var(--bx-text-1, #f4f6fb)",
  },
  red: {
    border: "var(--bx-border-red, #3a2020)",
    color: "#ff6b6f",
    count: "var(--bx-text-1, #f4f6fb)",
  },
  neutral: {
    border: "var(--bx-border-mid, #2a2c34)",
    color: "var(--bx-text-5, #7b8290)",
    count: "var(--bx-text-3, #c8cdd6)",
  },
};

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11,
  padding: "3px 9px",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
  fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
};

export interface BadgeProps {
  /** The label content. */
  children: ReactNode;
  /** Tinted-border color family. Defaults to the green `accent`. */
  tone?: BadgeTone;
  /** Optional trailing count/value, rendered brighter than the label. */
  count?: ReactNode;
}

/**
 * A small labeled badge with a tinted hairline border and an optional trailing
 * count — the annotation marker from the nav/markers section (e.g. `NEW 4`,
 * `ERR 2`, `QUEUE 128`). Pure static markup.
 */
export function Badge({ children, tone = "accent", count }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span style={{ ...base, border: `1px solid ${t.border}`, color: t.color }}>
      {children}
      {count != null && <span style={{ color: t.count }}>{count}</span>}
    </span>
  );
}
