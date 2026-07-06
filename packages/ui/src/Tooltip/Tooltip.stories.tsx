import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip.tsx";

const meta: Meta<typeof Tooltip> = {
  title: "OCTANT/Tooltip",
  component: Tooltip,
  args: { children: "OCTANT", tip: "2×4 sub-pixel grid · U+1CD00" },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};

export const Cyan: Story = {
  args: {
    children: "DITHER",
    tip: "density mapped to luminance",
    color: "#2bd9d9",
    underlineColor: "var(--bx-border-cyan, #1d3540)",
  },
};

export const Magenta: Story = {
  args: {
    children: "ANSI",
    tip: "16 hues · 8 base + 8 bright",
    color: "#d79bff",
    underlineColor: "var(--bx-border-magenta, #3a2540)",
  },
};

export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", paddingTop: 40 }}>
      <Tooltip tip="2×4 sub-pixel grid · U+1CD00">OCTANT</Tooltip>
      <Tooltip tip="density mapped to luminance" color="#2bd9d9" underlineColor="var(--bx-border-cyan, #1d3540)">
        DITHER
      </Tooltip>
      <Tooltip tip="16 hues · 8 base + 8 bright" color="#d79bff" underlineColor="var(--bx-border-magenta, #3a2540)">
        ANSI
      </Tooltip>
      <span style={{ color: "#3f424d", fontSize: 11 }}>hover — text resolves out of static</span>
    </div>
  ),
};
