import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "balaur-memory";
import { memoryTools } from "../apps/web/src/memory/memory-tools.ts";
import { PROPOSABLE_TYPES, registerMemorySchema } from "../apps/web/src/memory/schema.ts";

// Regression: the web app opened a Store but never registered any node types,
// so every memory_propose failed with `node type "X" is not registered`. These
// tests pin the schema wiring end-to-end through the actual agent tool.

let dir: string;
let store: Store;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "balaur-web-schema-"));
  store = Store.open({ dir });
});

afterEach(() => {
  store.close();
  rmSync(dir, { recursive: true, force: true });
});

test("registerMemorySchema registers every proposable type as consent-gated", () => {
  registerMemorySchema(store);
  // Each proposable type accepts a proposal and lands it in the owner's queue.
  for (const type of PROPOSABLE_TYPES) {
    const out = store.propose({ type, title: `probe ${type}`, body: "", origin: "test" });
    expect(out.node.status).toBe("proposed");
  }
  expect(store.pendingQueue().length).toBe(PROPOSABLE_TYPES.length);
});

test("memory_propose succeeds for the type the owner hit (preference)", async () => {
  registerMemorySchema(store);
  const tools = memoryTools(store, { origin: "web-chat" });
  const propose = tools.find((t) => t.name === "memory_propose");
  expect(propose).toBeDefined();

  const result = await propose!.execute("call-1", {
    type: "preference",
    title: "Address the owner as Alex",
  });
  const out = result.content.map((c) => c.text).join("");
  // Previously: "refused: node type \"preference\" is not registered".
  expect(out).not.toContain("refused");
  expect(out).toContain("status: proposed");
  expect(store.pendingQueue().length).toBe(1);
});

test("without the schema, a propose is refused — proving the fix is load-bearing", () => {
  // No registerMemorySchema: the blank-schema store rejects the type.
  expect(() => store.propose({ type: "preference", title: "x", body: "", origin: "test" })).toThrow(
    /not registered/,
  );
});
