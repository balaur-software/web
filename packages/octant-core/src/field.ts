// Deterministic field / lighting math, ported from the OCTANT reference.

/**
 * 4x4 ordered (Bayer) dither threshold matrix, row-major. A cell is lit when its
 * luminance exceeds `(BAYER[(y&3)*4 + (x&3)] + 0.5) / 16`.
 */
export const BAYER: readonly number[] = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Unit-cube vertices, used by the wireframe cube demo. */
export const V: ReadonlyArray<readonly [number, number, number]> = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

/**
 * Deterministic 3D value noise in [0,1]. Integer-hashed lattice corners are
 * smoothstep-interpolated on each axis. Pure and stable for a given (x,y,z).
 */
export function noise(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const h = (a: number, b: number, c: number): number => {
    let n = (a * 374761393 + b * 668265263 + c * 1274126177) | 0;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  };
  const L = (a: number, b: number, t: number): number => a + (b - a) * t;
  const c000 = h(xi, yi, zi);
  const c100 = h(xi + 1, yi, zi);
  const c010 = h(xi, yi + 1, zi);
  const c110 = h(xi + 1, yi + 1, zi);
  const c001 = h(xi, yi, zi + 1);
  const c101 = h(xi + 1, yi, zi + 1);
  const c011 = h(xi, yi + 1, zi + 1);
  const c111 = h(xi + 1, yi + 1, zi + 1);
  const x00 = L(c000, c100, u);
  const x10 = L(c010, c110, u);
  const x01 = L(c001, c101, u);
  const x11 = L(c011, c111, u);
  return L(L(x00, x10, v), L(x01, x11, v), w);
}

/**
 * Lambert-shaded unit sphere with a rotating longitudinal stripe texture.
 * `(nx,ny)` are normalized screen coords in [-1,1]; returns 0 outside the disc,
 * otherwise a luminance in [0,1]. `t` rotates the stripe; `(lx,ly)` is the light
 * direction (z is fixed at 0.85).
 */
export function sphereLum(nx: number, ny: number, t: number, lx: number, ly: number): number {
  const r2 = nx * nx + ny * ny;
  if (r2 > 1) return 0;
  const nz = Math.sqrt(1 - r2);
  const lz = 0.85;
  const ll = Math.hypot(lx, ly, lz) || 1;
  const ax = lx / ll;
  const ay = ly / ll;
  const az = lz / ll;
  let d = nx * ax + ny * ay + nz * az;
  if (d < 0) d = 0;
  const lon = Math.atan2(nx, nz) + t;
  const stripe = 0.5 + 0.5 * Math.sin(lon * 9);
  const tex = 0.6 + 0.4 * stripe;
  let lum = d * d * tex;
  lum = lum * 1.1 + 0.05;
  return lum > 1 ? 1 : lum;
}
