import type { Meta, StoryObj } from "@storybook/react";
import { Tree, type TreeNode } from "./Tree.tsx";

const SYSTEM: TreeNode[] = [
  {
    label: "SYSTEM",
    children: [
      { label: "palette.def", glyph: "▞" },
      {
        label: "glyphs",
        children: [
          { label: "octant.map", glyph: "▛" },
          { label: "legacy.map", glyph: "▙" },
        ],
      },
      {
        label: "render",
        children: [
          { label: "dither.cfg", glyph: "▚" },
          { label: "light.cfg", glyph: "▟" },
        ],
      },
      { label: "boot.seq", glyph: "▞" },
    ],
  },
];

const meta: Meta<typeof Tree> = {
  title: "OCTANT/Tree",
  component: Tree,
  args: { nodes: SYSTEM },
};
export default meta;
type Story = StoryObj<typeof Tree>;

export const Default: Story = {};

export const CollapsedFolders: Story = {
  args: {
    nodes: [
      {
        label: "SYSTEM",
        children: [
          { label: "palette.def", glyph: "▞" },
          {
            label: "glyphs",
            defaultCollapsed: true,
            children: [
              { label: "octant.map", glyph: "▛" },
              { label: "legacy.map", glyph: "▙" },
            ],
          },
          {
            label: "render",
            defaultCollapsed: true,
            children: [
              { label: "dither.cfg", glyph: "▚" },
              { label: "light.cfg", glyph: "▟" },
            ],
          },
        ],
      },
    ],
  },
};

export const DeepNesting: Story = {
  args: {
    nodes: [
      {
        label: "root",
        children: [
          {
            label: "src",
            children: [
              {
                label: "core",
                children: [
                  { label: "octant.ts", glyph: "▛" },
                  { label: "encode.ts", glyph: "▙" },
                ],
              },
              { label: "index.ts", glyph: "▚" },
            ],
          },
          { label: "readme.md", glyph: "▟" },
        ],
      },
    ],
  },
};

export const InPanel: Story = {
  render: (args) => (
    <div style={{ border: "1px solid var(--bx-border, #1c1d24)", background: "var(--bx-surface-3, #0c0d11)", padding: 18, maxWidth: 320 }}>
      <div style={{ color: "#5b616e", fontSize: 11, letterSpacing: "0.1em", marginBottom: 14 }}>TREE · click folders</div>
      <Tree {...args} />
    </div>
  ),
};
