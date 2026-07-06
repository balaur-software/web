import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BootOverlay } from "./BootOverlay.tsx";

const meta: Meta<typeof BootOverlay> = {
  title: "OCTANT/BootOverlay",
  component: BootOverlay,
};
export default meta;
type Story = StoryObj<typeof BootOverlay>;

/** The default OCTANT.OS BIOS sequence — boots on mount, then self-dismisses. */
export const Default: Story = {};

/** A custom boot log. */
export const CustomLines: Story = {
  args: {
    lines: [
      "BALAUR.KERNEL v3.1",
      "MOUNT /dev/glyph .... OK",
      "SEED ENTROPY ........ 4096b",
      "LINK OCTANT.OS ...... UP",
      "HANDSHAKE ........... ACK",
    ],
  },
};

/** Recoloured splash using a cyan boot tint instead of the accent green. */
export const CyanBoot: Story = {
  args: {
    accent: "var(--bx-border-cyan, #2b6cb0)",
    lines: [
      "COLD START .......... 0x1CD00",
      "SCAN SURFACES ....... 8/8",
      "CALIBRATE RASTER .... DONE",
    ],
  },
};

/**
 * Controlled usage — the overlay reports its own dismissal via `onOpenChange`,
 * and the button reboots it so the sequence can be replayed on demand.
 */
export const Replayable: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            fontFamily: "inherit",
            fontSize: 13,
            letterSpacing: "0.1em",
            padding: "10px 18px",
            background: "transparent",
            color: "var(--bx-text-1, #f4f6fb)",
            border: "1px solid var(--bx-border-accent, #2a3320)",
            cursor: "pointer",
          }}
        >
          REBOOT
        </button>
        <BootOverlay open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};
