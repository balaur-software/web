import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDismissable } from "../hooks/useDismissable";
import { useFocusTrap } from "../hooks/useFocusTrap";

export interface ScrimOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Trap focus within the panel while open (default true). */
  trapFocus?: boolean;
  /** Panel alignment: centered dialog or an edge sheet. */
  align?: "center" | "start" | "end";
  panelStyle?: CSSProperties;
}

const JUSTIFY: Record<NonNullable<ScrimOverlayProps["align"]>, CSSProperties["justifyContent"]> = {
  center: "center",
  start: "flex-start",
  end: "flex-end",
};

/**
 * A portalled full-screen scrim + panel with Escape/outside-click dismissal,
 * body-scroll lock, and focus trapping. The shared shell behind Modal, Sheet, and
 * CommandPalette. Client-only (renders null on the server / when closed).
 */
export function ScrimOverlay({
  open,
  onClose,
  children,
  trapFocus = true,
  align = "center",
  panelStyle,
}: ScrimOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDismissable(panelRef, { onDismiss: onClose, active: open });
  useFocusTrap(panelRef, open && trapFocus);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: align === "center" ? "center" : "stretch",
        justifyContent: JUSTIFY[align],
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,10,0.72)" }} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        style={{ position: "relative", zIndex: 1, ...panelStyle }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
