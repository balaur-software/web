import type { Meta, StoryObj } from "@storybook/react";
import { SpecList } from "./SpecList.tsx";

const meta: Meta<typeof SpecList> = {
  title: "OCTANT/SpecList",
  component: SpecList,
};
export default meta;

type Story = StoryObj<typeof SpecList>;

/** The reference glyph-block spec sheet, two columns. */
export const Default: Story = {};

/** A single column of rows — useful in a narrow sidebar. */
export const SingleColumn: Story = {
  args: { columns: 1 },
};

/** Custom rows with a relabelled caption and several accented values. */
export const Custom: Story = {
  args: {
    label: "NODE · runtime",
    items: [
      { key: "HOST", value: "octant-01", accent: true },
      { key: "REGION", value: "eu-central" },
      { key: "UPTIME", value: "412d 06h" },
      { key: "STATUS", value: "HEALTHY", accent: true },
      { key: "CPU", value: "38%" },
      { key: "MEM", value: "6.2 / 16 GB" },
    ],
  },
};

/** Three columns for a wide dense layout. */
export const ThreeColumns: Story = {
  args: { columns: 3 },
};
