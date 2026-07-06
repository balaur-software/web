import { type RefObject, useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface OctantCanvasFrame {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** Cell-grid width (canvas.width) — `floor(cssWidth / dotPx)`. */
  dw: number;
  /** Cell-grid height (canvas.height). */
  dh: number;
  /** Seconds since the effect started. */
  t: number;
}

export interface UseOctantCanvasOptions {
  /** Called each frame (or once, when not animating) to paint the canvas. */
  draw: (frame: OctantCanvasFrame) => void;
  /** CSS px per octant cell. Default 4. */
  dotPx?: number;
  /** Called when the cell grid resizes — reallocate framebuffers here. */
  onResize?: (dw: number, dh: number) => void;
  /** Pause the loop while offscreen (IntersectionObserver). Default true. */
  gated?: boolean;
  /** Run an rAF loop. Default true. When false (or reduced-motion), draws once + on resize. */
  animate?: boolean;
}

/**
 * The shared client-only canvas engine generalized from `OctantField`: fits the
 * canvas to `floor(cssSize / dotPx)` cells, runs an rAF loop (viewport-gated,
 * reduced-motion aware), and tears everything down on unmount. Components own
 * their framebuffer (allocate in `onResize`) and paint in `draw` via
 * `paintBuf`/`paintVal`/`paintLUT`. Renders inert on the server.
 */
export function useOctantCanvas(
  opts: UseOctantCanvasOptions,
  externalRef?: RefObject<HTMLCanvasElement | null>,
): RefObject<HTMLCanvasElement | null> {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef ?? internalRef;
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const reduced = useReducedMotion();

  // biome-ignore lint/correctness/useExhaustiveDependencies: canvas ref is stable; loop is set up once, fresh props read via optsRef each frame.
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dotPx = optsRef.current.dotPx ?? 4;
    const gated = optsRef.current.gated ?? true;
    const animate = (optsRef.current.animate ?? true) && !reduced;

    let dw = 0;
    let dh = 0;
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    const fit = (): boolean => {
      const r = c.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return dw > 0;
      const ndw = Math.max(1, Math.floor(r.width / dotPx));
      const ndh = Math.max(1, Math.floor(r.height / dotPx));
      if (ndw !== dw || ndh !== dh) {
        dw = ndw;
        dh = ndh;
        c.width = dw;
        c.height = dh;
        optsRef.current.onResize?.(dw, dh);
      }
      return true;
    };

    const frame = () => {
      if (fit() && (!gated || visible)) {
        optsRef.current.draw({ canvas: c, ctx, dw, dh, t: (performance.now() - t0) / 1000 });
      }
    };

    let io: IntersectionObserver | undefined;
    if (gated) {
      io = new IntersectionObserver(([e]) => {
        visible = e?.isIntersecting ?? true;
      });
      io.observe(c);
    }

    const onResize = () => {
      fit();
      if (!animate) frame();
    };
    window.addEventListener("resize", onResize);

    if (animate) {
      const loop = () => {
        frame();
        raf = requestAnimationFrame(loop);
      };
      loop();
    } else {
      frame();
    }

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return ref;
}
