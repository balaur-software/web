import type { Meta, StoryObj } from "@storybook/react";
import { ScrambleHeading } from "./ScrambleHeading.tsx";

const meta: Meta<typeof ScrambleHeading> = {
  title: "OCTANT/ScrambleHeading",
  component: ScrambleHeading,
  args: { text: "COMPONENT INDEX" },
};
export default meta;
type Story = StoryObj<typeof ScrambleHeading>;

export const Default: Story = {};

export const Accent: Story = {
  args: { text: "SIGNAL / SCOPE", accent: true },
};

export const Hero: Story = {
  args: { text: "OCTANT" },
  render: () => (
    <div style={{ display: "grid", gap: 4 }}>
      <ScrambleHeading
        as="h1"
        text="OCTANT"
        dur={1100}
        style={{ fontSize: "clamp(48px, 11vw, 150px)", lineHeight: 0.9, letterSpacing: "-0.01em" }}
      />
      <ScrambleHeading
        as="h1"
        accent
        text="INTERFACE"
        dur={1100}
        delay={160}
        style={{ fontSize: "clamp(48px, 11vw, 150px)", lineHeight: 0.9, letterSpacing: "-0.01em" }}
      />
    </div>
  ),
};

export const Stack: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 28 }}>
      <ScrambleHeading text="PALETTE" />
      <ScrambleHeading text="GLYPH PRIMITIVES" delay={140} />
      <ScrambleHeading text="LOADERS / METERS" delay={280} />
      <ScrambleHeading text="TYPOGRAPHY FX" accent delay={420} />
    </div>
  ),
};
