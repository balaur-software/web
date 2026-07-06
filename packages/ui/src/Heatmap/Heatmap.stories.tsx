import type { Meta, StoryObj } from "@storybook/react";
import { Heatmap } from "./Heatmap.tsx";

const meta: Meta<typeof Heatmap> = {
  title: "OCTANT/Heatmap",
  component: Heatmap,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Heatmap>;

export const Default: Story = {};

export const Cyan: Story = {
  args: { color: "#2bd9d9", label: "HEATMAP · latency" },
};

export const Amber: Story = {
  args: { color: "#f2c94c", label: "HEATMAP · load" },
};

export const Compact: Story = {
  args: { rows: 5, cols: 16, label: "HEATMAP · commits" },
};
