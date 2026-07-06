import { describe, expect, test } from "bun:test";
import { octChar } from "./encode";
import { octantMaskField } from "./sample";

describe("octantMaskField", () => {
  test("all-lit sampler -> all full blocks (both dithers)", () => {
    expect(octantMaskField(() => 1, 3, 2, { dither: "bayer" })).toBe("███\n███");
    expect(octantMaskField(() => 1, 3, 2, { dither: "threshold" })).toBe("███\n███");
  });

  test("all-dark sampler -> all spaces (both dithers)", () => {
    expect(octantMaskField(() => 0, 3, 2, { dither: "bayer" })).toBe("   \n   ");
    expect(octantMaskField(() => 0, 3, 2, { dither: "threshold" })).toBe("   \n   ");
  });

  test("threshold: top-half sub-pixels lit -> upper half block", () => {
    // Y < 2 lit -> mask bits 0,1,2,3 = 15 -> "▀"
    const s = octantMaskField((_x, y) => (y < 2 ? 1 : 0), 1, 1, { dither: "threshold" });
    expect(s).toBe("▀");
    expect(s).toBe(octChar(15));
  });

  test("threshold: bottom-half sub-pixels lit -> lower half block", () => {
    // Y >= 2 lit -> mask bits 4,5,6,7 = 240 -> "▄"
    expect(octantMaskField((_x, y) => (y >= 2 ? 1 : 0), 1, 1, { dither: "threshold" })).toBe("▄");
  });

  test("threshold: left column lit -> left half block", () => {
    // X even (0) lit -> mask bits 0,2,4,6 = 85 -> "▌"
    expect(octantMaskField((x) => (x % 2 === 0 ? 1 : 0), 1, 1, { dither: "threshold" })).toBe("▌");
  });

  test("threshold: right column lit -> right half block", () => {
    // X odd (1) lit -> mask bits 1,3,5,7 = 170 -> "▐"
    expect(octantMaskField((x) => (x % 2 === 1 ? 1 : 0), 1, 1, { dither: "threshold" })).toBe("▐");
  });

  test("threshold respects a custom cut value", () => {
    // uniform 0.4: > 0.3 lit everywhere, > 0.5 nowhere
    expect(octantMaskField(() => 0.4, 2, 1, { dither: "threshold", threshold: 0.3 })).toBe("██");
    expect(octantMaskField(() => 0.4, 2, 1, { dither: "threshold", threshold: 0.5 })).toBe("  ");
  });

  test("bayer dither on a flat 0.5 field assembles the expected ordered mask", () => {
    // Golden mask 153 derived from BAYER thresholds over one 2x4 cell.
    expect(octantMaskField(() => 0.5, 1, 1, { dither: "bayer" })).toBe(octChar(153));
  });

  test("defaults to bayer dithering", () => {
    expect(octantMaskField(() => 0.5, 1, 1)).toBe(octChar(153));
  });

  test("rows are joined with newlines, no trailing newline", () => {
    const s = octantMaskField(() => 1, 1, 3);
    expect(s).toBe("█\n█\n█");
    expect(s.endsWith("\n")).toBe(false);
  });
});
