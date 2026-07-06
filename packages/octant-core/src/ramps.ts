// Named glyph / color ramp constants, ported verbatim from the OCTANT reference.

/**
 * 9-step vertical eighth-block ramp (bottom-up): index i draws i eighths filled
 * from the bottom; index 8 is a full block. Ported from `initLoaders` `V`.
 * Named `VBLOCKS` to avoid colliding with the unit-cube vertices `V` in field.ts.
 */
export const VBLOCKS: readonly string[] = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

/**
 * 10-step shade ramp (from the image renderer): pairs of ` `, `░`, `▒`, `▓`, `█`
 * indexed by `Math.min(9, Math.max(0, Math.round(l * 9)))`.
 */
export const SHADE: readonly string[] = [" ", " ", "░", "░", "▒", "▒", "▓", "▓", "█", "█"];

/**
 * 5-step heatmap ramp, indexed by `Math.round(v * 4)` clamped to 0..4. Ported
 * from `initHeatmap` `G`.
 */
export const G: readonly string[] = ["·", "░", "▒", "▓", "█"];

/** 14-frame "wave" loader alphabet (eighth-blocks rising then falling). */
export const WAVE: readonly string[] = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▄", "▃", "▂"];

/** 4-frame "pulse" loader alphabet (rotating quadrant dots). */
export const PULSE: readonly string[] = ["▘", "▝", "▗", "▖"];

/** 4-frame "orbit" loader alphabet (rotating half-blocks). */
export const ORBIT: readonly string[] = ["▀", "▐", "▄", "▌"];

/** 14-frame "grow" loader alphabet (left eighth-blocks growing then shrinking). */
export const GROW: readonly string[] = ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "█", "▉", "▊", "▋", "▌", "▍", "▎"];

/** 16-color equalizer palette (`initLoaders` `EQC`). */
export const EQC: readonly string[] = [
  "#e5484d",
  "#46c66d",
  "#f2c94c",
  "#4f8cff",
  "#c061ff",
  "#2bd9d9",
  "#ff6b6f",
  "#74e692",
  "#ffe08a",
  "#7aa9ff",
  "#d79bff",
  "#6ff2f2",
  "#46c66d",
  "#f2c94c",
  "#2bd9d9",
  "#c061ff",
];
