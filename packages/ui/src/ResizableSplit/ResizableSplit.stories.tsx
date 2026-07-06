import type { Meta, StoryObj } from "@storybook/react";
import { ResizableSplit } from "./ResizableSplit.tsx";

const meta: Meta<typeof ResizableSplit> = {
  title: "OCTANT/ResizableSplit",
  component: ResizableSplit,
};
export default meta;
type Story = StoryObj<typeof ResizableSplit>;

export const Default: Story = {};

export const EvenSplit: Story = {
  args: { defaultSplit: 50 },
};

export const WideBounds: Story = {
  args: { defaultSplit: 60, min: 8, max: 92 },
};

export const CustomPanels: Story = {
  args: {
    height: 240,
    defaultSplit: 35,
    left: (
      <>
        <div style={{ color: "var(--bx-accent, #46c66d)", fontSize: 11, letterSpacing: "0.1em", marginBottom: 10 }}>
          TREE
        </div>
        <div style={{ color: "var(--bx-text-3, #7b8290)", fontSize: 12, lineHeight: 1.7 }}>
          ├─ src
          <br />
          ├─ packages
          <br />
          └─ README
        </div>
      </>
    ),
    right: (
      <>
        <div
          style={{ color: "var(--bx-border-magenta, #d94ec6)", fontSize: 11, letterSpacing: "0.1em", marginBottom: 10 }}
        >
          EDITOR
        </div>
        <div style={{ color: "var(--bx-text-3, #7b8290)", fontSize: 12, lineHeight: 1.7 }}>
          Drag the divider to give the editor more room. Bounds honour the min/max props.
        </div>
      </>
    ),
  },
};
