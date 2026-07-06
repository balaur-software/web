/**
 * `@balaur/tokens` — the OCTANT design token layer.
 *
 * Typed TS tokens plus a companion `tokens.css` of CSS custom properties and
 * the self-hosted DepartureMono font. Zero runtime dependencies.
 *
 * Import the CSS once at your app root:
 *   import "@balaur/tokens/tokens.css";
 *
 * Use the typed tokens in TS/JS:
 *   import { tokens, accentVars } from "@balaur/tokens";
 */

import { ACCENTS, DEFAULT_ACCENT_NAME } from "./accent.ts";
import { borders, surfaces, text, textDim, tints } from "./colors.ts";
import { PALETTE } from "./palette.ts";
import { blink, easing, space } from "./space.ts";
import { fontSize, fonts } from "./type.ts";

export type { Accent, AccentName, AccentOption, AccentVars } from "./accent.ts";
export {
  ACCENT_OPTIONS,
  ACCENTS,
  accentVars,
  DEFAULT_ACCENT,
  DEFAULT_ACCENT_NAME,
} from "./accent.ts";

export { borders, fg, surfaces, text, textDim, tints } from "./colors.ts";
export type { PaletteColor } from "./palette.ts";
export { byIdx, byName, PALETTE } from "./palette.ts";
export { blink, border, duration, easing, radius, space } from "./space.ts";
export { fontMono, fontSize, fonts, lineHeight } from "./type.ts";

/**
 * The single aggregated token object. Every design decision in one typed tree,
 * mirrored 1:1 by the `--bx-*` custom properties in tokens.css.
 */
export const tokens = {
  /** ANSI 16-color palette (index 0..15). */
  palette: PALETTE,
  /** Page background + surface fills. */
  surfaces,
  /** Border / hairline colors. */
  border: borders,
  /** Status-tint background washes. */
  tints,
  /** Text ramp, brightest -> dimmest. */
  text,
  /** Off-ramp interstitial text grays (brightest -> dimmest). */
  textDim,
  /** Accent system: default hue + selectable options. */
  accent: {
    default: ACCENTS[DEFAULT_ACCENT_NAME],
    options: ACCENTS,
  },
  /** Font stacks. */
  font: fonts,
  /** Font-size scale. */
  type: fontSize,
  /** Spacing scale. */
  space,
  /** Motion tokens. */
  motion: {
    blink,
    easing,
  },
} as const;

export type Tokens = typeof tokens;
