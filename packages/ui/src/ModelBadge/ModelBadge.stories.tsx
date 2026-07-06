import type { Meta, StoryObj } from "@storybook/react";
import { ModelBadge } from "./ModelBadge.tsx";

const meta: Meta<typeof ModelBadge> = {
  title: "OCTANT/ModelBadge",
  component: ModelBadge,
};
export default meta;

type Story = StoryObj<typeof ModelBadge>;

export const Default: Story = {};

export const CustomModel: Story = {
  args: {
    model: "OCTANT-4-TURBO",
    meta: ["CTX 256K", "TEMP 0.2", "TOP-P 0.9"],
  },
};

export const ModelOnly: Story = {
  args: {
    model: "OCTANT-MINI",
    meta: [],
  },
};

export const CustomGlyph: Story = {
  args: {
    model: "OCTANT-VISION",
    glyph: "▛",
    meta: ["CTX 128K", "IMG 4"],
  },
};
