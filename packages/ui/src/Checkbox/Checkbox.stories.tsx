import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox.tsx";

const meta: Meta<typeof Checkbox> = {
  title: "OCTANT/Checkbox",
  component: Checkbox,
  args: { label: "ORDERED DITHER" },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Checked: Story = { args: { defaultChecked: true, label: "ORDERED DITHER" } };
export const Unchecked: Story = { args: { defaultChecked: false, label: "WRAP EDGES" } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true, label: "LOCKED" } };

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 320 }}>
      <Checkbox defaultChecked label="ORDERED DITHER" />
      <Checkbox label="WRAP EDGES" />
      <Checkbox label="SERPENTINE SCAN" />
      <Checkbox disabled defaultChecked label="LOCKED" />
    </div>
  ),
};
