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
  /** Row hover fill (off-ramp, between surface3 and surface4). `--bx-surface-hover` */
  hover: "#0f1014",
  /** Table zebra stripe (off-ramp, between surface1 and surface2). `--bx-surface-stripe` */
  stripe: "#0b0c10",
} as const;

/** Subtle status-tint background washes. */
export const tints = {
  /** Success / accent wash. `--bx-accent-tint` */
  accent: "#0e140e",
  /** Danger wash. `--bx-danger-tint` */
  danger: "#1f1416",
} as const;

/** Border / hairline colors. */
export const borders = {
  /** Primary hairline border. `--bx-border` */
  primary: "#1c1d24",
  /** Stronger / secondary border. `--bx-border-strong` */
  strong: "#23252e",
  /** Mid hairline, between `strong` and `bright`. `--bx-border-mid` */
  mid: "#2a2c34",
  /** Accent (green-tinted) border. `--bx-border-accent` */
  accent: "#2a3320",
  /** Bright overlay border. `--bx-border-bright` */
  bright: "#33353f",
  /** Cyan-tinted border. `--bx-border-cyan` */
  cyan: "#1d3540",
  /** Magenta-tinted border. `--bx-border-magenta` */
  magenta: "#3a2540",
  /** Yellow-tinted border. `--bx-border-yellow` */
  yellow: "#3a3520",
  /** Red-tinted border. `--bx-border-red` */
  red: "#3a2020",
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

/**
 * Off-ramp interstitial text grays used raw in the OCTANT source that fall
 * between the numbered `--bx-text-*` steps. Brightest -> dimmest, mapping to
 * `--bx-text-dim-1` .. `--bx-text-dim-4`.
 */
export const textDim = ["#aab0bd", "#6b7180", "#4b505c", "#363943"] as const;
