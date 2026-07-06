import type { Meta, StoryObj } from "@storybook/react";
import { ValidatedField } from "./ValidatedField.tsx";

const meta: Meta<typeof ValidatedField> = {
  title: "OCTANT/ValidatedField",
  component: ValidatedField,
};
export default meta;
type Story = StoryObj<typeof ValidatedField>;

export const Default: Story = {};

export const PrefilledValid: Story = {
  args: { defaultValue: "RELAY-7" },
};

export const PrefilledInvalid: Story = {
  args: { defaultValue: "relay 7" },
};

export const EmailField: Story = {
  args: {
    label: "OPERATOR EMAIL",
    placeholder: "ops@balaur.dev",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 48,
    hint: "We only page this address on incidents.",
    validMessage: "Deliverable address",
    invalidMessage: "Enter a valid email, e.g. ops@balaur.dev",
  },
};

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 360 }}>
      <ValidatedField defaultValue="NODE-01" />
      <ValidatedField defaultValue="bad id" />
      <ValidatedField />
    </div>
  ),
};
