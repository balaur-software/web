import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRafLoop } from "../hooks/useRafLoop";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Height of the sweeping scanline, in px. */
const SCAN_H = 5;

export interface ScanButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children: ReactNode;
  /** Colour of the scanline sweep + its glow. Defaults to a warning yellow. */
  scanColor?: string;
  /** Border colour. Defaults to a yellow-tinted border. */
  borderColor?: string;
  style?: CSSProperties;
}

/**
 * A button with a horizontal scanline that sweeps top-to-bottom on hover, its
 * opacity pulsing along a sine curve. The line is driven imperatively via a rAF
 * loop (`useRafLoop`) so it stays inert on the server and only animates while
 * hovered — respecting `prefers-reduced-motion`.
 */
export function ScanButton({
  children,
  scanColor = "#f2c94c",
  borderColor = "#3a3520",
  disabled,
  style,
  ...rest
}: ScanButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const pRef = useRef(0);
  const [hover, setHover] = useState(false);
  const reduced = useReducedMotion();
  const active = hover && !disabled && !reduced;

  useRafLoop(() => {
    const line = lineRef.current;
    const btn = btnRef.current;
    if (!line || !btn) return;
    pRef.current = (pRef.current + 0.04) % 1;
    const p = pRef.current;
    const h = btn.getBoundingClientRect().height;
    line.style.top = `${p * (h - SCAN_H)}px`;
    line.style.opacity = (0.35 + 0.4 * Math.sin(p * Math.PI)).toFixed(2);
  }, active);

  // When the sweep stops (leave / reduced motion / disable), fade the line out.
  useEffect(() => {
    if (!active && lineRef.current) lineRef.current.style.opacity = "0";
  }, [active]);

  return (
    <button
      ref={btnRef}
      type="button"
      disabled={disabled}
      {...rest}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
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
      <span
        ref={lineRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: SCAN_H,
          background: scanColor,
          opacity: 0,
          boxShadow: `0 0 9px 1px ${scanColor}`,
          pointerEvents: "none",
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
}
