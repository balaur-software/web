import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CATALOG_GROUPS, ComponentCatalog } from "./ComponentCatalog.tsx";

const meta: Meta<typeof ComponentCatalog> = {
  title: "OCTANT/ComponentCatalog",
  component: ComponentCatalog,
};
export default meta;

type Story = StoryObj<typeof ComponentCatalog>;

/** The full index, uncontrolled. Type in the filter to narrow the live count. */
export const Default: Story = {};

/** Pre-filtered on mount via `defaultFilter` (uncontrolled). */
export const Prefiltered: Story = {
  args: { defaultFilter: "chart" },
};

/** A small custom catalogue passed via `groups`. */
export const CustomGroups: Story = {
  args: {
    groups: [
      {
        cat: "PRIMITIVES",
        items: [
          { name: "Button", to: "button" },
          { name: "Switch", to: "switch" },
          { name: "Slider", to: "slider" },
        ],
      },
      {
        cat: "OVERLAYS",
        items: [
          { name: "Dialog", to: "dialog" },
          { name: "Toast", to: "toast" },
        ],
      },
    ],
  },
};

/** Controlled filter driven by external state, with a jump log. */
export const Controlled: Story = {
  render: () => {
    const [q, setQ] = useState("data");
    const [last, setLast] = useState<string>("—");
    return (
      <div>
        <div style={{ marginBottom: 16, fontSize: 12, color: "#7b8290", fontFamily: "var(--bx-font-mono, monospace)" }}>
          filter=<span style={{ color: "#f4f6fb" }}>{q || "∅"}</span> · lastJump=
          <span style={{ color: "var(--bx-accent, #46c66d)" }}>{last}</span>
        </div>
        <ComponentCatalog filter={q} onFilterChange={setQ} onJump={setLast} groups={CATALOG_GROUPS} />
      </div>
    );
  },
};
