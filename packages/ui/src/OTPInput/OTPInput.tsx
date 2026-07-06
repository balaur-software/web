import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useToast } from "../primitives";

const AC = "var(--bx-accent, #46c66d)";

export interface OTPInputProps {
  /** Number of digit cells. Default 6. */
  length?: number;
  /** Controlled value (digits only). Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires once when every cell is filled, with the assembled code. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  style?: CSSProperties;
}

const cellStyle: CSSProperties = {
  width: 42,
  height: 50,
  textAlign: "center",
  fontSize: 18,
  background: "#0a0b0e",
  color: "var(--bx-text-1, #f4f6fb)",
  caretColor: "transparent",
  outline: 0,
  fontFamily: "inherit",
  transition: "border-color .15s, box-shadow .15s",
};

/**
 * Six-cell one-time-passcode field (§ INPUT-OTP). Each cell accepts a single
 * digit, auto-advances on entry, walks back on Backspace, and accepts a pasted
 * code across all cells. The value is held in `useControllableState`; when every
 * cell is filled the assembled code is announced once via `useToast` + `onComplete`.
 * Border/glow paint reacts to focus + filled state, mirroring the reference `paint`.
 */
export function OTPInput({
  length = 6,
  value: controlled,
  defaultValue = "",
  onChange,
  onComplete,
  disabled,
  style,
}: OTPInputProps) {
  const [value, setValue] = useControllableState(controlled, defaultValue.slice(0, length), onChange);
  const [active, setActive] = useState<number | null>(null);
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);
  const doneRef = useRef(false);
  const toast = useToast();

  const chars = Array.from({ length }, (_, i) => value[i] ?? "");
  const full = chars.every((c) => c !== "");
  const code = value.slice(0, length);

  useEffect(() => {
    if (full && !doneRef.current) {
      doneRef.current = true;
      toast({ kind: "ok", message: `OTP verified — ${code}` });
      onComplete?.(code);
    }
    if (!full) doneRef.current = false;
  }, [full, code, toast, onComplete]);

  const focusCell = (i: number) => {
    if (i >= 0 && i < length) cellRefs.current[i]?.focus();
  };

  const setChar = (i: number, ch: string) => {
    const arr = value.split("");
    while (arr.length < length) arr.push("");
    arr[i] = ch;
    setValue(arr.join("").slice(0, length));
  };

  return (
    <div style={{ minWidth: 0, ...style }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {chars.map((ch, i) => {
          const isActive = active === i;
          const borderColor = isActive
            ? AC
            : ch
              ? "var(--bx-border-accent, #2a3320)"
              : "var(--bx-border, #1c1d24)";
          return (
            <input
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional cells
              key={i}
              ref={(el) => {
                cellRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              disabled={disabled}
              value={ch}
              aria-label={`Digit ${i + 1} of ${length}`}
              onChange={(e) => {
                const raw = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 1);
                // keep the DOM in sync even when the sanitized value is unchanged
                e.currentTarget.value = raw;
                setChar(i, raw);
                if (raw && i < length - 1) focusCell(i + 1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !chars[i] && i > 0) focusCell(i - 1);
              }}
              onFocus={() => setActive(i)}
              onBlur={() => setActive((cur) => (cur === i ? null : cur))}
              onPaste={(e) => {
                e.preventDefault();
                const d = (e.clipboardData.getData("text") || "").replace(/[^0-9]/g, "").slice(0, length);
                if (!d) return;
                setValue(d);
                focusCell(Math.min(d.length, length) - 1);
              }}
              style={{
                ...cellStyle,
                border: `1px solid ${borderColor}`,
                boxShadow: isActive ? `0 0 0 1px ${AC}` : "none",
                cursor: disabled ? "not-allowed" : "text",
                opacity: disabled ? 0.5 : 1,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 14,
          color: full ? "var(--bx-accent-bright, #74e692)" : "#5b616e",
        }}
      >
        {full ? "✓ code complete" : `enter ${length}-digit code · paste supported`}
      </div>
    </div>
  );
}
