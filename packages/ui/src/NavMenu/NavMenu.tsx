import { type CSSProperties, useEffect, useRef, useState } from "react";
import { FloatingPanel } from "../primitives";

/** A rich mega-panel card: an accent glyph over a title + one-line description. */
export interface NavMenuCard {
  /** Leading octant/quadrant glyph, drawn in the accent colour. */
  glyph: string;
  title: string;
  desc: string;
  href?: string;
}

/** A plain link row inside a simple pull-down panel. */
export interface NavMenuLink {
  label: string;
  href?: string;
}

/**
 * One top-level nav entry. With `cards` it opens a two-column mega panel; with
 * `links` it opens a compact link list; with neither it renders as a bare link
 * (e.g. "PRICING").
 */
export interface NavMenuItem {
  /** Trigger label (e.g. "PRODUCT"). */
  label: string;
  /** Destination for a bare-link entry (no panel). */
  href?: string;
  /** Mega-panel cards, laid out in a grid. */
  cards?: NavMenuCard[];
  /** Simple link-list panel rows. */
  links?: NavMenuLink[];
  /** Panel width in px. Defaults to 440 for cards, 240 for links. */
  width?: number;
  /** Grid columns for a `cards` panel. Default 2. */
  columns?: number;
}

export interface NavMenuProps {
  items: NavMenuItem[];
  style?: CSSProperties;
}

const EASE = "var(--bx-ease, cubic-bezier(.5,0,.2,1))";
const SHADOW = "0 18px 44px rgba(0,0,0,0.55)";

const BASE_PANEL: CSSProperties = {
  background: "var(--bx-surface-3, #0c0d11)",
  border: "1px solid var(--bx-border-accent, #2a3320)",
  boxShadow: SHADOW,
};

/**
 * A top-level navigation bar whose triggers unroll floating mega panels. Hovering
 * a trigger opens its panel (with a 150 ms grace period on leave so the pointer can
 * travel into the panel); clicking toggles it; only one panel is open at a time.
 * A caret rotates and the trigger picks up an accent border while open. Each panel
 * is a shared {@link FloatingPanel}, so Escape / outside-click dismissal and the
 * opacity+translate reveal come for free. Triggers render statically on the server;
 * panels stay inert (`pointer-events:none`, opacity 0) until opened after mount.
 */
export function NavMenu({ items, style }: NavMenuProps) {
  const [openIdx, setOpenIdx] = useState(-1);
  const [hovered, setHovered] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const enter = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    setOpenIdx(i);
  };
  const leave = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setOpenIdx((cur) => (cur === i ? -1 : cur));
    }, 150);
  };

  return (
    <div style={{ display: "inline-flex", gap: 6, position: "relative", ...style }}>
      {items.map((item, i) => {
        const cards = item.cards ?? [];
        const links = item.links ?? [];
        const hasPanel = cards.length > 0 || links.length > 0;

        if (!hasPanel) {
          return (
            <a
              key={item.label}
              href={item.href ?? "#"}
              style={{
                display: "flex",
                alignItems: "center",
                fontFamily: "inherit",
                fontSize: 13,
                padding: "9px 14px",
                color: "var(--bx-text-4, #9aa0ad)",
                textDecoration: "none",
              }}
            >
              {item.label}
            </a>
          );
        }

        const on = openIdx === i;
        const isCards = cards.length > 0;
        const width = item.width ?? (isCards ? 440 : 240);
        const panelStyle: CSSProperties = isCards
          ? {
              ...BASE_PANEL,
              padding: 16,
              display: "grid",
              gridTemplateColumns: `repeat(${item.columns ?? 2}, 1fr)`,
              gap: 6,
            }
          : { ...BASE_PANEL, padding: 10 };

        return (
          <div
            key={item.label}
            onPointerEnter={() => enter(i)}
            onPointerLeave={() => leave(i)}
            style={{ display: "inline-block" }}
          >
            <FloatingPanel
              open={on}
              onOpenChange={(o) => setOpenIdx(o ? i : -1)}
              width={width}
              panelStyle={panelStyle}
              trigger={
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={on}
                  onClick={() => setOpenIdx(on ? -1 : i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily: "inherit",
                    fontSize: 13,
                    padding: "9px 14px",
                    background: "transparent",
                    border: `1px solid ${on ? "var(--bx-border-accent, #2a3320)" : "transparent"}`,
                    color: on ? "var(--bx-text-1, #f4f6fb)" : "var(--bx-text-4, #9aa0ad)",
                    cursor: "pointer",
                    transition: `color .12s ${EASE}, border-color .12s ${EASE}`,
                  }}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-block",
                      color: "var(--bx-accent, #46c66d)",
                      fontSize: 10,
                      transform: on ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform .2s",
                    }}
                  >
                    {"▾"}
                  </span>
                </button>
              }
            >
              {isCards
                ? cards.map((card) => {
                    const key = `${item.label}:${card.title}`;
                    const isH = hovered === key;
                    return (
                      <a
                        key={key}
                        role="menuitem"
                        href={card.href ?? "#"}
                        onPointerEnter={() => setHovered(key)}
                        onPointerLeave={() => setHovered((h) => (h === key ? null : h))}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: 11,
                          textDecoration: "none",
                          background: isH ? "#15161e" : "transparent",
                          transition: `background-color .12s ${EASE}`,
                        }}
                      >
                        <span aria-hidden="true" style={{ color: "var(--bx-accent, #46c66d)" }}>
                          {card.glyph}
                        </span>
                        <span>
                          <span style={{ display: "block", color: "var(--bx-text-1, #f4f6fb)", fontSize: 13 }}>
                            {card.title}
                          </span>
                          <span style={{ display: "block", color: "#5b616e", fontSize: 11, marginTop: 2 }}>
                            {card.desc}
                          </span>
                        </span>
                      </a>
                    );
                  })
                : links.map((link) => {
                    const key = `${item.label}:${link.label}`;
                    const isH = hovered === key;
                    return (
                      <a
                        key={key}
                        role="menuitem"
                        href={link.href ?? "#"}
                        onPointerEnter={() => setHovered(key)}
                        onPointerLeave={() => setHovered((h) => (h === key ? null : h))}
                        style={{
                          display: "block",
                          padding: "9px 11px",
                          textDecoration: "none",
                          color: "var(--bx-text-3, #c8cdd6)",
                          fontSize: 13,
                          background: isH ? "#15161e" : "transparent",
                          transition: `background-color .12s ${EASE}`,
                        }}
                      >
                        {link.label}
                      </a>
                    );
                  })}
            </FloatingPanel>
          </div>
        );
      })}
    </div>
  );
}
