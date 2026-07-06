import { describe, expect, test } from "bun:test";
import { bar8, E } from "./bars";

describe("E ramp", () => {
  test("is the 9-step left-eighth block ramp", () => {
    expect([...E]).toEqual([" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"]);
  });
});

describe("bar8", () => {
  test("empty -> all spaces, exact width", () => {
    expect(bar8(0, 4)).toBe("    ");
  });

  test("full -> all full blocks, exact width", () => {
    expect(bar8(1, 4)).toBe("████");
  });

  test("clamps out-of-range fractions", () => {
    expect(bar8(-5, 4)).toBe("    ");
    expect(bar8(5, 4)).toBe("████");
  });

  test("midpoint on an even width", () => {
    expect(bar8(0.5, 4)).toBe("██  ");
  });

  test("fractional cap cell from the E ramp", () => {
    // 0.3125 * 4 = 1.25 -> 1 full block, remainder 0.25 -> round(2) -> "▎"
    expect(bar8(0.3125, 4)).toBe("█▎  ");
  });

  test("output length always equals cells", () => {
    for (const f of [0, 0.1, 0.33, 0.5, 0.666, 0.9, 1]) {
      expect([...bar8(f, 10)].length).toBe(10);
    }
  });
});
