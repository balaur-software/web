import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider } from "../primitives";
import { DropdownMenu, type DropdownMenuItem } from "./DropdownMenu.tsx";

const ACTIONS: DropdownMenuItem[] = [
  { label: "Render frame", glyph: "▛", shortcut: "R", toast: "Frame rendered" },
  { label: "Duplicate cell", glyph: "▞", shortcut: "⌘D", toast: "Cell duplicated" },
  { label: "Export PNG", glyph: "▙", toast: "Exported PNG" },
  { divider: true },
  { label: "Flush buffer", glyph: "▓", shortcut: "⌫", danger: true, toast: "Buffer flushed" },
];

const meta: Meta<typeof DropdownMenu> = {
  title: "OCTANT/DropdownMenu",
  component: DropdownMenu,
  args: { items: ACTIONS },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;

/** The reference action menu — click an item, it fires a toast and closes. */
export const Default: Story = {};

export const CustomLabel: Story = {
  args: { label: "COMMANDS", width: 240 },
};

export const NoShortcuts: Story = {
  args: {
    label: "ENCODERS",
    items: [
      { label: "OCTANT · 2×4", glyph: "▛" },
      { label: "QUADRANT · 2×2", glyph: "▚" },
      { label: "BRAILLE · 2×4", glyph: "⠿" },
      { label: "SHADE · 1×1", glyph: "▓" },
    ],
  },
};

export const EndAligned: Story = {
  render: (args) => (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <DropdownMenu {...args} align="end" />
    </div>
  ),
};
