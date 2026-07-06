import { describe, expect, test } from "bun:test";
import { noiseBars, seededRandom } from "./rand";

const draws = (rnd: () => number, n: number): number[] => Array.from({ length: n }, () => rnd());

describe("seededRandom", () => {
  test("same seed yields the same sequence", () => {
    expect(draws(seededRandom("octant"), 8)).toEqual(draws(seededRandom("octant"), 8));
  });

  test("different seeds diverge", () => {
    expect(draws(seededRandom("a"), 8)).not.toEqual(draws(seededRandom("b"), 8));
  });

  test("every draw is in [0, 1)", () => {
    for (const v of draws(seededRandom("balaur"), 512)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test("successive draws advance the state", () => {
    const rnd = seededRandom("x");
    const a = rnd();
    const b = rnd();
    expect(a).not.toBe(b);
  });
});

describe("noiseBars", () => {
  test("returns n integer indices in 0..8", () => {
    const bars = noiseBars(1.23, 16);
    expect(bars.length).toBe(16);
    for (const v of bars) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(8);
    }
  });

  test("deterministic for the same (t, n, sp)", () => {
    expect(noiseBars(1.23, 16, 0.7)).toEqual(noiseBars(1.23, 16, 0.7));
  });

  test("sp defaults to 1", () => {
    expect(noiseBars(2.5, 12)).toEqual(noiseBars(2.5, 12, 1));
  });
});
