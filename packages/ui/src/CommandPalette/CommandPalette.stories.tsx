import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider } from "../primitives";
import { type CommandGroup, CommandPalette } from "./CommandPalette.tsx";

const meta: Meta<typeof CommandPalette> = {
  title: "OCTANT/CommandPalette",
  component: CommandPalette,
  decorators: [
    (Story) => (
      <ToastProvider>
        <div style={{ maxWidth: 420 }}>
          <div style={{ color: "var(--bx-text-3, #5b616e)", fontSize: 11, letterSpacing: "0.1em", marginBottom: 18 }}>
            COMMAND PALETTE
          </div>
          <Story />
          <div style={{ color: "var(--bx-text-dim, #3f424d)", fontSize: 11, marginTop: 18 }}>
            press ⌘K / Ctrl-K anywhere on this page
          </div>
        </div>
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CommandPalette>;

/** The default palette: click the trigger or hit ⌘K, filter, arrow + Enter. */
export const Default: Story = {};

/** Opens mounted so the panel, filter list and highlight are visible at rest. */
export const OpenByDefault: Story = {
  args: { defaultOpen: true, showTrigger: false },
};

const DEPLOY_COMMANDS: CommandGroup[] = [
  {
    group: "PIPELINE",
    items: [
      { glyph: "▸", label: "Trigger build", shortcut: "B" },
      { glyph: "◆", label: "Run test suite", shortcut: "T" },
      { glyph: "▙", label: "Deploy to staging", to: "staging" },
      { glyph: "▟", label: "Promote to production", to: "prod" },
    ],
  },
  {
    group: "DANGER",
    items: [
      { glyph: "▓", label: "Roll back release", danger: true, shortcut: "⌘R" },
      { glyph: "▚", label: "Purge cache", danger: true, shortcut: "⌫" },
    ],
  },
];

/** A custom command set — navigation targets log via `onNavigate`, actions toast. */
export const CustomCommands: Story = {
  args: {
    commands: DEPLOY_COMMANDS,
    triggerLabel: "Search deploy actions…",
    // eslint-disable-next-line no-console
    onNavigate: (to) => console.log("navigate:", to),
  },
};

/** No inline trigger — driven purely by the global ⌘K / Ctrl-K shortcut. */
export const KeyboardOnly: Story = {
  args: { showTrigger: false },
};
