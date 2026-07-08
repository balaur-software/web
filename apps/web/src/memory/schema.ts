import type { Store } from "balaur-memory";

/**
 * The node types the web-chat agent may propose — the store's vocabulary.
 *
 * balaur-memory ships NO built-in node types: a freshly opened Store is a blank
 * schema, and `store.propose({ type })` refuses any unregistered type with
 * `node type "X" is not registered`. Registering here at boot is what makes the
 * memory tools actually work; without it every `memory_propose` fails.
 *
 * All three are born `proposed` so an agent write routes through the owner's
 * consent gate (SCHEMA.md I1): `memory_propose` → pending queue → owner
 * approves/rejects. `store.propose()` REQUIRES a `proposed`-born type
 * (`requireGatedType`) — an `active`-born type is owner-authored and would be
 * refused by the propose surface.
 *
 * This list is the single source of truth: the `memory_propose` parameter union
 * is derived from it (see memory-tools.ts) so the tool can never offer a type
 * the store has not registered — the exact drift that broke the first agent
 * write.
 */
export const PROPOSABLE_TYPES = ["task", "memory", "preference"] as const;

export type ProposableType = (typeof PROPOSABLE_TYPES)[number];

/**
 * Register the agent-proposable vocabulary on `store`. Idempotent — the store's
 * `registerType` upserts (`ON CONFLICT DO UPDATE`) — so calling it on every boot
 * is safe. Born-status never flips here, so it never trips the "type in use"
 * guard.
 */
export function registerMemorySchema(store: Store): void {
  for (const name of PROPOSABLE_TYPES) {
    store.registerType({ name, bornStatus: "proposed" });
  }
}
