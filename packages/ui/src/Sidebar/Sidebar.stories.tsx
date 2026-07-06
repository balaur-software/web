import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./Sidebar.tsx";

const meta: Meta<typeof Sidebar> = {
  title: "OCTANT/Sidebar",
  component: Sidebar,
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: { defaultCollapsed: true },
};

export const SecondActive: Story = {
  args: { defaultActiveIndex: 2 },
};

export const CustomSections: Story = {
  args: {
    brand: "RASTER.KIT",
    operator: "root",
    items: [
      { label: "Overview", glyph: "▛", title: "OVERVIEW", sub: "Fleet health at a glance." },
      { label: "Shaders", glyph: "▚", title: "SHADERS", sub: "Compile targets and cell kernels." },
      { label: "Queue", glyph: "▟", title: "QUEUE", sub: "Pending frame jobs, FIFO order." },
    ],
  },
};
