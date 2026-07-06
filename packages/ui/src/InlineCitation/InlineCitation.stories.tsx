import type { Meta, StoryObj } from "@storybook/react";
import { CitationList, CitationSource, InlineCitation } from "./InlineCitation.tsx";

const meta: Meta<typeof InlineCitation> = {
  title: "OCTANT/InlineCitation",
  component: InlineCitation,
  args: { label: "1" },
};
export default meta;

type Story = StoryObj<typeof InlineCitation>;

/** A lone chip, rendered inline after a fragment of prose. */
export const Default: Story = {
  render: (args) => (
    <span style={{ color: "#dfe3ea", fontSize: 13, lineHeight: 1.7 }}>
      Median frame cost holds at 4.1ms
      <InlineCitation {...args} /> even under sustained load.
    </span>
  ),
};

/** The cyan accent variant used for a second, distinct source. */
export const CyanAccent: Story = {
  args: { label: "2", accent: "#2bd9d9", border: "#234" },
  render: (args) => (
    <span style={{ color: "#dfe3ea", fontSize: 13, lineHeight: 1.7 }}>
      p99 latency is bounded at 12ms
      <InlineCitation {...args} />.
    </span>
  ),
};

/** A full passage with two citations plus their reference list — the reference layout. */
export const WithSourceList: Story = {
  render: () => (
    <div style={{ border: "1px solid #1c1d24", background: "#0c0d11", padding: 20, maxWidth: 460 }}>
      <div style={{ color: "#dfe3ea", fontSize: 13, lineHeight: 1.7 }}>
        Median frame cost holds at 4.1ms
        <InlineCitation label="1" href="#src-1" /> even under sustained load, with p99 latency bounded at 12ms
        <InlineCitation label="2" href="#src-2" accent="#2bd9d9" border="#234" />.
      </div>
      <CitationList>
        <CitationSource label="1">grid-throughput.md · internal bench</CitationSource>
        <CitationSource label="2" accent="#2bd9d9">
          latency-report Q2 · ops dashboard
        </CitationSource>
      </CitationList>
    </div>
  ),
};

/** Non-numeric labels work too — any short marker fits the chip. */
export const LetterLabels: Story = {
  render: () => (
    <span style={{ color: "#dfe3ea", fontSize: 13, lineHeight: 1.7 }}>
      Two independent traces
      <InlineCitation label="a" />
      <InlineCitation label="b" accent="#f2c94c" border="#3a341c" /> agree within noise.
    </span>
  ),
};
