import type { CSSProperties } from "react";
import { seededRandom } from "@balaur/octant-core";

const ON = "█"; // █ full octant cell
const OFF = "·"; // · middot

/**
 * Build the mirrored 5×5 octant-block mosaic for a seed. Ported from
 * `initAvatar`: an FNV-1a → xorshift32 PRNG ({@link seededRandom}) fills the
 * left three columns of each of five rows, then columns 3/4 mirror columns
 * 1/0, giving a vertically-symmetric identicon. Pure and deterministic, so it
 * renders identically on server and client — no hydration flash.
 */
export function avatarMosaic(seed: string): string {
  const rnd = seededRandom(seed);
  const rows: string[] = [];
  for (let y = 0; y < 5; y++) {
    const c: number[] = [];
    for (let x = 0; x < 3; x++) c[x] = rnd() > 0.5 ? 1 : 0;
    c[3] = c[1]!;
    c[4] = c[0]!;
    rows.push(c.map((v) => (v ? ON : OFF)).join(""));
  }
  return rows.join("\n");
}

export interface AvatarProps {
  /** Name/id hashed into the identicon. Same seed always yields the same block grid. */
  seed: string;
  /** Edge length of the square frame, in px. Default 46. */
  size?: number;
  /** Glyph colour. Default the accent green. */
  color?: string;
  /**
   * Mosaic font size, in px. Defaults to a value proportioned to {@link size}
   * (≈ size / 5.1, matching the reference's 9px glyphs in a 46px frame).
   */
  fontSize?: number;
}

/**
 * A procedural, deterministic identicon (section §avatars): a hash of the
 * `seed` string seeds a mirrored octant-block `<pre>` mosaic. Pure static
 * markup — the grid is computed during render, so it is stable across the
 * server/client boundary.
 */
export function Avatar({ seed, size = 46, color = "var(--bx-accent, #46c66d)", fontSize }: AvatarProps) {
  const frame: CSSProperties = {
    width: size,
    height: size,
    flex: "none",
    border: "1px solid var(--bx-border, #1c1d24)",
    background: "var(--bx-surface-3, #0c0d11)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };
  const grid: CSSProperties = {
    margin: 0,
    fontSize: fontSize ?? Math.round(size / 5.1),
    lineHeight: 1,
    color,
    whiteSpace: "pre",
    letterSpacing: 0,
    opacity: 0.92,
    fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
  };
  return (
    <div style={frame}>
      <pre style={grid}>{avatarMosaic(seed)}</pre>
    </div>
  );
}
