import type { Meta, StoryObj } from "@storybook/react";
import { ScrambleButton } from "./ScrambleButton.tsx";

const meta: Meta<typeof ScrambleButton> = {
  title: "OCTANT/ScrambleButton",
  component: ScrambleButton,
  args: { text: "DECRYPT" },
};
export default meta;
type Story = StoryObj<typeof ScrambleButton>;

export const Default: Story = {};

export const Cyan: Story = {
  args: { text: "DECODE", color: "#2bd9d9", borderColor: "#1d3540" },
};

export const Accent: Story = {
  args: { text: "AUTHORIZE", color: "var(--bx-accent, #46c66d)", borderColor: "var(--bx-border-accent, #2a3320)" },
};

export const Disabled: Story = {
  args: { text: "LOCKED", disabled: true },
};

export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <ScrambleButton text="DECRYPT" />
      <ScrambleButton text="DECODE" color="#2bd9d9" borderColor="#1d3540" />
      <ScrambleButton text="AUTHORIZE" color="var(--bx-accent, #46c66d)" borderColor="var(--bx-border-accent, #2a3320)" />
      <ScrambleButton text="LOCKED" disabled />
    </div>
  ),
};
