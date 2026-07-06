import { type CSSProperties, type FocusEvent, type TextareaHTMLAttributes, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange" | "style"> {
  /** Controlled value. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Character cap; also the denominator of the live counter. */
  maxLength?: number;
  /** Muted caption shown on the left of the footer row. */
  hint?: string;
  style?: CSSProperties;
}

/**
 * A multi-line text field with a live character counter. The wrap border eases
 * to the accent colour on focus (React state, not imperative style mutation),
 * and the counter flips to a warning amber once the value passes 90% of the cap.
 * Value flows through `useControllableState`, so it works controlled or not.
 */
export function Textarea({
  value: valueProp,
  defaultValue = "",
  onChange,
  maxLength = 240,
  placeholder = "describe the render target\nmarkdown is fine…",
  hint = "supports multi-line",
  disabled,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextareaProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange);
  const [focused, setFocused] = useState(false);

  const count = value.length;
  const warn = count > maxLength * 0.9;

  return (
    <div style={{ opacity: disabled ? 0.5 : 1, ...style }}>
      <div
        style={{
          border: `1px solid ${focused ? "var(--bx-accent, #46c66d)" : "var(--bx-border, #1c1d24)"}`,
          background: "#0a0b0e",
          transition: "border-color .2s",
        }}
      >
        <textarea
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e: FocusEvent<HTMLTextAreaElement>) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e: FocusEvent<HTMLTextAreaElement>) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
          style={{
            width: "100%",
            background: "transparent",
            border: 0,
            outline: 0,
            resize: "vertical",
            fontFamily: "inherit",
            fontSize: 13,
            color: "var(--bx-text-1, #f4f6fb)",
            caretColor: "var(--bx-accent, #46c66d)",
            padding: 12,
            minHeight: 92,
            lineHeight: 1.6,
            display: "block",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11 }}>
        <span style={{ color: "#3f424d" }}>{hint}</span>
        <span style={{ color: warn ? "#ffe08a" : "#5b616e" }}>
          {count} / {maxLength}
        </span>
      </div>
    </div>
  );
}
