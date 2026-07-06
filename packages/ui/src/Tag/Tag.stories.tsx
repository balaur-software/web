import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tag } from "./Tag.tsx";

const meta: Meta<typeof Tag> = {
  title: "OCTANT/Tag",
  component: Tag,
  args: { label: "NODE-01" },
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {};

export const NotRemovable: Story = {
  args: { label: "READ-ONLY", removable: false },
};

/** Non-removable status chips: each tone prepends its own octant status glyph. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
      <Tag tone="active" label="ACTIVE" removable={false} />
      <Tag tone="degraded" label="DEGRADED" removable={false} />
      <Tag tone="offline" label="OFFLINE" removable={false} />
      <Tag label="DEFAULT" removable={false} />
    </div>
  ),
};

/** A dismissable tag row — `×` dissolves each chip into dot-noise, then collapses it. */
export const Row: Story = {
  render: () => {
    const [tags, setTags] = useState(["NODE-01", "RELAY-7", "BUFFER-X", "SINK-3"]);
    return (
      <div style={{ maxWidth: 360 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {tags.map((label) => (
            <Tag key={label} label={label} onRemove={() => setTags((t) => t.filter((x) => x !== label))} />
          ))}
        </div>
        <div style={{ color: "#3f424d", fontSize: 11, marginTop: 16 }}>
          × dissolves the tag into dot-noise
        </div>
        {tags.length < 4 && (
          <button
            type="button"
            onClick={() => setTags(["NODE-01", "RELAY-7", "BUFFER-X", "SINK-3"])}
            style={{
              marginTop: 12,
              fontFamily: "inherit",
              fontSize: 11,
              background: "transparent",
              border: "1px solid #2a2c34",
              color: "#9aa0ad",
              cursor: "pointer",
              padding: "5px 10px",
            }}
          >
            RESET
          </button>
        )}
      </div>
    );
  },
};
