import type { CSSProperties, ReactNode } from "react";
import { FillButton } from "../FillButton/FillButton.tsx";

/** Empty-frame octant glyph shown by default above the title. */
const DEFAULT_ART = "▛▀▀▀▜\n▌   ▐\n▙▄▄▄▟";

export interface EmptyStateProps {
  /** Headline shown beneath the art (e.g. "NO CELLS LIT"). */
  title: ReactNode;
  /** Supporting copy rendered under the title. */
  description?: ReactNode;
  /**
   * Octant / ASCII art rendered above the title. Defaults to an empty-frame
   * glyph. Pass `null` to omit the art entirely.
   */
  art?: ReactNode;
  /** Label for the built-in {@link FillButton} CTA. Omit to render no button. */
  cta?: ReactNode;
  /** Click handler for the built-in CTA. */
  onCtaClick?: () => void;
  /** Fully custom action node, rendered in place of the built-in CTA. */
  action?: ReactNode;
  style?: CSSProperties;
}

/**
 * The empty-state card (section §17): centred octant art, a title, a line of
 * supporting copy, and an optional charging {@link FillButton} CTA. Pure static
 * markup — the only motion is the CTA's own hover fill.
 */
export function EmptyState({
  title,
  description,
  art = DEFAULT_ART,
  cta,
  onCtaClick,
  action,
  style,
}: EmptyStateProps) {
  return (
    <div
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 22,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 6,
        minHeight: 240,
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
        ...style,
      }}
    >
      {art != null && (
        <pre
          aria-hidden="true"
          style={{
            margin: "0 0 10px",
            fontSize: 22,
            lineHeight: 1.05,
            color: "#33353f",
            whiteSpace: "pre",
            letterSpacing: 0,
          }}
        >
          {art}
        </pre>
      )}
      <div style={{ color: "#c8cdd6", fontSize: 14, letterSpacing: "0.04em" }}>{title}</div>
      {description != null && (
        <div style={{ color: "#5b616e", fontSize: 12, maxWidth: 240, lineHeight: 1.6 }}>{description}</div>
      )}
      {action != null
        ? action
        : cta != null && (
            <FillButton
              onClick={onCtaClick}
              style={{ marginTop: 10, padding: "11px 18px", fontSize: 13, letterSpacing: "0.08em" }}
            >
              {cta}
            </FillButton>
          )}
    </div>
  );
}
