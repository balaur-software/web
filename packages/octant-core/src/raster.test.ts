import { describe, expect, test } from "bun:test";
import { drawLine, paintBuf, paintLUT, paintVal, strokeArc } from "./raster";

const W = 5;
const H = 5;
const lit = (buf: Uint8Array): number[] => {
  const out: number[] = [];
  for (let i = 0; i < buf.length; i++) if (buf[i]) out.push(i);
  return out;
};

describe("drawLine", () => {
  test("single-pixel line writes the value at the endpoint", () => {
    const buf = new Uint8Array(W * H);
    drawLine(buf, W, H, 1, 1, 1, 1, 7);
    expect(buf[1 * W + 1]).toBe(7);
    expect(lit(buf)).toEqual([1 * W + 1]);
  });

  test("horizontal line fills a whole row", () => {
    const buf = new Uint8Array(W * H);
    drawLine(buf, W, H, 0, 2, 4, 2, 1);
    expect(lit(buf)).toEqual([10, 11, 12, 13, 14]);
  });

  test("main diagonal", () => {
    const buf = new Uint8Array(W * H);
    drawLine(buf, W, H, 0, 0, 4, 4, 1);
    expect(lit(buf)).toEqual([0, 6, 12, 18, 24]);
  });

  test("writes the given value, not just 1", () => {
    const buf = new Uint8Array(W * H);
    drawLine(buf, W, H, 0, 0, 2, 0, 3);
    expect([buf[0], buf[1], buf[2]]).toEqual([3, 3, 3]);
  });

  test("clips out-of-bounds cells without throwing", () => {
    const buf = new Uint8Array(W * H);
    expect(() => drawLine(buf, W, H, 2, 2, 10, 2, 1)).not.toThrow();
    // only the in-bounds portion (x = 2..4 on row 2) is written
    expect(lit(buf)).toEqual([12, 13, 14]);
  });
});

describe("strokeArc", () => {
  test("thickness 0 plots a single cell at angle 0", () => {
    const buf = new Uint8Array(11 * 11);
    strokeArc(buf, 11, 11, 5, 5, 3, 0, 0, 5, 0);
    // cos(0)=1, sin(0)=0 -> (8, 5)
    expect(buf[5 * 11 + 8]).toBe(5);
    expect(lit(buf)).toEqual([5 * 11 + 8]);
  });

  test("a quarter arc hits both endpoints and leaves the center empty", () => {
    const buf = new Uint8Array(11 * 11);
    strokeArc(buf, 11, 11, 5, 5, 3, 0, Math.PI / 2, 2, 0);
    expect(buf[5 * 11 + 8]).toBe(2); // angle 0   -> (8,5)
    expect(buf[8 * 11 + 5]).toBe(2); // angle π/2 -> (5,8)
    expect(buf[5 * 11 + 5]).toBe(0); // center untouched
  });

  test("max-blends: never lowers an already-higher cell", () => {
    const buf = new Uint8Array(11 * 11);
    buf[5 * 11 + 8] = 9;
    strokeArc(buf, 11, 11, 5, 5, 3, 0, 0, 2, 0);
    expect(buf[5 * 11 + 8]).toBe(9);
  });

  test("thickness widens the stroke radially", () => {
    const buf = new Uint8Array(11 * 11);
    strokeArc(buf, 11, 11, 5, 5, 3, 0, 0, 1, 2);
    // rr = 3 + tk*0.55 for tk in -2..2 -> x in {7,7,8,9,9}, y = 5
    expect([buf[5 * 11 + 7], buf[5 * 11 + 8], buf[5 * 11 + 9]]).toEqual([1, 1, 1]);
  });
});

describe("canvas painters import cleanly (no DOM in bun)", () => {
  test("are all functions", () => {
    expect(typeof paintBuf).toBe("function");
    expect(typeof paintVal).toBe("function");
    expect(typeof paintLUT).toBe("function");
  });
});
