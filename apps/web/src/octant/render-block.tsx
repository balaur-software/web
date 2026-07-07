import { type Block, CodeBlock } from "@balaur/octant";
import hljs from "highlight.js/lib/common";
import type { ReactNode } from "react";

/**
 * Syntax-highlight a `code` block into OCTANT's `CodeBlock` shell. Highlighting
 * (and the highlight.js dependency) lives here in the app, not in the design
 * system — OCTANT's `CodeBlock` takes caller-supplied coloured spans by
 * contract. Wire it into `ChatPanel` via the `renderBlock` prop; every other
 * block type falls through to OCTANT's default `BlockRenderer` (return null).
 */
export function renderBlock(block: Block): ReactNode {
  if (block.type !== "code") return null;
  const lang = block.language && hljs.getLanguage(block.language) ? block.language : undefined;
  const html = lang
    ? hljs.highlight(block.code, { language: lang }).value
    : hljs.highlightAuto(block.code).value;
  return (
    <CodeBlock {...(block.language ? { lang: block.language } : {})}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: highlight.js output over trusted agent code */}
      <span className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
    </CodeBlock>
  );
}
