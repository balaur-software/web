import { type CSSProperties, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/**
 * Compute the visible pager items (page numbers + ellipsis gaps) for a given
 * total `count` and active `page`. Mirrors the MUI usePagination layout: the
 * boundary pages are always shown, the active page keeps `siblingCount`
 * neighbours, and gaps collapse into an ellipsis. With the reference defaults
 * (count 24, page 3) this yields `1 2 3 4 5 … 24`.
 */
function pageItems(count: number, page: number, siblingCount: number, boundaryCount: number): PageItem[] {
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? (endPages[0] as number) - 2 : count - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (["ellipsis-start"] as const)
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (["ellipsis-end"] as const)
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ];
}

const BORDER = "var(--bx-border, #1c1d24)";
const BORDER_HOVER = "var(--bx-border-accent, #2a3320)";
const ACCENT = "var(--bx-accent, #46c66d)";
const TEXT = "var(--bx-text-4, #9aa0ad)";
const BG = "var(--bx-bg, #08080a)";
const MUTE = "#3f424d";

const baseBtn: CSSProperties = {
  fontFamily: "inherit",
  fontSize: 13,
  height: 32,
  background: "transparent",
  border: `1px solid ${BORDER}`,
  color: TEXT,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export interface PagerProps {
  /** Total number of pages. */
  count: number;
  /** Controlled active page (1-indexed). Omit for uncontrolled (use `defaultPage`). */
  page?: number;
  /** Initial active page when uncontrolled (1-indexed). */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages kept on each side of the active page. */
  siblingCount?: number;
  /** Pages always shown at the start/end. */
  boundaryCount?: number;
  style?: CSSProperties;
}

/**
 * Terminal-styled pagination: a row of octant-bordered page buttons flanked by
 * prev/next chevrons, with ellipsis gaps. The active page lights up in the
 * accent colour; hovering an inactive cell warms its border. Active-page state
 * flows through `useControllableState`, so the control can be driven or left to
 * manage itself. Rendering is declarative — no imperative glyph fill — so it is
 * server-safe as-is.
 */
export function Pager({
  count,
  page,
  defaultPage = 1,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  style,
}: PagerProps) {
  const [current, setCurrent] = useControllableState(page, defaultPage, onPageChange);
  const [hovered, setHovered] = useState<number | "prev" | "next" | null>(null);

  const go = (n: number) => {
    const clamped = Math.min(Math.max(n, 1), count);
    if (clamped !== current) setCurrent(clamped);
  };

  const items = pageItems(count, current, siblingCount, boundaryCount);
  const atStart = current <= 1;
  const atEnd = current >= count;

  const arrowBtn = (kind: "prev" | "next", disabled: boolean): CSSProperties => ({
    ...baseBtn,
    width: 32,
    borderColor: hovered === kind && !disabled ? BORDER_HOVER : BORDER,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
  });

  return (
    <div
      data-pager=""
      role="navigation"
      aria-label="Pagination"
      style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", ...style }}
    >
      <button
        type="button"
        data-page-prev=""
        aria-label="Previous page"
        disabled={atStart}
        onClick={() => go(current - 1)}
        onPointerEnter={() => setHovered("prev")}
        onPointerLeave={() => setHovered(null)}
        style={arrowBtn("prev", atStart)}
      >
        {"‹"}
      </button>

      {items.map((item, i) => {
        if (typeof item !== "number") {
          return (
            <span key={item + i} aria-hidden style={{ color: MUTE, padding: "0 4px" }}>
              {"…"}
            </span>
          );
        }
        const on = item === current;
        const isHover = hovered === item;
        return (
          <button
            key={item}
            type="button"
            data-page=""
            aria-label={`Page ${item}`}
            aria-current={on ? "page" : undefined}
            onClick={() => go(item)}
            onPointerEnter={() => setHovered(item)}
            onPointerLeave={() => setHovered(null)}
            style={{
              ...baseBtn,
              minWidth: 32,
              background: on ? ACCENT : "transparent",
              color: on ? BG : TEXT,
              borderColor: on ? ACCENT : isHover ? BORDER_HOVER : BORDER,
            }}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        data-page-next=""
        aria-label="Next page"
        disabled={atEnd}
        onClick={() => go(current + 1)}
        onPointerEnter={() => setHovered("next")}
        onPointerLeave={() => setHovered(null)}
        style={arrowBtn("next", atEnd)}
      >
        {"›"}
      </button>
    </div>
  );
}
