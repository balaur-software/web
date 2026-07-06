import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { Avatar } from "../Avatar/Avatar.tsx";
import { useControllableState } from "../hooks/useControllableState";
import { FloatingPanel } from "../primitives";

export interface HoverCardProps {
  /** The inline trigger — the dotted-underline handle. Default "@octant-core". */
  handle?: ReactNode;
  /** Display name inside the card. Default "octant-core". */
  name?: string;
  /** Secondary line beneath the name. Default "glyph systems team". */
  subtitle?: string;
  /** Body copy under the identity row. Default the reference entity summary. */
  description?: ReactNode;
  /** Seed for the deterministic octant identicon. Default "OCTANT-CORE". */
  seed?: string;
  /** Avatar glyph colour. Default the accent green. */
  avatarColor?: string;
  /** Fully replace the card body. When given, name/subtitle/description/seed/avatarColor are ignored. */
  children?: ReactNode;
  /** ms to wait after pointer-enter before opening. Default 220. */
  openDelay?: number;
  /** ms to wait after pointer-leave before closing. Default 120. */
  closeDelay?: number;
  /** Card width. Default 240. */
  width?: CSSProperties["width"];
  /** Which edge the card anchors to. Default "start". */
  align?: "start" | "end";
  /** Controlled open state. Omit for uncontrolled (use `defaultOpen`). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: CSSProperties;
}

/**
 * An inline handle that reveals a floating entity-preview card on hover, with
 * asymmetric open/close delays (ported from `initHoverCard`: 220ms in, 120ms
 * out) so brushing past the handle doesn't flash the card and a quick transit
 * across the gap into the card keeps it open. The anchored, transition-revealed
 * panel comes from the `FloatingPanel` primitive (positioned *above* the handle
 * to match the reference), which also handles Escape / outside-click dismissal.
 * The identicon is the pure, deterministic {@link Avatar}, so the whole thing is
 * static markup on the server — the card is simply inert (opacity 0) until hover.
 */
export function HoverCard({
  handle = "@octant-core",
  name = "octant-core",
  subtitle = "glyph systems team",
  description = "Maintains the 2×4 cell renderer and the ANSI palette. 14 nodes online.",
  seed = "OCTANT-CORE",
  avatarColor = "var(--bx-accent, #46c66d)",
  children,
  openDelay = 220,
  closeDelay = 120,
  width = 240,
  align = "start",
  open,
  defaultOpen = false,
  onOpenChange,
  style,
}: HoverCardProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const schedule = (next: boolean, delay: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(next), delay);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover-preview affordance mirrors the reference; the handle stays keyboard-inert (a decorative preview, not a control).
    <span
      onPointerEnter={() => schedule(true, openDelay)}
      onPointerLeave={() => schedule(false, closeDelay)}
      style={{ display: "inline-block", ...style }}
    >
      <FloatingPanel
        open={isOpen}
        onOpenChange={setOpen}
        align={align}
        width={width}
        panelStyle={{
          top: "auto",
          bottom: "calc(100% + 12px)",
          marginTop: 0,
          zIndex: 40,
          background: "var(--bx-surface-3, #0c0d11)",
          border: "1px solid var(--bx-border-accent, #2a3320)",
          boxShadow: "0 18px 44px rgba(0,0,0,0.55)",
          padding: 14,
        }}
        trigger={
          <span
            style={{
              position: "relative",
              color: "var(--bx-accent, #46c66d)",
              borderBottom: "1px dotted var(--bx-border-accent, #2a3320)",
              cursor: "default",
            }}
          >
            {handle}
          </span>
        }
      >
        {children ?? (
          <>
            <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar seed={seed} size={40} color={avatarColor} fontSize={8} />
              <span style={{ display: "block" }}>
                <span style={{ display: "block", color: "var(--bx-text-1, #f4f6fb)", fontSize: 13 }}>{name}</span>
                <span style={{ display: "block", color: "#5b616e", fontSize: 11 }}>{subtitle}</span>
              </span>
            </span>
            <span style={{ display: "block", color: "#7b8290", fontSize: 11, lineHeight: 1.6, marginTop: 11 }}>
              {description}
            </span>
          </>
        )}
      </FloatingPanel>
    </span>
  );
}
