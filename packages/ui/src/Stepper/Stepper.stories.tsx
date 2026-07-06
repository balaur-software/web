import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Stepper } from "./Stepper.tsx";

const meta: Meta<typeof Stepper> = {
  title: "OCTANT/Stepper",
  component: Stepper,
};
export default meta;
type Story = StoryObj<typeof Stepper>;

export const Default: Story = {};

export const NearFull: Story = {
  args: { label: "STEPPER · gain", defaultValue: 14, max: 16 },
};

export const Cyan: Story = {
  args: {
    label: "STEPPER · channels",
    defaultValue: 3,
    min: 0,
    max: 8,
    fillColor: "#2bd9d9",
  },
};

export const Disabled: Story = {
  args: { label: "STEPPER · locked", defaultValue: 9, disabled: true },
};

export const Controlled: Story = {
  render: () => {
    const [v, setV] = useState(6);
    return (
      <div style={{ display: "grid", gap: 14, width: 320 }}>
        <Stepper value={v} onChange={setV} label="STEPPER · controlled" />
        <div style={{ color: "#9aa0ad", fontSize: 12 }}>value = {v}</div>
      </div>
    );
  },
};
