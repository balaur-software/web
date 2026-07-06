import { describe, expect, test } from "bun:test";
import { hexRGB, lighten, rgbHex } from "./color";
import { noise } from "./field";

describe("hexRGB", () => {
  test("parses 6-digit hex with and without leading #", () => {
    expect(hexRGB("#46c66d")).toEqual([70, 198, 109]);
    expect(hexRGB("46c66d")).toEqual([70, 198, 109]);
  });

  test("expands 3-digit shorthand", () => {
    expect(hexRGB("#f0a")).toEqual([255, 0, 170]);
  });

  test("falls back to accent green on empty input", () => {
    expect(hexRGB("")).toEqual([70, 198, 109]);
  });

  test("black and white extremes", () => {
    expect(hexRGB("#000000")).toEqual([0, 0, 0]);
    expect(hexRGB("#ffffff")).toEqual([255, 255, 255]);
  });
});

describe("rgbHex", () => {
  test("formats zero-padded lowercase #rrggbb", () => {
    expect(rgbHex([0, 0, 0])).toBe("#000000");
    expect(rgbHex([255, 255, 255])).toBe("#ffffff");
    expect(rgbHex([70, 198, 109])).toBe("#46c66d");
  });

  test("round-trips with hexRGB", () => {
    expect(rgbHex(hexRGB("#7aa9ff"))).toBe("#7aa9ff");
  });
});

describe("lighten", () => {
  test("amt=0 is identity", () => {
    expect(lighten([70, 198, 109], 0)).toEqual([70, 198, 109]);
  });

  test("amt=1 is white", () => {
    expect(lighten([70, 198, 109], 1)).toEqual([255, 255, 255]);
  });

  test("0.3 lighten matches reference math (round(c+(255-c)*amt))", () => {
    // 70 + (255-70)*0.3 = 125.5 -> 126; 198 + 57*0.3 = 215.1 -> 215;
    // 109 + 146*0.3 = 152.8 -> 153
    expect(lighten([70, 198, 109], 0.3)).toEqual([126, 215, 153]);
  });
});

describe("noise determinism", () => {
  test("same inputs -> same output", () => {
    expect(noise(1.5, 2.5, 3.5)).toBe(noise(1.5, 2.5, 3.5));
    expect(noise(0, 0, 0)).toBe(noise(0, 0, 0));
  });

  test("output is in [0,1]", () => {
    for (let i = 0; i < 50; i++) {
      const v = noise(i * 0.37, i * 1.13, i * 0.71);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  test("integer lattice points are stable across calls", () => {
    const a = noise(3, 4, 5);
    const b = noise(3, 4, 5);
    expect(a).toBe(b);
  });
});
