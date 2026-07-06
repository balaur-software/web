import { type CSSProperties, useRef, useState } from "react";
import { useOnVisible, useScramble } from "../hooks";

export interface ScrambleHeadingProps {
  /** The final, decoded heading text. Rendered statically on the server, then scrambled-in on first view. */
  text: string;
  /** Heading tag to render. Defaults to `h2` (the section heading in the reference). */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Tint the heading with the accent colour, mirroring the hero's second line. */
  accent?: boolean;
  /** Scramble duration in ms (reference uses 900). */
  dur?: number;
  /** Delay before the scramble begins, in ms. */
  delay?: number;
  style?: CSSProperties;
}

/**
 * A heading that decodes itself with a glyph scramble the first time it scrolls
 * into view — the reference's `initScramble` / `scramble` pass, gated by an
 * IntersectionObserver instead of firing on load. SSR emits the plain decoded
 * text (no hydration mismatch); the scramble replays imperatively via
 * `useScramble` once `useOnVisible` latches. Honours reduced-motion.
 */
export function ScrambleHeading({
  text,
  as: Tag = "h2",
  accent = false,
  dur = 900,
  delay = 0,
  style,
}: ScrambleHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [active, setActive] = useState(false);
  useOnVisible(ref, () => setActive(true));
  useScramble(ref, text, { dur, delay, active });

  return (
    <Tag
      ref={ref}
      style={{
        margin: 0,
        fontSize: 26,
        fontWeight: "normal",
        letterSpacing: "0.02em",
        color: accent ? "var(--bx-accent, #46c66d)" : "var(--bx-text-1, #f4f6fb)",
        ...style,
      }}
    >
      {text}
    </Tag>
  );
}
