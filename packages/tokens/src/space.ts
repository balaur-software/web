/**
 * OCTANT spacing, borders, radius and motion tokens.
 *
 * Radius is always 0 — the system is drawn in cells, nothing is rounded.
 * Mirrors the `--bx-space-*`, `--bx-radius`, `--bx-border-width`, `--bx-dur-*`
 * and `--bx-ease` custom properties in tokens.css.
 */

/** Spacing scale (px strings). Roughly a 4px base with the sizes the UI uses. */
export const space = {
  /** 2px */
  "3xs": "2px",
  /** 4px */
  "2xs": "4px",
  /** 7px */
  xs: "7px",
  /** 10px */
  sm: "10px",
  /** 12px */
  md: "12px",
  /** 18px */
  lg: "18px",
  /** 24px */
  xl: "24px",
  /** 32px */
  "2xl": "32px",
  /** 48px */
  "3xl": "48px",
} as const;

/** Border widths. */
export const border = {
  /** Standard hairline. 1px. `--bx-border-width` */
  width: "1px",
  /** Emphasis rule (underlines, accents). 2px. `--bx-border-width-strong` */
  widthStrong: "2px",
} as const;

/** Corner radius — always 0. `--bx-radius` */
export const radius = "0";

/** Motion durations (seconds strings), from the reference transitions. */
export const duration = {
  /** 220ms */
  fast: "0.22s",
  /** 260ms */
  base: "0.26s",
  /** 340ms */
  slow: "0.34s",
  /** 420ms */
  slower: "0.42s",
} as const;

/** The single shared easing curve. `--bx-ease` */
export const easing = "cubic-bezier(.5,0,.2,1)";

/** Blink cursor timing, matching `@keyframes bx-blink`. */
export const blink = {
  duration: "1s",
  timing: "steps(1)",
} as const;
