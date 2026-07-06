import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton.tsx";

const meta: Meta<typeof Skeleton> = {
  title: "OCTANT/Skeleton",
  component: Skeleton,
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

/** The reference card: an avatar block, three header rows, two footer rows. */
export const Default: Story = {};

/** No avatar — a plain block of text placeholder rows. */
export const TextBlock: Story = {
  args: {
    label: "SKELETON · article",
    avatar: false,
    lines: ["100%", "96%", "88%", "72%", "40%"],
    footerLines: [],
  },
};

/** A media object with a larger avatar and a couple of caption rows. */
export const MediaObject: Story = {
  args: {
    label: "SKELETON · media",
    avatarSize: 72,
    lines: ["64%", "42%"],
    footerLines: [],
  },
};

/** A stack of full-width rows for list / feed placeholders. */
export const List: Story = {
  args: {
    label: "SKELETON · feed",
    avatar: false,
    lines: [],
    footerLines: ["100%", "100%", "100%", "100%", "100%"],
    lineHeight: 14,
    gap: 12,
  },
};
