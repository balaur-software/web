import { type CSSProperties, useId, useRef } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useScramble } from "../hooks/useScramble";
import { useSlidingIndicator } from "../hooks/useSlidingIndicator";

export interface TabItem {
  /** Tab button label. */
  label: string;
  /** Body text that "deserialises" (scrambles in) when this tab becomes active. */
  panel: string;
}

export interface TabsProps {
  /** The tabs, left-to-right. Each carries the panel body revealed when selected. */
  tabs: TabItem[];
  /** Controlled active tab index. Omit for uncontrolled (use `defaultIndex`). */
  index?: number;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  "aria-label"?: string;
  style?: CSSProperties;
}

/**
 * One `<Panel>` per active tab: keying it by the active index remounts it so
 * `useScramble` fires a fresh decode sweep on every switch. The server renders
 * the panel text plainly (children), so there's no hydration mismatch — the
 * glitch reveal only starts after mount.
 */
function Panel({ id, labelledBy, text }: { id: string; labelledBy: string; text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useScramble(ref, text, { dur: 620 });
  return (
    <p
      ref={ref}
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      style={{
        margin: 0,
        color: "var(--bx-text-4, #9aa0ad)",
        fontSize: 14,
        lineHeight: 1.75,
        maxWidth: 580,
        minHeight: 48,
      }}
    >
      {text}
    </p>
  );
}

/**
 * A tab strip with a lit accent underline that slides to the active tab, over a
 * panel region whose body scramble-decodes on every switch. Selection runs
 * through `useControllableState`; the underline is measured by
 * `useSlidingIndicator` (offsetLeft/offsetWidth of the active `[data-slide-item]`)
 * so it starts at zero-width on the server and eases into place once layout is
 * known. Arrow keys move between tabs.
 */
export function Tabs({ tabs, index, defaultIndex, onChange, "aria-label": ariaLabel, style }: TabsProps) {
  const [active, setActive] = useControllableState(index, defaultIndex ?? 0, onChange);
  const stripRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const count = tabs.length;
  const activeIndex = count ? Math.min(Math.max(active, 0), count - 1) : 0;
  const indicator = useSlidingIndicator(stripRef, activeIndex);

  const move = (next: number) => {
    setActive(next);
    stripRef.current?.querySelectorAll<HTMLElement>("[data-slide-item]")[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (count === 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move((activeIndex + 1) % count);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move((activeIndex - 1 + count) % count);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(count - 1);
    }
  };

  const panelText = tabs[activeIndex]?.panel ?? "";

  return (
    <div
      style={{
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        ...style,
      }}
    >
      <div
        ref={stripRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        style={{
          position: "relative",
          display: "flex",
          borderBottom: "1px solid var(--bx-border, #1c1d24)",
          padding: "0 8px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab, i) => {
          const on = i === activeIndex;
          return (
            <button
              key={tab.label}
              type="button"
              data-slide-item
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${baseId}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              style={{
                fontFamily: "inherit",
                fontSize: 13,
                padding: "14px 16px",
                background: "transparent",
                border: 0,
                color: on ? "var(--bx-text-1, #f4f6fb)" : "#7b8290",
                cursor: "pointer",
                letterSpacing: "0.06em",
                transition: "color .26s cubic-bezier(.5,0,.2,1)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -1,
            left: indicator.left,
            width: indicator.width,
            height: 2,
            background: "var(--bx-accent, #46c66d)",
            boxShadow: "0 0 7px var(--bx-accent, #46c66d)",
            transition: "left .26s cubic-bezier(.5,0,.2,1), width .26s cubic-bezier(.5,0,.2,1)",
          }}
        />
      </div>
      <div style={{ padding: 24, minHeight: 96 }}>
        <Panel key={activeIndex} id={`${baseId}-panel`} labelledBy={`${baseId}-tab-${activeIndex}`} text={panelText} />
      </div>
    </div>
  );
}
