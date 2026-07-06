import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, useRef, useState } from "react";
import { useBar8Fill } from "../hooks/useBar8Fill";

export interface FillButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children: ReactNode;
  /** Colour of the eighth-block charge fill. Defaults to the accent CSS var. */
  fillColor?: string;
  /** Border colour. Defaults to the accent-tinted border token. */
  borderColor?: string;
  style?: CSSProperties;
}

/**
 * A button that "charges" on hover — the label sits over a `<pre>` framebuffer
 * that fills in eighth-block increments via the shared `useBar8Fill` hook. SSR
 * emits a static button; the fill animates after hydration.
 */
export function FillButton({
  children,
  fillColor = "var(--bx-accent, #46c66d)",
  borderColor = "var(--bx-border-accent, #2a3320)",
  disabled,
  style,
  ...rest
}: FillButtonProps) {
  const fillRef = useRef<HTMLPreElement>(null);
  const [charged, setCharged] = useState(false);
  useBar8Fill(fillRef, disabled ? 0 : charged ? 1 : 0);

  return (
    <button
      type="button"
      disabled={disabled}
      {...rest}
      onPointerEnter={() => setCharged(true)}
      onPointerLeave={() => setCharged(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        fontFamily: "inherit",
        fontSize: 13,
        letterSpacing: "0.1em",
        padding: "12px 20px",
        background: "transparent",
        border: `1px solid ${disabled ? "var(--bx-border, #1c1d24)" : borderColor}`,
        color: disabled ? "var(--bx-text-dim-3, #4b505c)" : "var(--bx-text-1, #f4f6fb)",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      <pre
        ref={fillRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          margin: 0,
          opacity: 0.9,
          whiteSpace: "pre",
          overflow: "hidden",
          fontSize: 13,
          lineHeight: 1,
          pointerEvents: "none",
          color: fillColor,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
}
