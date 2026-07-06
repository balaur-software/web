import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ScrimOverlay } from "../primitives/ScrimOverlay";

export interface SheetProps {
  /** Whether the sheet is mounted and slid in. */
  open: boolean;
  /** Called on any dismissal: scrim click, Escape, or the × / close controls. */
  onClose: () => void;
  /** Which edge the sheet docks to and slides from. */
  side?: "right" | "left";
  /** Header label shown at the top of the panel. */
  title?: ReactNode;
  /** Body content — scrolls independently when it overflows. */
  children?: ReactNode;
  /** Optional footer bar (e.g. action buttons) pinned to the bottom. */
  footer?: ReactNode;
  /** Panel width in px. */
  width?: number;
  /** Trap focus within the panel while open (default true). */
  trapFocus?: boolean;
  panelStyle?: CSSProperties;
}

/**
 * An edge drawer built on the shared {@link ScrimOverlay} shell (portal, scrim,
 * focus trap, Escape / outside-click dismissal, body-scroll lock). The panel docks
 * to one side and slides in from that edge; the entrance transform is a client-only
 * one-shot toggled after mount, so SSR emits nothing and reduced-motion snaps it in
 * place. Header (title + ×), a scrollable body, and an optional footer are stacked in
 * a full-height flex column.
 */
export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
  width = 360,
  trapFocus = true,
  panelStyle,
}: SheetProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  // Entrance: slide in from the docked edge once the panel has mounted.
  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    if (reduced) {
      setShown(true);
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [open, reduced]);

  const offEdge = side === "right" ? "translateX(100%)" : "translateX(-100%)";

  return (
    <ScrimOverlay
      open={open}
      onClose={onClose}
      align={side === "right" ? "end" : "start"}
      trapFocus={trapFocus}
      panelStyle={{
        display: "flex",
        flexDirection: "column",
        width,
        maxWidth: "calc(100vw - 40px)",
        background: "var(--bx-surface-3, #0c0d11)",
        [side === "right" ? "borderLeft" : "borderRight"]: "1px solid var(--bx-border-accent, #2a3320)",
        boxShadow: side === "right" ? "-24px 0 60px rgba(0,0,0,0.5)" : "24px 0 60px rgba(0,0,0,0.5)",
        transform: shown ? "translateX(0)" : offEdge,
        transition: reduced ? "none" : "transform .3s cubic-bezier(.5,0,.2,1)",
        ...panelStyle,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          borderBottom: "1px solid var(--bx-border, #1c1d24)",
        }}
      >
        <span style={{ color: "var(--bx-text-1, #f4f6fb)", fontSize: 14, letterSpacing: "0.04em" }}>{title}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            fontFamily: "inherit",
            fontSize: 15,
            lineHeight: 1,
            background: "transparent",
            border: 0,
            color: "var(--bx-text-3, #5b616e)",
            cursor: "pointer",
            padding: "2px 4px",
          }}
        >
          {"×"}
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 18 }}>{children}</div>

      {footer != null && (
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 18px",
            borderTop: "1px solid var(--bx-border, #1c1d24)",
          }}
        >
          {footer}
        </div>
      )}
    </ScrimOverlay>
  );
}
