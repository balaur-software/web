/**
 * OCTANT typography: the mono font stack and the size scale.
 *
 * The whole system is set in a single monospace family. Values mirror the
 * `--bx-font-mono` and `--bx-fs-*` custom properties in tokens.css.
 */

/** The one and only font stack, self-hosted DepartureMono first. `--bx-font-mono` */
export const fontMono = "'DepartureMono', ui-monospace, 'DejaVu Sans Mono', monospace";

/** Font object matching the `tokens.font` shape. */
export const fonts = {
  mono: fontMono,
} as const;

/**
 * Font-size scale. Values are CSS strings so the `hero` clamp() ports verbatim.
 * Mirrors the `--bx-fs-*` custom properties.
 */
export const fontSize = {
  /** Responsive hero. clamp(48px, 11vw, 150px). `--bx-fs-hero` */
  hero: "clamp(48px, 11vw, 150px)",
  /** Section heading. 26px. `--bx-fs-h2` */
  h2: "26px",
  /** Base body copy. 15px. `--bx-fs-body` */
  body: "15px",
  /** Default control / UI text. 13px. `--bx-fs-control` */
  control: "13px",
  /** Small print, chip labels. 12px. `--bx-fs-small` */
  small: "12px",
} as const;

/** Line-height tokens used across the system. */
export const lineHeight = {
  hero: "0.9",
  tight: "1.25",
  body: "1.5",
  relaxed: "1.9",
} as const;
