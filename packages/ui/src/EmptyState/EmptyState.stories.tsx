import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState.tsx";

const meta: Meta<typeof EmptyState> = {
  title: "OCTANT/EmptyState",
  component: EmptyState,
  args: {
    title: "NO CELLS LIT",
    description: "The octant buffer is empty. Seed it with random cells or start drawing to begin.",
    cta: "SEED RANDOM ▸",
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const NoCta: Story = {
  args: {
    title: "NOTHING TO SHOW",
    description: "There are no records in this view yet.",
    cta: undefined,
  },
};

export const CustomArt: Story = {
  args: {
    title: "SIGNAL LOST",
    description: "The relay dropped its carrier. Retry the handshake to reconnect.",
    art: "░▒▓█▓▒░\n ✗   ✗ \n░▒▓█▓▒░",
    cta: "RETRY ↻",
  },
};

export const CustomAction: Story = {
  args: {
    title: "QUEUE DRAINED",
    description: "All jobs have finished. Enqueue a new batch to continue.",
    cta: undefined,
    action: (
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <span style={{ color: "#5b616e", fontSize: 12 }}>0 pending &middot; 0 running</span>
      </div>
    ),
  },
};
