// Framebuffer -> canvas ImageData rasterizers, ported from the OCTANT reference.
//
// NOTE: both functions require a DOM canvas 2D context. Not unit-tested (bun test
// has no DOM); exercised only in the browser.

/** A 1-bit-per-cell framebuffer: nonzero = lit. */
export type Buf = ArrayLike<number>;
/** A float-per-cell framebuffer: value in [0,1] scales brightness (clamped at 1). */
export type ValBuf = ArrayLike<number>;

/**
 * Paint a boolean framebuffer to a canvas at 1 pixel per cell in a single solid
 * color (r,g,b), fully opaque where the cell is lit and transparent elsewhere.
 */
export function paintBuf(
  c: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  buf: Buf,
  dw: number,
  dh: number,
  r: number,
  g: number,
  b: number,
): void {
  if (c.width !== dw || c.height !== dh) {
    c.width = dw;
    c.height = dh;
  }
  const im = ctx.createImageData(dw, dh);
  const d = im.data;
  for (let i = 0, j = 0; i < buf.length; i++, j += 4) {
    if (buf[i]) {
      d[j] = r;
      d[j + 1] = g;
      d[j + 2] = b;
      d[j + 3] = 255;
    }
  }
  ctx.putImageData(im, 0, 0);
}

/**
 * Paint a float framebuffer to a canvas at 1 pixel per cell, modulating (r,g,b)
 * by the per-cell value (clamped to [0,1]); cells <= 0 stay transparent.
 */
export function paintVal(
  c: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  vbuf: ValBuf,
  dw: number,
  dh: number,
  r: number,
  g: number,
  b: number,
): void {
  if (c.width !== dw || c.height !== dh) {
    c.width = dw;
    c.height = dh;
  }
  const im = ctx.createImageData(dw, dh);
  const d = im.data;
  for (let i = 0, j = 0; i < vbuf.length; i++, j += 4) {
    let v = vbuf[i] ?? 0;
    if (v > 0) {
      if (v > 1) v = 1;
      d[j] = r * v;
      d[j + 1] = g * v;
      d[j + 2] = b * v;
      d[j + 3] = 255;
    }
  }
  ctx.putImageData(im, 0, 0);
}
