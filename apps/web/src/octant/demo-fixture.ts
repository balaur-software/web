import type { Agent, Block, ChatMessageData } from "@balaur/octant";

export const demoAgents: Record<string, Agent> = {
  relay: { id: "relay", name: "RELAY", accent: "#46c66d" },
  forge: { id: "forge", name: "FORGE", accent: "#2bd9d9" },
};

const agentText = (text: string, streaming = false): Block[] => [{ type: "text", text, streaming }];

export const demoMessages: ChatMessageData[] = [
  {
    id: "u1",
    role: "user",
    time: "09:41",
    blocks: agentText("Refactor the memory explorer to use the new graph layout."),
  },
  {
    id: "a1",
    role: "agent",
    agentId: "relay",
    time: "09:41",
    status: "complete",
    blocks: [
      { type: "reasoning", text: "Plan: extract the force-layout hook, then swap the renderer." },
      {
        type: "tool_call",
        id: "t1",
        name: "bash",
        args: { command: "wc -l packages/ui/src/organisms/MemoryGraph/MemoryGraph.tsx" },
        result: "312 packages/ui/src/organisms/MemoryGraph/MemoryGraph.tsx\n",
        status: "error",
        startedAt: 0,
        endedAt: 42,
      },
      {
        type: "text",
        text: "Read the graph renderer. The force loop lives inline — I'll lift it into `useForceLayout` and rewire the canvas:",
      },
      {
        type: "code",
        language: "typescript",
        code: "export function useForceLayout(nodes: Node[]) {\n  const ref = useRef<Sim | null>(null);\n  useEffect(() => {\n    ref.current = new Sim(nodes);\n    return () => ref.current?.stop();\n  }, [nodes]);\n  return ref;\n}",
      },
    ],
  },
  {
    id: "a2",
    role: "agent",
    agentId: "forge",
    time: "09:42",
    status: "complete",
    blocks: [{ type: "text", text: "Picking this up on the FORGE side — I'll add the layout hook tests." }],
  },
];

export const demoArtifacts: Block[] = [
  {
    type: "artifact",
    id: "art-1",
    title: "useForceLayout.ts",
    kind: "code",
    language: "typescript",
    content: "export function useForceLayout() {\n  // …extracted force-directed layout…\n}\n",
  },
];
