import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScramble } from "../hooks/useScramble";

/** A single event kind on the feed: a rail glyph, its color, a title and a detail line. */
export interface TimelineEvent {
  /** Rail glyph (e.g. "✓", "▛", "▲"). */
  glyph: string;
  /** Glyph color — any CSS color. */
  color: string;
  /** The scrambled/deserialized headline. */
  title: string;
  /** The muted sub-line beneath the title. */
  detail: string;
}

const DEFAULT_EVENTS: readonly TimelineEvent[] = [
  { glyph: "✓", color: "#74e692", title: "Buffer committed", detail: "render pass 4.1ms" },
  { glyph: "▛", color: "#2bd9d9", title: "Glyph cache warmed", detail: "256 states mapped" },
  { glyph: "▲", color: "#ffe08a", title: "Frame budget at 92%", detail: "dither resolution lowered" },
  { glyph: "█", color: "#46c66d", title: "Node OCTANT-01 online", detail: "handshake ok · grid-west" },
  { glyph: "▓", color: "#ff6b6f", title: "SINK-03 glyph fault", detail: "canvas fallback engaged" },
];

interface Entry {
  id: number;
  event: TimelineEvent;
  ts: string;
  /** Newly-streamed entries deserialize out of noise and fade in; seeded ones don't. */
  scramble: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/** One rail row. Owns its own title ref so the decode animation is per-entry. */
function TimelineEntry({ entry }: { entry: Entry }) {
  const titleRef = useRef<HTMLSpanElement>(null);
  useScramble(titleRef, entry.event.title, { dur: 420, active: entry.scramble });

  const [shown, setShown] = useState(!entry.scramble);
  useEffect(() => {
    if (!entry.scramble) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [entry.scramble]);

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        position: "relative",
        padding: "0 0 20px 0",
        opacity: shown ? 1 : 0,
        transition: entry.scramble ? "opacity .3s ease" : undefined,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: 16 }}>
        <span style={{ color: entry.event.color, fontSize: 13, lineHeight: 1 }}>{entry.event.glyph}</span>
        <span style={{ flex: 1, width: 1, background: "var(--bx-border, #1c1d24)", marginTop: 6 }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
          {/* scramble entries populate imperatively after mount; seeded ones render their text */}
          <span ref={titleRef} style={{ color: "#c8cdd6", fontSize: 13 }}>
            {entry.scramble ? "" : entry.event.title}
          </span>
          <span style={{ color: "#3f424d", fontSize: 11 }}>{entry.ts}</span>
        </div>
        <div style={{ color: "#5b616e", fontSize: 12, marginTop: 4 }}>{entry.event.detail}</div>
      </div>
    </div>
  );
}

export interface TimelineProps {
  /** The pool of event kinds the feed streams from. */
  events?: readonly TimelineEvent[];
  /** Max entries kept before the oldest is composted. Default 6. */
  max?: number;
  /** ms between new entries pushing in. Default 5200. */
  interval?: number;
  style?: CSSProperties;
}

/**
 * An activity feed on a vertical rail (section §25). Seeded with a few recent
 * entries after mount, then every few seconds a new entry pushes in at the top
 * and deserializes out of noise; the feed caps and composts the oldest. The
 * insert interval pauses while offscreen or under reduced-motion, mirroring the
 * reference's `vis()`/`reduced` gate, and is cleaned up on unmount.
 */
export function Timeline({ events = DEFAULT_EVENTS, max = 6, interval = 5200, style }: TimelineProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const inView = useInView(listRef);
  const reduced = useReducedMotion();
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  // Seed the feed on the client so timestamps never mismatch the server render.
  useEffect(() => {
    const now = Date.now();
    setEntries(
      events.slice(0, max).map((event, i) => ({
        id: idRef.current++,
        event,
        ts: fmt(new Date(now - i * 47000)),
        scramble: false,
      })),
    );
  }, [events, max]);

  // Stream new entries; the callback reads visibility/motion from refs so the
  // timer isn't torn down and rebuilt on every intersection change.
  useEffect(() => {
    const iv = setInterval(() => {
      if (!inViewRef.current || reducedRef.current) return;
      const event = events[(Math.random() * events.length) | 0];
      if (!event) return;
      const next: Entry = { id: idRef.current++, event, ts: fmt(new Date()), scramble: true };
      setEntries((prev) => [next, ...prev].slice(0, max));
    }, interval);
    return () => clearInterval(iv);
  }, [events, max, interval]);

  return (
    <div style={{ border: "1px solid var(--bx-border, #1c1d24)", background: "var(--bx-surface-3, #0c0d11)", padding: 22, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em" }}>EVENT FEED</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 11,
            padding: "3px 9px",
            border: "1px solid var(--bx-border-accent, #2a3320)",
            color: "var(--bx-accent-bright, #74e692)",
            letterSpacing: "0.06em",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              background: "var(--bx-accent, #46c66d)",
              display: "inline-block",
              animation: "bx-blink 1.4s steps(1) infinite",
            }}
          />
          LIVE
        </span>
      </div>
      <div ref={listRef}>
        {entries.map((entry) => (
          <TimelineEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
