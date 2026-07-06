import { type CSSProperties, type FocusEvent, type InputHTMLAttributes, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "style"> {
  /** Controlled value. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}

/**
 * A terminal-style text field. The real `<input>` is rendered transparent (no
 * native caret) and layered over a mirror span that echoes the typed value (or
 * a dim placeholder). A fake eighth-cell block caret sits at the end of the
 * mirror text, blinking via the global `bx-blink` keyframe while focused, and an
 * accent underline slides in on focus. Value flows through `useControllableState`.
 */
export function TextInput({
  value: valueProp,
  defaultValue = "",
  onChange,
  placeholder = "enter callsign",
  maxLength = 22,
  disabled,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextInputProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();

  const hasValue = value.length > 0;

  return (
    <div
      style={{
        position: "relative",
        borderBottom: "1px solid var(--bx-border, #1c1d24)",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          padding: "9px 2px",
          fontSize: 14,
          whiteSpace: "pre",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <span style={{ color: hasValue ? "var(--bx-text-1, #f4f6fb)" : "#3f424d" }}>
          {hasValue ? value : placeholder}
        </span>
        <span
          style={{
            width: 8,
            height: 17,
            background: "var(--bx-accent, #46c66d)",
            display: "inline-block",
            marginLeft: 1,
            opacity: focused ? 1 : 0,
            animation: focused && !reduced ? "bx-blink 1s steps(1) infinite" : "none",
          }}
        />
      </div>
      <input
        type="text"
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e: FocusEvent<HTMLInputElement>) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e: FocusEvent<HTMLInputElement>) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          background: "transparent",
          border: 0,
          outline: 0,
          fontFamily: "inherit",
          fontSize: 14,
          color: "transparent",
          caretColor: "transparent",
          padding: "9px 2px",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          bottom: -1,
          height: 1,
          width: focused ? "100%" : 0,
          background: "var(--bx-accent, #46c66d)",
          transition: "width .35s cubic-bezier(.5,0,.2,1)",
        }}
      />
    </div>
  );
}
