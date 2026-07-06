import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { FillButton } from "../FillButton/FillButton.tsx";
import { useScramble } from "../hooks/useScramble";

/** Log severity levels: [label, colour]. */
const LV: ReadonlyArray<readonly [string, string]> = [
  ["INFO", "#6ff2f2"],
  ["OK", "#74e692"],
  ["WARN", "#ffe08a"],
  ["ERR", "#ff6b6f"],
];

/** Default pool of synthetic telemetry messages that stream into the log. */
const MSGS: readonly string[] = [
  "cell buffer committed",
  "cursor entered field",
  "dither pass complete",
  "glyph cache warmed",
  "octant range check ok",
  "frame budget 4.1ms",
  "palette resolved 16/16",
  "sub-pixel mask updated",
  "ring sampler ticked",
  "noise seed rerolled",
  "viewport reflowed",
  "bayer matrix loaded",
];

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
const pick = (arr: readonly string[]) => arr[(Math.random() * arr.length) | 0] ?? "";

interface LogEntry {
  id: number;
  ts: string;
  level: string;
  color: string;
  msg: string;
  scram: boolean;
}

/** One log row. Scrambled entries render empty and decode in place via `useScramble`. */
function LogLine({ entry }: { entry: LogEntry }) {
  const msgRef = useRef<HTMLSpanElement>(null);
  useScramble(msgRef, entry.msg, { dur: 420, active: entry.scram });
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        fontSize: 12,
        lineHeight: 1.72,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <span style={{ color: "#3f424d", flex: "none" }}>{entry.ts}</span>
      <span style={{ color: entry.color, width: 40, flex: "none" }}>{entry.level}</span>
      <span
        ref={msgRef}
        style={{ color: "var(--bx-text-4, #9aa0ad)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {entry.scram ? "" : entry.msg}
      </span>
    </div>
  );
}

export interface LogStreamProps {
  /** Pool of messages randomly appended to the stream. */
  messages?: readonly string[];
  /** Panel heading. */
  title?: string;
  /** Auto-append cadence in ms. */
  interval?: number;
  /** Number of rows the log keeps before dropping the oldest. */
  maxLines?: number;
  /** Number of rows seeded on mount (unscrambled). */
  initialCount?: number;
  /** Command-input placeholder. */
  placeholder?: string;
  /** Fired when a non-empty command is submitted (Enter or RUN). */
  onCommand?: (command: string) => void;
  style?: CSSProperties;
}

/**
 * A streaming event log with a command line. Colour-coded rows auto-append on an
 * interval (each newly-streamed row decodes via `useScramble`), while a prompt at
 * the foot lets you submit commands — every submission is echoed as a `CMD` row and
 * forwarded to `onCommand`. The row list starts empty and is populated in a
 * client-only effect (timestamps come from `new Date()`), so the server renders an
 * inert shell with no hydration mismatch.
 */
export function LogStream({
  messages = MSGS,
  title = "EVENT LOG",
  interval = 1700,
  maxLines = 9,
  initialCount = 7,
  placeholder = "type a command — try 'flush'",
  onCommand,
  style,
}: LogStreamProps) {
  const [lines, setLines] = useState<LogEntry[]>([]);
  const [cmd, setCmd] = useState("");
  const idRef = useRef(0);

  const push = useCallback(
    (level: string, color: string, msg: string, scram: boolean) => {
      const entry: LogEntry = { id: idRef.current++, ts: stamp(), level, color, msg, scram };
      setLines((prev) => {
        const next = [...prev, entry];
        return next.length > maxLines ? next.slice(next.length - maxLines) : next;
      });
    },
    [maxLines],
  );

  // Keep the latest push / messages reachable from mount-only + interval effects
  // without re-seeding when unrelated props change identity.
  const pushRef = useRef(push);
  pushRef.current = push;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Seed the initial rows on the client (unscrambled).
  useEffect(() => {
    for (let i = 0; i < initialCount; i++) {
      const lv = LV[(Math.random() * 2) | 0]!;
      pushRef.current(lv[0], lv[1], pick(messagesRef.current), false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-append a scrambled row every `interval` ms.
  useEffect(() => {
    const id = setInterval(() => {
      const lv = LV[(Math.random() * 3) | 0]!;
      pushRef.current(lv[0], lv[1], pick(messagesRef.current), true);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  const run = () => {
    const v = cmd.trim();
    if (!v) return;
    pushRef.current("CMD", "var(--bx-accent, #46c66d)", `> ${v}`, true);
    onCommand?.(v);
    setCmd("");
  };

  return (
    <div
      style={{
        border: "1px solid #23252e",
        background: "var(--bx-bg, #0a0b0e)",
        overflow: "hidden",
        fontFamily: "var(--bx-font-mono, ui-monospace, monospace)",
        ...style,
      }}
    >
      <div style={{ borderBottom: "1px solid #1a1b22", padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
          }}
        >
          <span style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em" }}>{title}</span>
          <span style={{ color: "#3f424d", fontSize: 11 }}>tail -f</span>
        </div>
        <div
          style={{
            height: 152,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {lines.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      <div
        style={{
          padding: "13px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--bx-surface-3, #0c0d11)",
        }}
      >
        <span style={{ color: "var(--bx-accent, #46c66d)", fontSize: 14 }}>&gt;</span>
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            borderBottom: "1px solid var(--bx-border, #1c1d24)",
          }}
        >
          <input
            type="text"
            maxLength={40}
            value={cmd}
            placeholder={placeholder}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                run();
              }
            }}
            style={{
              width: "100%",
              background: "transparent",
              border: 0,
              outline: 0,
              fontFamily: "inherit",
              fontSize: 13,
              color: "var(--bx-text-1, #f4f6fb)",
              caretColor: "var(--bx-accent, #46c66d)",
              padding: "8px 2px",
            }}
          />
        </div>
        <FillButton onClick={run} style={{ fontSize: 12, padding: "9px 16px", flex: "none" }}>
          RUN&nbsp;&#x25B8;
        </FillButton>
      </div>
    </div>
  );
}
