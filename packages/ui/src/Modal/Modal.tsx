import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { measureCell } from "../hooks/useCellMetrics";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScramble } from "../hooks/useScramble";
import { ScrimOverlay } from "../primitives/ScrimOverlay";

/** Eighth-block + shade glyphs the dither pass rasterises the panel from. */
const DITHER_GLYPHS = " ░▒▓█▚▙";

export interface ModalProps {
  /** Whether the dialog is mounted and visible. */
  open: boolean;
  /** Called on any dismissal: scrim click, Escape, the × or the cancel button. */
  onClose: () => void;
  /** Header label — scrambles into place each time the dialog opens. */
  title?: string;
  /** Body content. */
  children?: ReactNode;
  /** Confirm button label. */
  confirmLabel?: string;
  /** Cancel button label. */
  cancelLabel?: string;
  /** Fired when the confirm button is pressed; the dialog then closes via `onClose`. */
  onConfirm?: () => void;
  /** Colour treatment of the confirm button. `danger` matches the reference "flush". */
  tone?: "accent" | "danger";
  /** Panel width in px. */
  width?: number;
  panelStyle?: CSSProperties;
}

const CONFIRM_TONE: Record<NonNullable<ModalProps["tone"]>, CSSProperties> = {
  accent: {
    border: "1px solid var(--bx-border-accent, #2a3320)",
    color: "var(--bx-accent, #46c66d)",
  },
  danger: {
    border: "1px solid var(--bx-border-red, #3a2020)",
    color: "#ff6b6f",
  },
};

/**
 * A confirm dialog built on the shared {@link ScrimOverlay} shell (portal, scrim,
 * focus trap, Escape / outside-click dismissal). The panel "materialises" through a
 * one-shot ordered-dither pass while the title decodes via {@link useScramble}. The
 * dither and entrance are client-only rAF work, gated on `open` and cleaned up on
 * close/unmount; reduced-motion skips them.
 */
export function Modal({
  open,
  onClose,
  title = "CONFIRM",
  children,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  onConfirm,
  tone = "accent",
  width = 430,
  panelStyle,
}: ModalProps) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const ditherRef = useRef<HTMLPreElement>(null);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  useScramble(titleRef, title, { dur: 540, delay: 90, active: open });

  // Entrance: fade + lift once the panel has mounted.
  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Dither materialisation pass: fill the panel with random glyphs, fade to nothing.
  useEffect(() => {
    const el = ditherRef.current;
    if (!open || !el) return;
    if (reduced) {
      el.style.opacity = "0";
      el.textContent = "";
      return;
    }
    const { cw, ch } = measureCell(el);
    const rect = el.getBoundingClientRect();
    const cols = Math.max(10, Math.ceil(rect.width / cw));
    const rows = Math.max(8, Math.ceil(rect.height / ch));
    const fill = () => {
      let s = "";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) s += DITHER_GLYPHS.charAt((Math.random() * DITHER_GLYPHS.length) | 0);
        if (r < rows - 1) s += "\n";
      }
      return s;
    };
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const p = (performance.now() - t0) / 440;
      if (p >= 1) {
        el.style.opacity = "0";
        el.textContent = "";
        raf = 0;
        return;
      }
      el.textContent = fill();
      el.style.opacity = (0.92 * (1 - p)).toFixed(2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open, reduced]);

  const confirmStyle = CONFIRM_TONE[tone];

  return (
    <ScrimOverlay
      open={open}
      onClose={onClose}
      panelStyle={{
        width,
        maxWidth: "calc(100vw - 32px)",
        background: "var(--bx-surface-3, #0c0d11)",
        border: "1px solid var(--bx-border-accent, #2a3320)",
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(10px)",
        transition: "opacity .22s ease, transform .22s cubic-bezier(.5,0,.2,1)",
        ...panelStyle,
      }}
    >
      <pre
        ref={ditherRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          margin: 0,
          color: "var(--bx-accent, #46c66d)",
          opacity: 0,
          fontSize: 12,
          lineHeight: 1,
          whiteSpace: "pre",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 18px",
            borderBottom: "1px solid var(--bx-border, #1c1d24)",
          }}
        >
          <span ref={titleRef} style={{ color: "var(--bx-text-1, #f4f6fb)", fontSize: 14, letterSpacing: "0.05em" }}>
            {title}
          </span>
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

        <div style={{ padding: "22px 18px", color: "var(--bx-text-2, #9aa0ad)", fontSize: 13, lineHeight: 1.75 }}>
          {children}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 18px",
            borderTop: "1px solid var(--bx-border, #1c1d24)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              fontFamily: "inherit",
              fontSize: 13,
              letterSpacing: "0.06em",
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid var(--bx-border, #1c1d24)",
              color: "var(--bx-text-2, #9aa0ad)",
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            style={{
              fontFamily: "inherit",
              fontSize: 13,
              letterSpacing: "0.06em",
              padding: "10px 16px",
              background: "var(--bx-surface-2, #15161e)",
              cursor: "pointer",
              ...confirmStyle,
            }}
          >
            {confirmLabel}
            {" ▸"}
          </button>
        </div>
      </div>
    </ScrimOverlay>
  );
}
