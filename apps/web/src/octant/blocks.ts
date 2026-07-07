import type { Block } from "@balaur/octant";

const FENCE = /```([\w+-]*)\r?\n([\s\S]*?)```/g;

/**
 * Split a raw agent text string into OCTANT content blocks: prose becomes
 * `text` blocks, fenced ```code``` becomes `code` blocks (rendered by OCTANT's
 * `CodeBlock`). This is our bridge from the agent's markdown-ish output to the
 * design system, which has no full markdown renderer by design.
 *
 * While a message is still streaming we skip the split (a half-typed fence
 * would flicker) and emit a single streaming `text` block so the
 * `StreamingCursor` sits at the end.
 */
export function splitTextBlocks(text: string, streaming = false): Block[] {
  if (streaming) return [{ type: "text", text, streaming: true }];

  const blocks: Block[] = [];
  let last = 0;
  FENCE.lastIndex = 0;
  let m = FENCE.exec(text);
  while (m !== null) {
    const before = text.slice(last, m.index).trim();
    if (before) blocks.push({ type: "text", text: before });

    const lang = m[1] || undefined;
    const code = (m[2] ?? "").replace(/\n$/, "");
    blocks.push({ type: "code", ...(lang ? { language: lang } : {}), code });

    last = m.index + m[0].length;
    m = FENCE.exec(text);
  }

  const rest = text.slice(last).trim();
  if (rest) blocks.push({ type: "text", text: rest });
  if (blocks.length === 0) blocks.push({ type: "text", text });
  return blocks;
}
