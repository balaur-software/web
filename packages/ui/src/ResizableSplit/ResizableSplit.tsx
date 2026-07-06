import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useControllableState } from "../hooks/useControllableState";

export interface ResizableSplitProps {
  /** Content of the left panel. */
  left?: ReactNode;
  /** Content of the right panel. */
  right?: ReactNode;
  /** Controlled left-panel width, in percent (0–100). Omit for uncontrolled. */
  split?: number;
  /** Uncontrolled initial left-panel width, in percent. */
  defaultSplit?: number;
  /** Called with the new left-panel percentage as the divider is dragged. */
  onSplitChange?: (pct: number) => void;
  /** Lower bound for the split, in percent. */
  min?: number;
  /** Upper bound for the split, in percent. */
  max?: number;
  /** Row height (number = px). */
  height?: number | string;
  style?: CSSProperties;
}

const defaultLeft = (
  <>
    <div style={{ color: "var(--bx-accent, #46c66d)", fontSize: 11, letterSpacing: "0.1em", marginBottom: 10 }}>
      INSPECTOR
    </div>
    <div style={{ color: "var(--bx-text-3, #7b8290)", fontSize: 12, lineHeight: 1.7 }}>
      Cell 04,12
      <br />
      mask 0xB6
      <br />
      lit 5 / 8
      <br />
      luminance 0.71
    </div>
  </>
);

const defaultRight = (
  <>
    <div style={{ color: "var(--bx-border-cyan, #2bd9d9)", fontSize: 11, letterSpacing: "0.1em", marginBottom: 10 }}>
      PREVIEW
    </div>
    <div style={{ color: "var(--bx-text-3, #7b8290)", fontSize: 12, lineHeight: 1.7 }}>
      The two panels share this row. Drag the divider to rebalance — bounded to {"18–82%"}.
    </div>
  </>
);

/**
 * Two panels separated by a draggable vertical divider. The handle uses pointer
 * capture so the drag keeps tracking outside the element; the split percentage is
 * clamped to [min, max] and flows through `useControllableState` so it can be
 * controlled or left uncontrolled. Arrow keys nudge the divider when focused.
 */
export function ResizableSplit({
  left = defaultLeft,
  right = defaultRight,
  split,
  defaultSplit = 42,
  onSplitChange,
  min = 18,
  max = 82,
  height = 200,
  style,
}: ResizableSplitProps) {
  const [pct, setPct] = useControllableState(split, defaultSplit, onSplitChange);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      setPct(clamp(((e.clientX - r.left) / r.width) * 100));
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, min, max]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(true);
    try {
      handleRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture unsupported */
    }
    e.preventDefault();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPct(clamp(pct - 2));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPct(clamp(pct + 2));
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        height,
        border: "1px solid var(--bx-border, #1c1d24)",
        overflow: "hidden",
        background: "var(--bx-bg, #0a0b0e)",
        ...style,
      }}
    >
      <div style={{ flex: `0 0 ${pct}%`, minWidth: 0, padding: 16, overflow: "hidden" }}>{left}</div>
      <div
        ref={handleRef}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        style={{
          width: 7,
          flex: "none",
          background: dragging ? "var(--bx-accent, #46c66d)" : "var(--bx-border, #1c1d24)",
          cursor: "col-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--bx-text-4, #5b616e)",
          fontSize: 11,
          userSelect: "none",
          touchAction: "none",
          outline: "none",
        }}
      >
        {"⋮"}
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: 16, overflow: "hidden" }}>{right}</div>
    </div>
  );
}
