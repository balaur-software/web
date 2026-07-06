import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar.tsx";

const meta: Meta<typeof Avatar> = {
  title: "OCTANT/Avatar",
  component: Avatar,
  args: { seed: "OCTANT" },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

/** The four seeded avatars from the reference, each in its own accent colour. */
export const Gallery: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Avatar seed="OCTANT" />
      <Avatar seed="RELAY-7" color="#2bd9d9" />
      <Avatar seed="BUFFER-X" color="#d79bff" />
      <Avatar seed="SINK-03" color="#f2c94c" />
    </div>
  ),
};

/** Same seed, escalating frame sizes — glyphs scale with the box. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar seed="BALAUR" size={32} />
      <Avatar seed="BALAUR" size={46} />
      <Avatar seed="BALAUR" size={72} />
      <Avatar seed="BALAUR" size={104} />
    </div>
  ),
};

/** Distinct seeds fan out into visibly different mirrored mosaics. */
export const SeedSpread: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {["alice", "bob", "carol", "dave", "erin", "frank", "grace", "heidi"].map((s) => (
        <Avatar key={s} seed={s} />
      ))}
    </div>
  ),
};
