import { type CSSProperties, useEffect, useRef } from "react";

export interface ClockProps {
  /** Show the live wall-clock time as `HH:MM:SS`. Default true. */
  showTime?: boolean;
  /** Show an uptime counter (`LABEL HH:MM:SS`) counting up from mount. Default false. */
  showUptime?: boolean;
  /** Prefix shown before the uptime counter. Default `"UPTIME"`. */
  uptimeLabel?: string;
  /** Tick interval in ms. Default 500 (mirrors the reference). */
  interval?: number;
  style?: CSSProperties;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A terminal-style clock rendering the live `HH:MM:SS` wall time and/or an
 * uptime counter that ticks up from mount. Time is written imperatively to refs
 * inside a `setInterval` (client-only, fully cleared on unmount) so the static
 * placeholder renders on the server with no hydration mismatch. Mirrors the
 * reference `initClock()` (`bx-clock` + `bx-uptime`).
 */
export function Clock({
  showTime = true,
  showUptime = false,
  uptimeLabel = "UPTIME",
  interval = 500,
  style,
}: ClockProps) {
  const timeRef = useRef<HTMLSpanElement>(null);
  const uptimeRef = useRef<HTMLSpanElement>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (startRef.current == null) startRef.current = performance.now();

    const upd = () => {
      if (showTime && timeRef.current) {
        const d = new Date();
        timeRef.current.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      }
      if (showUptime && uptimeRef.current) {
        const s = Math.floor((performance.now() - (startRef.current ?? 0)) / 1000);
        uptimeRef.current.textContent = `${uptimeLabel} ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
      }
    };

    upd();
    const id = setInterval(upd, interval);
    return () => clearInterval(id);
  }, [showTime, showUptime, uptimeLabel, interval]);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        fontSize: 13,
        fontFamily: "var(--bx-font-mono, ui-monospace, monospace)",
        whiteSpace: "pre",
        ...style,
      }}
    >
      {showTime && (
        <span ref={timeRef} style={{ color: "#5b616e" }}>
          --:--:--
        </span>
      )}
      {showUptime && (
        <span ref={uptimeRef} style={{ color: "#3f424d" }}>
          {`${uptimeLabel} 00:00:00`}
        </span>
      )}
    </span>
  );
}
