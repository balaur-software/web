import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider } from "../primitives";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu.tsx";

const meta: Meta<typeof ContextMenu> = {
  title: "OCTANT/ContextMenu",
  component: ContextMenu,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ContextMenu>;

/** The reference surface — right-click it to pop the cell-inspector menu. */
export const Default: Story = {};

/** A custom action set, including a divider and a danger row. */
export const CustomItems: Story = {
  args: {
    items: [
      { label: "Render frame", glyph: "▛", toast: "Frame rendered" },
      { label: "Duplicate cell", glyph: "▞", toast: "Cell duplicated" },
      { label: "Export PNG", glyph: "▙", toast: "Exported PNG" },
      { divider: true },
      { label: "Flush buffer", glyph: "▓", danger: true, toast: "Buffer flushed" },
    ] satisfies ContextMenuItem[],
  },
};

/** Custom trigger content via `children`. */
export const CustomSurface: Story = {
  args: {
    children: "◪ right-click this canvas region",
    style: { padding: 64, color: "#5b616e", borderStyle: "solid" },
  },
};

/** Near a viewport edge the menu clamps back inside the visible area. */
export const ClampToEdge: Story = {
  render: (args) => (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <ContextMenu {...args} style={{ width: 320 }} />
    </div>
  ),
};
