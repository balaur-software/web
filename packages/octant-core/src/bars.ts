// Fractional horizontal bar rendering, ported from the OCTANT reference.

/**
 * The 9-step left-eighth-block ramp: index i draws i eighths of a cell filled
 * from the left. Index 8 is a full block.
 */
export const E: readonly string[] = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];

/**
 * Render `frac` (clamped to [0,1]) as a `cells`-wide bar using full blocks plus a
 * single fractional cap cell from the `E` ramp, padded with spaces to `cells`.
 */
export function bar8(frac: number, cells: number): string {
  frac = Math.max(0, Math.min(1, frac));
  const full = Math.floor(frac * cells);
  let s = "█".repeat(full);
  if (full < cells) {
    const rem = frac * cells - full;
    s += E[Math.round(rem * 8)] ?? " ";
    s += " ".repeat(cells - full - 1);
  }
  return s;
}
