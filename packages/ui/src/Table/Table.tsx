import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { bar8 } from "@balaur/octant-core";

/** Number of eighth-block cells the `load` bar is rendered across. */
const LOAD_CELLS = 12;

/** The default row shape — a cluster node with a status badge and a 0..1 load. */
export interface NodeRow {
  node: string;
  /** `[label, hex-colour]` — rendered as a filled-square badge. */
  status: [label: string, color: string];
  /** Fraction 0..1, drawn as a `bar8` eighth-block meter. */
  load: number;
  cells: number;
}

export interface TableColumn<T> {
  /** Stable identity used as the sort key and React key. */
  key: string;
  label: string;
  align?: "left" | "right";
  /** Cell text colour (overridden by a custom `render`). */
  color?: string;
  /** Value the column sorts by. Defaults to the raw `row[key]`. */
  sortValue?: (row: T) => string | number;
  /** Custom cell content. Defaults to `String(row[key])`. */
  render?: (row: T) => ReactNode;
}

export interface TableProps<T = NodeRow> {
  columns?: TableColumn<T>[];
  rows?: T[];
  /** Column key sorted on first paint. */
  defaultSortKey?: string;
  /** Initial sort direction (ascending). */
  defaultAsc?: boolean;
  /** Caption above the table. */
  label?: string;
  style?: CSSProperties;
}

const DEFAULT_ROWS: NodeRow[] = [
  { node: "OCTANT-01", status: ["OK", "#74e692"], load: 0.82, cells: 2048 },
  { node: "RELAY-07", status: ["WARN", "#ffe08a"], load: 0.46, cells: 1536 },
  { node: "BUFFER-X", status: ["OK", "#74e692"], load: 0.63, cells: 1792 },
  { node: "SINK-03", status: ["ERR", "#ff6b6f"], load: 0.18, cells: 512 },
  { node: "CACHE-9", status: ["OK", "#74e692"], load: 0.91, cells: 3072 },
];

const DEFAULT_COLUMNS: TableColumn<NodeRow>[] = [
  { key: "node", label: "NODE", color: "#c8cdd6", sortValue: (r) => r.node },
  {
    key: "status",
    label: "STATUS",
    sortValue: (r) => r.status[0],
    render: (r) => (
      <span style={{ color: r.status[1], fontSize: 11 }}>{"■ " + r.status[0]}</span>
    ),
  },
  {
    key: "load",
    label: "LOAD",
    color: "var(--bx-accent, #46c66d)",
    sortValue: (r) => r.load,
    render: (r) => (
      <span style={{ whiteSpace: "pre", letterSpacing: 0, fontSize: 12 }}>{bar8(r.load, LOAD_CELLS)}</span>
    ),
  },
  { key: "cells", label: "CELLS", align: "right", color: "#9aa0ad", sortValue: (r) => r.cells },
];

function readValue<T>(col: TableColumn<T>, row: T): string | number {
  if (col.sortValue) return col.sortValue(row);
  const v = (row as Record<string, unknown>)[col.key];
  return typeof v === "number" ? v : String(v);
}

function renderCell<T>(col: TableColumn<T>, row: T): ReactNode {
  if (col.render) return col.render(row);
  return String((row as Record<string, unknown>)[col.key]);
}

/**
 * A sortable, zebra-striped data table. Click a header to sort (toggling
 * direction on the active column); the active header brightens and shows a
 * ▲/▼ arrow. The `load` column is drawn as a `bar8` eighth-block meter. Sort
 * state is plain React `useState` and the rendered rows are pure/deterministic,
 * so the markup is identical on server and client (no hydration mismatch).
 */
export function Table<T = NodeRow>({
  columns = DEFAULT_COLUMNS as unknown as TableColumn<T>[],
  rows = DEFAULT_ROWS as unknown as T[],
  defaultSortKey,
  defaultAsc = true,
  label = "TABLE · click a header to sort",
  style,
}: TableProps<T>) {
  const firstKey = columns[0]?.key ?? "";
  const [sortKey, setSortKey] = useState(defaultSortKey ?? firstKey);
  const [asc, setAsc] = useState(defaultAsc);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    return [...rows].sort((a, b) => {
      const x = readValue(col, a);
      const y = readValue(col, b);
      if (x < y) return asc ? -1 : 1;
      if (x > y) return asc ? 1 : -1;
      return 0;
    });
  }, [columns, rows, sortKey, asc]);

  const onSort = (key: string) => {
    if (key === sortKey) setAsc((a) => !a);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  return (
    <div
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 18,
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
        ...style,
      }}
    >
      {label && (
        <div style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em", marginBottom: 14 }}>{label}</div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--bx-border, #1c1d24)" }}>
              {columns.map((col) => {
                const active = col.key === sortKey;
                return (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    aria-sort={active ? (asc ? "ascending" : "descending") : "none"}
                    style={{
                      textAlign: col.align ?? "left",
                      fontWeight: "normal",
                      color: active ? "#c8cdd6" : "#5b616e",
                      padding: "9px 12px",
                      cursor: "pointer",
                      letterSpacing: "0.06em",
                      userSelect: "none",
                    }}
                  >
                    {col.label}{" "}
                    <span style={{ color: "var(--bx-accent, #46c66d)" }}>
                      {active ? (asc ? "▲" : "▼") : " "}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                // biome-ignore lint/suspicious/noArrayIndexKey: sorted rows have no stable id
                key={i}
                style={{
                  borderTop: "1px solid #15161e",
                  background: i % 2 ? "#0b0c10" : "transparent",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "9px 12px",
                      textAlign: col.align ?? "left",
                      color: col.color ?? "#c8cdd6",
                    }}
                  >
                    {renderCell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
