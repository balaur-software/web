import type { AccentName } from "@balaur/tokens";
import { AccentProvider, FillButton, GlyphReference, OctantField, Palette, Switch } from "@balaur/ui";
import { useState } from "react";

const ACCENTS: { name: AccentName; rgb: [number, number, number] }[] = [
  { name: "green", rgb: [70, 198, 109] },
  { name: "amber", rgb: [255, 176, 0] },
  { name: "cyan", rgb: [43, 217, 217] },
];

function SectionHead({ n, title, meta }: { n: string; title: string; meta: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "72px 0 26px" }}>
      <span style={{ color: "var(--bx-accent, #46c66d)", fontSize: 13 }}>§ {n}</span>
      <h2
        style={{ margin: 0, fontSize: 26, fontWeight: "normal", color: "#f4f6fb", letterSpacing: "0.02em" }}
      >
        {title}
      </h2>
      <span style={{ flex: 1, borderTop: "1px solid #1c1d24", alignSelf: "center" }} />
      <span style={{ color: "#3f424d", fontSize: 13 }}>{meta}</span>
    </div>
  );
}

/**
 * A minimal OCTANT landing screen composed entirely from `@balaur/ui` atoms.
 * Proves the SSR + hydration pipeline: static atoms render server-side, the
 * canvas field + charge/slide effects wire up after hydration, and switching the
 * accent re-skins everything through the `--bx-accent` CSS variable.
 */
export function App() {
  const [accent, setAccent] = useState<AccentName>("green");
  const rgb = ACCENTS.find((a) => a.name === accent)?.rgb ?? ACCENTS[0]!.rgb;

  return (
    <AccentProvider
      accent={accent}
      style={{
        minHeight: "100vh",
        background: "#08080a",
        color: "#c8cdd6",
        fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
        fontSize: 15,
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 16px",
          height: 38,
          background: "rgba(8,8,10,0.86)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid #1a1b22",
        }}
      >
        <span style={{ color: "var(--bx-accent, #46c66d)", letterSpacing: "0.04em" }}>
          {"ANSI//OCTANT.OS"}
        </span>
        <span style={{ color: "#33353f" }}>v1.0</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {ACCENTS.map((a) => (
            <button
              key={a.name}
              type="button"
              onClick={() => setAccent(a.name)}
              aria-pressed={accent === a.name}
              style={{
                fontFamily: "inherit",
                fontSize: 12,
                padding: "4px 9px",
                cursor: "pointer",
                background: "transparent",
                color: accent === a.name ? "#08080a" : "#9aa0ad",
                border: "1px solid #23252e",
                ...(accent === a.name ? { background: `rgb(${a.rgb.join(",")})` } : {}),
              }}
            >
              {a.name.toUpperCase()}
            </button>
          ))}
        </span>
      </header>

      <section
        style={{
          position: "relative",
          height: "62vh",
          minHeight: 440,
          overflow: "hidden",
          borderBottom: "1px solid #1a1b22",
        }}
      >
        <OctantField accent={rgb} style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 7vw",
            pointerEvents: "none",
          }}
        >
          <div style={{ color: "#5b616e", fontSize: 13, marginBottom: 18, letterSpacing: "0.12em" }}>
            {"// A DESIGN SYSTEM RENDERED IN CELLS"}
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(48px,11vw,150px)",
              lineHeight: 0.9,
              color: "#f4f6fb",
              fontWeight: "normal",
            }}
          >
            OCTANT
          </h1>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(48px,11vw,150px)",
              lineHeight: 0.9,
              color: "var(--bx-accent, #46c66d)",
              fontWeight: "normal",
            }}
          >
            INTERFACE
          </h1>
          <p style={{ maxWidth: 560, margin: "26px 0 0", color: "#9aa0ad", fontSize: 15, lineHeight: 1.6 }}>
            Every surface is a grid of Unicode 2×4 octant cells (U+1CD00) and legacy block elements. Density
            is the only channel. Move your cursor across the field.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 96px" }}>
        <SectionHead n="01" title="PALETTE" meta="16 / ANSI" />
        <Palette />

        <SectionHead n="02" title="GLYPH PRIMITIVES" meta="U+1CD00 · U+2580" />
        <GlyphReference />

        <SectionHead n="03" title="COMPONENTS / ATOMIC" meta="INTERACTIVE" />
        <div style={{ border: "1px solid #1c1d24", background: "#0c0d11", padding: 24, marginBottom: 14 }}>
          <div style={{ color: "#5b616e", fontSize: 12, marginBottom: 20 }}>
            BUTTONS — hover to charge, click to fire
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
            <FillButton>EXECUTE ▸</FillButton>
            <FillButton fillColor="#2bd9d9" borderColor="#1d3540">
              COMPILE
            </FillButton>
            <FillButton disabled>LOCKED</FillButton>
          </div>
        </div>
        <div style={{ border: "1px solid #1c1d24", background: "#0c0d11", padding: 24 }}>
          <div style={{ color: "#5b616e", fontSize: 12, marginBottom: 20 }}>SWITCHES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 340 }}>
            <Switch defaultChecked label="TELEMETRY" />
            <Switch label="VERBOSE LOG" />
          </div>
        </div>
      </main>
    </AccentProvider>
  );
}
