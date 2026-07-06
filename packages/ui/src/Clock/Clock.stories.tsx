import type { Meta, StoryObj } from "@storybook/react";
import { Clock } from "./Clock.tsx";

const meta: Meta<typeof Clock> = {
  title: "OCTANT/Clock",
  component: Clock,
};
export default meta;
type Story = StoryObj<typeof Clock>;

/** Live wall-clock time, `HH:MM:SS`. */
export const Default: Story = {};

/** Uptime counter only, ticking up from mount. */
export const UptimeOnly: Story = {
  args: { showTime: false, showUptime: true },
};

/** Both segments, as they appear split across the reference header + footer. */
export const TimeAndUptime: Story = {
  args: { showUptime: true },
};

/** Custom uptime label. */
export const CustomLabel: Story = {
  args: { showTime: false, showUptime: true, uptimeLabel: "SESSION" },
};

/** In a header-like bar, right-aligned with a blinking caret. */
export const InHeader: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderBottom: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-3, #0c0d11)",
      }}
    >
      <span style={{ color: "var(--bx-text-4, #9aa0ad)", fontSize: 13 }}>OCTANT.OS</span>
      <Clock style={{ marginLeft: "auto" }} />
      <span
        style={{
          width: 9,
          height: 15,
          background: "var(--bx-accent, #46c66d)",
          display: "inline-block",
        }}
      />
    </div>
  ),
};
