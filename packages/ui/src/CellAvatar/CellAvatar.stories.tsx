import type { Meta, StoryObj } from "@storybook/react";
import { CellAvatar, CellAvatarRow } from "./CellAvatar.tsx";

const meta: Meta<typeof CellAvatar> = {
  title: "OCTANT/CellAvatar",
  component: CellAvatar,
  args: { kind: "agent" },
};
export default meta;

type Story = StoryObj<typeof CellAvatar>;

export const Default: Story = {};

export const Tool: Story = { args: { kind: "tool" } };

export const System: Story = { args: { kind: "system" } };

export const AllArchetypes: StoryObj = {
  render: () => <CellAvatarRow />,
};

export const CustomLabel: Story = {
  args: { kind: "user", label: "OPERATOR", size: 22 },
};
