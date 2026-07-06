import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { OctantField } from "./OctantField.tsx";

const box = (children: ReactNode) => (
  <div
    style={{
      width: "100%",
      height: 360,
      position: "relative",
      border: "1px solid #1c1d24",
      background: "#08080a",
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof OctantField> = {
  title: "OCTANT/OctantField",
  component: OctantField,
  decorators: [(Story) => box(<Story />)],
};
export default meta;
type Story = StoryObj<typeof OctantField>;

export const Green: Story = {};
export const Cyan: Story = { args: { accent: [43, 217, 217] } };
export const Amber: Story = { args: { accent: [255, 176, 0] } };
export const Calm: Story = { args: { ambient: 0.2 } };
