import { type CSSProperties, type ReactNode, useRef } from "react";
import { useCollapse } from "../hooks/useCollapse";
import { useControllableState } from "../hooks/useControllableState";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface AccordionItem {
  /** Header label (rendered inside the toggle button). */
  title: ReactNode;
  /** Body content, revealed when the item is open. */
  content: ReactNode;
  /** Start expanded when uncontrolled. */
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Only one item open at a time (radio-style). Defaults to false (multi-open). */
  single?: boolean;
  /** Controlled set of open item indices. Omit for uncontrolled. */
  openIndices?: number[];
  onOpenChange?: (open: number[]) => void;
  style?: CSSProperties;
}

const EASE = "cubic-bezier(.5,0,.2,1)";

interface RowProps {
  item: AccordionItem;
  open: boolean;
  last: boolean;
  reduced: boolean;
  onToggle: () => void;
}

function AccordionRow({ item, open, last, reduced, onToggle }: RowProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useCollapse(bodyRef, open);

  return (
    <div
      style={{
        borderTop: "1px solid var(--bx-border, #1c1d24)",
        borderBottom: last ? "1px solid var(--bx-border, #1c1d24)" : undefined,
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          fontFamily: "inherit",
          fontSize: 13,
          padding: "15px 20px",
          background: "transparent",
          border: 0,
          color: open ? "var(--bx-text-1, #f4f6fb)" : "var(--bx-text-3, #c8cdd6)",
          cursor: "pointer",
          textAlign: "left",
          letterSpacing: "0.03em",
        }}
      >
        <span>{item.title}</span>
        <span
          aria-hidden="true"
          style={{
            color: "var(--bx-accent, #46c66d)",
            display: "inline-block",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: reduced ? "none" : `transform .26s ${EASE}`,
          }}
        >
          {"▸"}
        </span>
      </button>
      <div
        ref={bodyRef}
        style={{
          maxHeight: 0,
          overflow: "hidden",
          transition: reduced ? "none" : `max-height .28s ${EASE}`,
        }}
      >
        <div
          style={{
            padding: "0 20px 18px",
            color: "var(--bx-text-4, #9aa0ad)",
            fontSize: 13,
            lineHeight: 1.75,
            maxWidth: 520,
          }}
        >
          {item.content}
        </div>
      </div>
    </div>
  );
}

/**
 * A stack of collapsible disclosure items. Each header toggles its body via a
 * `max-height` transition (shared `useCollapse`) while the caret rotates 90deg.
 * By default several items may be open at once; pass `single` for radio-style
 * behaviour. Open state is controllable via `openIndices`/`onOpenChange`
 * (`useControllableState`); markup is static so it renders identically on the
 * server and the bodies size themselves after mount.
 */
export function Accordion({ items, single = false, openIndices, onOpenChange, style }: AccordionProps) {
  const initial = items.reduce<number[]>((acc, item, i) => (item.defaultOpen ? [...acc, i] : acc), []);
  const [open, setOpen] = useControllableState<number[]>(openIndices, initial, onOpenChange);
  const reduced = useReducedMotion();

  const toggle = (i: number) => {
    const isOpen = open.includes(i);
    if (single) {
      setOpen(isOpen ? [] : [i]);
    } else {
      setOpen(isOpen ? open.filter((x) => x !== i) : [...open, i]);
    }
  };

  return (
    <div style={style}>
      {items.map((item, i) => (
        <AccordionRow
          // biome-ignore lint/suspicious/noArrayIndexKey: items are a stable, ordered list
          key={i}
          item={item}
          open={open.includes(i)}
          last={i === items.length - 1}
          reduced={reduced}
          onToggle={() => toggle(i)}
        />
      ))}
    </div>
  );
}
