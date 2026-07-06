import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge.tsx";

const meta: Meta<typeof Badge> = {
  title: "OCTANT/Badge",
  component: Badge,
  args: { children: "NEW", tone: "accent", count: 4 },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

/** The reference row from the nav/markers section. */
export const ReferenceRow: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Badge tone="accent" count={4}>
        NEW
      </Badge>
      <Badge tone="red" count={2}>
        ERR
      </Badge>
      <Badge tone="neutral" count={128}>
        QUEUE
      </Badge>
    </div>
  ),
};

/** Every tinted-border tone. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Badge tone="accent">ACCENT</Badge>
      <Badge tone="cyan">CYAN</Badge>
      <Badge tone="magenta">MAGENTA</Badge>
      <Badge tone="yellow">YELLOW</Badge>
      <Badge tone="red">RED</Badge>
      <Badge tone="neutral">NEUTRAL</Badge>
    </div>
  ),
};

/** Labels with no trailing count. */
export const LabelOnly: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Badge tone="accent">STABLE</Badge>
      <Badge tone="yellow">BETA</Badge>
      <Badge tone="red">DEPRECATED</Badge>
    </div>
  ),
};
