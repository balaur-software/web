import type { Meta, StoryObj } from "@storybook/react";
import { Ticker } from "./Ticker.tsx";

const meta: Meta<typeof Ticker> = {
  title: "OCTANT/Ticker",
  component: Ticker,
  args: { to: 256, label: "CELL STATES" },
};
export default meta;
type Story = StoryObj<typeof Ticker>;

export const Default: Story = {};

export const AnsiHues: Story = {
  args: { to: 16, label: "ANSI HUES", barColor: "#2bd9d9" },
};

export const LargeCount: Story = {
  args: { to: 14400, label: "DOTS / FRAME", barColor: "#c061ff" },
};

export const Dashboard: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      <Ticker to={256} label="CELL STATES" />
      <Ticker to={16} label="ANSI HUES" barColor="#2bd9d9" />
      <Ticker to={3072} label="GLYPHS MAPPED" barColor="#f2c94c" />
      <Ticker to={14400} label="DOTS / FRAME" barColor="#c061ff" />
    </div>
  ),
};
