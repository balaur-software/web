import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

export type AlertKind = "ok" | "info" | "err" | "warn";

interface KindStyle {
  /** Tinted hairline border. */
  border: string;
  /** Left rule + icon color. */
  accent: string;
  /** Leading octant glyph. */
  icon: string;
}

const KINDS: Record<AlertKind, KindStyle> = {
  ok: { border: "var(--bx-border-accent, #2a3320)", accent: "var(--bx-accent, #46c66d)", icon: "▙" },
  info: { border: "var(--bx-border-cyan, #1d3540)", accent: "var(--bx-ansi-6, #2bd9d9)", icon: "▛" },
  warn: { border: "var(--bx-border-yellow, #3a3520)", accent: "var(--bx-ansi-3, #f2c94c)", icon: "▲" },
  err: { border: "var(--bx-border-red, #3a2020)", accent: "var(--bx-ansi-9, #ff6b6f)", icon: "▓" },
};

export interface AlertProps {
  /** Status hue: tints the border, left rule and leading glyph. */
  kind?: AlertKind;
  /** Alert body — the message text. */
  children: ReactNode;
  /** Override the leading glyph. */
  icon?: ReactNode;
  /** Show the dismiss (×) button. Default `true`. */
  dismissible?: boolean;
  /** Called once the collapse animation completes and the alert is removed. */
  onDismiss?: () => void;
  style?: CSSProperties;
}

/**
 * A dismissible status banner with a kind-tinted left rule and octant glyph.
 * Clicking × mirrors the reference's collapse: pin the current pixel height,
 * then ease `max-height`/`opacity`/`margin` to zero before unmounting (`320ms`,
 * matching the CSS transition). All timers are cleaned up on unmount, and
 * reduced-motion removes the banner instantly.
 */
export function Alert({ kind = "info", children, icon, dismissible = true, onDismiss, style }: AlertProps) {
  const ref = useRef<HTMLDivElement>(null);
  const goneRef = useRef(false);
  const rafRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [removed, setRemoved] = useState(false);
  const reduced = useReducedMotion();

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  if (removed) return null;

  const k = KINDS[kind];

  const dismiss = () => {
    if (goneRef.current) return;
    goneRef.current = true;
    const el = ref.current;
    if (!el || reduced) {
      setRemoved(true);
      onDismiss?.();
      return;
    }
    el.style.maxHeight = `${el.getBoundingClientRect().height}px`;
    rafRef.current = requestAnimationFrame(() => {
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
      el.style.marginBottom = "0px";
    });
    timerRef.current = setTimeout(() => {
      setRemoved(true);
      onDismiss?.();
    }, 320);
  };

  return (
    <div
      ref={ref}
      role="alert"
      style={{
        overflow: "hidden",
        transition: "max-height .3s ease, opacity .25s ease, margin .3s ease",
        border: `1px solid ${k.border}`,
        borderLeft: `2px solid ${k.accent}`,
        background: "var(--bx-surface-2, #0b0d10)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
        <span style={{ color: k.accent, fontSize: 14 }}>{icon ?? k.icon}</span>
        <span style={{ flex: 1, color: "var(--bx-text-3, #c8cdd6)", fontSize: 13 }}>{children}</span>
        {dismissible && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            style={{
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1,
              background: "transparent",
              border: 0,
              color: "var(--bx-text-6, #5b616e)",
              cursor: "pointer",
              padding: "0 2px",
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
