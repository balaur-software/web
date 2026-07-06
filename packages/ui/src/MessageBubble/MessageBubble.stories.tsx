import type { Meta, StoryObj } from "@storybook/react";
import { MessageBubble } from "./MessageBubble.tsx";

const meta: Meta<typeof MessageBubble> = {
  title: "OCTANT/MessageBubble",
  component: MessageBubble,
};
export default meta;

type Story = StoryObj<typeof MessageBubble>;

export const Default: Story = {
  args: {
    role: "user",
    time: "09:41:07",
    children: "Render the throughput series as an octant chart.",
  },
};

export const Agent: Story = {
  args: {
    role: "agent",
    time: "09:41:09",
    children: "On it — pulling the series and rasterising to the lattice now.",
  },
};

export const Conversation: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
      <MessageBubble role="user" time="09:41:07">
        Render the throughput series as an octant chart.
      </MessageBubble>
      <MessageBubble role="agent" time="09:41:09">
        On it — pulling the series and rasterising to the lattice now.
      </MessageBubble>
      <MessageBubble role="user" time="09:41:15">
        Perfect. Overlay the p99 latency as a second band.
      </MessageBubble>
    </div>
  ),
};

export const CustomAvatar: Story = {
  args: {
    role: "agent",
    name: "TOOL",
    time: "09:41:11",
    avatar: "▚▖\n▗▝",
    children: "Query executed — 4,096 rows rasterised to the lattice.",
  },
};
