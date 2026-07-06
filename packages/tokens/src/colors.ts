/**
 * OCTANT surface, border and text-ramp colors.
 *
 * These mirror the `--bx-bg`, `--bx-surface-*`, `--bx-border*` and `--bx-text-*`
 * custom properties in tokens.css. Hexes are drawn directly from the reference
 * document's inline styles.
 */

/** Page background & panel surfaces, darkest -> lightest fill. */
export const surfaces = {
  /** Page background. `--bx-bg` */
  page: "#08080a",
  /** `--bx-surface-1` */
  surface1: "#0a0b0e",
  /** `--bx-surface-2` */
  surface2: "#0b0d10",
  /** Default panel / card. `--bx-surface-3` */
  surface3: "#0c0d11",
  /** `--bx-surface-4` */
  surface4: "#12131a",
  /** `--bx-surface-5` */
  surface5: "#131419",
  /** `--bx-surface-6` */
  surface6: "#15161e",
  /** Elevated surface (hover, active rows). `--bx-surface-7` */
  surface7: "#1a1b22",
} as const;

/** Border / hairline colors. */
export const borders = {
  /** Primary hairline border. `--bx-border` */
  primary: "#1c1d24",
  /** Stronger / secondary border. `--bx-border-strong` */
  strong: "#23252e",
  /** Accent (green-tinted) border. `--bx-border-accent` */
  accent: "#2a3320",
  /** Bright overlay border. `--bx-border-bright` */
  bright: "#33353f",
} as const;

/**
 * Text ramp, brightest -> dimmest, mapping to `--bx-text-1` .. `--bx-text-7`.
 * `text[0]` is the primary foreground; higher indices are progressively dimmer.
 */
export const text = ["#f4f6fb", "#dfe3ea", "#c8cdd6", "#9aa0ad", "#7b8290", "#5b616e", "#3f424d"] as const;

/** Named foreground roles pulled from the text ramp. */
export const fg = {
  /** Primary text. `--bx-text-1` (text[0]) */
  default: text[0],
  /** Strong body text. `--bx-text-2` (text[1]) */
  strong: text[1],
  /** Standard body text. `--bx-text-3` (text[2]) */
  body: text[2],
  /** Muted text. `--bx-text-4` (text[3]) */
  muted: text[3],
  /** Dim / secondary text. `--bx-text-5` (text[4]) */
  dim: text[4],
  /** Faint text (timestamps, meta). `--bx-text-6` (text[5]) */
  faint: text[5],
  /** Ghost text (placeholders, disabled). `--bx-text-7` (text[6]) */
  ghost: text[6],
} as const;
