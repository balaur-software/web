import { describe, expect, test } from "bun:test";
import { SCRAMBLE_GLYPHS, scrambleFrame } from "./text";

const chars = (s: string): string[] => [...s];

describe("scrambleFrame", () => {
  test("fully revealed at p >= 1", () => {
    expect(scrambleFrame("OCTANT", 1)).toBe("OCTANT");
    expect(scrambleFrame("OCTANT", 2)).toBe("OCTANT");
  });

  test("revealed once progress passes every char's threshold", () => {
    // max threshold is (5/6)*0.65 ≈ 0.542, so p = 0.99 reveals all.
    expect(scrambleFrame("OCTANT", 0.99)).toBe("OCTANT");
  });

  test("output length always equals input length", () => {
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      expect(chars(scrambleFrame("OCTANT", p, SCRAMBLE_GLYPHS, 3)).length).toBe(6);
    }
  });

  test("spaces are preserved at every progress", () => {
    for (const p of [0, 0.3, 0.7, 1]) {
      const s = scrambleFrame("A B", p, SCRAMBLE_GLYPHS, 4);
      expect(chars(s)[1]).toBe(" ");
    }
  });

  test("at p = 0 every non-space char is drawn from the glyph set", () => {
    const glyphSet = new Set(chars(SCRAMBLE_GLYPHS));
    for (const ch of chars(scrambleFrame("OCTANT", 0))) {
      expect(glyphSet.has(ch)).toBe(true);
    }
  });

  test("deterministic for a fixed frame", () => {
    expect(scrambleFrame("OCTANT", 0, SCRAMBLE_GLYPHS, 7)).toBe(
      scrambleFrame("OCTANT", 0, SCRAMBLE_GLYPHS, 7),
    );
  });

  test("frame changes the scrambled glyphs", () => {
    const seen = new Set<string>();
    for (let f = 0; f <= 30; f++) seen.add(scrambleFrame("X", 0, SCRAMBLE_GLYPHS, f));
    expect(seen.size).toBeGreaterThan(1);
  });
});
