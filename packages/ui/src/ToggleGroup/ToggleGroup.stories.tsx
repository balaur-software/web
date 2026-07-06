import type { Meta, StoryObj } from "@storybook/react";
import { ToggleGroup } from "./ToggleGroup.tsx";

const meta: Meta<typeof ToggleGroup> = {
  title: "OCTANT/ToggleGroup",
  component: ToggleGroup,
};
export default meta;
type Story = StoryObj<typeof ToggleGroup>;

const SQUARE = { width: 38, padding: 0, textAlign: "center" as const };

/** Single-select alignment picker (default mode). */
export const Default: Story = {
  args: {
    defaultValue: ["left"],
    items: [
      { value: "left", label: "▐█▌", title: "Align left" },
      { value: "center", label: "███", title: "Align center" },
      { value: "right", label: "▌█▐", title: "Align right" },
    ],
  },
};

/** Multi-select text formatting (mirrors `data-multi`). */
export const Multi: Story = {
  args: {
    multi: true,
    defaultValue: ["b"],
    items: [
      { value: "b", label: "B", title: "Bold", style: { ...SQUARE, fontSize: 14, fontWeight: "bold" } },
      { value: "i", label: "I", title: "Italic", style: { ...SQUARE, fontSize: 14, fontStyle: "italic" } },
      { value: "u", label: "U", title: "Underline", style: { ...SQUARE, fontSize: 14, textDecoration: "underline" } },
    ],
  },
};

/** Wider labelled options. */
export const Labelled: Story = {
  args: {
    defaultValue: ["grid"],
    items: [
      { value: "grid", label: "GRID" },
      { value: "list", label: "LIST" },
      { value: "flow", label: "FLOW" },
    ],
  },
};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
      <div>
        <div style={{ color: "#3f424d", fontSize: 11, marginBottom: 9 }}>FORMAT &middot; multi</div>
        <ToggleGroup
          multi
          defaultValue={["b"]}
          items={[
            { value: "b", label: "B", title: "Bold", style: { ...SQUARE, fontSize: 14, fontWeight: "bold" } },
            { value: "i", label: "I", title: "Italic", style: { ...SQUARE, fontSize: 14, fontStyle: "italic" } },
            {
              value: "u",
              label: "U",
              title: "Underline",
              style: { ...SQUARE, fontSize: 14, textDecoration: "underline" },
            },
          ]}
        />
      </div>
      <div>
        <div style={{ color: "#3f424d", fontSize: 11, marginBottom: 9 }}>ALIGN &middot; single</div>
        <ToggleGroup
          defaultValue={["left"]}
          items={[
            { value: "left", label: "▐█▌", title: "Align left" },
            { value: "center", label: "███", title: "Align center" },
            { value: "right", label: "▌█▐", title: "Align right" },
          ]}
        />
      </div>
    </div>
  ),
};
