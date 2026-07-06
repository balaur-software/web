import type { Meta, StoryObj } from "@storybook/react";
import { DeployButton } from "./DeployButton.tsx";

const meta: Meta<typeof DeployButton> = {
  title: "OCTANT/DeployButton",
  component: DeployButton,
};
export default meta;
type Story = StoryObj<typeof DeployButton>;

export const Default: Story = {};

export const CustomLabel: Story = {
  args: { label: "SHIP ▸" },
};

export const Cyan: Story = {
  args: {
    label: "PUBLISH ▸",
    accent: "#2bd9d9",
    accentBright: "#7ff0f0",
    borderColor: "#1d3540",
  },
};

export const Disabled: Story = {
  args: { label: "LOCKED", disabled: true },
};

export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <DeployButton />
      <DeployButton label="SHIP ▸" accent="#2bd9d9" accentBright="#7ff0f0" borderColor="#1d3540" />
      <DeployButton label="LOCKED" disabled />
    </div>
  ),
};
