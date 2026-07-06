import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select.tsx";

const ENCODERS = [
  { value: "octant", label: "OCTANT · 2×4" },
  { value: "quadrant", label: "QUADRANT · 2×2" },
  { value: "braille", label: "BRAILLE · 2×4" },
  { value: "shade", label: "SHADE · 1×1" },
];

const meta: Meta<typeof Select> = {
  title: "OCTANT/Select",
  component: Select,
  args: { options: ENCODERS },
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = { args: { defaultValue: "octant" } };

export const Placeholder: Story = {
  args: { placeholder: "CHOOSE ENCODER" },
};

export const Disabled: Story = {
  args: { defaultValue: "octant", disabled: true },
};

export const Regions: Story = {
  args: {
    options: [
      { value: "us-east", label: "US-EAST · IAD" },
      { value: "us-west", label: "US-WEST · SFO" },
      { value: "eu-central", label: "EU-CENTRAL · FRA" },
      { value: "ap-south", label: "AP-SOUTH · SIN" },
      { value: "sa-east", label: "SA-EAST · GRU" },
    ],
    defaultValue: "eu-central",
    width: 260,
  },
};

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ color: "#5b616e", fontSize: 12 }}>SELECT</div>
      <Select options={ENCODERS} defaultValue="octant" />
      <div style={{ color: "#3f424d", fontSize: 11 }}>click to unroll · selection drives the glyph encoder</div>
    </div>
  ),
};
