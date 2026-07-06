// Deterministic pseudo-random helpers, ported from the OCTANT reference.

import { noise } from "./field";

/**
 * Seed a small PRNG from a string: FNV-1a hash of the string, then a xorshift32
 * generator. Ported verbatim from `initAvatar`. Returns a closure producing
 * values in `[0, 1]` (the divisor is `0xFFFFFFFF`, so `1` is theoretically
 * reachable but astronomically rare); successive calls advance the state.
 */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (): number => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967295;
  };
}

/**
 * Generate `n` ramp indices in `0..8` from 3D value `noise`, as shared by the
 * equalizer / sparkline. Bar `i` at time `t` is
 * `round(noise(i*0.5, t*1.6*sp, i*7.3) * 9)` clamped to `[0, 8]`.
 */
export function noiseBars(t: number, n: number, sp = 1): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const v = noise(i * 0.5, t * 1.6 * sp, i * 7.3);
    out.push(Math.max(0, Math.min(8, Math.round(v * 9))));
  }
  return out;
}
