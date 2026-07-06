import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pager } from "./Pager.tsx";

const meta: Meta<typeof Pager> = {
  title: "OCTANT/Pager",
  component: Pager,
  args: { count: 24, defaultPage: 3 },
};
export default meta;
type Story = StoryObj<typeof Pager>;

/** Matches the reference layout: `1 2 3 4 5 … 24` with page 3 active. */
export const Default: Story = {};

export const FirstPage: Story = { args: { count: 24, defaultPage: 1 } };

export const Middle: Story = { args: { count: 24, defaultPage: 12 } };

export const Few: Story = { args: { count: 5, defaultPage: 2 } };

export const WideSiblings: Story = { args: { count: 40, defaultPage: 20, siblingCount: 2 } };

export const Controlled: Story = {
  render: () => {
    const [page, setPage] = useState(3);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Pager count={24} page={page} onPageChange={setPage} />
        <span style={{ color: "#9aa0ad", fontSize: 13 }}>PAGE {page} / 24</span>
      </div>
    );
  },
};
