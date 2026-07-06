import { describe, expect, test } from "bun:test";
import { ACCENT_OPTIONS, ACCENTS, accentVars, DEFAULT_ACCENT, DEFAULT_ACCENT_NAME } from "./accent.ts";

describe("accentVars", () => {
  test("resolves the green accent to its hardcoded bright pair", () => {
    expect(accentVars("green")).toEqual({
      "--bx-accent": "#46c66d",
      "--bx-accent-bright": "#74e692",
    });
  });

  test("resolves amber and cyan by name", () => {
    expect(accentVars("amber")).toEqual({
      "--bx-accent": "#ffb000",
      "--bx-accent-bright": "#ffc94d",
    });
    expect(accentVars("cyan")).toEqual({
      "--bx-accent": "#2bd9d9",
      "--bx-accent-bright": "#6ff2f2",
    });
  });

  test("resolves a known accent by its hex", () => {
    expect(accentVars("#46c66d")).toEqual({
      "--bx-accent": "#46c66d",
      "--bx-accent-bright": "#74e692",
    });
  });

  test("passes an unknown hex through as both accent and bright", () => {
    expect(accentVars("#123456")).toEqual({
      "--bx-accent": "#123456",
      "--bx-accent-bright": "#123456",
    });
  });
});

describe("accent constants", () => {
  test("default accent is green's hex and the first option", () => {
    expect(DEFAULT_ACCENT).toBe("#46c66d");
    expect(DEFAULT_ACCENT).toBe(ACCENT_OPTIONS[0]);
    expect(DEFAULT_ACCENT_NAME).toBe("green");
  });

  test("every accent option has a matching bright variant", () => {
    for (const opt of ACCENT_OPTIONS) {
      const vars = accentVars(opt);
      expect(vars["--bx-accent"]).toBe(opt);
      expect(vars["--bx-accent-bright"]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  test("ACCENTS exposes the three named pairs", () => {
    expect(Object.keys(ACCENTS)).toEqual(["green", "amber", "cyan"]);
  });
});
