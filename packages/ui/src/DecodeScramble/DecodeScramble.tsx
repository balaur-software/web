import { type CSSProperties, type HTMLAttributes, useRef, useState } from "react";
import { useScramble } from "../hooks/useScramble";

export interface DecodeScrambleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The word/phrase that glitch-resolves left-to-right. */
  text: string;
  /** How the reveal replays. `click` (default) matches the OCTANT spec; `hover` mirrors the original demo. */
  trigger?: "click" | "hover";
  /** Duration of the scramble sweep, ms. */
  dur?: number;
  /** Glyph colour. Defaults to the ANSI magenta token. */
  color?: string;
  /** Font size in px. */
  fontSize?: number;
  style?: CSSProperties;
}

/**
 * One `<Scrambler>` per replay: bumping its `key` remounts it so `useScramble`
 * fires a fresh decode sweep. Keeping the run counter in the parent means the
 * server renders plain `text` (no hydration mismatch) and the glitch only kicks
 * in after mount / on interaction.
 */
function Scrambler({ text, dur, color, fontSize }: { text: string; dur: number; color: string; fontSize: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useScramble(ref, text, { dur });
  return (
    <span ref={ref} style={{ color, fontSize, letterSpacing: "0.04em" }}>
      {text}
    </span>
  );
}

/**
 * Terminal "decode" text: a scrambled glyph field that resolves left-to-right
 * into `text`. Click (or hover) to replay the reveal. The animation is driven
 * by the shared `useScramble` hook and is inert until mounted.
 */
export function DecodeScramble({
  text,
  trigger = "click",
  dur = 800,
  color = "var(--bx-ansi-5, #c061ff)",
  fontSize = 30,
  style,
  ...rest
}: DecodeScrambleProps) {
  const [runKey, setRunKey] = useState(0);
  const replay = () => setRunKey((k) => k + 1);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={text}
      onClick={trigger === "click" ? replay : undefined}
      onMouseEnter={trigger === "hover" ? replay : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          replay();
        }
      }}
      {...rest}
      style={{
        display: "inline-block",
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
        ...style,
      }}
    >
      <Scrambler key={runKey} text={text} dur={dur} color={color} fontSize={fontSize} />
    </div>
  );
}
