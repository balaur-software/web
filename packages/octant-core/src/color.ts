// RGB / hex color helpers, ported from the OCTANT reference (applyAccent).

/** An 8-bit-per-channel RGB triple. */
export type RGB = [number, number, number];

/**
 * Parse a hex color to an RGB triple. Accepts an optional leading `#`, 3- or
 * 6-digit forms; falls back to the accent green (#46c66d) on empty/invalid input.
 */
export function hexRGB(h: string): RGB {
  h = (h || "").replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((x) => x + x)
      .join("");
  }
  const n = parseInt(h || "46c66d", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Format an RGB triple as a `#rrggbb` hex string. */
export function rgbHex(rgb: RGB): string {
  return `#${rgb.map((x) => (x & 255).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Lighten an RGB triple toward white by fraction `amt` in [0,1], rounding each
 * channel. `amt=0` returns the input; `amt=1` returns white.
 */
export function lighten(rgb: RGB, amt: number): RGB {
  return [
    Math.round(rgb[0] + (255 - rgb[0]) * amt),
    Math.round(rgb[1] + (255 - rgb[1]) * amt),
    Math.round(rgb[2] + (255 - rgb[2]) * amt),
  ];
}
