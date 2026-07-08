import { expect, test } from "bun:test";
import type { NodeId } from "balaur-memory";
import { memoryTools } from "../src/memory/memory-tools.ts";
import { testStore } from "./store-helper.ts";

/** Drive a tool the way pi would (params validated upstream by the SDK). */
async function call(tools: ReturnType<typeof memoryTools>, name: string, params: unknown): Promise<string> {
  const tool = tools.find((t) => t.name === name);
  if (!tool) throw new Error(`tool not registered: ${name}`);
  const result = await tool.execute("test-call", params as never, undefined, undefined, undefined as never);
  const first = result.content[0];
  return first && first.type === "text" ? first.text : "";
}

test("the tool surface is exactly the 10 agent verbs — no owner verbs", () => {
  const names = memoryTools(testStore(), { origin: "test" })
    .map((t) => t.name)
    .sort();
  expect(names).toEqual([
    "memory_agenda",
    "memory_context",
    "memory_episode",
    "memory_pending",
    "memory_propose",
    "memory_propose_edit",
    "memory_recall",
    "memory_search",
    "memory_touch",
    "memory_who",
  ]);
  for (const n of names) {
    expect(n).not.toMatch(/decide|forget|update|transition|create|register|backup|quarantine|vector|link/);
  }
});

test("memory_propose queues a node and reports the outcome kind", async () => {
  const store = testStore();
  let queueChanges = 0;
  const tools = memoryTools(store, { origin: "test-origin", onQueueChange: () => queueChanges++ });

  const reply = await call(tools, "memory_propose", { type: "task", title: "buy stamps" });
  expect(reply).toContain("created");
  expect(queueChanges).toBe(1);

  const queue = store.pendingQueue();
  expect(queue).toHaveLength(1);
  const item = queue[0]!;
  if (item.kind !== "proposal") throw new Error("expected a proposal");
  expect(item.node.title).toBe("buy stamps");
  expect(item.node.origin).toBe("test-origin");
  expect(item.node.status).toBe("proposed");

  // dedup: same normalized title merges into the pending item
  const again = await call(tools, "memory_propose", { type: "task", title: "buy stamps" });
  expect(again).toContain("merged_pending");
  expect(store.pendingQueue()).toHaveLength(1);
  store.close();
});

test("memory_propose against an unregistered type is a refusal, not a crash", async () => {
  const store = testStore();
  const tools = memoryTools(store, { origin: "test" });
  const reply = await call(tools, "memory_propose", { type: "journal", title: "x" });
  expect(reply).toStartWith("refused:");
  store.close();
});

test("memory_propose_edit parks an edit on an active node — content untouched", async () => {
  const store = testStore();
  const tools = memoryTools(store, { origin: "test" });
  const out = store.propose({ type: "memory", title: "Ana prefers tea", body: "", origin: "seed" });
  const active = store.decide(out.node.id, { kind: "approve" });
  expect(active.status).toBe("active");

  const reply = await call(tools, "memory_propose_edit", {
    id: active.id,
    fields: { body: "she said green tea specifically" },
  });
  expect(reply).toContain("parked");
  expect(store.getNode(active.id).body).toBe(""); // not applied
  expect(store.pendingQueue().some((p) => p.kind === "edit" && p.node.id === active.id)).toBe(true);
  store.close();
});

test("memory_touch records use on an active node", async () => {
  const store = testStore();
  const tools = memoryTools(store, { origin: "test" });
  const out = store.propose({ type: "memory", title: "Ana prefers tea", body: "", origin: "seed" });
  store.decide(out.node.id, { kind: "approve" });

  const reply = await call(tools, "memory_touch", { id: out.node.id });
  expect(reply).toContain("touched");
  expect(store.getNode(out.node.id as NodeId).useCount).toBe(1);
  store.close();
});
