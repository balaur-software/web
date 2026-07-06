import type { Meta, StoryObj } from "@storybook/react";
import { Marquee } from "./Marquee.tsx";

const meta: Meta<typeof Marquee> = {
  title: "OCTANT/Marquee",
  component: Marquee,
};
export default meta;
type Story = StoryObj<typeof Marquee>;

export const Default: Story = {};

export const Slow: Story = {
  args: { speed: 26, ambient: 0.4 },
};

export const HighEnergy: Story = {
  args: {
    speed: 92,
    ambient: 1,
    items: ["SYSTEM ONLINE", "LATENCY 4MS", "NODES 128 / 128", "THROUGHPUT 9.6 GB/S", "0 ERRORS"],
  },
};

export const CustomContent: Story = {
  render: () => (
    <Marquee separator="◆">
      <span style={{ color: "var(--bx-text-1, #f4f6fb)" }}>BALAUR</span>
      <span aria-hidden="true" style={{ color: "var(--bx-accent, #46c66d)", margin: "0 14px" }}>
        ◆
      </span>
      <span>MEMORY · OCTANT · LLM</span>
      <span aria-hidden="true" style={{ color: "var(--bx-accent, #46c66d)", margin: "0 14px" }}>
        ◆
      </span>
    </Marquee>
  ),
};

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Marquee />
      <Marquee speed={40} separator="•" items={["ENCODE", "QUANTIZE", "DITHER", "RASTER", "EMIT"]} />
    </div>
  ),
};
