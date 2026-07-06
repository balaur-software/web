import { Fragment, type CSSProperties, type ReactNode } from "react";

const cap: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 26,
  height: 26,
  padding: "0 8px",
  background: "var(--bx-surface-6, #15161e)",
  border: "1px solid var(--bx-border-mid, #2a2c34)",
  // the thicker bottom border gives the chip its physical, pressable keycap look
  borderBottomWidth: 2,
  color: "var(--bx-text-3, #c8cdd6)",
};

/** A single pressable keycap chip (section §17). Pure static markup. */
export function Keycap({ children }: { children: ReactNode }) {
  return <span style={cap}>{children}</span>;
}

/** One keyboard shortcut: a set of keys plus what they do. */
export interface Shortcut {
  /** The keys in the shortcut, e.g. `["⌘", "K"]` or `["↑", "↓", "←", "→"]`. */
  keys: string[];
  /** A short description of what the shortcut does. */
  label: string;
  /**
   * When `true` (the default) the keys are joined by a dim `+`, reading as a
   * chord (`⌘ + K`). Set `false` for a bare cluster of keys with no separator,
   * such as the four arrow keys.
   */
  combo?: boolean;
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "K"], label: "command palette" },
  { keys: ["CTRL", "C"], label: "copy cells" },
  { keys: ["↑", "↓", "←", "→"], label: "move cursor", combo: false },
  { keys: ["ESC"], label: "dismiss overlay" },
];

export interface KeycapsProps {
  /** The shortcut rows to render (defaults to a small demo set). */
  shortcuts?: Shortcut[];
}

/**
 * A vertical list of keyboard shortcuts rendered as keycap chips (section §17):
 * each row pairs a chord (or cluster) of {@link Keycap}s with a description.
 * Pure static markup — no effects.
 */
export function Keycaps({ shortcuts = DEFAULT_SHORTCUTS }: KeycapsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontSize: 12,
        color: "var(--bx-text-5, #7b8290)",
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
      }}
    >
      {shortcuts.map((s, i) => {
        const combo = s.combo ?? true;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {s.keys.map((k, j) => (
                <Fragment key={j}>
                  {j > 0 && combo && <span style={{ color: "var(--bx-text-7, #3f424d)" }}>+</span>}
                  <Keycap>{k}</Keycap>
                </Fragment>
              ))}
            </span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
