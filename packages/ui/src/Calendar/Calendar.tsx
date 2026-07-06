import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";

const AC = "var(--bx-accent, #46c66d)";
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDay(a: Date | null, b: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface CalendarProps {
  /** Controlled selected day. Omit for uncontrolled (use `defaultValue`). */
  value?: Date | null;
  defaultValue?: Date | null;
  /** Fired with the chosen day when a cell is clicked. */
  onSelect?: (date: Date) => void;
  /** Month to open on. Defaults to the selected day's month, else today. */
  defaultMonth?: Date;
  style?: CSSProperties;
}

/**
 * A month grid with today + selection markers and prev/next navigation. Layout
 * is fully declarative (renders on the server); the "today" marker resolves
 * after mount to avoid a server/client date mismatch. Selection is via
 * `useControllableState`, so it works controlled or uncontrolled.
 */
export function Calendar({ value, defaultValue = null, onSelect, defaultMonth, style }: CalendarProps) {
  const [selected, setSelected] = useControllableState<Date | null>(
    value,
    defaultValue,
    onSelect ? (d) => d && onSelect(d) : undefined,
  );
  const [view, setView] = useState<Date>(() => startOfMonth(defaultMonth ?? selected ?? new Date()));

  // Resolve "today" only on the client so SSR markup carries no date-specific
  // highlight and there is no hydration mismatch.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  const cells = useMemo<(Date | null)[]>(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const startDow = new Date(year, month, 1).getDay();
    const dim = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) out.push(null);
    for (let d = 1; d <= dim; d++) out.push(new Date(year, month, d));
    return out;
  }, [view]);

  const shiftMonth = (delta: number) => {
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  };

  const navBtn: CSSProperties = {
    fontFamily: "inherit",
    fontSize: 14,
    width: 28,
    height: 28,
    padding: 0,
    background: "transparent",
    border: "1px solid var(--bx-border, #1c1d24)",
    color: "var(--bx-text-4, #9aa0ad)",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        width: 286,
        maxWidth: "100%",
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button type="button" aria-label="Previous month" style={navBtn} onClick={() => shiftMonth(-1)}>
          {"‹"}
        </button>
        <div style={{ color: "var(--bx-text-1, #f4f6fb)", fontSize: 13, letterSpacing: "0.05em" }}>
          {MONTHS[view.getMonth()]!} {view.getFullYear()}
        </div>
        <button type="button" aria-label="Next month" style={navBtn} onClick={() => shiftMonth(1)}>
          {"›"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 5 }}>
        {WEEKDAYS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", color: "#3f424d", fontSize: 11, padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const isToday = sameDay(date, today);
          const isSel = sameDay(date, selected);
          return (
            <button
              key={date.getTime()}
              type="button"
              aria-pressed={isSel}
              aria-current={isToday ? "date" : undefined}
              onClick={() => setSelected(date)}
              onMouseEnter={(e) => {
                if (!isSel) e.currentTarget.style.background = "#15161e";
              }}
              onMouseLeave={(e) => {
                if (!isSel) e.currentTarget.style.background = "transparent";
              }}
              style={{
                fontFamily: "inherit",
                fontSize: 12,
                height: 30,
                padding: 0,
                background: isSel ? AC : "transparent",
                border: `1px solid ${isSel ? AC : isToday ? "var(--bx-border-accent, #2a3320)" : "transparent"}`,
                color: isSel ? "var(--bx-bg, #08080a)" : isToday ? AC : "#c8cdd6",
                cursor: "pointer",
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
