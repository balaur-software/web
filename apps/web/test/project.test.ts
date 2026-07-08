import { expect, test } from "bun:test";
import { toMemoryNode } from "../src/memory/project.ts";
import { testStore } from "./store-helper.ts";

test("toMemoryNode projects a library Node into OCTANT's MemoryNode", () => {
  const store = testStore();
  const out = store.propose({
    type: "memory",
    title: "Ana prefers tea",
    body: "mentioned over lunch",
    origin: "test",
  });
  const m = toMemoryNode(out.node);
  expect(m.id).toBe(out.node.id);
  expect(m.title).toBe("Ana prefers tea");
  expect(m.status).toBe("proposed");
  expect(m.when).toBeNull();
  expect(m.aliases).toBeUndefined(); // omitted, not undefined-valued (exactOptionalPropertyTypes)
  const withAliases = toMemoryNode(out.node, ["ana"]);
  expect(withAliases.aliases).toEqual(["ana"]);
  store.close();
});
