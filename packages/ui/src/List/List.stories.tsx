import type { Meta, StoryObj } from "@storybook/react";
import { List, type ListItem } from "./List.tsx";

const FILES: ListItem[] = [
  { glyph: "▛", label: "octant-field.bin", meta: "2.4k" },
  { glyph: "▞", label: "palette.def", meta: "512b" },
  { glyph: "▙", label: "dither.bayer", meta: "1.1k" },
  { glyph: "▟", label: "glyph.cache", meta: "8.7k" },
  { glyph: "▚", label: "render.cfg", meta: "340b" },
];

const meta: Meta<typeof List> = {
  title: "OCTANT/List",
  component: List,
  args: { items: FILES },
};
export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {};

export const ThirdSelected: Story = {
  args: { items: FILES, defaultSelected: 2 },
};

export const NoMeta: Story = {
  args: {
    items: [
      { label: "SYSTEM" },
      { label: "GLYPHS" },
      { label: "RENDER" },
      { label: "PALETTE" },
    ],
  },
};

export const Controlled: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <List items={FILES} selected={0} />
      <List items={FILES} selected={3} />
    </div>
  ),
};
