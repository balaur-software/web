import type { Meta, StoryObj } from "@storybook/react";
import { ScanButton } from "./ScanButton.tsx";

const meta: Meta<typeof ScanButton> = {
  title: "OCTANT/ScanButton",
  component: ScanButton,
  args: { children: "SCAN" },
};
export default meta;
type Story = StoryObj<typeof ScanButton>;

export const Default: Story = {};

export const Cyan: Story = {
  args: { children: "PROBE", scanColor: "#2bd9d9", borderColor: "#1d3540" },
};

export const Magenta: Story = {
  args: { children: "TRACE", scanColor: "#d79bff", borderColor: "#3a2540" },
};

export const Disabled: Story = {
  args: { children: "OFFLINE", disabled: true },
};

export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <ScanButton>SCAN</ScanButton>
      <ScanButton scanColor="#2bd9d9" borderColor="#1d3540">
        PROBE
      </ScanButton>
      <ScanButton scanColor="#d79bff" borderColor="#3a2540">
        TRACE
      </ScanButton>
      <ScanButton disabled>OFFLINE</ScanButton>
    </div>
  ),
};
