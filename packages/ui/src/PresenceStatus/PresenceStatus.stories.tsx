import type { Meta, StoryObj } from "@storybook/react";
import { PresenceStatus } from "./PresenceStatus.tsx";

const meta: Meta<typeof PresenceStatus> = {
  title: "OCTANT/PresenceStatus",
  component: PresenceStatus,
};
export default meta;

type Story = StoryObj<typeof PresenceStatus>;

/** The default ONLINE / THINKING / IDLE trio, with the live blinking ONLINE dot. */
export const Default: Story = {};

/** A pool of named agents, each with a custom meta readout. */
export const AgentPool: Story = {
  args: {
    items: [
      { label: "AGENT-01", state: "online", meta: "12 tasks" },
      { label: "AGENT-02", state: "online", meta: "3 tasks" },
      { label: "AGENT-03", state: "thinking", meta: "reasoning" },
      { label: "AGENT-04", state: "idle", meta: "queued" },
    ],
  },
};

/** A single online row — the minimal presence indicator. */
export const SingleOnline: Story = {
  args: {
    items: [{ label: "ONLINE", state: "online" }],
  },
};

/** Per-row dot-colour overrides on top of the preset tones. */
export const CustomColors: Story = {
  args: {
    items: [
      { label: "TOOL", state: "online", color: "#2bd9d9", meta: "web_search" },
      { label: "SYSTEM", state: "online", color: "#c061ff", meta: "broadcast" },
      { label: "ERROR", state: "thinking", color: "#ff6b6f", meta: "retrying" },
    ],
  },
};
