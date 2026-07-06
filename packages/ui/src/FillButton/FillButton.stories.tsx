import type { Meta, StoryObj } from "@storybook/react";
import { FillButton } from "./FillButton.tsx";

const meta: Meta<typeof FillButton> = {
  title: "OCTANT/FillButton",
  component: FillButton,
  args: { children: "EXECUTE ▸" },
};
export default meta;
type Story = StoryObj<typeof FillButton>;

export const Accent: Story = {};

export const Cyan: Story = {
  args: { children: "COMPILE", fillColor: "#2bd9d9", borderColor: "#1d3540" },
};

export const Disabled: Story = {
  args: { children: "LOCKED", disabled: true },
};

export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <FillButton>EXECUTE ▸</FillButton>
      <FillButton fillColor="#2bd9d9" borderColor="#1d3540">
        COMPILE
      </FillButton>
      <FillButton disabled>LOCKED</FillButton>
    </div>
  ),
};
