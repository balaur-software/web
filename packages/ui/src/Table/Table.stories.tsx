import type { Meta, StoryObj } from "@storybook/react";
import { Table, type TableColumn } from "./Table.tsx";

const meta: Meta<typeof Table> = {
  title: "OCTANT/Table",
  component: Table,
};
export default meta;

type Story = StoryObj<typeof Table>;

/** The reference node/status/load/cells table — click any header to sort. */
export const Default: Story = {};

/** Pre-sorted by the `load` meter, descending (heaviest node first). */
export const SortedByLoad: Story = {
  args: { defaultSortKey: "load", defaultAsc: false },
};

/** Bare table with the caption removed. */
export const NoLabel: Story = {
  args: { label: "" },
};

interface ProcRow {
  name: string;
  cpu: number;
  mem: number;
}

const PROC_COLUMNS: TableColumn<ProcRow>[] = [
  { key: "name", label: "PROCESS", color: "#c8cdd6", sortValue: (r) => r.name },
  {
    key: "cpu",
    label: "CPU",
    color: "var(--bx-accent, #46c66d)",
    sortValue: (r) => r.cpu,
    render: (r) => (
      <span style={{ whiteSpace: "pre", letterSpacing: 0, fontSize: 12 }}>
        {"█".repeat(Math.round(r.cpu * 10)).padEnd(10, "░")}
      </span>
    ),
  },
  { key: "mem", label: "MEM MB", align: "right", color: "#9aa0ad", sortValue: (r) => r.mem },
];

const PROC_ROWS: ProcRow[] = [
  { name: "octantd", cpu: 0.71, mem: 412 },
  { name: "relayctl", cpu: 0.22, mem: 128 },
  { name: "vblockfs", cpu: 0.54, mem: 256 },
  { name: "scrambler", cpu: 0.09, mem: 64 },
];

/** A custom dataset with its own columns, proving the generic column API. */
export const CustomColumns: StoryObj = {
  render: () => (
    <Table<ProcRow>
      label="PROCESSES · click a header to sort"
      columns={PROC_COLUMNS}
      rows={PROC_ROWS}
      defaultSortKey="cpu"
      defaultAsc={false}
    />
  ),
};
