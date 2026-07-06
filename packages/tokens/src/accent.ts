/**
 * OCTANT accent system.
 *
 * The accent is a single user-selectable hue with a paired "bright" variant.
 * Unlike the reference's runtime `lighten(rgb, 0.3)`, the token layer hardcodes
 * the three canonical accent -> bright pairs so the bright variant snaps to the
 * intended ANSI bright hues (green -> br.green, cyan -> br.cyan) rather than a
 * computed mix. Zero runtime dependencies.
 */

/** A named accent and its paired bright variant. */
export interface Accent {
  /** Base accent hex, e.g. "#46c66d". */
  readonly hex: string;
  /** Paired bright hex, e.g. "#74e692". */
  readonly bright: string;
}

/** The three selectable accents, keyed by name. */
export const ACCENTS = {
  green: { hex: "#46c66d", bright: "#74e692" },
  amber: { hex: "#ffb000", bright: "#ffc94d" },
  cyan: { hex: "#2bd9d9", bright: "#6ff2f2" },
} as const satisfies Record<string, Accent>;

/** Valid accent names ("green" | "amber" | "cyan"). */
export type AccentName = keyof typeof ACCENTS;

/** The ordered list of accent option hexes. */
export const ACCENT_OPTIONS = [ACCENTS.green.hex, ACCENTS.amber.hex, ACCENTS.cyan.hex] as const;

export type AccentOption = (typeof ACCENT_OPTIONS)[number];

/** Default accent hue (ANSI green). */
export const DEFAULT_ACCENT = ACCENTS.green.hex;

/** Default accent name. */
export const DEFAULT_ACCENT_NAME: AccentName = "green";

/** The CSS custom properties produced for a given accent. */
export interface AccentVars extends Record<string, string> {
  "--bx-accent": string;
  "--bx-accent-bright": string;
}

/** Lookup an accent by its hex value across the known options. */
function byHex(hex: string): Accent | undefined {
  const h = hex.toLowerCase();
  for (const a of Object.values(ACCENTS)) {
    if (a.hex === h) return a;
  }
  return undefined;
}

/** Type guard: is `input` one of the known accent names? */
function isAccentName(input: string): input is AccentName {
  return input in ACCENTS;
}

/**
 * Build the accent CSS custom properties for an accent name or a hex.
 *
 * The three canonical accents (green/amber/cyan) resolve to their hardcoded
 * bright pair. An unrecognized hex is passed through as both `--bx-accent` and
 * `--bx-accent-bright` (no derivation) so callers stay in control.
 */
export function accentVars(input: AccentName | string): AccentVars {
  const accent: Accent | undefined = isAccentName(input) ? ACCENTS[input] : byHex(input);
  if (accent) {
    return {
      "--bx-accent": accent.hex,
      "--bx-accent-bright": accent.bright,
    };
  }
  return {
    "--bx-accent": input,
    "--bx-accent-bright": input,
  };
}
