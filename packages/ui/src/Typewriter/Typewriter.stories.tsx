import type { Meta, StoryObj } from "@storybook/react";
import { Typewriter } from "./Typewriter.tsx";

const meta: Meta<typeof Typewriter> = {
  title: "OCTANT/Typewriter",
  component: Typewriter,
};
export default meta;
type Story = StoryObj<typeof Typewriter>;

export const Default: Story = {};

export const SinglePhrase: Story = {
  args: { text: "just Unicode.", loop: false },
};

export const NoPrompt: Story = {
  args: { text: "no canvas. no images.", loop: false, prompt: null },
};

export const Fast: Story = {
  args: {
    text: ["initialising kernel", "mounting glyph buffer", "ready."],
    speed: 28,
    hold: 700,
    fontSize: 15,
  },
};

export const NoCaret: Story = {
  args: { text: "steady output, no cursor", loop: false, caret: false },
};
