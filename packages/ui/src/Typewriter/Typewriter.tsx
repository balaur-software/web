import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useTypewriter } from "../hooks/useTypewriter";

const DEFAULT_PHRASES = [
  "render UI in 8-bit dots",
  "256 states per glyph",
  "no canvas. no images.",
  "just Unicode.",
];

export interface TypewriterProps {
  /** A single string, or a list of phrases cycled through when `loop` is set. */
  text?: string | string[];
  /** Milliseconds per character. */
  speed?: number;
  /** Milliseconds to hold a completed phrase before advancing (loop only). */
  hold?: number;
  /** Cycle through the phrases forever (only meaningful with multiple phrases). */
  loop?: boolean;
  /** Show the blinking block caret trailing the text. */
  caret?: boolean;
  /** Leading prompt glyph; pass `null` to hide it. */
  prompt?: ReactNode;
  /** Colour of the typed text and caret. */
  accent?: string;
  /** Font size in px (also drives caret height). */
  fontSize?: number;
  style?: CSSProperties;
}

/**
 * Types text out one character at a time behind a `>` prompt, trailed by a
 * blinking eighth-block caret. When given several phrases it cycles through
 * them, retyping each after a hold. The text is filled imperatively via the
 * shared `useTypewriter` hook, so the server renders an empty line and typing
 * begins after hydration (no mismatch). Reduced-motion pins the first phrase.
 */
export function Typewriter({
  text = DEFAULT_PHRASES,
  speed = 55,
  hold = 1300,
  loop = true,
  caret = true,
  prompt = "> ",
  accent = "var(--bx-accent, #46c66d)",
  fontSize = 19,
  style,
}: TypewriterProps) {
  const phrases = Array.isArray(text) ? text : [text];
  const [index, setIndex] = useState(0);
  const current = phrases[index % phrases.length] ?? "";
  const outRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useTypewriter(outRef, current, { speed, caret: false });

  // Advance to the next phrase once the current one has finished typing + held.
  useEffect(() => {
    if (!loop || reduced || phrases.length < 2) return;
    const total = current.length * speed + hold;
    const t = setTimeout(() => setIndex((i) => i + 1), total);
    return () => clearTimeout(t);
  }, [current, speed, hold, loop, reduced, phrases.length]);

  return (
    <div
      style={{
        fontSize,
        color: accent,
        display: "flex",
        alignItems: "center",
        minHeight: Math.round(fontSize * 1.5),
        fontFamily: "var(--bx-font-mono, ui-monospace, monospace)",
        whiteSpace: "pre",
        ...style,
      }}
    >
      {prompt != null && <span style={{ color: "#3f424d" }}>{prompt}</span>}
      <span ref={outRef} />
      {caret && (
        <span
          aria-hidden="true"
          style={{
            width: Math.round(fontSize * 0.47),
            height: fontSize,
            background: accent,
            display: "inline-block",
            marginLeft: 2,
            animation: "bx-blink 1s steps(1) infinite",
          }}
        />
      )}
    </div>
  );
}
