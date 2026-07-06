import { type CSSProperties, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";

type Status = "empty" | "valid" | "invalid";

const BORDER: Record<Status, string> = {
  empty: "var(--bx-border, #1c1d24)",
  valid: "var(--bx-accent, #46c66d)",
  invalid: "var(--bx-ansi-9, #ff6b6f)",
};
const GLYPH: Record<Status, string> = { empty: "", valid: "✓", invalid: "✕" };
const GLYPH_COLOR: Record<Status, string> = {
  empty: "transparent",
  valid: "var(--bx-accent, #46c66d)",
  invalid: "var(--bx-ansi-9, #ff6b6f)",
};
const MSG_COLOR: Record<Status, string> = {
  empty: "var(--bx-text-6, #5b616e)",
  valid: "var(--bx-accent-bright, #74e692)",
  invalid: "var(--bx-ansi-9, #ff6b6f)",
};

export interface ValidatedFieldProps {
  /** Field label rendered above the input. */
  label?: string;
  placeholder?: string;
  /** Pattern the trimmed value must match to be considered valid. */
  pattern?: RegExp;
  maxLength?: number;
  /** Controlled value. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Helper text shown while the field is empty. */
  hint?: string;
  /** Message shown when the value matches `pattern`. */
  validMessage?: string;
  /** Message shown when the (non-empty) value fails `pattern`. */
  invalidMessage?: string;
  style?: CSSProperties;
}

/**
 * A single-line field with live regex validation. As you type, the trimmed value
 * is tested against `pattern`; the border, a trailing ✓/✕ glyph, and the helper
 * message all recolor to reflect the empty / valid / invalid state. All feedback
 * is derived from React state, so it renders identically on server and client
 * (no imperative fills). Value flows through `useControllableState`.
 */
export function ValidatedField({
  label = "NODE ID",
  placeholder = "NODE-01",
  pattern = /^[A-Z]+-\d{1,3}$/,
  maxLength = 16,
  value: valueProp,
  defaultValue = "",
  onChange,
  hint = "Format: NAME-NUMBER (e.g. NODE-01)",
  validMessage = "Valid node identifier",
  invalidMessage = "Must match NAME-NUMBER, e.g. RELAY-7",
  style,
}: ValidatedFieldProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange);
  const [focused, setFocused] = useState(false);

  const trimmed = value.trim();
  const status: Status = trimmed === "" ? "empty" : pattern.test(trimmed) ? "valid" : "invalid";
  const message = status === "empty" ? hint : status === "valid" ? validMessage : invalidMessage;
  const borderColor = status === "empty" && focused ? "var(--bx-accent, #46c66d)" : BORDER[status];

  return (
    <div
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 22,
        minWidth: 0,
        ...style,
      }}
    >
      <div style={{ color: "var(--bx-text-6, #5b616e)", fontSize: 11, letterSpacing: "0.1em", marginBottom: 14 }}>
        FIELD &middot; live validation
      </div>
      <label style={{ display: "block", fontSize: 12, color: "var(--bx-text-4, #9aa0ad)", marginBottom: 8, letterSpacing: "0.04em" }}>
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: `1px solid ${borderColor}`,
          background: "var(--bx-surface-1, #0a0b0e)",
          padding: "0 12px",
          transition: "border-color .18s",
        }}
      >
        <input
          type="text"
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: "transparent",
            border: 0,
            outline: 0,
            fontFamily: "inherit",
            fontSize: 13,
            color: "var(--bx-text-1, #f4f6fb)",
            caretColor: "var(--bx-accent, #46c66d)",
            padding: "11px 0",
            minWidth: 0,
          }}
        />
        <span aria-hidden="true" style={{ fontSize: 13, color: GLYPH_COLOR[status] }}>
          {GLYPH[status]}
        </span>
      </div>
      <div role="status" style={{ fontSize: 11, color: MSG_COLOR[status], marginTop: 8 }}>
        {message}
      </div>
    </div>
  );
}
