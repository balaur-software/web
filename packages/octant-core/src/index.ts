// @balaur/octant-core — pure, framework-agnostic, zero-dependency rendering core
// for the OCTANT design system.

export { bar8, E } from "./bars";
export type { RGB } from "./color";
export { hexRGB, lighten, rgbHex } from "./color";
export { bit, glyphSupported, OCTANT_BASE, octChar, sext } from "./encode";
export { BAYER, noise, sphereLum, V } from "./field";
export { EQC, G, GROW, ORBIT, PULSE, SHADE, VBLOCKS, WAVE } from "./ramps";
export { noiseBars, seededRandom } from "./rand";
export type { Buf, LUT, MutBuf, ValBuf } from "./raster";
export { drawLine, paintBuf, paintLUT, paintVal, strokeArc } from "./raster";
export type { OctantMaskFieldOpts } from "./sample";
export { octantMaskField } from "./sample";
export { SCRAMBLE_GLYPHS, scrambleFrame } from "./text";
