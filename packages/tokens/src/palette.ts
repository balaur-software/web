/**
 * OCTANT ANSI 16-color palette.
 *
 * The exact indexed palette from the reference (renderVals): eight base hues
 * (idx 00-07) plus their bright variants (idx 08-15). These map 1:1 to the
 * `--ansi-00` .. `--ansi-15` CSS custom properties in tokens.css.
 */

export interface PaletteColor {
  /** Zero-padded ANSI index, e.g. "00" .. "15". Matches the CSS var suffix. */
  readonly idx: string;
  /** Human name, e.g. "green" or "br.green". */
  readonly name: string;
  /** Lowercase hex, e.g. "#46c66d". */
  readonly hex: string;
}

/** The 16 ANSI colors in index order (0..15). */
export const PALETTE: readonly PaletteColor[] = [
  { idx: "00", name: "black", hex: "#15161e" },
  { idx: "01", name: "red", hex: "#e5484d" },
  { idx: "02", name: "green", hex: "#46c66d" },
  { idx: "03", name: "yellow", hex: "#f2c94c" },
  { idx: "04", name: "blue", hex: "#4f8cff" },
  { idx: "05", name: "magenta", hex: "#c061ff" },
  { idx: "06", name: "cyan", hex: "#2bd9d9" },
  { idx: "07", name: "white", hex: "#c8cdd6" },
  { idx: "08", name: "br.black", hex: "#4b5263" },
  { idx: "09", name: "br.red", hex: "#ff6b6f" },
  { idx: "10", name: "br.green", hex: "#74e692" },
  { idx: "11", name: "br.yellow", hex: "#ffe08a" },
  { idx: "12", name: "br.blue", hex: "#7aa9ff" },
  { idx: "13", name: "br.magenta", hex: "#d79bff" },
  { idx: "14", name: "br.cyan", hex: "#6ff2f2" },
  { idx: "15", name: "br.white", hex: "#f4f6fb" },
] as const;

/** Lookup a palette color by its name (e.g. "green", "br.green"). */
export const byName: ReadonlyMap<string, PaletteColor> = new Map(PALETTE.map((c) => [c.name, c]));

/** Lookup a palette color by its zero-padded index (e.g. "00" .. "15"). */
export const byIdx: ReadonlyMap<string, PaletteColor> = new Map(PALETTE.map((c) => [c.idx, c]));
