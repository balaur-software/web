import { type CSSProperties, type ReactNode, useRef } from "react";
import { useDismissable } from "../hooks/useDismissable";

export interface FloatingPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The clickable anchor (button, input…). */
  trigger: ReactNode;
  children: ReactNode;
  /** Horizontal anchor edge. Default "start". */
  align?: "start" | "end";
  /** Panel width; defaults to auto (content). */
  width?: CSSProperties["width"];
  panelStyle?: CSSProperties;
}

/**
 * An anchored popup: a relatively-positioned trigger with an absolutely-positioned
 * panel that reveals below it (opacity + translateY, matching the OCTANT CSS-transition
 * aesthetic — no measurement library). Dismisses on Escape / outside click. The
 * shared base for Select, DropdownMenu, Popover, HoverCard, Menubar, NavMenu,
 * Combobox, DatePicker.
 */
export function FloatingPanel({
  open,
  onOpenChange,
  trigger,
  children,
  align = "start",
  width,
  panelStyle,
}: FloatingPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useDismissable(rootRef, { onDismiss: () => onOpenChange(false), active: open });

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      {trigger}
      <div
        role="menu"
        style={{
          position: "absolute",
          top: "100%",
          [align === "start" ? "left" : "right"]: 0,
          marginTop: 6,
          width,
          zIndex: 30,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-5px)",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity .12s var(--bx-ease, cubic-bezier(.5,0,.2,1)), transform .12s var(--bx-ease, cubic-bezier(.5,0,.2,1))",
          ...panelStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
