import type { Meta, StoryObj } from "@storybook/react";
import { Combobox } from "./Combobox.tsx";

const SYSTEMS = [
  "OCTANT 2x4",
  "QUADRANT 2x2",
  "SEXTANT 2x3",
  "BRAILLE 2x4",
  "SHADE 1x1",
  "HALF BLOCK 1x2",
  "LEGACY BLOCKS",
  "TERMINAL CELLS",
];

const meta: Meta<typeof Combobox> = {
  title: "OCTANT/Combobox",
  component: Combobox,
  args: { options: SYSTEMS, placeholder: "search glyph systems…" },
};
export default meta;
type Story = StoryObj<typeof Combobox>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: { defaultValue: "OCTANT 2x4" },
};

export const Regions: Story = {
  args: {
    options: [
      "US-EAST · IAD",
      "US-WEST · SFO",
      "EU-CENTRAL · FRA",
      "AP-SOUTH · SIN",
      "SA-EAST · GRU",
    ],
    placeholder: "search regions…",
    width: 260,
  },
};

export const Disabled: Story = {
  args: { defaultValue: "BRAILLE 2x4", disabled: true },
};

export const WithHint: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em" }}>COMBOBOX · searchable</div>
      <Combobox options={SYSTEMS} placeholder="search glyph systems…" />
      <div style={{ color: "#3f424d", fontSize: 11 }}>type to filter · ↑↓ to navigate · ⏎ to pick</div>
    </div>
  ),
};
