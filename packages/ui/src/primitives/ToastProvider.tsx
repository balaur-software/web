import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";

export type ToastKind = "ok" | "err" | "info";
export interface ToastOptions {
  kind?: ToastKind;
  message: string;
  /** Auto-dismiss after ms. Default 3200. */
  duration?: number;
}
interface Toast extends Required<Omit<ToastOptions, "duration">> {
  id: number;
}

const BORDER: Record<ToastKind, string> = {
  ok: "var(--bx-border-accent, #2a3320)",
  err: "var(--bx-border-red, #3a2020)",
  info: "var(--bx-border-mid, #2a2c34)",
};
const GLYPH: Record<ToastKind, string> = { ok: "✓", err: "✕", info: "›" };

const ToastContext = createContext<(opts: ToastOptions) => void>(() => {});

/** Fire a toast: `const toast = useToast(); toast({ kind: "ok", message: "SAVED" })`. */
export function useToast(): (opts: ToastOptions) => void {
  return useContext(ToastContext);
}

/**
 * Provides the imperative toast service (the reference's `spawnToast`) as React
 * context + a fixed bottom-right stack. Wrap the app once; any descendant fires
 * toasts via {@link useToast}.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const spawn = useCallback((opts: ToastOptions) => {
    const id = ++idRef.current;
    const kind = opts.kind ?? "info";
    setToasts((list) => [...list, { id, kind, message: opts.message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), opts.duration ?? 3200);
  }, []);

  const value = useMemo(() => spawn, [spawn]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              minWidth: 220,
              padding: "10px 14px",
              fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
              fontSize: 13,
              color: "var(--bx-text-3, #c8cdd6)",
              background: "var(--bx-surface-3, #0c0d11)",
              border: `1px solid ${BORDER[t.kind]}`,
            }}
          >
            <span style={{ color: "var(--bx-accent, #46c66d)" }}>{GLYPH[t.kind]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
