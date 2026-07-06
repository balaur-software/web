import type { Meta, StoryObj } from "@storybook/react";
import { BrailleSpinner } from "./BrailleSpinner.tsx";

const meta: Meta<typeof BrailleSpinner> = {
  title: "OCTANT/BrailleSpinner",
  component: BrailleSpinner,
};
export default meta;

type Story = StoryObj<typeof BrailleSpinner>;

export const Default: Story = {};

export const Pulse: Story = { args: { variant: "pulse" } };

export const Orbit: Story = { args: { variant: "orbit" } };

export const Grow: Story = { args: { variant: "grow", label: "FILL" } };

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 30,
        flexWrap: "wrap",
        border: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
        padding: 20,
      }}
    >
      <BrailleSpinner variant="wave" label="WAVE" />
      <BrailleSpinner variant="pulse" label="PULSE" />
      <BrailleSpinner variant="orbit" label="ORBIT" />
      <BrailleSpinner variant="grow" label="FILL" />
    </div>
  ),
};

export const Slow: Story = { args: { variant: "wave", speed: 0.5, label: "SLOW" } };
