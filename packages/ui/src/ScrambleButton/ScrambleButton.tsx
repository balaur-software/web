import { type ButtonHTMLAttributes, type CSSProperties, type FocusEvent, type PointerEvent, useRef, useState } from "react";
import { useScramble } from "../hooks/useScramble";

export interface ScrambleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "children"> {
  /** Label text; scrambles into place on hover/focus. */
  text: string;
  /** Text colour. Defaults to the bright-magenta ANSI token. */
  color?: string;
  /** Border colour. Defaults to the magenta-tinted border token. */
  borderColor?: string;
  style?: CSSProperties;
}

/**
 * A button whose label decodes with the shared `useScramble` reveal every time
 * it is hovered or focused. A `busy` guard debounces re-triggers (mirroring the
 * reference's 600ms lockout) and keeps `active` high until the scramble has fully
 * resolved, so leaving the button mid-animation never strands garbled text. SSR
 * renders the plain label; the scramble only runs client-side after mount.
 */
export function ScrambleButton({
  text,
  color = "var(--bx-ansi-13, #d79bff)",
  borderColor = "var(--bx-border-magenta, #3a2540)",
  disabled,
  style,
  onPointerEnter,
  onFocus,
  ...rest
}: ScrambleButtonProps) {
  const labelRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [active, setActive] = useState(false);

  useScramble(labelRef, text, { dur: 560, delay: 0, active });

  const trigger = () => {
    if (disabled || busyRef.current) return;
    busyRef.current = true;
    setActive(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      busyRef.current = false;
      setActive(false);
    }, 600);
  };

  return (
    <button
      ref={labelRef}
      type="button"
      disabled={disabled}
      {...rest}
      onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => {
        trigger();
        onPointerEnter?.(e);
      }}
      onFocus={(e: FocusEvent<HTMLButtonElement>) => {
        trigger();
        onFocus?.(e);
      }}
      style={{
        fontFamily: "inherit",
        fontSize: 13,
        letterSpacing: "0.1em",
        padding: "12px 20px",
        background: "transparent",
        border: `1px solid ${disabled ? "var(--bx-border, #1c1d24)" : borderColor}`,
        color: disabled ? "var(--bx-text-dim-3, #4b505c)" : color,
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: 118,
        ...style,
      }}
    >
      {text}
    </button>
  );
}
