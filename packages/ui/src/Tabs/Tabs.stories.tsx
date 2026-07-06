import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs.tsx";

const meta: Meta<typeof Tabs> = {
  title: "OCTANT/Tabs",
  component: Tabs,
  args: {
    "aria-label": "System sections",
    tabs: [
      {
        label: "OVERVIEW",
        panel:
          "A grid of 2×4 octant cells, U+1CD00 onward. Eight sub-pixels per glyph, 256 reachable states, density as the only channel. The whole system descends from this one primitive.",
      },
      {
        label: "SIGNAL",
        panel:
          "Cursor X drives frequency, cursor Y drives amplitude. Each dot column is one sample; the trace is rasterised straight into block cells with no antialiasing.",
      },
      {
        label: "RENDER",
        panel:
          "One luminance buffer, ordered-dithered onto 2×4 cells. Where the font ships the glyphs they render as real text; where it does not, the panel draws the same sub-pixels directly.",
      },
      {
        label: "SYSTEM",
        panel:
          "Sixteen ANSI hues, eight base plus bright. No gradients, no opacity tricks — every surface in the system is a flat fill of lit cells in one of these colours.",
      },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};

export const StartOnSignal: Story = {
  args: { defaultIndex: 1 },
};

export const TwoTabs: Story = {
  args: {
    "aria-label": "Transport modes",
    tabs: [
      {
        label: "STREAM",
        panel:
          "Frames arrive as they render; the reader never blocks. Backpressure is a single lit cell that fills as the buffer drains.",
      },
      {
        label: "BATCH",
        panel:
          "The whole payload resolves before the first byte ships. One decode, one paint, no reflow — the terminal aesthetic at rest.",
      },
    ],
  },
};

export const Controlled: Story = {
  render: (args) => {
    const items = args.tabs;
    return (
      <div style={{ maxWidth: 680 }}>
        <Tabs {...args} tabs={items} index={2} onChange={() => {}} />
        <p style={{ marginTop: 12, color: "#5b616e", fontSize: 12 }}>
          index is pinned to RENDER (controlled); clicks fire onChange only.
        </p>
      </div>
    );
  },
};
