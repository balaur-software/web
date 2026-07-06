// Pure decode-scramble string builder, ported from the OCTANT reference
// `scramble()`. The React hook drives `p` (progress) and `frame`; this function
// stays pure so the reference `Math.random()` glyph pick is replaced by a
// deterministic `(index, frame)` hash.

/** Default scramble glyph alphabet (`scramble()` `g`). */
export const SCRAMBLE_GLYPHS = "▓▒░█▚▙▞▛#%*+=:.";

/** Deterministic glyph pick, standing in for `g[(Math.random()*g.length)|0]`. */
function glyphAt(i: number, frame: number, glyphs: string): string {
  if (glyphs.length === 0) return " ";
  let h = (Math.imul(i, 73856093) ^ Math.imul(frame, 19349663)) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  return glyphs[h % glyphs.length] ?? " ";
}

/**
 * Build one scramble frame for `text` at progress `p in [0,1]`. Character `i` is
 * revealed once `p > (i/n)*0.65`; before that it shows a deterministic glyph
 * chosen from `glyphs` by `(i, frame)`. Spaces are always preserved.
 *
 * At `p >= 1` this returns `text` unchanged; the output always has the same
 * length as `text`.
 */
export function scrambleFrame(text: string, p: number, glyphs: string = SCRAMBLE_GLYPHS, frame = 0): string {
  const n = text.length;
  let s = "";
  for (let i = 0; i < n; i++) {
    const ch = text[i] ?? "";
    if (ch === " ") {
      s += " ";
      continue;
    }
    const rev = (i / n) * 0.65;
    s += p > rev ? ch : glyphAt(i, frame, glyphs);
  }
  return s;
}
