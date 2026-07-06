import { type CSSProperties, useRef } from "react";
import { useBar8Fill } from "../hooks/useBar8Fill";

export interface ProgressBarProps {
  /** Progress fraction, 0..1. Clamped to that range. */
  value: number;
  /** Caption shown at the left of the label row (e.g. `"LINK"`). */
  label?: string;
  /** Fill + percent readout colour. Defaults to the accent CSS var. */
  color?: string;
  /** Show the right-aligned percent readout. Defaults to `true`. */
  showPercent?: boolean;
  /** Ease factor forwarded to `useBar8Fill` (0..1). Defaults to `0.3`. */
  ease?: number;
  style?: CSSProperties;
}

/**
 * A determinate progress bar rendered as a single row of eighth-block glyphs.
 * The `<pre>` framebuffer eases toward `value` via the shared `useBar8Fill`
 * hook, while a percent readout mirrors the label row. SSR emits the static
 * label chrome with an empty bar; the fill populates after mount.
 */
export function ProgressBar({
  value,
  label,
  color = "var(--bx-accent, #46c66d)",
  showPercent = true,
  ease = 0.3,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const pct = Math.round(clamped * 100);
  const barRef = useRef<HTMLPreElement>(null);
  useBar8Fill(barRef, clamped, { rows: 1, ease });

  const hasHeader = label !== undefined || showPercent;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      style={{ minWidth: 0, ...style }}
    >
      {hasHeader ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--bx-text-3, #5b616e)",
            marginBottom: 4,
          }}
        >
          <span>{label}</span>
          {showPercent ? <span style={{ color }}>{pct}%</span> : null}
        </div>
      ) : null}
      <pre
        ref={barRef}
        aria-hidden="true"
        style={{
          margin: 0,
          fontSize: 15,
          color,
          whiteSpace: "pre",
          letterSpacing: 0,
          lineHeight: 1,
          overflow: "hidden",
        }}
      />
    </div>
  );
}
