// Pixel-mask -> Unicode octant glyph encoder, ported from the OCTANT reference.
//
// An octant cell is a 2x4 grid of sub-pixels. Each sub-pixel maps to one bit of
// an 8-bit mask via `bit` (row-major, x-fastest): the top-left sub-pixel is bit 0
// (value 1), top-right is bit 1 (value 2), then down the rows to bottom-right
// (value 128). `octChar` turns that mask into a single-code-point string.

/** Base code point of the Unicode "Legacy Computing Supplement" octant block. */
export const OCTANT_BASE = 0x1cd00;

/** Sub-pixel bit weights in mask-assembly order (x-fastest, then y). */
export const bit: readonly number[] = [1, 2, 4, 8, 16, 32, 64, 128];

/**
 * 16 masks that coincide with legacy block / quadrant glyphs already present in
 * the Basic Multilingual Plane. Mapped directly to those characters so text
 * rendered with a fallback font still shows the right shape.
 */
const Q: Readonly<Record<number, string>> = {
  0: " ",
  5: "▘", // ▘
  10: "▝", // ▝
  15: "▀", // ▀
  80: "▖", // ▖
  85: "▌", // ▌
  90: "▞", // ▞
  95: "▛", // ▛
  160: "▗", // ▗
  165: "▚", // ▚
  170: "▐", // ▐
  175: "▜", // ▜
  240: "▄", // ▄
  245: "▙", // ▙
  250: "▟", // ▟
  255: "█", // █
};

/**
 * 3 special masks whose glyph lives outside the contiguous octant block; encoded
 * as explicit code points.
 */
const S: Readonly<Record<number, number>> = {
  1: 0x1cea8,
  2: 0x1ceab,
  3: 0x1fb82,
};

/**
 * The set of masks already handled by Q or S. Used to compress the remaining
 * masks into the contiguous octant code-point range: for a non-Q/S mask we count
 * how many lower masks are NOT skipped and add that offset to OCTANT_BASE.
 */
const _octSkip: ReadonlySet<number> = new Set([
  0, 5, 10, 15, 80, 85, 90, 95, 160, 165, 170, 175, 240, 245, 250, 255, 1, 2, 3,
]);

/**
 * Encode an 8-bit octant sub-pixel mask (0..255) to its single-code-point glyph.
 */
export function octChar(mask: number): string {
  const q = Q[mask];
  if (q !== undefined) return q;
  const s = S[mask];
  if (s !== undefined) return String.fromCodePoint(s);
  let idx = 0;
  for (let i = 0; i < mask; i++) {
    if (!_octSkip.has(i)) idx++;
  }
  return String.fromCodePoint(OCTANT_BASE + idx);
}

/**
 * Sextant (2x3) encoder, ported for completeness. Maps a 6-bit mask (0..63) to a
 * legacy-computing sextant glyph, reusing the half-block glyphs for the columns.
 */
export function sext(mask: number): string {
  if (mask === 0) return " ";
  if (mask === 21) return "▌"; // ▌
  if (mask === 42) return "▐"; // ▐
  if (mask === 63) return "█"; // █
  let o = mask - 1;
  if (mask > 21) o--;
  if (mask > 42) o--;
  return String.fromCodePoint(0x1fb00 + o);
}

/**
 * DOM/canvas-dependent glyph-availability probe. Renders a sparse octant and a
 * dense octant to an offscreen canvas and compares lit-pixel counts: a real font
 * shows a large density ratio, whereas tofu ".notdef" boxes (which draw the hex
 * code point) have near-identical counts.
 *
 * NOTE: requires a DOM (`document`, canvas 2D + getImageData). Not unit-tested.
 */
export function glyphSupported(ch: string): boolean {
  void ch;
  try {
    const s = 24;
    const cv = document.createElement("canvas");
    cv.width = s;
    cv.height = s;
    const c = cv.getContext("2d", { willReadFrequently: true });
    if (!c) return false;
    const count = (t: string): number => {
      c.fillStyle = "#000";
      c.fillRect(0, 0, s, s);
      c.fillStyle = "#fff";
      c.textBaseline = "top";
      c.font = '20px "DepartureMono",monospace';
      c.fillText(t, 1, 1);
      const d = c.getImageData(0, 0, s, s).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const v = d[i];
        if (v !== undefined && v > 120) n++;
      }
      return n;
    };
    const lo = count(octChar(1));
    const hi = count(octChar(254));
    return lo > 0 && hi > lo * 2.5;
  } catch {
    return false;
  }
}
