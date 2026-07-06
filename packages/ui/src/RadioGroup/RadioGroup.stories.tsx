import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup } from "./RadioGroup.tsx";

const DITHER = [
  { value: "bayer", label: "BAYER 4×4 — ordered" },
  { value: "floyd", label: "FLOYD–STEINBERG — error diffuse" },
  { value: "threshold", label: "THRESHOLD — hard cut" },
];

const meta: Meta<typeof RadioGroup> = {
  title: "OCTANT/RadioGroup",
  component: RadioGroup,
  args: { options: DITHER, "aria-label": "Dither mode" },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = { args: { defaultValue: "bayer" } };

export const SecondSelected: Story = { args: { defaultValue: "floyd" } };

export const WithDisabledOption: Story = {
  args: {
    defaultValue: "bayer",
    options: [
      { value: "bayer", label: "BAYER 4×4 — ordered" },
      { value: "floyd", label: "FLOYD–STEINBERG — error diffuse" },
      { value: "threshold", label: "THRESHOLD — locked", disabled: true },
    ],
  },
};

export const DisabledGroup: Story = { args: { defaultValue: "floyd", disabled: true } };

export const MagentaFill: Story = {
  args: { defaultValue: "threshold", fillColor: "#c26cd0" },
};
