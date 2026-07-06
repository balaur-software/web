import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Dot-noise glyph set the label dissolves into before the tag collapses. */
const NOISE = "▓▒░█▚▙▞#%*+=:.";

export type TagTone = "default" | "active" | "degraded" | "offline";

interface Tone {
  border: string;
  color: string;
  glyph?: string;
  glyphColor?: string;
  letterSpacing: string;
}

const TONES: Record<TagTone, Tone> = {
  default: { border: "#2a2c34", color: "#c8cdd6", letterSpacing: "0.04em" },
  active: {
    border: "var(--bx-border-accent, #2a3320)",
    color: "var(--bx-accent-bright, #74e692)",
    glyph: "█",
    glyphColor: "var(--bx-accent, #46c66d)",
    letterSpacing: "0.06em",
  },
  degraded: {
    border: "#3a3520",
    color: "#ffe08a",
    glyph: "▛",
    glyphColor: "#f2c94c",
    letterSpacing: "0.06em",
  },
  offline: {
    border: "#3a2020",
    color: "#ff6b6f",
    glyph: "▓",
    glyphColor: "#e5484d",
    letterSpacing: "0.06em",
  },
};

export interface TagProps {
  /** Text shown in the chip; also the string that dissolves into dot-noise on remove. */
  label: string;
  /** Color/glyph variant. Non-default tones prepend a status glyph. */
  tone?: TagTone;
  /** Show the `×` dismiss button. Default `true`. */
  removable?: boolean;
  /** Called once the dissolve + collapse animation finishes and the tag is gone. */
  onRemove?: () => void;
  style?: CSSProperties;
}

/**
 * A removable status chip. Clicking `×` scrambles the label into dot-noise for
 * ~360ms, then collapses the chip's max-width/opacity/padding to zero and pulls
 * the following siblings in before signalling {@link TagProps.onRemove}. The
 * whole dissolve is driven imperatively via refs (mirroring the reference's
 * `initTags`) so it runs client-only and never fights React over the label text.
 */
export function Tag({ label, tone = "default", removable = true, onRemove, style }: TagProps) {
  const [removed, setRemoved] = useState(false);
  const tagRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const dyingRef = useRef(false);
  const rafRef = useRef(0);
  const timeoutRef = useRef(0);
  const reduced = useReducedMotion();

  // Client-only cleanup: cancel any in-flight dissolve frame/timer on unmount.
  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    },
    [],
  );

  const t = TONES[tone];

  const dismiss = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const tag = tagRef.current;
    if (!tag || dyingRef.current) return;
    dyingRef.current = true;

    const labelEl = labelRef.current;
    const txt = labelEl?.textContent ?? "";

    const collapse = () => {
      tag.style.transition =
        "max-width .26s ease,opacity .22s ease,padding .26s ease,margin .26s ease";
      tag.style.maxWidth = `${tag.getBoundingClientRect().width}px`;
      rafRef.current = requestAnimationFrame(() => {
        tag.style.maxWidth = "0px";
        tag.style.opacity = "0";
        tag.style.paddingLeft = "0";
        tag.style.paddingRight = "0";
        tag.style.marginLeft = "-9px";
      });
      timeoutRef.current = window.setTimeout(() => {
        setRemoved(true);
        onRemove?.();
      }, 300);
    };

    if (reduced) {
      collapse();
      return;
    }

    const t0 = performance.now();
    const anim = () => {
      if ((performance.now() - t0) / 360 >= 1) {
        collapse();
        return;
      }
      if (labelEl) {
        labelEl.textContent = txt
          .split("")
          .map((c) => (c === " " ? " " : NOISE[(Math.random() * NOISE.length) | 0]!))
          .join("");
      }
      tag.style.color = "#5b616e";
      rafRef.current = requestAnimationFrame(anim);
    };
    anim();
  };

  if (removed) return null;

  return (
    <span
      ref={tagRef}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        padding: removable ? "5px 6px 5px 10px" : "5px 10px",
        border: `1px solid ${t.border}`,
        color: t.color,
        whiteSpace: "nowrap",
        overflow: "hidden",
        letterSpacing: t.letterSpacing,
        fontFamily: "var(--bx-font-mono, ui-monospace, monospace)",
        ...style,
      }}
    >
      {t.glyph && <span style={{ color: t.glyphColor }}>{t.glyph}</span>}
      <span ref={labelRef}>{label}</span>
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={dismiss}
          style={{
            fontFamily: "inherit",
            fontSize: 13,
            lineHeight: 1,
            background: "transparent",
            border: 0,
            color: "#5b616e",
            cursor: "pointer",
            padding: "0 2px",
          }}
        >
          {"×"}
        </button>
      )}
    </span>
  );
}
