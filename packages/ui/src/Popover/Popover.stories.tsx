import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider } from "../primitives";
import { Popover } from "./Popover.tsx";

const meta: Meta<typeof Popover> = {
  title: "OCTANT/Popover",
  component: Popover,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Popover>;

/** The reference popover — CONFIGURE opens a density toggle; APPLY closes it and fires a toast. */
export const Default: Story = {};

export const CustomControls: Story = {
  args: {
    label: "ENCODER",
    title: "GLYPH SET",
    description: "Which sub-cell encoder rasterises each frame.",
    options: ["OCTANT", "QUAD", "BRAILLE"],
    defaultValue: "OCTANT",
    applyLabel: "COMMIT",
    toastMessage: "Encoder committed",
    width: 264,
  },
};

export const EndAligned: Story = {
  render: (args) => (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Popover {...args} align="end" />
    </div>
  ),
};

export const TwoUp: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 40 }}>
      <Popover label="DENSITY" />
      <Popover
        label="THEME"
        title="SURFACE TINT"
        description="Base tint applied to floating surfaces."
        options={["COOL", "NEUTRAL", "WARM"]}
        defaultValue="NEUTRAL"
        toastMessage="Tint applied"
      />
    </div>
  ),
};
