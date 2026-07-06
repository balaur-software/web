import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";

/** A single segment in a {@link Breadcrumb} path. */
export interface BreadcrumbItem {
  /** Text shown for the segment. */
  label: string;
  /** Optional link target; renders the segment as an anchor when set. */
  href?: string;
}

export interface BreadcrumbProps {
  /** Ordered path segments, root first. The last item is the current location. */
  items: readonly BreadcrumbItem[];
  /** Glyph rendered between segments. Defaults to ▸ (U+25B8). */
  separator?: ReactNode;
}

/** ▸ BLACK RIGHT-POINTING SMALL TRIANGLE — the default wayfinding separator. */
const SEP = "▸";

const linkStyle: CSSProperties = {
  color: "#7b8290",
  cursor: "pointer",
  textDecoration: "none",
};

const currentStyle: CSSProperties = { color: "var(--bx-accent, #46c66d)" };

const sepStyle: CSSProperties = { color: "#3f424d" };

/**
 * Breadcrumb trail (section §16 — NAV & MARKERS): a horizontal path of segments
 * joined by a triangle separator. The final segment is the current location and
 * is highlighted with the accent color; the rest are clickable links. Pure
 * static markup — no client-side effects.
 */
export function Breadcrumb({ items, separator = SEP }: BreadcrumbProps) {
  const last = items.length - 1;
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        flexWrap: "wrap",
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
      }}
    >
      {items.map((item, i) => {
        const isCurrent = i === last;
        return (
          <Fragment key={i}>
            {isCurrent ? (
              <span aria-current="page" style={currentStyle}>
                {item.label}
              </span>
            ) : item.href !== undefined ? (
              <a href={item.href} style={linkStyle}>
                {item.label}
              </a>
            ) : (
              <span style={linkStyle}>{item.label}</span>
            )}
            {!isCurrent && (
              <span aria-hidden="true" style={sepStyle}>
                {separator}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
