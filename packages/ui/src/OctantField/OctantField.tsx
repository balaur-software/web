import { noise, paintBuf } from "@balaur/octant-core";
import { type CSSProperties, useEffect, useRef } from "react";

export interface OctantFieldProps {
  /** RGB the field dots are painted in. Defaults to the OCTANT accent green (#2f9e57-ish). */
  accent?: readonly [number, number, number];
  /** Motion intensity 0..1 (the source's `ambient/10`). Default 0.8. Ignored under reduced-motion. */
  ambient?: number;
  className?: string;
  style?: CSSProperties;
}

const DOT_PX = 4;

/**
 * The cursor-reactive OCTANT background field — a particle flow steered by
 * curl-noise and repelled by the pointer, rasterized through `paintBuf` into a
 * single-colour framebuffer scaled up with `image-rendering: pixelated`.
 *
 * Client-only: the canvas + rAF loop run entirely inside `useEffect` after
 * hydration, so it renders as an inert `<canvas>` on the server (no hydration
 * mismatch, no server-side requestAnimationFrame). This is the reference
 * pattern every Phase-2 canvas component follows.
 */
export function OctantField({ accent = [47, 158, 87], ambient = 0.8, className, style }: OctantFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ar, ag, ab] = accent;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const host = c.parentElement ?? c;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const mot = reduced ? 0 : ambient;

    let fdw = 0;
    let fdh = 0;
    let fbuf: Uint8Array | null = null;
    let pts: { x: number; y: number; vx: number; vy: number }[] = [];
    const ptr = { x: -999, y: -999, active: false };
    const t0 = performance.now();
    let raf = 0;

    const fit = () => {
      const r = c.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const ndw = Math.floor(r.width / DOT_PX);
      const ndh = Math.floor(r.height / DOT_PX);
      if (fbuf && ndw === fdw && ndh === fdh) return;
      fdw = ndw;
      fdh = ndh;
      c.width = fdw;
      c.height = fdh;
      fbuf = new Uint8Array(fdw * fdh);
      const n = Math.floor((fdw * fdh) / 40);
      pts = [];
      for (let i = 0; i < n; i++) {
        pts.push({ x: Math.random() * fdw, y: Math.random() * fdh, vx: 0, vy: 0 });
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * fdw;
      ptr.y = ((e.clientY - r.top) / r.height) * fdh;
      ptr.active = true;
    };
    const onLeave = () => {
      ptr.active = false;
    };

    const step = () => {
      if (!fbuf) return;
      const t = (performance.now() - t0) / 1000;
      const dw = fdw;
      const dh = fdh;
      const buf = fbuf;
      buf.fill(0);
      const sp = 0.4 + mot;
      for (const p of pts) {
        const a = (noise(p.x * 0.02, p.y * 0.02, t * 0.16) - 0.5) * Math.PI * 4;
        p.vx += Math.cos(a) * 0.06 * sp;
        p.vy += Math.sin(a) * 0.06 * sp;
        if (ptr.active) {
          const dx = p.x - ptr.x;
          const dy = p.y - ptr.y;
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
      paintBuf(c, ctx, buf, dw, dh, ar, ag, ab);
    };

    const loop = () => {
      fit();
      step();
      raf = requestAnimationFrame(loop);
    };

    fit();
    window.addEventListener("resize", fit);
    host.addEventListener("pointermove", onMove as EventListener);
    host.addEventListener("pointerleave", onLeave);
    if (reduced) step();
    else loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [ar, ag, ab, ambient]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated", ...style }}
    />
  );
}
