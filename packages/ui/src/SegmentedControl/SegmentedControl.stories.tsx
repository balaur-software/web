import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl.tsx";

const meta: Meta<typeof SegmentedControl> = {
  title: "OCTANT/SegmentedControl",
  component: SegmentedControl,
  args: { options: ["LOW", "MED", "HIGH"], "aria-label": "Intensity" },
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {};

export const PreSelected: Story = {
  args: { options: ["LOW", "MED", "HIGH"], defaultValue: "HIGH" },
};

export const ManyOptions: Story = {
  args: { options: ["1H", "24H", "7D", "30D", "ALL"], defaultValue: "24H", "aria-label": "Range" },
};

export const Controlled: Story = {
  render: (args) => {
    const [val, setVal] = useState("MED");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SegmentedControl {...args} value={val} onChange={setVal} />
        <div style={{ color: "#7b8290", fontSize: 12 }}>selected: {val}</div>
      </div>
    );
  },
};
