import type { Meta, StoryObj } from "@storybook/react";
import { Equalizer } from "./Equalizer.tsx";

const meta: Meta<typeof Equalizer> = {
  title: "OCTANT/Equalizer",
  component: Equalizer,
};
export default meta;
type Story = StoryObj<typeof Equalizer>;

export const Default: Story = {};

export const FewBands: Story = {
  args: { bands: 8, label: "SPECTRUM · 8 bands" },
};

export const HighResolution: Story = {
  args: { bands: 32, fontSize: 28, label: "SPECTRUM · 32 bands" },
};

export const Calm: Story = {
  args: { motion: 0.1, label: "SPECTRUM · calm" },
};

export const Monochrome: Story = {
  args: { colors: ["var(--bx-accent, #46c66d)"], label: "MONO SPECTRUM" },
};
