import type { Meta, StoryObj } from "@storybook/react";
import { Steps } from "./Steps.tsx";

const meta: Meta<typeof Steps> = {
  title: "OCTANT/Steps",
  component: Steps,
  args: { steps: ["DECODE", "DITHER", "RENDER", "EXPORT"], defaultStep: 2 },
};
export default meta;
type Story = StoryObj<typeof Steps>;

export const Default: Story = {};

export const First: Story = { args: { defaultStep: 0 } };

export const Complete: Story = {
  args: { steps: ["DECODE", "DITHER", "RENDER", "EXPORT"], defaultStep: 4 },
};

export const ThreeStage: Story = {
  args: { steps: ["QUEUE", "BUILD", "SHIP"], defaultStep: 1 },
};
