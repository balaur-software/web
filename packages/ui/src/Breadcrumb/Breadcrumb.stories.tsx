import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "./Breadcrumb.tsx";

const meta: Meta<typeof Breadcrumb> = {
  title: "OCTANT/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [{ label: "ROOT" }, { label: "SYSTEM" }, { label: "GLYPHS" }, { label: "OCTANT.MAP" }],
  },
};
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

/** The canonical §16 trail: ROOT ▸ SYSTEM ▸ GLYPHS ▸ OCTANT.MAP. */
export const Default: Story = {};

/** Two segments — a shallow path. */
export const Shallow: Story = {
  args: { items: [{ label: "ROOT" }, { label: "SETTINGS" }] },
};

/** A single segment renders as the current location only, with no separators. */
export const CurrentOnly: Story = {
  args: { items: [{ label: "DASHBOARD" }] },
};

/** Segments as real links, plus a custom slash separator. */
export const LinkedWithSlash: Story = {
  args: {
    separator: "/",
    items: [
      { label: "ROOT", href: "#root" },
      { label: "MODULES", href: "#modules" },
      { label: "ENCODER", href: "#encoder" },
      { label: "BAYER.4X4" },
    ],
  },
};
