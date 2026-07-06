import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider } from "../primitives";
import { Menubar, type MenubarMenu } from "./Menubar.tsx";

const MENUS: MenubarMenu[] = [
  {
    label: "FILE",
    items: [
      { label: "New buffer", shortcut: "⌘N", toast: "New buffer" },
      { label: "Open…", shortcut: "⌘O", toast: "Opened" },
      { label: "Save", shortcut: "⌘S", toast: "Saved" },
      { divider: true },
      { label: "Export PNG", shortcut: "⌘E", toast: "Exported PNG" },
    ],
  },
  {
    label: "EDIT",
    items: [
      { label: "Undo", shortcut: "⌘Z", toast: "Undo" },
      { label: "Redo", shortcut: "⇧⌘Z", toast: "Redo" },
      { divider: true },
      { label: "Copy", shortcut: "⌘C", toast: "Copied cells" },
      { label: "Paste", shortcut: "⌘V", toast: "Pasted cells" },
    ],
  },
  {
    label: "VIEW",
    items: [
      { label: "Zoom in", shortcut: "⌘+", toast: "Zoomed in" },
      { label: "Zoom out", shortcut: "⌘−", toast: "Zoomed out" },
      { divider: true },
      { label: "Toggle grid", shortcut: "⌘G", toast: "Grid toggled" },
    ],
  },
  {
    label: "HELP",
    items: [
      { label: "Documentation", toast: "Docs opened" },
      { label: "Keyboard shortcuts", toast: "Shortcuts" },
    ],
  },
];

const meta: Meta<typeof Menubar> = {
  title: "OCTANT/Menubar",
  component: Menubar,
  args: { menus: MENUS },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Menubar>;

/** The reference app-shell menu bar — click a group, hover across to switch, pick an item to fire a toast. */
export const Default: Story = {};

/** A trimmed bar with just two groups. */
export const Compact: Story = {
  args: {
    menus: [
      {
        label: "FILE",
        items: [
          { label: "New buffer", shortcut: "⌘N" },
          { label: "Save", shortcut: "⌘S" },
        ],
      },
      {
        label: "EDIT",
        items: [
          { label: "Undo", shortcut: "⌘Z" },
          { label: "Redo", shortcut: "⇧⌘Z" },
        ],
      },
    ],
  },
};

/** No shortcut hints — the items collapse to plain labels. */
export const NoShortcuts: Story = {
  args: {
    menus: [
      {
        label: "ENCODE",
        items: [
          { label: "OCTANT · 2×4" },
          { label: "QUADRANT · 2×2" },
          { label: "BRAILLE · 2×4" },
          { divider: true },
          { label: "SHADE · 1×1" },
        ],
      },
      {
        label: "PALETTE",
        items: [{ label: "16 ANSI hues" }, { label: "256 xterm" }, { label: "Truecolor" }],
      },
    ],
  },
};

/** Custom `onSelect` handlers instead of the default toast. */
export const CustomHandlers: Story = {
  args: {
    menus: [
      {
        label: "RUN",
        items: [
          { label: "Build", shortcut: "⌘B", onSelect: () => console.log("build") },
          { label: "Test", shortcut: "⌘T", onSelect: () => console.log("test") },
          { divider: true },
          { label: "Deploy", onSelect: () => console.log("deploy") },
        ],
      },
    ],
  },
};
