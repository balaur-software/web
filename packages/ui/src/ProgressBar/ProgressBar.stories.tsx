import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { ProgressBar } from "./ProgressBar.tsx";

const meta: Meta<typeof ProgressBar> = {
  title: "OCTANT/ProgressBar",
  component: ProgressBar,
  args: { value: 0.66, label: "LINK" },
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};

export const Hash: Story = {
  args: { value: 0.4, label: "HASH", color: "#f2c94c" },
};

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 13, width: 320 }}>
      <ProgressBar value={0} label="IDLE" />
      <ProgressBar value={1} label="DONE" />
    </div>
  ),
};

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 13, width: 320 }}>
      <ProgressBar value={0.82} label="LINK" />
      <ProgressBar value={0.4} label="HASH" color="#f2c94c" />
      <ProgressBar value={0.61} label="STREAM" color="#2bd9d9" />
    </div>
  ),
};

function LoopingBars() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const f1 = Math.min(1, (t * 0.16) % 1.25);
  const f2 = Math.min(1, (t * 0.1 + 0.3) % 1.4);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13, width: 320 }}>
      <ProgressBar value={f1} label="LINK" />
      <ProgressBar value={f2} label="HASH" color="#f2c94c" />
    </div>
  );
}

export const Animated: Story = {
  render: () => <LoopingBars />,
};
