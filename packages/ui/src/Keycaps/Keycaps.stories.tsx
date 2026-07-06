import type { Meta, StoryObj } from "@storybook/react";
import { Keycap, Keycaps, type Shortcut } from "./Keycaps.tsx";

const meta: Meta<typeof Keycaps> = {
  title: "OCTANT/Keycaps",
  component: Keycaps,
};
export default meta;

type Story = StoryObj<typeof Keycaps>;

export const Default: Story = {};

const EDITOR_SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "Z"], label: "undo stroke" },
  { keys: ["⌘", "⇧", "Z"], label: "redo stroke" },
  { keys: ["⌘", "S"], label: "export buffer" },
  { keys: ["SPACE"], label: "toggle cell" },
  { keys: ["W", "A", "S", "D"], label: "pan viewport", combo: false },
];

export const EditorShortcuts: Story = {
  args: { shortcuts: EDITOR_SHORTCUTS },
};

export const SingleChord: Story = {
  args: {
    shortcuts: [{ keys: ["⌘", "K"], label: "open command palette" }],
  },
};

export const LoneCaps: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Keycap>⌘</Keycap>
      <Keycap>⏎</Keycap>
      <Keycap>ESC</Keycap>
      <Keycap>⌫</Keycap>
    </div>
  ),
};
