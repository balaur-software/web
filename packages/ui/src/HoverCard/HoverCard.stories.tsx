import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard } from "./HoverCard.tsx";

const meta: Meta<typeof HoverCard> = {
  title: "OCTANT/HoverCard",
  component: HoverCard,
};
export default meta;
type Story = StoryObj<typeof HoverCard>;

/** The reference handle — hover `@octant-core` and the entity-preview card fades in above it. */
export const Default: Story = {};

/** In flowing prose, exactly as in the reference: the dotted handle sits inline in a sentence. */
export const InSentence: Story = {
  render: (args) => (
    <div style={{ fontSize: 13, color: "#9aa0ad", lineHeight: 1.9, maxWidth: 460 }}>
      Maintained by <HoverCard {...args} /> — hover the handle to preview.
    </div>
  ),
};

/** A different entity + accent colour, driving the deterministic identicon from a new seed. */
export const CustomEntity: Story = {
  args: {
    handle: "@relay-7",
    name: "relay-7",
    subtitle: "edge transport",
    description: "Routes frame buffers between render nodes. 3 shards, p99 4.2ms.",
    seed: "RELAY-7",
    avatarColor: "#2bd9d9",
  },
};

/** Open on mount (no hover needed) so the card layout is visible in a static frame. */
export const AlwaysOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div style={{ paddingTop: 150 }}>
      <HoverCard {...args} />
    </div>
  ),
};

/** No open delay and a long close delay — snaps in instantly, lingers on the way out. */
export const InstantOpen: Story = {
  args: { openDelay: 0, closeDelay: 500 },
};
