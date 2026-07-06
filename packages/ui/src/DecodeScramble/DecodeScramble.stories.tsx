import type { Meta, StoryObj } from "@storybook/react";
import { DecodeScramble } from "./DecodeScramble.tsx";

const meta: Meta<typeof DecodeScramble> = {
  title: "OCTANT/DecodeScramble",
  component: DecodeScramble,
  args: { text: "DESERIALIZE" },
};
export default meta;
type Story = StoryObj<typeof DecodeScramble>;

export const Default: Story = {};

export const Hover: Story = {
  args: { text: "REPLICATE", trigger: "hover" },
};

export const CyanFast: Story = {
  args: { text: "HANDSHAKE", color: "var(--bx-ansi-6, #2bd9d9)", dur: 500 },
};

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ color: "#3f424d", fontSize: 11 }}>click to replay &middot; scramble &rarr; resolve, left to right</div>
      <DecodeScramble text="DESERIALIZE" />
      <DecodeScramble text="RECONSTRUCT" color="var(--bx-accent, #46c66d)" />
      <DecodeScramble text="TERMINATE" color="var(--bx-ansi-3, #f2c94c)" fontSize={24} />
    </div>
  ),
};
