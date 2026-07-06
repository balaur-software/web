import { PALETTE } from "@balaur/tokens";
import type { Meta, StoryObj } from "@storybook/react";
import { Palette, PaletteChip } from "./PaletteChip.tsx";

const meta: Meta<typeof Palette> = {
  title: "OCTANT/PaletteChip",
  component: Palette,
};
export default meta;

export const FullPalette: StoryObj<typeof Palette> = {};

export const SingleChip: StoryObj = {
  render: () => (
    <div style={{ width: 140 }}>
      <PaletteChip color={PALETTE[2]!} />
    </div>
  ),
};
