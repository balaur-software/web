import { type CSSProperties, Fragment, useRef } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useRafLoop } from "../hooks/useRafLoop";
import { useReducedMotion } from "../hooks/useReducedMotion";

const AC = "var(--bx-accent, #46c66d)";
const DIM = "#23252e";
/** RGB of the default accent, used for the animated pulse glow. */
const ACCENT_RGB: readonly [number, number, number] = [70, 198, 109];

export interface StepsProps {
  /** Ordered stage labels — one node is rendered per entry. */
  steps: string[];
  /** Controlled active index. Omit for uncontrolled (use `defaultStep`). */
  step?: number;
  /** Uncontrolled starting index. */
  defaultStep?: number;
  onStepChange?: (index: number) => void;
  style?: CSSProperties;
}

/**
 * A horizontal pipeline stepper: numbered nodes joined by a connecting rail.
 * Nodes before the active stage read as done (accent fill + check), the active
 * node is outlined with a pulsing accent glow, and later nodes stay dim. Click a
 * node to set the stage (`useControllableState`). The glow is written
 * imperatively via `useRafLoop`, so it starts inert on the server and eases in
 * after mount.
 */
export function Steps({ steps, step, defaultStep = 0, onStepChange, style }: StepsProps) {
  const [cur, setCur] = useControllableState(step, defaultStep, onStepChange);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useRafLoop((t) => {
    const nodes = nodeRefs.current;
    const a = 0.5 + 0.5 * Math.sin((t * 1000) / 320);
    const [r, g, b] = ACCENT_RGB;
    const shadow = `0 0 0 ${(1 + a * 4).toFixed(1)}px rgba(${r},${g},${b},${(0.08 + a * 0.22).toFixed(2)})`;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!n) continue;
      n.style.boxShadow = i === cur ? shadow : "none";
    }
  }, !reduced);

  return (
    <div data-steps style={{ display: "flex", alignItems: "flex-start", ...style }}>
      {steps.map((label, i) => {
        const done = i < cur;
        const active = i === cur;
        const nodeBg = done ? AC : "transparent";
        const nodeBorder = done || active ? AC : DIM;
        const nodeColor = done ? "var(--bx-bg, #08080a)" : active ? AC : "#5b616e";
        const nodeText = done ? "✓" : active ? "◆" : String(i + 1);
        const labelColor = done ? "var(--bx-text-4, #9aa0ad)" : active ? "var(--bx-text-1, #f4f6fb)" : "#5b616e";
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: stages are a fixed positional list
          <Fragment key={i}>
            {i > 0 && (
              <div
                data-step-line
                style={{ flex: 1, height: 2, marginTop: 13, background: i <= cur ? AC : DIM }}
              />
            )}
            <div
              data-step
              role="button"
              tabIndex={0}
              aria-current={active ? "step" : undefined}
              onClick={() => setCur(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setCur(i);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                width: 88,
                flex: "none",
                outline: "none",
              }}
            >
              <div
                data-step-node
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${nodeBorder}`,
                  fontSize: 13,
                  background: nodeBg,
                  color: nodeColor,
                }}
              >
                {nodeText}
              </div>
              <div data-step-label style={{ fontSize: 12, color: labelColor }}>
                {label}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
