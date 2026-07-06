import { describe, expect, test } from "bun:test";
import { bit, OCTANT_BASE, octChar, sext } from "./encode";

describe("octChar golden values (from reference Q/S tables)", () => {
  test("Q-table masks map to legacy block/quadrant glyphs", () => {
    // Golden values taken directly from the reference Q table.
    expect(octChar(0)).toBe(" "); // U+0020
    expect(octChar(255)).toBe("█"); // U+2588
    expect(octChar(85)).toBe("▌"); // U+258C
    expect(octChar(5)).toBe("▘"); // U+2598
    expect(octChar(10)).toBe("▝"); // U+259D
    expect(octChar(15)).toBe("▀"); // U+2580
    expect(octChar(80)).toBe("▖"); // U+2596
    expect(octChar(90)).toBe("▞"); // U+259E
    expect(octChar(95)).toBe("▛"); // U+259B
    expect(octChar(160)).toBe("▗"); // U+2597
    expect(octChar(165)).toBe("▚"); // U+259A
    expect(octChar(170)).toBe("▐"); // U+2590
    expect(octChar(175)).toBe("▜"); // U+259C
    expect(octChar(240)).toBe("▄"); // U+2584
    expect(octChar(245)).toBe("▙"); // U+2599
    expect(octChar(250)).toBe("▟"); // U+259F
  });

  test("S-table masks map to their explicit code points", () => {
    expect(octChar(1)).toBe(String.fromCodePoint(0x1cea8));
    expect(octChar(2)).toBe(String.fromCodePoint(0x1ceab));
    expect(octChar(3)).toBe(String.fromCodePoint(0x1fb82));
  });

  test("OCTANT_BASE constant", () => {
    expect(OCTANT_BASE).toBe(0x1cd00);
  });

  test("first non-Q/S mask (4) lands at OCTANT_BASE", () => {
    // masks 0..3 are covered by Q(0) and S(1,2,3); mask 4 is the first "free"
    // index and must land exactly at the block base.
    expect(octChar(4)).toBe(String.fromCodePoint(OCTANT_BASE));
  });
});

describe("octChar exhaustive invariants over masks 0..255", () => {
  const outputs: string[] = [];
  for (let m = 0; m <= 255; m++) outputs.push(octChar(m));

  test("every output is exactly one code point", () => {
    for (let m = 0; m <= 255; m++) {
      const s = outputs[m]!;
      expect([...s].length).toBe(1);
    }
  });

  test("all 256 outputs are unique", () => {
    expect(new Set(outputs).size).toBe(256);
  });

  test("non-Q/S masks land in [OCTANT_BASE, OCTANT_BASE+0xFF]", () => {
    const qMasks = new Set([0, 5, 10, 15, 80, 85, 90, 95, 160, 165, 170, 175, 240, 245, 250, 255]);
    const sMasks = new Set([1, 2, 3]);
    for (let m = 0; m <= 255; m++) {
      if (qMasks.has(m) || sMasks.has(m)) continue;
      const cp = outputs[m]!.codePointAt(0)!;
      expect(cp).toBeGreaterThanOrEqual(OCTANT_BASE);
      expect(cp).toBeLessThanOrEqual(OCTANT_BASE + 0xff);
    }
  });
});

describe("tables", () => {
  test("bit weights are the octant sub-pixel powers of two", () => {
    expect([...bit]).toEqual([1, 2, 4, 8, 16, 32, 64, 128]);
  });
});

describe("sext (sextant encoder)", () => {
  test("golden endpoints and half-block special cases", () => {
    expect(sext(0)).toBe(" ");
    expect(sext(21)).toBe("▌");
    expect(sext(42)).toBe("▐");
    expect(sext(63)).toBe("█");
    expect(sext(1)).toBe(String.fromCodePoint(0x1fb00));
  });
});
