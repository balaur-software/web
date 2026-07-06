import type { Meta, StoryObj } from "@storybook/react";
import { ScrollReveal } from "./ScrollReveal.tsx";

const meta: Meta<typeof ScrollReveal> = {
  title: "OCTANT/ScrollReveal",
  component: ScrollReveal,
};
export default meta;
type Story = StoryObj<typeof ScrollReveal>;

const card = {
  border: "1px solid var(--bx-border, #1c1d24)",
  background: "var(--bx-surface-3, #0c0d11)",
  padding: 22,
  color: "var(--bx-text-2, #cfd3db)",
  lineHeight: 1.7,
  fontSize: 13,
} as const;

/** Fade + rise reveal of arbitrary children on first view. */
export const Default: Story = {
  render: () => (
    <ScrollReveal>
      <div style={card}>
        <div style={{ color: "var(--bx-text-4, #9aa0ad)", fontSize: 12, marginBottom: 10 }}>§ REVEAL</div>
        Everything below the fold fades up as it enters the viewport — the section decode pass, generalised into a
        wrapper.
      </div>
    </ScrollReveal>
  ),
};

/** Text that glyph-scrambles itself into place as it appears. */
export const ScrambleText: Story = {
  render: () => (
    <ScrollReveal
      scramble="SIGNAL ACQUIRED"
      style={{ fontSize: 30, letterSpacing: "0.06em", color: "var(--bx-accent, #46c66d)" }}
    />
  ),
};

/** A staggered stack: scroll the panel to watch each row decode in turn. */
export const Staggered: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 18 }}>
      {["MEMORY LAYER", "OCTANT SYSTEM", "LLM SURFACE", "TERMINAL SHELL"].map((t, i) => (
        <ScrollReveal key={t} scramble={t} delay={i * 120} style={{ fontSize: 22, color: "var(--bx-text-1, #f4f6fb)" }} />
      ))}
    </div>
  ),
};

/** Reveals appearing far down a tall scroll region, so the intersection gate is visible in action. */
export const OnScroll: Story = {
  render: () => (
    <div style={{ height: 900, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 20 }}>
      <div style={{ color: "var(--bx-text-4, #9aa0ad)", fontSize: 12 }}>↓ scroll down ↓</div>
      <ScrollReveal>
        <div style={card}>This card only fades in once it is scrolled into the viewport.</div>
      </ScrollReveal>
      <ScrollReveal scramble="DECODE ON ARRIVAL" delay={120} style={{ fontSize: 26, color: "var(--bx-accent, #46c66d)" }} />
    </div>
  ),
};
