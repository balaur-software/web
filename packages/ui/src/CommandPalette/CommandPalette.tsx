import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ScrimOverlay } from "../primitives/ScrimOverlay";
import { useToast } from "../primitives/ToastProvider";

/** ⌕ (U+2315) — the "commands" search glyph used on the trigger + header. */
const SEARCH_GLYPH = "⌕";
/** ⌘ (U+2318) — the command-key glyph for the trigger's kbd badge. */
const CMD_GLYPH = "⌘";

export interface CommandItem {
  /** Leading octant/box glyph. */
  glyph: string;
  /** Human label — the string the filter matches against. */
  label: string;
  /** Navigation target id. Selecting fires `onNavigate(to)` instead of a toast. */
  to?: string;
  /** Trailing keyboard-shortcut hint (display only). */
  shortcut?: string;
  /** Render + toast in the destructive red treatment. */
  danger?: boolean;
}

export interface CommandGroup {
  /** Section heading, e.g. "NAVIGATION". */
  group: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  /** Command groups to list. Defaults to the reference NAVIGATION + ACTIONS set. */
  commands?: CommandGroup[];
  /** Controlled open state. Omit for uncontrolled (use `defaultOpen`). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fired when a navigation item (one with `to`) is chosen. */
  onNavigate?: (to: string) => void;
  /** Fired for every chosen command, after internal handling. */
  onSelect?: (item: CommandItem) => void;
  /** Render the built-in ⌘K trigger button. Default true. */
  showTrigger?: boolean;
  /** Input placeholder. */
  placeholder?: string;
  /** Trigger button label. */
  triggerLabel?: string;
  style?: CSSProperties;
}

const DEFAULT_COMMANDS: CommandGroup[] = [
  {
    group: "NAVIGATION",
    items: [
      { glyph: "▛", label: "Go to Palette", to: "palette" },
      { glyph: "▞", label: "Go to Glyph Primitives", to: "glyphs" },
      { glyph: "▙", label: "Go to Console", to: "console" },
      { glyph: "▟", label: "Go to Lists & Data", to: "data" },
      { glyph: "▚", label: "Go to Data Entry", to: "entry" },
    ],
  },
  {
    group: "ACTIONS",
    items: [
      { glyph: "▸", label: "Render frame", shortcut: "R" },
      { glyph: "◆", label: "Toggle dither", shortcut: "D" },
      { glyph: "▙", label: "Export PNG", shortcut: "⌘E" },
      { glyph: "▓", label: "Flush buffer", danger: true, shortcut: "⌫" },
    ],
  },
];

/**
 * A ⌘K command palette: a filterable, keyboard-drivable command list in the
 * shared {@link ScrimOverlay} shell (portal, scrim, focus trap, Escape /
 * outside-click dismissal). A document-level Cmd/Ctrl-K listener toggles it,
 * fully cleaned up on unmount. Navigation items call `onNavigate`; action items
 * fire a toast via {@link useToast}. Open state is controllable; the palette
 * only mounts client-side (ScrimOverlay is null on the server / when closed).
 */
export function CommandPalette({
  commands = DEFAULT_COMMANDS,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onNavigate,
  onSelect,
  showTrigger = true,
  placeholder = "type a command or search…",
  triggerLabel = "Search commands…",
  style,
}: CommandPaletteProps) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);
  const [shown, setShown] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const toast = useToast();

  // Filtered groups keep each match's flat index so keyboard nav + highlight
  // paint stay in sync with the rendered rows.
  const { groups, flat } = useMemo(() => {
    const q = query.toLowerCase();
    const flatArr: CommandItem[] = [];
    const grps: { group: string; items: { item: CommandItem; index: number }[] }[] = [];
    for (const grp of commands) {
      const matches = grp.items.filter((it) => it.label.toLowerCase().includes(q));
      if (matches.length === 0) continue;
      grps.push({
        group: grp.group,
        items: matches.map((item) => {
          const index = flatArr.length;
          flatArr.push(item);
          return { item, index };
        }),
      });
    }
    return { groups: grps, flat: flatArr };
  }, [commands, query]);

  // Entrance + reset: clear the query and highlight, then fade/lift the panel in.
  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    setQuery("");
    setHi(0);
    if (reduced) {
      setShown(true);
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [open, reduced]);

  // Global Cmd/Ctrl-K toggles the palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Keep the highlighted row scrolled into view within the list.
  useEffect(() => {
    if (!open) return;
    const btns = listRef.current?.querySelectorAll("button");
    btns?.[hi]?.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const run = (item: CommandItem) => {
    setOpen(false);
    onSelect?.(item);
    if (item.to !== undefined) {
      onNavigate?.(item.to);
    } else {
      toast({ kind: item.danger ? "err" : "ok", message: item.label });
    }
  };

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            fontFamily: "inherit",
            fontSize: 13,
            padding: "11px 14px",
            background: "var(--bx-bg, #0a0b0e)",
            border: "1px solid var(--bx-border, #1c1d24)",
            color: "var(--bx-text-3, #5b616e)",
            cursor: "pointer",
            textAlign: "left",
            ...style,
          }}
        >
          <span style={{ color: "var(--bx-text-dim, #3f424d)" }}>{SEARCH_GLYPH}</span>
          <span style={{ flex: 1 }}>{triggerLabel}</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 22,
              height: 20,
              padding: "0 6px",
              background: "var(--bx-surface-2, #15161e)",
              border: "1px solid var(--bx-border-mid, #2a2c34)",
              color: "var(--bx-text-2, #9aa0ad)",
              fontSize: 11,
            }}
          >
            {CMD_GLYPH}K
          </span>
        </button>
      )}

      <ScrimOverlay
        open={open}
        onClose={() => setOpen(false)}
        panelStyle={{
          width: 540,
          maxWidth: "calc(100vw - 32px)",
          marginTop: 84,
          marginBottom: "auto",
          background: "var(--bx-surface-3, #0c0d11)",
          border: "1px solid var(--bx-border-accent, #2a3320)",
          overflow: "hidden",
          boxShadow: "0 28px 70px rgba(0,0,0,0.6)",
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity .18s ease, transform .18s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "14px 16px",
            borderBottom: "1px solid var(--bx-border, #1c1d24)",
          }}
        >
          <span style={{ color: "var(--bx-accent, #46c66d)", fontSize: 14 }}>{SEARCH_GLYPH}</span>
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setHi(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHi((h) => Math.min(flat.length - 1, h + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHi((h) => Math.max(0, h - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const it = flat[hi];
                if (it) run(it);
              }
            }}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: 0,
              outline: 0,
              fontFamily: "inherit",
              fontSize: 14,
              color: "var(--bx-text-1, #f4f6fb)",
              caretColor: "var(--bx-accent, #46c66d)",
            }}
          />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 6px",
              height: 20,
              background: "var(--bx-surface-2, #15161e)",
              border: "1px solid var(--bx-border-mid, #2a2c34)",
              color: "var(--bx-text-3, #5b616e)",
              fontSize: 11,
            }}
          >
            ESC
          </span>
        </div>

        <div ref={listRef} style={{ maxHeight: 340, overflowY: "auto", padding: 6 }}>
          {groups.map(({ group, items }) => (
            <div key={group}>
              <div
                style={{
                  color: "var(--bx-text-dim, #3f424d)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  padding: "10px 10px 6px",
                }}
              >
                {group}
              </div>
              {items.map(({ item, index }) => (
                <button
                  key={item.label}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    run(item);
                  }}
                  onPointerEnter={() => setHi(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: 13,
                    padding: "10px 10px",
                    background: index === hi ? "var(--bx-surface-2, #15161e)" : "transparent",
                    border: 0,
                    color: item.danger ? "#ff6b6f" : "var(--bx-text-3, #c8cdd6)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: item.danger ? "#ff6b6f" : "var(--bx-accent, #46c66d)" }}>{item.glyph}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.shortcut !== undefined && (
                    <span
                      style={{
                        color: "var(--bx-text-dim, #3f424d)",
                        fontSize: 11,
                        border: "1px solid var(--bx-border-mid, #2a2c34)",
                        padding: "0 5px",
                      }}
                    >
                      {item.shortcut}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
          {flat.length === 0 && (
            <div style={{ padding: "16px 10px", color: "var(--bx-text-dim, #3f424d)", fontSize: 12 }}>
              no matching command
            </div>
          )}
        </div>
      </ScrimOverlay>
    </>
  );
}
