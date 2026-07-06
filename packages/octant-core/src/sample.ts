// Pixel -> 2x4 sub-pixel mask -> octant glyph sampler, ported from the OCTANT
// reference image (`_imgDraw`) and banner (`initBanner`) renderers.

import { bit, octChar } from "./encode";
import { BAYER } from "./field";

/** Options for {@link octantMaskField}. */
export interface OctantMaskFieldOpts {
  /**
   * Lit decision per sub-pixel:
   * - `"bayer"` (default): `l > (BAYER[(Y&3)*4 + (X&3)] + 0.5) / 16` — ordered
   *   4x4 dither, as in the image renderer.
   * - `"threshold"`: `l > threshold` — a flat cut, as in the banner renderer.
   */
  dither?: "bayer" | "threshold";
  /** Flat cut used when `dither === "threshold"`. Defaults to `0.5`. */
  threshold?: number;
}

/**
 * Sample a virtual `(cols*2) x (rows*4)` sub-pixel grid into a grid of octant
 * glyphs. For each cell, the 8 sub-pixels (x-fastest, then y) are read from
 * `sample(px, py)` and thresholded; lit sub-pixels set their mask bit via `bit`,
 * and the assembled mask is encoded with `octChar`. Rows are joined with `\n`.
 *
 * Pure: determinism depends only on `sample`.
 */
export function octantMaskField(
  sample: (px: number, py: number) => number,
  cols: number,
  rows: number,
  opts: OctantMaskFieldOpts = {},
): string {
  const dither = opts.dither ?? "bayer";
  const threshold = opts.threshold ?? 0.5;
  const lines: string[] = [];
  for (let cy = 0; cy < rows; cy++) {
    let line = "";
    for (let cx = 0; cx < cols; cx++) {
      let mask = 0;
      let k = 0;
      for (let sy = 0; sy < 4; sy++) {
        const Y = cy * 4 + sy;
        for (let sx = 0; sx < 2; sx++) {
          const X = cx * 2 + sx;
          const l = sample(X, Y);
          const lit =
            dither === "bayer" ? l > ((BAYER[(Y & 3) * 4 + (X & 3)] ?? 0) + 0.5) / 16 : l > threshold;
          if (lit) mask |= bit[k] ?? 0;
          k++;
        }
      }
      line += octChar(mask);
    }
    lines.push(line);
  }
  return lines.join("\n");
}
