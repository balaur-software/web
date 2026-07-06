import type { CSSProperties } from "react";
import { type ToastKind, useToast } from "../primitives";

interface TriggerSpec {
  kind: ToastKind;
  label: string;
  glyph: string;
  message: string;
  color: string;
  border: string;
}

const TRIGGERS: readonly TriggerSpec[] = [
  {
    kind: "ok",
    label: "OK",
    glyph: "✓",
    message: "Buffer committed",
    color: "var(--bx-accent-bright, #74e692)",
    border: "var(--bx-border-accent, #2a3320)",
  },
  {
    kind: "err",
    label: "ERROR",
    glyph: "▓",
    message: "Glyph out of range",
    color: "#ff6b6f",
    border: "var(--bx-border-red, #3a2020)",
  },
  {
    kind: "info",
    label: "INFO",
    glyph: "▛",
    message: "Cursor reactive",
    color: "#6ff2f2",
    border: "var(--bx-border-cyan, #1d3540)",
  },
];

const btn: CSSProperties = {
  fontFamily: "inherit",
  fontSize: 13,
  letterSpacing: "0.06em",
  padding: "10px 14px",
  background: "transparent",
  cursor: "pointer",
};

/**
 * Demo panel (section §13) whose buttons fire toasts through {@link useToast}.
 * Requires a {@link ToastProvider} ancestor, which owns the fixed bottom-right
 * stack + auto-dismiss. Mirrors the reference `initToast` trigger wiring.
 */
export function Toast() {
  const toast = useToast();
  return (
    <div
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 22,
        minWidth: 0,
      }}
    >
      <div style={{ color: "#5b616e", fontSize: 12, marginBottom: 18 }}>TOAST</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {TRIGGERS.map((t) => (
          <button
            key={t.kind}
            type="button"
            onClick={() => toast({ kind: t.kind, message: t.message })}
            style={{ ...btn, color: t.color, border: `1px solid ${t.border}` }}
          >
            {t.glyph} {t.label}
          </button>
        ))}
      </div>
      <div style={{ color: "#3f424d", fontSize: 11, marginTop: 18 }}>
        stacks bottom-right · eighth-block bar drains, then auto-dismiss
      </div>
    </div>
  );
}
