import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TextInput } from "./TextInput.tsx";

const meta: Meta<typeof TextInput> = {
  title: "OCTANT/TextInput",
  component: TextInput,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: { defaultValue: "NOVA-7", placeholder: "enter callsign" },
};

export const CustomPlaceholder: Story = {
  args: { placeholder: "search sector" },
};

export const Disabled: Story = {
  args: { defaultValue: "LOCKED", disabled: true },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextInput value={value} onChange={setValue} placeholder="type here" />
        <div style={{ fontSize: 11, color: "#5b616e" }}>value: {value || "—"}</div>
      </div>
    );
  },
};
