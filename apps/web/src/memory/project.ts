import type { MemoryNode } from "@balaur/octant";
import type { Node } from "balaur-memory";

/** Project a library Node into OCTANT's JSON-safe MemoryNode. The UI package
 * carries no runtime dep on balaur-memory — the host maps (and keeps it dumb). */
export function toMemoryNode(n: Node, aliases?: readonly string[]): MemoryNode {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    status: n.status,
    surfacing: n.surfacing,
    importance: n.importance,
    when: n.when,
    created: n.created,
    updated: n.updated,
    useCount: n.useCount,
    origin: n.origin,
    author: n.author,
    ...(aliases !== undefined ? { aliases } : {}),
  };
}
