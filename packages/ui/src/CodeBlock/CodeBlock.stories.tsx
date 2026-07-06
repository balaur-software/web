import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from "./CodeBlock.tsx";

const meta: Meta<typeof CodeBlock> = {
  title: "OCTANT/CodeBlock",
  component: CodeBlock,
};
export default meta;

type Story = StoryObj<typeof CodeBlock>;

const kw = { color: "#8a6dff" } as const;

/** The reference Python snippet, syntax-highlighted with coloured spans. */
const pySnippet = (
  <>
    <span style={kw}>def</span>{" "}
    <span style={{ color: "var(--bx-accent, #46c66d)" }}>rasterise</span>
    {"(series):\n    "}
    <span style={{ color: "#5b616e" }}># bin to octant lattice</span>
    {"\n    "}
    <span style={kw}>return</span>
    {" [oct(v) "}
    <span style={kw}>for</span>
    {" v "}
    <span style={kw}>in</span>
    {" series]"}
  </>
);

export const Default: Story = {
  args: { lang: "py", filename: "render.py", children: pySnippet },
};

/** Header with only a language tag — no filename. */
export const LangOnly: Story = {
  args: {
    lang: "sh",
    children: (
      <>
        <span style={{ color: "#5b616e" }}>$</span> octant render --grid 2x4{"\n"}
        <span style={{ color: "var(--bx-accent, #46c66d)" }}>{"▚"} ok</span>
        {" · 128 frames rasterised"}
      </>
    ),
  },
};

/** Plain, unhighlighted string body with no header metadata. */
export const PlainText: Story = {
  args: {
    action: null,
    children: "GET /v1/frames?grid=2x4\n200 · application/octet-stream",
  },
};

/** Custom trailing slot in place of the default copy affordance. */
export const CustomAction: Story = {
  args: {
    lang: "ts",
    filename: "grid.ts",
    action: <span style={{ color: "#5b616e", fontSize: 11 }}>readonly</span>,
    children: (
      <>
        <span style={kw}>export const</span>
        {" CELL = "}
        <span style={{ color: "#2bd9d9" }}>0x1cd00</span>
        {";"}
      </>
    ),
  },
};

/** Constrained width so an over-long line reveals the horizontal scroll. */
export const Overflow: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <CodeBlock {...args} />
    </div>
  ),
  args: {
    lang: "py",
    filename: "wide.py",
    children: "cells = [octchar(bar8(v)) for v in throughput_series_binned_to_the_octant_lattice]",
  },
};
