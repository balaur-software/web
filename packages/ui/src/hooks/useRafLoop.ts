import { useEffect, useRef } from "react";

/**
 * Runs `cb(tSeconds)` every animation frame while `active`. Cancels on unmount /
 * when `active` flips false. The callback is kept in a ref so it can close over
 * fresh state without restarting the loop.
 */
export function useRafLoop(cb: (t: number) => void, active = true): void {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      cbRef.current((performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
