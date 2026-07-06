import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar } from "./Calendar.tsx";

const meta: Meta<typeof Calendar> = {
  title: "OCTANT/Calendar",
  component: Calendar,
};
export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { defaultValue: new Date(new Date().getFullYear(), new Date().getMonth(), 15) },
};

export const InCard: Story = {
  render: (args) => (
    <div style={{ border: "1px solid var(--bx-border, #1c1d24)", background: "var(--bx-surface-3, #0c0d11)", padding: 22 }}>
      <div style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em", marginBottom: 16 }}>CALENDAR</div>
      <Calendar {...args} />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 286 }}>
        <Calendar value={date} onSelect={setDate} />
        <div style={{ fontSize: 12, color: "var(--bx-text-4, #9aa0ad)" }}>
          {date ? `SELECTED: ${date.toDateString()}` : "no date selected"}
        </div>
      </div>
    );
  },
};
