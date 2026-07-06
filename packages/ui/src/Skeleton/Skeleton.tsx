import { type CSSProperties, useEffect, useRef } from "react";
import { measureCell } from "../hooks/useCellMetrics";
import { useInView } from "../hooks/useInView";
import { useRafLoop } from "../hooks/useRafLoop";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Distance from the shimmer band → glyph, densest at the crest (the reference's `d<1?█…` ramp). */
function shimmerChar(d: number): string {
  return d < 1 ? "█" : d < 2.3 ? "▓" : d < 3.8 ? "▒" : "░";
}

const asWidth = (w: string | number) => (typeof w === "number" ? `${w}px` : w);

export interface SkeletonProps {
  /** Header label inside the card. Pass `null` to hide it. Default `"SKELETON · loading"`. */
  label?: string | null;
  /** Show the leading square avatar block. Default `true`. */
  avatar?: boolean;
  /** Avatar square size in px. Default `46`. */
  avatarSize?: number;
  /** Widths of the placeholder rows beside the avatar. Default `["100%", "78%", "54%"]`. */
  lines?: readonly (string | number)[];
  /** Widths of the full-width rows stacked below the avatar row. Default `["100%", "88%"]`. */
  footerLines?: readonly (string | number)[];
  /** Height of each placeholder row in px. Default `11`. */
  lineHeight?: number;
  /** Gap between stacked rows in px. Default `9`. */
  gap?: number;
  /** Colour of the shimmer glyphs. Default `#363943`. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A loading placeholder whose bars are filled with octant shade glyphs while a
 * bright band sweeps across each row, staggered per line (the reference's
 * `initSkeleton`). Each row is measured with {@link measureCell} to pick a
 * column/row count for its box, and the rAF loop is gated by {@link useInView}
 * (pauses offscreen) and {@link useReducedMotion} (pins one static frame). The
 * bars render empty on the server and populate imperatively after mount, so
 * there's no hydration mismatch.
 */
export function Skeleton({
  label = "SKELETON · loading",
  avatar = true,
  avatarSize = 46,
  lines = ["100%", "78%", "54%"],
  footerLines = ["100%", "88%"],
  lineHeight = 11,
  gap = 9,
  color = "#363943",
  className,
  style,
}: SkeletonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const preRefs = useRef<(HTMLPreElement | null)[]>([]);
  const metaRef = useRef<{ cols: number; rows: number }[]>([]);
  const inView = useInView(rootRef);
  const reduced = useReducedMotion();

  const baseIndex = avatar ? 1 : 0;
  const footerBase = baseIndex + lines.length;
  const linesKey = lines.join("|");
  const footerKey = footerLines.join("|");

  const setPre = (idx: number) => (el: HTMLPreElement | null) => {
    preRefs.current[idx] = el;
  };

  const preStyle = (fill: boolean): CSSProperties => ({
    margin: 0,
    fontSize: 8,
    lineHeight: 1,
    color,
    whiteSpace: "pre",
    letterSpacing: 0,
    width: "100%",
    ...(fill ? { height: "100%" } : null),
  });

  // Paint one frame: for every measured row, sweep a band and fill it with shade glyphs.
  const paint = (t: number) => {
    const metas = metaRef.current;
    preRefs.current.forEach((el, i) => {
      if (!el || !el.isConnected) return;
      const meta = metas[i] ?? { cols: 20, rows: 1 };
      const off = i * 2.3;
      const span = meta.cols + 12;
      const band = (((t * 16 + off) % span) + span) % span - 6;
      let line = "";
      for (let c = 0; c < meta.cols; c++) line += shimmerChar(Math.abs(c - band));
      el.textContent = new Array(meta.rows).fill(line).join("\n");
    });
  };

  // Measure each row's box into a column/row count; keep it fresh across resize + late layout.
  useEffect(() => {
    const measure = () => {
      const pres = preRefs.current;
      const first = pres.find((el): el is HTMLPreElement => !!el);
      if (!first) return;
      const { cw, ch } = measureCell(first);
      pres.forEach((el, i) => {
        if (!el || !el.isConnected) return;
        const r = el.getBoundingClientRect();
        if (r.width < 2) return;
        metaRef.current[i] = {
          cols: Math.max(4, Math.floor(r.width / cw)),
          rows: Math.max(1, Math.round(r.height / ch)),
        };
      });
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    for (const el of preRefs.current) if (el) ro.observe(el);
    // Retry until layout settles (the reference's `ensure` loop).
    let tries = 0;
    let raf = requestAnimationFrame(function ensure() {
      measure();
      if (tries++ < 60 && preRefs.current.some((el) => el && el.getBoundingClientRect().width < 2)) {
        raf = requestAnimationFrame(ensure);
      }
    });
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [avatar, avatarSize, lineHeight, linesKey, footerKey]);

  useRafLoop(paint, inView && !reduced);

  // Under reduced motion the rAF loop never runs; paint a single resting frame.
  useEffect(() => {
    if (reduced) paint(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, avatar, avatarSize, lineHeight, linesKey, footerKey]);

  const boxStyle = (w: string | number): CSSProperties => ({
    height: lineHeight,
    width: asWidth(w),
    border: "1px solid #131419",
    overflow: "hidden",
  });

  return (
    <div
      ref={rootRef}
      className={className}
      role="status"
      aria-busy="true"
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 22,
        minWidth: 0,
        ...style,
      }}
    >
      {label !== null && (
        <div style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em", marginBottom: 20 }}>{label}</div>
      )}

      {(avatar || lines.length > 0) && (
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            marginBottom: footerLines.length > 0 ? 20 : 0,
          }}
        >
          {avatar && (
            <div
              style={{
                width: avatarSize,
                height: avatarSize,
                flex: "none",
                border: "1px solid #15161e",
                overflow: "hidden",
              }}
            >
              <pre ref={setPre(0)} aria-hidden="true" style={preStyle(true)} />
            </div>
          )}
          {lines.length > 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap, minWidth: 0 }}>
              {lines.map((w, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional row list
                <div key={`l${i}`} style={boxStyle(w)}>
                  <pre ref={setPre(baseIndex + i)} aria-hidden="true" style={preStyle(false)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {footerLines.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          {footerLines.map((w, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional row list
            <div key={`f${i}`} style={boxStyle(w)}>
              <pre ref={setPre(footerBase + i)} aria-hidden="true" style={preStyle(false)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
