import type { MemoryNode } from "@balaur/octant";
import { type Decision, MemoryError, type NodeId, type Store } from "balaur-memory";
import { toMemoryNode } from "./project.ts";

/**
 * The OWNER's verbs, server-side only. These are called from the WS message
 * handlers in server.tsx — never from an agent tool. The agent channel must
 * not be able to reach decide (INTEGRATIONS.md: owner verbs stay behind the
 * human).
 */

/** Proposal-kind queue items projected for the PendingQueue organism.
 * v1 scope: proposals only — parked edits and identity questions come later. */
export function pendingProposals(store: Store): MemoryNode[] {
  return store.pendingQueue().flatMap((p) => (p.kind === "proposal" ? [toMemoryNode(p.node)] : []));
}

export type DecideResult = { ok: true } | { ok: false; message: string };

/** Route the owner's verdict to the Store. approve/reject only in v1 —
 * supersede needs a target picker, archive has no direct Decision kind. */
export function decidePending(store: Store, id: string, kind: "approve" | "reject"): DecideResult {
  const decision: Decision = kind === "approve" ? { kind: "approve" } : { kind: "reject" };
  try {
    store.decide(id as NodeId, decision);
    return { ok: true };
  } catch (e) {
    if (e instanceof MemoryError) return { ok: false, message: e.message };
    throw e;
  }
}
