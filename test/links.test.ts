import { expect, test } from "bun:test";
import { Store } from "balaur-memory";
import { bar8 } from "@balaur/octant-core";
import { PALETTE } from "@balaur/tokens";
import { FillButton } from "@balaur/ui";

test("linked external deps resolve through bun link", () => {
  expect(typeof Store).toBe("function");
  expect(typeof Store.open).toBe("function");
  expect(typeof bar8).toBe("function");
  expect(PALETTE).toBeDefined();
  expect(typeof FillButton).toBe("function");
});
