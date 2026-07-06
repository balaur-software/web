import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from "react";
import { useCollapse } from "../hooks/useCollapse";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface TreeNode {
  /** Row label. */
  label: string;
  /** Child nodes. Their presence marks this node as a folder. */
  children?: TreeNode[];
  /** Leading glyph. Folders default to ■; files default to a quadrant block. */
  glyph?: string;
  /** Start collapsed (folders only). Defaults to expanded. */
  defaultCollapsed?: boolean;
}

export interface TreeProps {
  /** The top-level nodes. Nest via each node's `children`. */
  nodes: TreeNode[];
  style?: CSSProperties;
}

const EASE = "cubic-bezier(.5,0,.2,1)";
const INDENT = 18;
const HOVER = "#0f1014";

/** Files sit 8px further in than a folder at the same depth (the caret's width). */
function padLeft(depth: number, folder: boolean): number {
  return 10 + depth * INDENT + (folder ? 0 : 8);
}

const rowBase: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 8px",
};

function FileRow({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <div
      role="treeitem"
      style={{
        ...rowBase,
        paddingLeft: padLeft(depth, false),
        color: "var(--bx-text-4, #9aa0ad)",
      }}
    >
      <span aria-hidden="true" style={{ color: "#5b616e" }}>
        {node.glyph ?? "▞"}
      </span>
      <span>{node.label}</span>
    </div>
  );
}

function TreeFolder({ node, depth, reduced }: { node: TreeNode; depth: number; reduced: boolean }) {
  const [open, setOpen] = useState(!node.defaultCollapsed);
  const bodyRef = useRef<HTMLDivElement>(null);
  useCollapse(bodyRef, open);

  // While closed/open, `useCollapse` pins max-height to a pixel value. Once an
  // open panel finishes animating we release it to `none` so nested folders can
  // grow/shrink without being clipped by an ancestor's stale measured height.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (reduced) el.style.maxHeight = open ? "none" : "0px";
  }, [open, reduced]);

  const toggle = () => {
    const el = bodyRef.current;
    // Closing from a released `none` height: re-pin to px first so it animates.
    if (open && el && !reduced) {
      el.style.maxHeight = `${el.scrollHeight}px`;
      void el.offsetHeight; // force reflow
    }
    setOpen((o) => !o);
  };

  const hover = (bg: string) => (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.background = bg;
  };

  return (
    <>
      <div
        role="treeitem"
        aria-expanded={open}
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        onPointerEnter={hover(HOVER)}
        onPointerLeave={hover("transparent")}
        style={{
          ...rowBase,
          paddingLeft: padLeft(depth, true),
          cursor: "pointer",
          color: "var(--bx-text-3, #c8cdd6)",
          outline: "none",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            color: "var(--bx-accent, #46c66d)",
            display: "inline-block",
            fontSize: 11,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: reduced ? "none" : `transform .2s ${EASE}`,
          }}
        >
          ▸
        </span>
        <span aria-hidden="true" style={{ color: "var(--bx-accent, #46c66d)" }}>
          {node.glyph ?? "■"}
        </span>
        <span>{node.label}</span>
      </div>
      <div
        ref={bodyRef}
        role="group"
        onTransitionEnd={(e) => {
          // Ignore transitions bubbling up from descendant folders/carets.
          if (e.target !== e.currentTarget) return;
          if (open && bodyRef.current) bodyRef.current.style.maxHeight = "none";
        }}
        style={{
          maxHeight: 0,
          overflow: "hidden",
          transition: reduced ? "none" : `max-height .26s ${EASE}`,
        }}
      >
        <TreeNodes nodes={node.children ?? []} depth={depth + 1} reduced={reduced} />
      </div>
    </>
  );
}

function TreeNodes({ nodes, depth, reduced }: { nodes: TreeNode[]; depth: number; reduced: boolean }) {
  return (
    <>
      {nodes.map((node, i) =>
        node.children ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: tree nodes are a stable, ordered list
          <TreeFolder key={i} node={node} depth={depth} reduced={reduced} />
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: tree nodes are a stable, ordered list
          <FileRow key={i} node={node} depth={depth} />
        ),
      )}
    </>
  );
}

/**
 * A collapsible file tree. Folders (nodes with `children`) toggle their subtree
 * on click, rotating a caret 90deg and animating the group open via the shared
 * `useCollapse` max-height transition. Depth drives indentation. Markup is
 * static so it renders on the server; the disclosure animation runs after mount.
 */
export function Tree({ nodes, style }: TreeProps) {
  const reduced = useReducedMotion();
  return (
    <div
      role="tree"
      style={{
        fontSize: 13,
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
        ...style,
      }}
    >
      <TreeNodes nodes={nodes} depth={0} reduced={reduced} />
    </div>
  );
}
