import { noise, paintBuf } from "@balaur/octant-core";
import { type CSSProperties, useRef } from "react";
import { useOctantCanvas } from "../hooks/useOctantCanvas";
import { usePointerCell } from "../hooks/usePointerCell";

export interface OctantFieldProps {
  /** RGB the field dots are painted in. Defaults to the OCTANT accent green. */
  accent?: readonly [number, number, number];
  /** Motion intensity 0..1 (the source's `ambient/10`). Default 0.8. Ignored under reduced-motion. */
  ambient?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * The cursor-reactive OCTANT background field — a particle flow steered by
 * curl-noise and repelled by the pointer, rasterized through `paintBuf`. Now
 * built on the shared `useOctantCanvas` engine (fit/rAF/gating/cleanup) +
 * `usePointerCell`; the component only owns its particle simulation. Renders an
 * inert `<canvas>` on the server.
 */
export function OctantField({ accent = [47, 158, 87], ambient = 0.8, className, style }: OctantFieldProps) {
  const [ar, ag, ab] = accent;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptr = usePointerCell(canvasRef);
  const sim = useRef<{ buf: Uint8Array; pts: { x: number; y: number; vx: number; vy: number }[] }>({
    buf: new Uint8Array(0),
    pts: [],
  });

  useOctantCanvas(
    {
      dotPx: 4,
      onResize: (dw, dh) => {
        sim.current.buf = new Uint8Array(dw * dh);
        const n = Math.floor((dw * dh) / 40);
        sim.current.pts = Array.from({ length: n }, () => ({
          x: Math.random() * dw,
          y: Math.random() * dh,
          vx: 0,
          vy: 0,
        }));
      },
      draw: ({ canvas, ctx, dw, dh, t }) => {
        const { buf, pts } = sim.current;
        if (buf.length !== dw * dh) return;
        buf.fill(0);
        const sp = 0.4 + ambient;
        const active = ptr.current.active;
        const px = ptr.current.u * dw;
        const py = ptr.current.v * dh;
        for (const p of pts) {
          const a = (noise(p.x * 0.02, p.y * 0.02, t * 0.16) - 0.5) * Math.PI * 4;
          p.vx += Math.cos(a) * 0.06 * sp;
          p.vy += Math.sin(a) * 0.06 * sp;
          if (active) {
            const dx = p.x - px;
            const dy = p.y - py;
            const d2 = dx * dx + dy * dy;
            const R = 20;
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1;
              const f = ((R - d) / R) * 2.4;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }
          p.vx *= 0.9;
          p.vy *= 0.9;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x += dw;
          if (p.x >= dw) p.x -= dw;
          if (p.y < 0) p.y += dh;
          if (p.y >= dh) p.y -= dh;
          buf[(p.y | 0) * dw + (p.x | 0)] = 1;
        }
        paintBuf(canvas, ctx, buf, dw, dh, ar, ag, ab);
      },
    },
    canvasRef,
  );

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated", ...style }}
    />
  );
}
