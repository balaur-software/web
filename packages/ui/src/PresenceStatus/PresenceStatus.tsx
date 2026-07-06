import type { CSSProperties, ReactNode } from "react";

/** One of the built-in presence tones, each with its own dot colour and label wash. */
export type PresenceState = "online" | "thinking" | "idle";

interface Preset {
  /** Dot colour. */
  color: string;
  /** Label text colour. */
  labelColor: string;
  /** Trailing-meta text colour. */
  metaColor: string;
  /** Terminal-cursor blink on the dot (uses the global `bx-blink` keyframe). */
  blink: boolean;
  /** Default trailing meta when the item doesn't supply its own. */
  defaultMeta: ReactNode;
  /** Optional letter-spacing for the meta (the "…" animation dots want it). */
  metaLetterSpacing?: string;
}

const PRESETS: Record<PresenceState, Preset> = {
  online: {
    color: "var(--bx-accent, #46c66d)",
    labelColor: "#9aa0ad",
    metaColor: "#3f424d",
    blink: true,
    defaultMeta: "agent ready",
  },
  thinking: {
    color: "#f2c94c",
    labelColor: "#9aa0ad",
    metaColor: "#f2c94c",
    blink: false,
    defaultMeta: "…",
    metaLetterSpacing: "0.2em",
  },
  idle: {
    color: "#3f424d",
    labelColor: "#5b616e",
    metaColor: "#3f424d",
    blink: false,
    defaultMeta: "--",
  },
};

export interface PresenceItem {
  /** Uppercase status label, e.g. `"ONLINE"`. */
  label: string;
  /** Preset tone that drives the dot colour, label wash and default meta. */
  state?: PresenceState;
  /** Trailing meta node (right-aligned). Overrides the preset default. */
  meta?: ReactNode;
  /** Override the dot colour while keeping the rest of the preset. */
  color?: string;
}

export interface PresenceStatusProps {
  /** Presence rows, top-to-bottom. Defaults to the ONLINE / THINKING / IDLE trio. */
  items?: readonly PresenceItem[];
  style?: CSSProperties;
}

const DEFAULT_ITEMS: readonly PresenceItem[] = [
  { label: "ONLINE", state: "online" },
  { label: "THINKING", state: "thinking" },
  { label: "IDLE", state: "idle" },
];

/**
 * A stack of presence rows — a coloured status dot, a label, and a right-aligned
 * meta readout (section: CELL AVATARS · PRESENCE). The ONLINE dot uses the global
 * `bx-blink` cursor keyframe for a live heartbeat; the rest are steady. Pure static
 * markup — the blink is a declarative CSS animation, so it renders identically on
 * the server and after hydration.
 */
export function PresenceStatus({ items = DEFAULT_ITEMS, style }: PresenceStatusProps) {
  return (
    <div
      style={{
        borderTop: "1px solid #1c1d24",
        paddingTop: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontSize: 12,
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
        ...style,
      }}
    >
      {items.map((item, i) => {
        const preset = PRESETS[item.state ?? "idle"];
        const dotStyle: CSSProperties = {
          width: 7,
          height: 7,
          flex: "none",
          display: "inline-block",
          background: item.color ?? preset.color,
          ...(preset.blink ? { animation: "bx-blink 1.4s steps(1) infinite" } : {}),
        };
        const metaStyle: CSSProperties = {
          marginLeft: "auto",
          color: preset.metaColor,
          ...(preset.metaLetterSpacing ? { letterSpacing: preset.metaLetterSpacing } : {}),
        };
        return (
          <div key={`${item.label}-${i}`} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span aria-hidden="true" style={dotStyle} />
            <span style={{ color: preset.labelColor }}>{item.label}</span>
            <span style={metaStyle}>{item.meta ?? preset.defaultMeta}</span>
          </div>
        );
      })}
    </div>
  );
}
