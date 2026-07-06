import type { CSSProperties, ReactNode } from "react";

export interface InlineCitationProps {
  /** Chip content — usually the citation number, e.g. `1`. */
  label: ReactNode;
  /** Anchor target for the cited source. Defaults to `"#"`. */
  href?: string;
  /** Chip text (and, by default, border-derived) accent color. */
  accent?: string;
  /** Chip border color. Defaults to the accent-border token. */
  border?: string;
}

/**
 * A superscript inline citation chip (section §07): a small bordered, accent-tinted
 * number that sits inside running body text and links to a listed source. Pure
 * static markup — the anchor wraps the chip so the whole glyph is the hit target.
 */
export function InlineCitation({
  label,
  href = "#",
  accent = "var(--bx-accent,#46c66d)",
  border = "var(--bx-border-accent,#2a3320)",
}: InlineCitationProps) {
  return (
    <a href={href} style={{ textDecoration: "none" }}>
      <span
        style={{
          border: `1px solid ${border}`,
          color: accent,
          fontSize: 10,
          padding: "1px 5px",
          margin: "0 2px",
          verticalAlign: 1,
        }}
      >
        {label}
      </span>
    </a>
  );
}

export interface CitationSourceProps {
  /** Marker shown as `[label]` in the reference list. */
  label: ReactNode;
  /** Marker accent color — match the inline chip it pairs with. */
  accent?: string;
  /** Source description, e.g. file name and provenance. */
  children: ReactNode;
}

/** One entry in a {@link CitationList}: an accented `[n]` marker plus its source line. */
export function CitationSource({ label, accent = "var(--bx-accent,#46c66d)", children }: CitationSourceProps) {
  return (
    <div style={{ display: "flex", gap: 9 }}>
      <span style={{ color: accent, flex: "none" }}>[{label}]</span>
      <span style={{ color: "#7b8290" }}>{children}</span>
    </div>
  );
}

const listStyle: CSSProperties = {
  borderTop: "1px solid var(--bx-border,#1c1d24)",
  marginTop: 14,
  paddingTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 7,
  fontSize: 11,
};

/** The reference-list footer that collects the {@link CitationSource} entries. */
export function CitationList({ children }: { children: ReactNode }) {
  return <div style={listStyle}>{children}</div>;
}
