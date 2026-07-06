import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline } from "./Sparkline.tsx";

const meta: Meta<typeof Sparkline> = {
  title: "OCTANT/Sparkline",
  component: Sparkline,
  args: { label: "throughput", unit: "MB/s" },
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

export const Default: Story = {};

export const Latency: Story = {
  args: { label: "latency", unit: "ms", color: "#f2c94c", spanLabel: "-30s" },
};

export const Dense: Story = {
  args: { label: "packets", unit: "pkt/s", color: "#46c66d", samples: 64 },
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, maxWidth: 900 }}>
      <Sparkline label="throughput" unit="MB/s" color="#ff6b6f" />
      <Sparkline label="latency" unit="ms" color="#4f8cff" />
      <Sparkline label="errors" unit="/min" color="#e5484d" samples={28} />
    </div>
  ),
};
