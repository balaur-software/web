import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion.tsx";

const items = [
  {
    title: "WHAT IS AN OCTANT CELL?",
    content:
      "A single character divided into a 2×4 grid of eight sub-pixels. Each can be lit independently, giving 256 states per glyph — the finest mosaic in the Unicode block, new in 16.0.",
    defaultOpen: true,
  },
  {
    title: "HOW IS DENSITY THE ONLY CHANNEL?",
    content:
      "A grayscale value maps to how many sub-pixels are lit. Ordered dithering distributes that coverage across the cell, so a flat text grid behaves like a 1-bit framebuffer — no colour, no antialiasing.",
  },
  {
    title: "WHAT IF THE FONT LACKS THE GLYPHS?",
    content:
      "The renderer detects support per glyph. Where the cells exist they print as real text; where they don't, the panel draws the same 2×4 sub-pixels directly to a canvas — identical output, never a broken box.",
  },
];

const meta: Meta<typeof Accordion> = {
  title: "OCTANT/Accordion",
  component: Accordion,
  args: { items, style: { maxWidth: 560 } },
};
export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {};

export const AllClosed: Story = {
  args: { items: items.map((it) => ({ ...it, defaultOpen: false })) },
};

export const SingleOpen: Story = {
  args: { single: true, items: items.map((it) => ({ ...it, defaultOpen: false })) },
};

export const Compact: Story = {
  args: {
    items: [
      { title: "STATUS", content: "All eight sub-pixels reporting nominal.", defaultOpen: true },
      { title: "BUFFER", content: "256 states cached; 0 dropped frames." },
    ],
  },
};
