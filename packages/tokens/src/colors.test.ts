import { describe, expect, test } from "bun:test";
import { borders, surfaces, text, textDim, tints } from "./colors.ts";

describe("colors typed exports", () => {
  test("borders carry the mid hairline and per-hue tinted variants", () => {
    expect(borders.mid).toBe("#2a2c34");
    expect(borders.accent).toBe("#2a3320");
    expect(borders.cyan).toBe("#1d3540");
    expect(borders.magenta).toBe("#3a2540");
    expect(borders.yellow).toBe("#3a3520");
    expect(borders.red).toBe("#3a2020");
  });

  test("surfaces carry the off-ramp hover and stripe fills", () => {
    expect(surfaces.hover).toBe("#0f1014");
    expect(surfaces.stripe).toBe("#0b0c10");
  });

  test("status tints expose accent and danger washes", () => {
    expect(tints.accent).toBe("#0e140e");
    expect(tints.danger).toBe("#1f1416");
  });

  test("text ramp still has exactly seven numbered steps", () => {
    expect(text).toEqual(["#f4f6fb", "#dfe3ea", "#c8cdd6", "#9aa0ad", "#7b8290", "#5b616e", "#3f424d"]);
  });

  test("textDim lists the four off-ramp grays, brightest -> dimmest", () => {
    expect(textDim).toEqual(["#aab0bd", "#6b7180", "#4b505c", "#363943"]);
  });

  test("every color export is a lowercase 6-digit hex", () => {
    const hexes = [
      ...Object.values(surfaces),
      ...Object.values(borders),
      ...Object.values(tints),
      ...text,
      ...textDim,
    ];
    for (const hex of hexes) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
