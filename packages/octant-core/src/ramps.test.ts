import { describe, expect, test } from "bun:test";
import { EQC, G, GROW, ORBIT, PULSE, SHADE, VBLOCKS, WAVE } from "./ramps";

describe("ramp lengths", () => {
  test("each ramp has its expected length", () => {
    expect(VBLOCKS.length).toBe(9);
    expect(SHADE.length).toBe(10);
    expect(G.length).toBe(5);
    expect(WAVE.length).toBe(14);
    expect(PULSE.length).toBe(4);
    expect(ORBIT.length).toBe(4);
    expect(GROW.length).toBe(14);
    expect(EQC.length).toBe(16);
  });
});

describe("ramp golden contents", () => {
  test("VBLOCKS is the vertical eighth-block ramp", () => {
    expect([...VBLOCKS]).toEqual([" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]);
  });

  test("SHADE is the 10-step shade ramp", () => {
    expect([...SHADE]).toEqual([" ", " ", "░", "░", "▒", "▒", "▓", "▓", "█", "█"]);
  });

  test("G is the 5-step heatmap ramp", () => {
    expect([...G]).toEqual(["·", "░", "▒", "▓", "█"]);
  });

  test("loader alphabets", () => {
    expect([...WAVE]).toEqual(["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▄", "▃", "▂"]);
    expect([...PULSE]).toEqual(["▘", "▝", "▗", "▖"]);
    expect([...ORBIT]).toEqual(["▀", "▐", "▄", "▌"]);
    expect([...GROW]).toEqual(["▏", "▎", "▍", "▌", "▋", "▊", "▉", "█", "▉", "▊", "▋", "▌", "▍", "▎"]);
  });

  test("EQC entries are all #rrggbb hex colors", () => {
    for (const c of EQC) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    expect(EQC[0]).toBe("#e5484d");
  });
});
