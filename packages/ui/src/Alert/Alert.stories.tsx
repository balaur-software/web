import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert.tsx";

const meta: Meta<typeof Alert> = {
  title: "OCTANT/Alert",
  component: Alert,
  args: {
    kind: "info",
    children: "Octant glyphs detected — rendering with native U+1CD00 cells.",
  },
  argTypes: {
    kind: { control: "inline-radio", options: ["ok", "info", "warn", "err"] },
  },
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

export const Ok: Story = {
  args: { kind: "ok", children: "Frame committed — 4096 cells flushed to the octant buffer." },
};

export const Warn: Story = {
  args: { kind: "warn", children: "Frame budget at 92% — consider lowering the dither resolution." },
};

export const Err: Story = {
  args: { kind: "err", children: "Glyph out of range on SINK-03 — falling back to canvas raster." },
};

export const NotDismissible: Story = {
  args: { kind: "info", dismissible: false, children: "This notice stays put — no dismiss control." },
};

export const Stack: Story = {
  render: () => (
    <div>
      <Alert kind="info" style={{ marginBottom: 10 }}>
        Octant glyphs detected — rendering with native U+1CD00 cells.
      </Alert>
      <Alert kind="warn" style={{ marginBottom: 10 }}>
        Frame budget at 92% — consider lowering the dither resolution.
      </Alert>
      <Alert kind="err">Glyph out of range on SINK-03 — falling back to canvas raster.</Alert>
    </div>
  ),
};
