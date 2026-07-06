import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch.tsx";

const meta: Meta<typeof Switch> = {
  title: "OCTANT/Switch",
  component: Switch,
  args: { label: "TELEMETRY" },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const On: Story = { args: { defaultChecked: true, label: "TELEMETRY" } };
export const Off: Story = { args: { defaultChecked: false, label: "VERBOSE LOG" } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true, label: "LOCKED" } };

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 320 }}>
      <Switch defaultChecked label="TELEMETRY" />
      <Switch label="VERBOSE LOG" />
      <Switch disabled defaultChecked label="LOCKED" />
    </div>
  ),
};
