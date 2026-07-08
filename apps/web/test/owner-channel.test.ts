import { expect, test } from "bun:test";
import { decidePending, pendingProposals } from "../src/memory/owner-channel.ts";
import { testStore } from "./store-helper.ts";

test("pendingProposals projects proposal-kind items only", () => {
  const store = testStore();
  const a = store.propose({ type: "task", title: "buy stamps", body: "", origin: "t" });
  const b = store.propose({ type: "memory", title: "Ana prefers tea", body: "", origin: "t" });
  // park an edit too — it must NOT appear in the v1 proposals projection
  store.decide(b.node.id, { kind: "approve" });
  store.proposeEdit(b.node.id, { fields: { body: "green tea" }, origin: "t" });

  const items = pendingProposals(store);
  expect(items.map((i) => i.id)).toEqual([a.node.id]);
  expect(items[0]!.status).toBe("proposed");
  store.close();
});

test("decidePending approve activates; reject terminates; queue empties", () => {
  const store = testStore();
  const a = store.propose({ type: "task", title: "buy stamps", body: "", origin: "t" });
  const b = store.propose({ type: "task", title: "cancel gym", body: "", origin: "t" });

  expect(decidePending(store, a.node.id, "approve")).toEqual({ ok: true });
  expect(store.getNode(a.node.id).status).toBe("active");

  expect(decidePending(store, b.node.id, "reject")).toEqual({ ok: true });
  expect(store.getNode(b.node.id).status).toBe("rejected");

  expect(pendingProposals(store)).toHaveLength(0);
  store.close();
});

test("decidePending on a bogus id refuses without crashing", () => {
  const store = testStore();
  const r = decidePending(store, "no-such-id", "approve");
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.message.length).toBeGreaterThan(0);
  store.close();
});
