import type { ReactNode } from "react";

const MONO = "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)";

export interface CodeBlockProps {
  /** Language tag shown at the header's leading edge (e.g. "py", "ts"). */
  lang?: string;
  /** Filename shown near the header's trailing edge (e.g. "render.py"). */
  filename?: string;
  /**
   * Header action slot, rendered at the trailing edge — compose a `CopyButton`
   * here. Defaults to a static "copy" affordance; pass `null` to omit it.
   */
  action?: ReactNode;
  /** The code body. Pass pre-highlighted nodes or a plain string. */
  children?: ReactNode;
}

/** The reference's static copy affordance (⎘ copy); the wired CopyButton composes over this slot later. */
function StaticCopyButton() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "inherit",
        fontSize: 11,
        background: "transparent",
        border: 0,
        color: "#7b8290",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {"⎘ copy"}
    </button>
  );
}

/**
 * A terminal-aesthetic code shell: a bordered surface with a `lang · filename ·
 * action` header rule over a horizontally-scrolling `<pre>` body. Pure static
 * markup — syntax highlighting is supplied by the caller as coloured `<span>`s
 * in `children`, and the header `action` slot is where a `CopyButton` composes.
 */
export function CodeBlock({ lang, filename, action, children }: CodeBlockProps) {
  const trailing = action === undefined ? <StaticCopyButton /> : action;
  return (
    <div
      style={{
        border: "1px solid #23252e",
        background: "#08090c",
        minWidth: 0,
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 11px",
          borderBottom: "1px solid #1c1d24",
          fontSize: 11,
        }}
      >
        {lang != null && <span style={{ color: "#5b616e" }}>{lang}</span>}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {filename != null && <span style={{ color: "#3f424d" }}>{filename}</span>}
          {trailing}
        </div>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 12,
          fontSize: 12,
          lineHeight: 1.6,
          color: "#c8cdd6",
          whiteSpace: "pre",
          overflowX: "auto",
        }}
      >
        {children}
      </pre>
    </div>
  );
}
