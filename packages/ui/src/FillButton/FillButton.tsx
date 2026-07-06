import { bar8 } from "@balaur/octant-core";
import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, useEffect, useRef } from "react";

export interface FillButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children: ReactNode;
  /** Colour of the eighth-block charge fill. Defaults to the accent CSS var. */
  fillColor?: string;
  /** Border colour. Defaults to the accent-tinted border. */
  borderColor?: string;
  style?: CSSProperties;
}

/**
 * A button that "charges" on hover and "fires" on press — the label sits over a
 * `<pre>` framebuffer that fills in eighth-block (`bar8`) increments. The fill
 * animation is imperative (refs + rAF, empty on the server), so SSR emits a
 * static button and the charge effect wires up after hydration.
 */
export function FillButton({
  children,
  fillColor = "var(--bx-accent, #46c66d)",
  borderColor = "#2a3320",
  disabled,
  style,
  ...rest
}: FillButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const fillRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const layer = fillRef.current;
    if (!btn || !layer || disabled) return;

    let frac = 0;
    let target = 0;
    let raf = 0;
    let cols = 20;
    let rows = 3;

    const measure = () => {
      const cs = getComputedStyle(layer);
      const probe = document.createElement("canvas").getContext("2d");
      let cw = parseFloat(cs.fontSize) * 0.6;
      if (probe) {
        probe.font = `${cs.fontSize} ${cs.fontFamily}`;
        cw = probe.measureText("█").width || cw;
      }
      const ch = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) || 13;
      const r = btn.getBoundingClientRect();
      cols = Math.max(2, Math.ceil(r.width / cw));
      rows = Math.max(1, Math.ceil(r.height / ch) + 1);
    };

    const render = () => {
      const ln = bar8(frac, cols);
      layer.textContent = new Array(rows).fill(ln).join("\n");
    };
    const anim = () => {
      frac += (target - frac) * 0.3;
      if (Math.abs(target - frac) < 0.004) {
        frac = target;
        render();
        raf = 0;
        return;
      }
      render();
      raf = requestAnimationFrame(anim);
    };
    const go = (t: number) => {
      target = t;
      if (raf === 0) raf = requestAnimationFrame(anim);
    };

    const onEnter = () => {
      measure();
      go(1);
    };
    const onLeave = () => go(0);
    const onDown = () => {
      measure();
      frac = 0;
      render();
      go(1);
    };

    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("pointerdown", onDown);
    measure();
    render();

    return () => {
      cancelAnimationFrame(raf);
      btn.removeEventListener("pointerenter", onEnter);
      btn.removeEventListener("pointerleave", onLeave);
      btn.removeEventListener("pointerdown", onDown);
    };
  }, [disabled]);

  return (
    <button
      ref={btnRef}
      type="button"
      disabled={disabled}
      style={{
        position: "relative",
        overflow: "hidden",
        fontFamily: "inherit",
        fontSize: 13,
        letterSpacing: "0.1em",
        padding: "12px 20px",
        background: "transparent",
        border: `1px solid ${disabled ? "#1c1d24" : borderColor}`,
        color: disabled ? "#3f424d" : "#f4f6fb",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...rest}
    >
      <pre
        ref={fillRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          margin: 0,
          opacity: 0.9,
          whiteSpace: "pre",
          overflow: "hidden",
          fontSize: 13,
          lineHeight: 1,
          pointerEvents: "none",
          color: fillColor,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
}
