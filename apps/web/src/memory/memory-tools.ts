import type { ToolDefinition } from "@mariozechner/pi-coding-agent";
import { type Static, type TSchema, Type } from "@sinclair/typebox";
import { MemoryError, type Node, type NodeId, type Store } from "balaur-memory";
import { PROPOSABLE_TYPES } from "./schema.ts";

/**
 * The agent's memory verbs — and ONLY the agent's (INTEGRATIONS.md Surface 1):
 * propose-shaped writes that queue behind the consent gate, and pure reads.
 * Owner verbs (decide, forget, updateNode, …) are never registered here; they
 * live behind the WS owner channel. "A consent gate with a wire-shaped hole
 * in it is not a consent gate."
 */

type ToolResult = { content: { type: "text"; text: string }[]; details: unknown };

const text = (t: string): ToolResult => ({ content: [{ type: "text", text: t }], details: undefined });
const json = (v: unknown): ToolResult => text(JSON.stringify(v));

/** Compact projection for tool results: content the model can use, no internals. */
const compact = (n: Node) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  body: n.body,
  status: n.status,
  when: n.when,
  importance: n.importance,
  useCount: n.useCount,
});

/** Build a ToolDefinition with typed params and the MemoryError guard: a
 * refused call is information for the model, not a crash. */
function tool<S extends TSchema>(def: {
  name: string;
  label: string;
  description: string;
  promptGuidelines?: string[];
  parameters: S;
  run: (params: Static<S>) => ToolResult;
}): ToolDefinition {
  return {
    name: def.name,
    label: def.label,
    description: def.description,
    ...(def.promptGuidelines !== undefined ? { promptGuidelines: def.promptGuidelines } : {}),
    parameters: def.parameters,
    execute: async (_toolCallId, params) => {
      try {
        return def.run(params as Static<S>);
      } catch (e) {
        if (e instanceof MemoryError) return text(`refused: ${e.message}`);
        throw e;
      }
    },
  } as ToolDefinition;
}

export interface MemoryToolOptions {
  /** Provenance stamped on every agent write (I10), e.g. "web-chat". */
  origin: string;
  /** Fired after any write-shaped call so the host can refresh the owner's queue UI. */
  onQueueChange?: () => void;
}

export function memoryTools(store: Store, opts: MemoryToolOptions): ToolDefinition[] {
  const { origin, onQueueChange } = opts;

  return [
    tool({
      name: "memory_propose",
      label: "Propose memory",
      description:
        "Propose a task, memory, or preference for the owner's long-term store. It enters a review queue; " +
        "the OWNER approves or rejects it — you cannot activate anything yourself.",
      promptGuidelines: [
        "Propose, never insist: a proposal waits for the owner's verdict.",
        "When the owner states a durable fact, task, or preference, propose it.",
      ],
      parameters: Type.Object({
        // Derived from the store's registered vocabulary (schema.ts) so the
        // tool can never offer a type the store would refuse.
        type: Type.Union(PROPOSABLE_TYPES.map((t) => Type.Literal(t))),
        title: Type.String({ description: "short, deduplicatable statement of the fact/task" }),
        body: Type.Optional(Type.String({ description: "detail/context" })),
        importance: Type.Optional(Type.Number({ minimum: 1, maximum: 5 })),
        when: Type.Optional(Type.String({ description: "scheduled moment, strict ISO-8601 UTC" })),
      }),
      run: (p) => {
        const out = store.propose({
          type: p.type,
          title: p.title,
          body: p.body ?? "",
          ...(p.importance !== undefined ? { importance: p.importance } : {}),
          ...(p.when !== undefined ? { when: p.when } : {}),
          origin,
        });
        onQueueChange?.();
        return text(`${out.kind}: ${out.node.id} (status: ${out.node.status})`);
      },
    }),

    tool({
      name: "memory_propose_edit",
      label: "Propose edit",
      description:
        "Propose a change to an existing ACTIVE memory (or its archival). The change is parked for the " +
        "owner's review — the approved content stays untouched until the owner applies it.",
      parameters: Type.Object({
        id: Type.String(),
        fields: Type.Optional(
          Type.Record(Type.String(), Type.String(), { description: "field → new value" }),
        ),
        archive: Type.Optional(Type.Boolean({ description: "propose archiving this node" })),
      }),
      run: (p) => {
        store.proposeEdit(p.id as NodeId, {
          ...(p.fields !== undefined ? { fields: p.fields } : {}),
          ...(p.archive !== undefined ? { archive: p.archive } : {}),
          origin,
        });
        onQueueChange?.();
        return text(`parked: edit to ${p.id} awaits the owner's review`);
      },
    }),

    tool({
      name: "memory_recall",
      label: "Recall",
      description:
        "Recall the owner's memories matching search terms. Returns active, surfaceable nodes only.",
      parameters: Type.Object({
        terms: Type.Array(Type.String(), { minItems: 1 }),
        type: Type.Optional(Type.String({ description: "restrict to one node type" })),
        limit: Type.Optional(Type.Number()),
      }),
      run: (p) =>
        json(
          store
            .recall(p.terms, {
              ...(p.type !== undefined ? { type: p.type } : {}),
              ...(p.limit !== undefined ? { limit: p.limit } : {}),
            })
            .map(compact),
        ),
    }),

    tool({
      name: "memory_search",
      label: "Search memory",
      description: "Cross-type search over all the owner's active, surfaceable knowledge.",
      parameters: Type.Object({
        terms: Type.Array(Type.String(), { minItems: 1 }),
        limit: Type.Optional(Type.Number()),
      }),
      run: (p) => json(store.search(p.terms, p.limit).map(compact)),
    }),

    tool({
      name: "memory_agenda",
      label: "Agenda",
      description:
        "The owner's scheduled window: nodes with a scheduled moment in [from, to), UTC, soonest first.",
      parameters: Type.Object({
        from: Type.String({ description: "ISO-8601 UTC inclusive" }),
        to: Type.String({ description: "ISO-8601 UTC exclusive" }),
        type: Type.Optional(Type.String()),
        limit: Type.Optional(Type.Number()),
      }),
      run: (p) =>
        json(
          store
            .agenda(p.from, p.to, {
              ...(p.type !== undefined ? { type: p.type } : {}),
              ...(p.limit !== undefined ? { limit: p.limit } : {}),
            })
            .map(compact),
        ),
    }),

    tool({
      name: "memory_episode",
      label: "Episode",
      description: "The lived past: what entered the owner's memory (by creation time) in [from, to), UTC.",
      parameters: Type.Object({
        from: Type.String({ description: "ISO-8601 UTC inclusive" }),
        to: Type.String({ description: "ISO-8601 UTC exclusive" }),
        type: Type.Optional(Type.String()),
        limit: Type.Optional(Type.Number()),
      }),
      run: (p) =>
        json(
          store
            .episode(p.from, p.to, {
              ...(p.type !== undefined ? { type: p.type } : {}),
              ...(p.limit !== undefined ? { limit: p.limit } : {}),
            })
            .map(compact),
        ),
    }),

    tool({
      name: "memory_who",
      label: "Resolve reference",
      description:
        "Resolve a name/reference to candidate nodes of a type. Returns CANDIDATES only — when ambiguous, " +
        "ask the owner which one they mean; never pick silently.",
      parameters: Type.Object({
        type: Type.String({ description: 'node type to search, e.g. "person"' }),
        text: Type.String({ description: "the reference as the owner said it" }),
      }),
      run: (p) => json({ candidates: store.resolveRef(p.type, p.text).map(compact) }),
    }),

    tool({
      name: "memory_context",
      label: "Entity context",
      description:
        "The bounded context card for one node: the node, its aliases, and its capped 1-hop peers.",
      parameters: Type.Object({
        id: Type.String(),
        limit: Type.Optional(Type.Number({ description: "max peers" })),
      }),
      run: (p) => {
        const ec = store.entityContext(p.id as NodeId, p.limit);
        return json({
          node: compact(ec.node),
          aliases: ec.aliases,
          peers: ec.peers.map((peer) => ({
            node: compact(peer.node),
            edges: peer.edges.map((e) => ({ type: e.type, source: e.source, target: e.target })),
          })),
        });
      },
    }),

    tool({
      name: "memory_touch",
      label: "Touch memory",
      description:
        "Record that a recalled memory was actually used in this conversation. Content-free; feeds ranking.",
      parameters: Type.Object({ id: Type.String() }),
      run: (p) => {
        store.touch(p.id as NodeId);
        return text(`touched: ${p.id}`);
      },
    }),

    tool({
      name: "memory_pending",
      label: "Pending queue (read-only)",
      description:
        "Read-only view of what awaits the owner's decision. You cannot decide anything — if the owner asks, " +
        "point them at the queue panel.",
      parameters: Type.Object({}),
      run: () =>
        json(
          store
            .pendingQueue()
            .map((p) =>
              p.kind === "identity"
                ? { kind: p.kind, a: p.a.id, b: p.b.id }
                : { kind: p.kind, id: p.node.id, type: p.node.type, title: p.node.title },
            ),
        ),
    }),
  ];
}
